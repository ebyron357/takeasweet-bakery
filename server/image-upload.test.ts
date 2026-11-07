import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MAX_UPLOAD_BYTES } from "../shared/image-upload";
import { ENV } from "./_core/env";
import type { TrpcContext } from "./_core/context";
import {
  detectImageType,
  stripImageMetadata,
  uploadAdminImage,
  uploadBaseName,
} from "./image-upload";
import { appRouter } from "./routers";

const { storagePut } = vi.hoisted(() => ({ storagePut: vi.fn() }));
vi.mock("./storage", () => ({ storagePut }));

const SECRET = "GPS-35.2271N-80.8431W";

function jpegSegment(marker: number, payload: string | Buffer): Buffer {
  const body = Buffer.isBuffer(payload) ? payload : Buffer.from(payload, "latin1");
  const header = Buffer.from([0xff, marker, 0, 0]);
  header.writeUInt16BE(body.length + 2, 2);
  return Buffer.concat([header, body]);
}

const SCAN_DATA = Buffer.from([0x12, 0x34, 0xff, 0x00, 0x56]);

function sampleJpeg(): Buffer {
  return Buffer.concat([
    Buffer.from([0xff, 0xd8]),
    jpegSegment(0xe0, "JFIF\0"),
    jpegSegment(0xe1, `Exif\0\0${SECRET}`),
    jpegSegment(0xe2, "ICC_PROFILE\0colors"),
    jpegSegment(0xed, `Photoshop 3.0\0${SECRET}`),
    Buffer.from([0xff]), // fill byte
    jpegSegment(0xdb, "quant-table"),
    jpegSegment(0xda, "scan-header"),
    SCAN_DATA,
    Buffer.from([0xff, 0xd9]),
    Buffer.from(`trailer ${SECRET}`, "latin1"),
  ]);
}

function pngChunk(type: string, payload: string): Buffer {
  const body = Buffer.from(payload, "latin1");
  const length = Buffer.alloc(4);
  length.writeUInt32BE(body.length);
  return Buffer.concat([length, Buffer.from(type, "latin1"), body, Buffer.alloc(4)]);
}

function samplePng(): Buffer {
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk("IHDR", "header-data!!"),
    pngChunk("tEXt", `Comment\0${SECRET}`),
    pngChunk("eXIf", SECRET),
    pngChunk("IDAT", "pixels"),
    pngChunk("IEND", ""),
  ]);
}

function webpChunk(type: string, body: Buffer): Buffer {
  const header = Buffer.alloc(8);
  header.write(type, 0, "latin1");
  header.writeUInt32LE(body.length, 4);
  return Buffer.concat([header, body, Buffer.alloc(body.length % 2)]);
}

function sampleWebp(): Buffer {
  const vp8x = Buffer.alloc(10);
  vp8x[0] = 0x08 | 0x04 | 0x10; // EXIF + XMP + alpha flags
  const chunks = Buffer.concat([
    webpChunk("VP8X", vp8x),
    webpChunk("VP8 ", Buffer.from("odd-pixels", "latin1").subarray(0, 9)),
    webpChunk("EXIF", Buffer.from(SECRET, "latin1")),
    webpChunk("XMP ", Buffer.from(`<x>${SECRET}</x>`, "latin1")),
  ]);
  const header = Buffer.from("RIFF0000WEBP", "latin1");
  header.writeUInt32LE(chunks.length + 4, 4);
  return Buffer.concat([header, chunks]);
}

function contains(data: Buffer, text: string) {
  return data.includes(Buffer.from(text, "latin1"));
}

describe("detectImageType", () => {
  it("identifies JPEG, PNG, and WebP by their bytes", () => {
    expect(detectImageType(sampleJpeg())).toBe("image/jpeg");
    expect(detectImageType(samplePng())).toBe("image/png");
    expect(detectImageType(sampleWebp())).toBe("image/webp");
  });

  it("rejects SVG, HTML, GIF, and empty data", () => {
    expect(detectImageType(Buffer.from('<svg onload="alert(1)"></svg>'))).toBeNull();
    expect(detectImageType(Buffer.from("<html><script></script></html>"))).toBeNull();
    expect(detectImageType(Buffer.from("GIF89a"))).toBeNull();
    expect(detectImageType(Buffer.alloc(0))).toBeNull();
  });
});

describe("stripImageMetadata", () => {
  it("removes JPEG Exif, IPTC, and trailing data but keeps the image and color profile", () => {
    const cleaned = stripImageMetadata(sampleJpeg(), "image/jpeg");
    expect(contains(cleaned, SECRET)).toBe(false);
    expect(contains(cleaned, "JFIF")).toBe(true);
    expect(contains(cleaned, "ICC_PROFILE")).toBe(true);
    expect(contains(cleaned, "quant-table")).toBe(true);
    expect(cleaned.includes(SCAN_DATA)).toBe(true);
    expect(cleaned.subarray(0, 2)).toEqual(Buffer.from([0xff, 0xd8]));
    expect(cleaned.subarray(-2)).toEqual(Buffer.from([0xff, 0xd9]));
  });

  it("removes PNG text and Exif chunks but keeps the image chunks", () => {
    const cleaned = stripImageMetadata(samplePng(), "image/png");
    expect(contains(cleaned, SECRET)).toBe(false);
    for (const type of ["IHDR", "IDAT", "IEND"]) expect(contains(cleaned, type)).toBe(true);
  });

  it("removes WebP EXIF and XMP chunks, clears their flags, and fixes the file size", () => {
    const cleaned = stripImageMetadata(sampleWebp(), "image/webp");
    expect(contains(cleaned, SECRET)).toBe(false);
    expect(contains(cleaned, "VP8 ")).toBe(true);
    expect(cleaned.readUInt32LE(4)).toBe(cleaned.length - 8);
    expect(cleaned[20]).toBe(0x10); // only the alpha flag remains
  });

  it("rejects a truncated JPEG", () => {
    const truncated = sampleJpeg().subarray(0, 10);
    expect(() => stripImageMetadata(truncated, "image/jpeg")).toThrow();
  });
});

