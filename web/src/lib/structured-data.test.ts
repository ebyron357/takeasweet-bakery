import { afterEach, describe, expect, it } from "vitest";

import { catalog } from "@/data/catalog";
import {
  createMenuStructuredData,
  createProductBreadcrumbs,
  createSiteStructuredData,
} from "@/lib/structured-data";

const originalEnvironment = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnvironment };
});

describe("public structured data", () => {
  it("uses only the configured canonical origin", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://takeasweet.example.com";
    const json = JSON.stringify(createSiteStructuredData());

    expect(json).toContain("https://takeasweet.example.com/");
    expect(json).toContain("Charlotte, North Carolina");
  });

  it("lists every verified menu page without claiming availability or offers", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://takeasweet.example.com";
    const json = JSON.stringify(createMenuStructuredData());

    expect(json.match(/ListItem/g)).toHaveLength(catalog.length);
    expect(json).not.toMatch(/availability|offers|price|aggregateRating/i);
  });

  it("creates a factual product breadcrumb trail", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://takeasweet.example.com";
    const data = createProductBreadcrumbs(catalog[0]);

    expect(data.itemListElement.map((item) => item.name)).toEqual([
      "Home",
      "Menu",
      catalog[0].name,
    ]);
  });
});
