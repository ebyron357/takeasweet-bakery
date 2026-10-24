import { afterEach, describe, expect, it } from "vitest";

import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { catalog } from "@/data/catalog";

const originalEnvironment = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnvironment };
});

describe("SEO metadata routes", () => {
  it("denies crawling by default", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
    delete process.env.SEARCH_INDEXING_ENABLED;

    expect(robots()).toEqual({
      rules: { userAgent: "*", disallow: "/" },
    });
  });

  it("publishes the sitemap only after the production indexing gate opens", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://takeasweet.example.com";
    process.env.SEARCH_INDEXING_ENABLED = "true";

    expect(robots()).toEqual({
      rules: { userAgent: "*", allow: "/" },
      sitemap: "https://takeasweet.example.com/sitemap.xml",
      host: "https://takeasweet.example.com",
    });
  });

  it("excludes cart, payment-return, and API routes from the sitemap", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://takeasweet.example.com";
    const urls = sitemap().map((entry) => entry.url);

    expect(urls).toHaveLength(catalog.length + 6);
    expect(urls.join(" ")).not.toMatch(/\/cart|\/order\/success|\/api\//);
  });
});
