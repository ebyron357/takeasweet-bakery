import { z } from "zod";

import { getProductBySlug } from "@/lib/catalog";
import type { ValidatedCartItem } from "@/types/cart";

export const cartItemSchema = z.object({
  slug: z.string().trim().min(1).max(220),
  quantity: z.number().int().min(1).max(20),
  selectedFlavors: z
    .array(z.string().trim().min(1).max(100))
    .max(8)
    .default([]),
});

export const checkoutRequestSchema = z.object({
  items: z.array(cartItemSchema).min(1).max(25),
  checkoutToken: z.uuid(),
});

export class CartValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CartValidationError";
  }
}

export function validateCart(items: z.infer<typeof cartItemSchema>[]) {
  const seen = new Set<string>();

  const validatedItems: ValidatedCartItem[] = items.map((item) => {
    const product = getProductBySlug(item.slug);
    if (!product)
      throw new CartValidationError("A cart item is no longer available.");

    const uniqueFlavors = [...new Set(item.selectedFlavors)];
    const key = `${item.slug}:${uniqueFlavors.slice().sort().join("|")}`;
    if (seen.has(key))
      throw new CartValidationError("Duplicate cart lines are not allowed.");
    seen.add(key);

    if (uniqueFlavors.length !== item.selectedFlavors.length) {
      throw new CartValidationError("Flavor selections must be unique.");
    }

    const selectionLimit = product.maxFlavorSelections ?? 0;
    if (product.flavorOptions.length > 0 && uniqueFlavors.length === 0) {
      throw new CartValidationError(`Choose a flavor for ${product.name}.`);
    }
    if (uniqueFlavors.length > selectionLimit) {
      throw new CartValidationError(
        `${product.name} allows up to ${selectionLimit} flavor selection${selectionLimit === 1 ? "" : "s"}.`
      );
    }
    if (
      uniqueFlavors.some((flavor) => !product.flavorOptions.includes(flavor))
    ) {
      throw new CartValidationError(
        `A selected flavor is not offered for ${product.name}.`
      );
    }

    return {
      slug: product.slug,
      name: product.name,
      quantity: item.quantity,
      selectedFlavors: uniqueFlavors,
      unitPriceCents: product.priceCents,
      lineTotalCents: product.priceCents * item.quantity,
    };
  });

  const totalCents = validatedItems.reduce(
    (total, item) => total + item.lineTotalCents,
    0
  );
  return { items: validatedItems, totalCents } as const;
}
