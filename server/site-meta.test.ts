import { describe, expect, it, vi } from "vitest";

vi.mock("./db-features", () => ({
  listActiveProducts: vi.fn().mockResolvedValue([]),
}));

import {
  buildRobotsTxt,
  buildSitemapXml,
  getIndexableSiteUrl,
  securityHeaders,
} from "./site-meta";

describe("search indexing gate", () => {
  it("stays off during client review", () => {
    expect(getIndexableSiteUrl(true, "https://takeasweet.example")).toBeNull();
  });

  it("stays off without a valid https site URL", () => {
    expect(getIndexableSiteUrl(false, undefined)).toBeNull();
    expect(getIndexableSiteUrl(false, "http://takeasweet.example")).toBeNull();
    expect(getIndexableSiteUrl(false, "not a url")).toBeNull();
  });

  it("turns on after review with an https site URL", () => {
    expect(getIndexableSiteUrl(false, "https://takeasweet.example/shop")).toBe(
      "https://takeasweet.example"
    );
  });
});

describe("robots.txt", () => {
  it("blocks all crawling when indexing is off", () => {
    expect(buildRobotsTxt(null)).toBe("User-agent: *\nDisallow: /\n");
  });

  it("allows public pages, blocks private ones, and links the sitemap", () => {
    const robots = buildRobotsTxt("https://takeasweet.example");
    expect(robots).toContain("Allow: /");
    expect(robots).toContain("Disallow: /admin");
    expect(robots).toContain("Disallow: /cart");
    expect(robots).toContain("Disallow: /order/");
    expect(robots).toContain("Sitemap: https://takeasweet.example/sitemap.xml");
  });
});

describe("sitemap.xml", () => {
  it("lists public pages and products but not cart, order, or admin routes", () => {
    const xml = buildSitemapXml("https://takeasweet.example", [
      "limber",
      "a&b",
    ]);
    expect(xml).toContain("<loc>https://takeasweet.example/shop</loc>");
    expect(xml).toContain(
      "<loc>https://takeasweet.example/product/limber</loc>"
    );
    expect(xml).toContain(
      "<loc>https://takeasweet.example/product/a%26b</loc>"
    );
    expect(xml).not.toMatch(/\/(cart|admin|order\/)/);
  });
});

describe("security headers", () => {
  function run(headers: Record<string, string> = {}) {
    const set: Record<string, string> = {};
    const res = {
      setHeader: (name: string, value: string) => {
        set[name] = value;
      },
      removeHeader: vi.fn(),
    };
    const next = vi.fn();
    securityHeaders({ secure: false, headers } as never, res as never, next);
    expect(next).toHaveBeenCalled();
    return set;
  }

  it("sets baseline headers and noindex during review", () => {
    const set = run();
    expect(set["X-Content-Type-Options"]).toBe("nosniff");
    expect(set["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(set["X-Robots-Tag"]).toBe("noindex, nofollow");
    expect(set["Strict-Transport-Security"]).toBeUndefined();
  });

  it("adds HSTS only behind https", () => {
    expect(
      run({ "x-forwarded-proto": "https" })["Strict-Transport-Security"]
    ).toBe("max-age=15552000");
  });
});
