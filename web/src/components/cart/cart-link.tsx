"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { useCart } from "@/components/cart/cart-provider";

export function CartLink() {
  const { itemCount, isReady } = useCart();

  return (
    <Link
      href="/cart"
      className="hover:bg-muted focus-visible:ring-ring relative inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold focus-visible:ring-2 focus-visible:outline-none"
      aria-label={`Cart${isReady ? `, ${itemCount} item${itemCount === 1 ? "" : "s"}` : ""}`}
    >
      <ShoppingBag className="size-4" aria-hidden="true" />
      <span className="hidden sm:inline">Cart</span>
      {isReady && itemCount > 0 ? (
        <span className="bg-primary text-primary-foreground flex min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold">
          {itemCount}
        </span>
      ) : null}
    </Link>
  );
}
