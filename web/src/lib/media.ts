import type {
  ApprovedFounderPortrait,
  AuthenticGalleryItem,
} from "@/types/media";

type AuthenticMedia = AuthenticGalleryItem | ApprovedFounderPortrait;

export function isPublishableAuthenticMedia(media: AuthenticMedia): boolean {
  return (
    media.approval.status === "approved" &&
    (media.approval.source === "owner-provided" ||
      media.approval.source === "repository-verified") &&
    media.src.startsWith("/media/authentic/") &&
    !/generated|stock|placeholder/i.test(media.src) &&
    media.alt.trim().length > 0 &&
    media.caption.trim().length > 0 &&
    Number.isInteger(media.width) &&
    Number.isInteger(media.height) &&
    media.width > 0 &&
    media.height > 0 &&
    !Number.isNaN(Date.parse(media.approval.approvedAt))
  );
}
