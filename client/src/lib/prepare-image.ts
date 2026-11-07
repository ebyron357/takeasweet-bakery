import {
  MAX_IMAGE_EDGE,
  MAX_ORIGINAL_BYTES,
  MAX_UPLOAD_BYTES,
  UPLOAD_IMAGE_TYPES,
} from "@shared/image-upload";

/**
 * Readies a chosen photo for upload: turns it upright, shrinks it to at most
 * MAX_IMAGE_EDGE pixels on its longest side, and re-saves it, which also drops
 * camera and location metadata. The server strips metadata again regardless.
 * Throws an Error with a message suitable to show the owner.
 */
export async function prepareImageForUpload(
  file: File,
): Promise<{ fileName: string; dataBase64: string }> {
  if (!(UPLOAD_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    throw new Error("Please choose a JPEG, PNG, or WebP photo.");
  }
  if (file.size > MAX_ORIGINAL_BYTES) {
    throw new Error("That photo is too large. Please choose one under 40 MB.");
  }

  const image = await loadImage(file);
  const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser can't prepare photos. Try another browser.");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  // PNG and WebP may be transparent (logos), so keep their format when possible.
  let blob = await toBlob(canvas, file.type);
  if (blob.type !== file.type || blob.size > MAX_UPLOAD_BYTES) {
    blob = await toBlob(canvas, "image/jpeg");
  }
  if (blob.size > MAX_UPLOAD_BYTES) {
    throw new Error("That photo is still too large after resizing. Please choose another.");
  }

  return { fileName: file.name, dataBase64: await toBase64(blob) };
}

function loadImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.src = url;
  // Browsers apply the photo's orientation when drawing a decoded <img> to a canvas.
  return image
    .decode()
    .then(() => image)
    .catch(() => {
      throw new Error("That photo couldn't be opened. Please try another.");
    })
    .finally(() => URL.revokeObjectURL(url));
}

function toBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      blob => (blob ? resolve(blob) : reject(new Error("The photo couldn't be prepared."))),
      type,
      0.85,
    ),
  );
}

function toBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",", 2)[1] ?? "");
    reader.onerror = () => reject(new Error("The photo couldn't be read."));
    reader.readAsDataURL(blob);
  });
}
