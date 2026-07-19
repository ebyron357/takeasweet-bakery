import { describe, expect, it } from "vitest";

import { CartValidationError, validateCart } from "@/server/cart";

describe("server-authoritative cart validation", () => {
  it("calculates totals from the verified catalog", () => {
    const result = validateCart([
      { slug: "limber", quantity: 2, selectedFlavors: ["Mango"] },
      { slug: "oreo", quantity: 1, selectedFlavors: [] },
    ]);

    expect(result.totalCents).toBe(800);
    expect(result.items[0].unitPriceCents).toBe(150);
  });

  it("rejects invalid flavors", () => {
    expect(() =>
      validateCart([
        { slug: "limber", quantity: 1, selectedFlavors: ["Vanilla"] },
      ])
    ).toThrow(CartValidationError);
  });

  it("enforces the Four Corners selection limit", () => {
    expect(() =>
      validateCart([
        {
          slug: "four-corners-cheesecake",
          quantity: 1,
          selectedFlavors: [
            "Strawberry",
            "Biscoff",
            "Oreo",
            "Nutella",
            "Cherry",
          ],
        },
      ])
    ).toThrow("allows up to 4 flavor selections");
  });
});
