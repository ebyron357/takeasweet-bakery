import { TRPCError } from "@trpc/server";
import { MAX_UPLOAD_BYTES, type UploadImageType } from "@shared/image-upload";
import { ENV } from "./_core/env";
import { storagePut } from "./storage";

const EXTENSIONS: Record<UploadImageType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/** Identifies an image from its first bytes; the browser's declared type is not trusted. */
export function detectImageType(data: Buffer): UploadImageType | null {
  if (data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) {
    return "image/jpeg";
  }
  if (data.subarray(0, 8).equals(PNG_SIGNATURE)) return "image/png";
  if (
    data.length >= 12 &&
    data.toString("latin1", 0, 4) === "RIFF" &&
    data.toString("latin1", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

class MalformedImageError extends Error {}

/** JPEG segments that can hold camera, location, or editing metadata (APP1 Exif/XMP, APP13 IPTC). */
const JPEG_METADATA_MARKERS = new Set([0xe1, 0xed]);

function stripJpeg(data: Buffer): Buffer {
  const parts: Buffer[] = [data.subarray(0, 2)];
  let pos = 2;
  while (pos < data.length) {
    if (data[pos] !== 0xff || pos + 1 >= data.length) throw new MalformedImageError();
    const marker = data[pos + 1];
    // Optional fill byte before a marker: drop it.
    if (marker === 0xff) {
      pos += 1;
      continue;
    }
    // Standalone markers carry no length field.
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      parts.push(data.subarray(pos, pos + 2));
      pos += 2;
      continue;
    }
    if (marker === 0xd9) {
      parts.push(data.subarray(pos, pos + 2));
      break;
    }
    if (pos + 4 > data.length) throw new MalformedImageError();
    const length = data.readUInt16BE(pos + 2);
    const end = pos + 2 + length;
    if (length < 2 || end > data.length) throw new MalformedImageError();
    if (!JPEG_METADATA_MARKERS.has(marker)) parts.push(data.subarray(pos, end));
    pos = end;
    if (marker === 0xda) {
      // Start of scan: copy compressed data up to the next real marker. Inside it,
      // 0xFF is followed by 0x00 (stuffing) or a restart marker (0xD0–0xD7).
      const scanStart = pos;
      while (pos < data.length) {
        if (data[pos] === 0xff && pos + 1 < data.length) {
          const next = data[pos + 1];
          if (next === 0x00 || (next >= 0xd0 && next <= 0xd7)) {
            pos += 2;
            continue;
          }
          if (next !== 0xff) break;
        }
        pos += 1;
      }
      parts.push(data.subarray(scanStart, pos));
    }
  }
  return Buffer.concat(parts);
}

/** PNG chunks that can hold camera, location, or free-text metadata. */
const PNG_METADATA_CHUNKS = new Set(["eXIf", "tEXt", "zTXt", "iTXt", "tIME"]);

function stripPng(data: Buffer): Buffer {
  const parts: Buffer[] = [PNG_SIGNATURE];
  let pos = 8;
  while (pos < data.length) {
    if (pos + 12 > data.length) throw new MalformedImageError();
    const type = data.toString("latin1", pos + 4, pos + 8);
    const end = pos + 12 + data.readUInt32BE(pos);
    if (end > data.length) throw new MalformedImageError();
    if (!PNG_METADATA_CHUNKS.has(type)) parts.push(data.subarray(pos, end));
    pos = end;
    if (type === "IEND") break;
  }
  return Buffer.concat(parts);
}

const WEBP_METADATA_CHUNKS = new Set(["EXIF", "XMP "]);
/** VP8X header flags announcing EXIF (0x08) and XMP (0x04) chunks. */
const VP8X_METADATA_FLAGS = 0x08 | 0x04;

function stripWebp(data: Buffer): Buffer {
  const parts: Buffer[] = [];
  let pos = 12;
  while (pos < data.length) {
    if (pos + 8 > data.length) throw new MalformedImageError();
    const type = data.toString("latin1", pos, pos + 4);
    const size = data.readUInt32LE(pos + 4);
    const end = pos + 8 + size + (size % 2);
    if (pos + 8 + size > data.length) throw new MalformedImageError();
    if (!WEBP_METADATA_CHUNKS.has(type)) {
      const chunk = Buffer.from(data.subarray(pos, Math.min(end, data.length)));
      if (type === "VP8X" && size > 0) chunk[8] &= ~VP8X_METADATA_FLAGS;
      parts.push(chunk);
    }
    pos = end;
  }
  const body = Buffer.concat(parts);
  const header = Buffer.from(data.subarray(0, 12));
  header.writeUInt32LE(body.length + 4, 4);
  return Buffer.concat([header, body]);
}

/**
 * Removes embedded metadata (camera details, GPS location, captions) so an
 * uploaded photo can never reveal where it was taken. Throws on a damaged file.
 */
export function stripImageMetadata(data: Buffer, type: UploadImageType): Buffer {
  if (type === "image/jpeg") return stripJpeg(data);
  if (type === "image/png") return stripPng(data);
  return stripWebp(data);
}

/** Lowercase letters, digits, and dashes only, so the storage key is safe and readable. */
export function uploadBaseName(fileName: string): string {
  const withoutExtension = fileName.replace(/\.[^.]*$/, "");
  const slug = withoutExtension
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return slug || "photo";
}

const BASE64 = /^[A-Za-z0-9+/]*={0,2}$/;

/** Validates, cleans, and stores an admin-uploaded image; returns its site URL. */
export async function uploadAdminImage(input: {
  fileName: string;
  dataBase64: string;
}): Promise<{ url: string }> {
  if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "Photo upload isn't set up on this server. Paste an image link instead.",
    });
  }
  if (input.dataBase64.length % 4 !== 0 || !BASE64.test(input.dataBase64)) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "The photo could not be read." });
  }
  const data = Buffer.from(input.dataBase64, "base64");
  if (data.length === 0) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "The photo is empty." });
  }
  if (data.length > MAX_UPLOAD_BYTES) {
    throw new TRPCError({
      code: "PAYLOAD_TOO_LARGE",
      message: "The photo is too large. Please choose one under 8 MB.",
    });
  }
  const type = detectImageType(data);
  if (!type) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Only JPEG, PNG, or WebP photos can be uploaded.",
    });
  }

  let cleaned: Buffer;
  try {
    cleaned = stripImageMetadata(data, type);
  } catch (error) {
    if (!(error instanceof MalformedImageError)) throw error;
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "The photo file appears to be damaged. Please try another.",
    });
  }

  try {
    const key = `uploads/${uploadBaseName(input.fileName)}.${EXTENSIONS[type]}`;
    const { url } = await storagePut(key, cleaned, type);
    return { url };
  } catch (error) {
    console.error("[ImageUpload] Storage upload failed:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "The photo couldn't be saved. Please try again.",
    });
  }
}
