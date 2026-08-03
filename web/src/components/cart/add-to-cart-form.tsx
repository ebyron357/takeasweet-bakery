"use client";

import { useState } from "react";
import { Check } from "lucide-react";

import { useCart } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";
import { trackAnalyticsEvent } from "@/lib/analytics";
import type { CatalogProduct } from "@/types/catalog";

export function AddToCartForm({ product }: { product: CatalogProduct }) {
  const { addItem } = useCart();
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const selectionLimit = product.maxFlavorSelections ?? 0;

  function toggleFlavor(flavor: string) {
    setMessage("");
    if (selectedFlavors.includes(flavor)) {
      setSelectedFlavors((current) =>
        current.filter((item) => item !== flavor)
      );
      return;
    }
    if (selectedFlavors.length >= selectionLimit) {
      setMessage(
        `Choose no more than ${selectionLimit} flavor${selectionLimit === 1 ? "" : "s"}.`
      );
      return;
    }
    setSelectedFlavors((current) => [...current, flavor]);
  }

  function addToCart() {
    if (product.flavorOptions.length > 0 && selectedFlavors.length === 0) {
      setMessage("Choose at least one flavor.");
      return;
    }

    addItem({ slug: product.slug, quantity, selectedFlavors });
    trackAnalyticsEvent({
      name: "add_to_cart",
      properties: {
        productSlug: product.slug,
        quantity,
        flavorCount: selectedFlavors.length,
      },
    });
    setMessage(`${product.name} added to your cart.`);
  }

  return (
    <div className="mt-10 border-t pt-8">
      {product.flavorOptions.length > 0 ? (
        <fieldset>
          <legend className="text-lg font-bold">
            Choose{" "}
            {selectionLimit === 1
              ? "a flavor"
              : `up to ${selectionLimit} flavors`}
          </legend>
          <div className="mt-4 flex flex-wrap gap-2">
            {product.flavorOptions.map((flavor) => {
              const selected = selectedFlavors.includes(flavor);
              return (
                <button
                  key={flavor}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleFlavor(flavor)}
                  className={`focus-visible:ring-ring inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold focus-visible:ring-2 focus-visible:outline-none ${selected ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`}
                >
                  {selected ? (
                    <Check className="size-4" aria-hidden="true" />
                  ) : null}
                  {flavor}
                </button>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      <div className="mt-6 flex flex-wrap items-end gap-4">
        <label className="grid gap-2 text-sm font-semibold">
          Quantity
          <input
            type="number"
            min={1}
            max={20}
            value={quantity}
            onChange={(event) =>
              setQuantity(
                Math.min(20, Math.max(1, event.target.valueAsNumber || 1))
              )
            }
            className="bg-background h-11 w-24 rounded-md border px-3"
          />
        </label>
        <Button type="button" size="lg" onClick={addToCart}>
          Add to cart
        </Button>
      </div>
      {message ? (
        <p
          className="mt-4 text-sm font-semibold"
          role="status"
          aria-live="polite"
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
