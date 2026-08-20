import { describe, expect, it } from "vitest";

import { catalog } from "@/data/catalog";
import { getProductBySlug, groupCatalogByCategory } from "@/lib/catalog";

describe("verified catalog", () => {
  it("uses unique slugs and positive cent-based prices", () => {
    const slugs = catalog.map((product) => product.slug);

    expect(new Set(slugs).size).toBe(slugs.length);
    expect(
      catalog.every((product) => Number.isInteger(product.priceCents))
    ).toBe(true);
    expect(catalog.every((product) => product.priceCents > 0)).toBe(true);
  });

  it("preserves the verified Four Corners selection limit", () => {
    const cheesecake = getProductBySlug("four-corners-cheesecake");

    expect(cheesecake?.priceCents).toBe(2000);
    expect(cheesecake?.maxFlavorSelections).toBe(4);
    expect(cheesecake?.flavorOptions).toHaveLength(8);
  });

  it("groups every catalog item exactly once", () => {
    const groups = groupCatalogByCategory();
    const groupedCount = Object.values(groups).reduce(
      (count, products) => count + products.length,
      0
    );

    expect(groupedCount).toBe(catalog.length);
  });
});
