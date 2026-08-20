import { describe, expect, it } from "vitest";

import {
  approvedFounderPortrait,
  authenticGalleryItems,
} from "@/data/authentic-gallery";
import { isPublishableAuthenticMedia } from "@/lib/media";

describe("authentic media governance", () => {
  it("publishes only approved local authentic-work media", () => {
    expect(authenticGalleryItems.every(isPublishableAuthenticMedia)).toBe(true);
    expect(
      authenticGalleryItems.every((item) => item.kind === "authentic-work")
    ).toBe(true);
  });

  it("uses unique gallery identifiers and source paths", () => {
    expect(new Set(authenticGalleryItems.map((item) => item.id)).size).toBe(
      authenticGalleryItems.length
    );
    expect(new Set(authenticGalleryItems.map((item) => item.src)).size).toBe(
      authenticGalleryItems.length
    );
  });

  it("never treats an unapproved founder portrait as publishable", () => {
    expect(
      approvedFounderPortrait === null ||
        isPublishableAuthenticMedia(approvedFounderPortrait)
    ).toBe(true);
  });

  it("rejects generated imagery from the authentic collection", () => {
    expect(
      isPublishableAuthenticMedia({
        id: "unsafe-example",
        kind: "authentic-work",
        category: "treat",
        src: "/media/authentic/generated-cookie.webp",
        alt: "Cookie",
        caption: "Cookie",
        width: 100,
        height: 100,
        approval: {
          status: "approved",
          source: "owner-provided",
          approvedAt: "2026-01-01",
        },
      })
    ).toBe(false);
  });
});
