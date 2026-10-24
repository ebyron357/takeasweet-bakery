import type {
  ApprovedFounderPortrait,
  AuthenticGalleryItem,
} from "@/types/media";

/**
 * Publish only owner-approved photographs of items actually baked by
 * TakeASweet. Generated, stock, reference, and unverified images never belong
 * in this collection.
 */
export const authenticGalleryItems: readonly AuthenticGalleryItem[] = [];

/** No approved founder portrait is present in the repository yet. */
export const approvedFounderPortrait: ApprovedFounderPortrait | null = null;
