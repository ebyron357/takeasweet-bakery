/** Admin photo upload limits, shared so the client can check before sending. */

/** File types accepted from the admin upload button. SVG is excluded: it can carry scripts. */
export const UPLOAD_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export type UploadImageType = (typeof UPLOAD_IMAGE_TYPES)[number];

/** Largest image the server stores, after the browser has resized it. */
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

/** Largest photo the browser will try to read before resizing. */
export const MAX_ORIGINAL_BYTES = 40 * 1024 * 1024;

/** Longest edge, in pixels, the browser resizes photos down to. */
export const MAX_IMAGE_EDGE = 2000;