describe("uploadBaseName", () => {
  it("makes a safe, readable storage name", () => {
    expect(uploadBaseName("My Cake Photo!.JPG")).toBe("my-cake-photo");
    expect(uploadBaseName("../../etc/passwd")).not.toMatch(/[./]/);
    expect(uploadBaseName(".jpg")).toBe("photo");
    expect(uploadBaseName("x".repeat(300) + ".png")).toHaveLength(60);
  });
});

describe("uploadAdminImage", () => {
  const original = { url: ENV.forgeApiUrl, key: ENV.forgeApiKey };

  beforeEach(() => {
    ENV.forgeApiUrl = "https://storage.example.test";
    ENV.forgeApiKey = "test-key";
    storagePut.mockReset().mockImplementation(async (key: string) => ({
      key,
      url: `/manus-storage/${key}`,
    }));
  });

  afterEach(() => {
    ENV.forgeApiUrl = original.url;
    ENV.forgeApiKey = original.key;
  });

  const upload = (data: Buffer, fileName = "Birthday Cookies.heic") =>
    uploadAdminImage({ fileName, dataBase64: data.toString("base64") });

  it("stores a cleaned photo under a type-correct name and returns its URL", async () => {
    const result = await upload(sampleJpeg());
    expect(storagePut).toHaveBeenCalledTimes(1);
    const [key, data, type] = storagePut.mock.calls[0];
    expect(key).toBe("uploads/birthday-cookies.jpg");
    expect(type).toBe("image/jpeg");
    expect(contains(data, SECRET)).toBe(false);
    expect(result).toEqual({ url: "/manus-storage/uploads/birthday-cookies.jpg" });
  });

  it("refuses uploads when storage is not configured", async () => {
    ENV.forgeApiKey = "";
    await expect(upload(sampleJpeg())).rejects.toMatchObject({
      code: "PRECONDITION_FAILED",
      message: expect.stringMatching(/isn't set up/),
    });
    expect(storagePut).not.toHaveBeenCalled();
  });

  it("refuses files that are not JPEG, PNG, or WebP", async () => {
    await expect(upload(Buffer.from("<svg onload=alert(1)>"), "logo.png")).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: expect.stringMatching(/Only JPEG, PNG, or WebP/),
    });
    expect(storagePut).not.toHaveBeenCalled();
  });

  it("refuses photos over the size limit", async () => {
    const big = Buffer.concat([sampleJpeg(), Buffer.alloc(MAX_UPLOAD_BYTES)]);
    await expect(upload(big)).rejects.toMatchObject({ code: "PAYLOAD_TOO_LARGE" });
    expect(storagePut).not.toHaveBeenCalled();
  });

  it("refuses data that is not valid base64", async () => {
    await expect(
      uploadAdminImage({ fileName: "a.jpg", dataBase64: "not base64!" }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("refuses a damaged photo", async () => {
    await expect(upload(sampleJpeg().subarray(0, 10))).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: expect.stringMatching(/damaged/),
    });
    expect(storagePut).not.toHaveBeenCalled();
  });

  it("reports a friendly error when storage fails", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    storagePut.mockRejectedValue(new Error("S3 down"));
    await expect(upload(samplePng())).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
      message: "The photo couldn't be saved. Please try again.",
    });
    consoleError.mockRestore();
  });
});

describe("admin.uploadImage permissions", () => {
  function createContext(role: "admin" | "user" | null): TrpcContext {
    return {
      user: role && {
        id: 1,
        openId: `${role}-user`,
        email: null,
        name: null,
        loginMethod: "manus",
        role,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };
  }

  const input = { fileName: "cake.jpg", dataBase64: sampleJpeg().toString("base64") };

  beforeEach(() => {
    ENV.forgeApiUrl = "https://storage.example.test";
    ENV.forgeApiKey = "test-key";
    storagePut.mockReset().mockResolvedValue({ key: "k", url: "/manus-storage/k" });
  });

  it("rejects signed-out visitors", async () => {
    const caller = appRouter.createCaller(createContext(null));
    await expect(caller.admin.uploadImage(input)).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    expect(storagePut).not.toHaveBeenCalled();
  });

  it("rejects signed-in customers", async () => {
    const caller = appRouter.createCaller(createContext("user"));
    await expect(caller.admin.uploadImage(input)).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(storagePut).not.toHaveBeenCalled();
  });

  it("lets the admin upload", async () => {
    const caller = appRouter.createCaller(createContext("admin"));
    await expect(caller.admin.uploadImage(input)).resolves.toEqual({ url: "/manus-storage/k" });
  });
});
