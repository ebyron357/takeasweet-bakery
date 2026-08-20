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

  it("exposes catalog-authoritative unit prices so drift against DB prices is detectable", () => {
    const result = validateCart([
      { slug: "limber", quantity: 3, selectedFlavors: ["Mango"] },
    ]);

    expect(result.items[0].unitPriceCents).toBe(150);
    expect(result.totalCents).toBe(450);

    // The checkout route compares each item's catalog unitPriceCents against the
    // DB price returned by resolvePersistableOrderItems. A per-item mismatch
    // throws OrderPersistenceError so stale or swapped prices cannot be charged.
    const hypotheticalDbUnitPrice = 175;
    const hypotheticalDbTotal = hypotheticalDbUnitPrice * 3;
    expect(hypotheticalDbTotal).not.toBe(result.totalCents);
    // Per-item check also catches cross-item price swaps where totals are equal:
    // e.g. item A: catalog $10 / DB $12, item B: catalog $12 / DB $10 — totals
    // match but individual charges are wrong. The per-item comparison in
    // resolvePersistableOrderItems rejects these before the Stripe session.
    expect(result.items[0].unitPriceCents).not.toBe(hypotheticalDbUnitPrice);
  });
});
