import { afterEach, describe, expect, it } from "vitest";

import {
  getCanonicalUrl,
  isProductionSiteUrl,
  isSearchIndexingEnabled,
} from "@/config/site";

const originalEnvironment = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnvironment };
});

describe("site URL controls", () => {
  it("keeps indexing disabled for local and non-HTTPS origins", () => {
    process.env.SEARCH_INDEXING_ENABLED = "true";
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
    expect(isSearchIndexingEnabled()).toBe(false);

    process.env.NEXT_PUBLIC_SITE_URL = "http://takeasweet.example.com";
    expect(isSearchIndexingEnabled()).toBe(false);
  });

  it("requires an explicit indexing gate and production HTTPS origin", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://takeasweet.example.com";
    delete process.env.SEARCH_INDEXING_ENABLED;
    expect(isProductionSiteUrl()).toBe(true);
    expect(isSearchIndexingEnabled()).toBe(false);

    process.env.SEARCH_INDEXING_ENABLED = "true";
    expect(isSearchIndexingEnabled()).toBe(true);
  });

  it("builds absolute canonical URLs from the configured origin", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://takeasweet.example.com";
    expect(getCanonicalUrl("/menu/limber")).toBe(
      "https://takeasweet.example.com/menu/limber"
    );
  });
});
