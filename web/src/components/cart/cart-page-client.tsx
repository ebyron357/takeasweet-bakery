"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";

import { CheckoutButton } from "@/components/cart/checkout-button";
import { useCart } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";
import { formatPrice, getProductBySlug } from "@/lib/catalog";

export function CartPageClient() {
  const { items, isReady, removeItem, updateQuantity } = useCart();

  if (!isReady) {
    return <p className="text-muted-foreground mt-8">Loading cart…</p>;
  }

  if (items.length === 0) {
    return (
      <div className="bg-card mt-8 rounded-xl border p-8 text-center">
        <h2 className="text-2xl font-bold">Your cart is empty</h2>
        <p className="text-muted-foreground mt-2">
          Browse the verified menu to choose a treat.
        </p>
        <Button asChild className="mt-6">
          <Link href="/menu">Browse menu</Link>
        </Button>
      </div>
    );
  }

  const lines = items.flatMap((item, index) => {
    const product = getProductBySlug(item.slug);
    return product ? [{ item, index, product }] : [];
  });
  const subtotal = lines.reduce(
    (total, line) => total + line.product.priceCents * line.item.quantity,
    0
  );

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_22rem]">
      <ul className="space-y-4" aria-label="Cart items">
        {lines.map(({ item, index, product }) => (
          <li
            key={`${item.slug}-${item.selectedFlavors.join("-")}`}
            className="bg-card rounded-xl border p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <Link
                  href={`/menu/${product.slug}`}
                  className="text-lg font-bold hover:underline"
                >
                  {product.name}
                </Link>
                {item.selectedFlavors.length > 0 ? (
                  <p className="text-muted-foreground mt-1 text-sm">
                    {item.selectedFlavors.join(", ")}
                  </p>
                ) : null}
                <p className="mt-2 text-sm font-semibold">
                  {formatPrice(product.priceCents)} each
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="hover:bg-muted focus-visible:ring-ring inline-flex size-11 items-center justify-center rounded-md focus-visible:ring-2 focus-visible:outline-none"
                aria-label={`Remove ${product.name}`}
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-5 flex items-center justify-between gap-4">
              <div
                className="flex items-center rounded-full border"
                aria-label={`${product.name} quantity`}
              >
                <button
                  type="button"
                  className="hover:bg-muted focus-visible:ring-ring inline-flex size-11 items-center justify-center rounded-full focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
                  onClick={() => updateQuantity(index, item.quantity - 1)}
                  aria-label={`Decrease ${product.name} quantity`}
                  disabled={item.quantity <= 1}
                >
                  <Minus className="size-4" aria-hidden="true" />
                </button>
                <span
                  className="min-w-8 text-center font-bold"
                  aria-live="polite"
                  aria-label={`${product.name} quantity ${item.quantity}`}
                >
                  {item.quantity}
                </span>
                <button
                  type="button"
                  className="hover:bg-muted focus-visible:ring-ring inline-flex size-11 items-center justify-center rounded-full focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
                  onClick={() => updateQuantity(index, item.quantity + 1)}
                  aria-label={`Increase ${product.name} quantity`}
                  disabled={item.quantity >= 20}
                >
                  <Plus className="size-4" aria-hidden="true" />
                </button>
              </div>
              <p className="font-bold">
                {formatPrice(product.priceCents * item.quantity)}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <aside className="bg-card h-fit rounded-xl border p-6 lg:sticky lg:top-6">
        <h2 className="text-xl font-bold">Order summary</h2>
        <div className="mt-5 flex justify-between border-t pt-5">
          <span>Subtotal</span>
          <span className="font-bold">{formatPrice(subtotal)}</span>
        </div>
        <p className="text-muted-foreground mt-3 text-xs leading-5">
          Pickup or local-delivery details and any applicable fees are confirmed
          separately.
        </p>
        <div className="mt-6">
          <CheckoutButton />
        </div>
      </aside>
    </div>
  );
}
