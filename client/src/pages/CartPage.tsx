import { useEffect } from "react";
import { Link, useSearch } from "wouter";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";
import { formatPrice, SERVICE_AREA_COPY } from "@shared/bakery";
import {
  PAYMENTS_ENABLED,
  PAYMENTS_LIVE,
  REVIEW_CHECKOUT_NOTICE,
} from "@shared/review-mode";

export default function CartPage() {
  const { items, totalCents, setQuantity, removeItem } = useCart();
  const search = useSearch();

  useEffect(() => {
    if (new URLSearchParams(search).get("cancelled") === "1") {
      toast.info("Checkout cancelled — your bag is still saved.");
    }
  }, [search]);

  const checkout = trpc.checkout.createSession.useMutation({
    onSuccess: data => {
      if (data.url) {
        toast.success("Taking you to secure checkout…");
        window.open(data.url, "_blank");
      }
    },
    onError: err => toast.error(err.message || "Could not start checkout. Please try again."),
  });

  if (items.length === 0) {
    return (
      <div className="container py-20 text-center">
        <ShoppingBag className="text-muted-foreground mx-auto size-12" />
        <h1 className="font-display mt-4 text-3xl font-extrabold">Your bag is empty</h1>
        <p className="text-muted-foreground mt-2">Time to fill it with something delicious.</p>
        <Button asChild className="mt-6 rounded-full font-bold" size="lg">
          <Link href="/shop">Browse the Menu</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-10 md:py-14">
      <h1 className="font-display mb-8 text-3xl font-extrabold sm:text-4xl">Your Sweet Bag</h1>
      <div className="space-y-4">
        {items.map(item => (
          <div
            key={item.productId}
            className="bg-card border-border/60 flex gap-4 rounded-2xl border p-4 shadow-sm"
          >
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="size-20 shrink-0 rounded-xl object-cover sm:size-24"
              />
            )}
            <div className="flex flex-1 flex-col">
              <div className="flex items-start justify-between gap-2">
                <p className="font-bold">{item.name}</p>
                <button
                  onClick={() => removeItem(item.productId)}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label={`Remove ${item.name}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              <p className="text-muted-foreground text-sm">{formatPrice(item.priceCents)} each</p>
              <div className="mt-auto flex items-center gap-2 pt-2">
                <button
                  className="border-border hover:bg-muted flex size-7 items-center justify-center rounded-full border"
                  onClick={() => setQuantity(item.productId, item.quantity - 1)}
                  aria-label="Decrease quantity"
                >
                  <Minus className="size-3.5" />
                </button>
                <span className="w-8 text-center font-bold">{item.quantity}</span>
                <button
                  className="border-border hover:bg-muted flex size-7 items-center justify-center rounded-full border"
                  onClick={() => setQuantity(item.productId, item.quantity + 1)}
                  aria-label="Increase quantity"
                >
                  <Plus className="size-3.5" />
                </button>
                <span className="font-display ml-auto text-lg font-bold">
                  {formatPrice(item.priceCents * item.quantity)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-muted mt-8 rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <span className="font-semibold">Subtotal</span>
          <span className="font-display text-2xl font-extrabold">{formatPrice(totalCents)}</span>
        </div>
        <p className="text-muted-foreground mt-2 text-sm">
          {SERVICE_AREA_COPY} Pickup details are shared after your order is confirmed.
        </p>
        {!PAYMENTS_LIVE && (
          <p
            role="status"
            className="bg-accent/60 text-accent-foreground mt-3 rounded-xl px-4 py-3 text-sm font-semibold"
          >
            {REVIEW_CHECKOUT_NOTICE}
          </p>
        )}
        <Button
          size="lg"
          className="mt-4 min-h-12 w-full rounded-full text-base font-bold"
          disabled={!PAYMENTS_ENABLED || checkout.isPending}
          onClick={() =>
            checkout.mutate({
              items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
            })
          }
        >
          {!PAYMENTS_ENABLED
            ? "Checkout Disabled (Preview)"
            : checkout.isPending
              ? "Preparing checkout…"
              : PAYMENTS_LIVE
                ? "Checkout Securely"
                : "Checkout (Test Mode)"}
        </Button>
        {!PAYMENTS_LIVE && (
          <p className="text-muted-foreground mt-3 text-center text-xs">
            Test card: 4242 4242 4242 4242 · any future expiry · any CVC · any ZIP
          </p>
        )}
      </div>
    </div>
  );
}
