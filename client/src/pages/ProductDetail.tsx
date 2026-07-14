import { useState } from "react";
import { Link, useParams } from "wouter";
import { ArrowLeft, Camera, Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";
import {
  CATEGORY_LABELS,
  FOUR_CORNERS_MAX_FLAVORS,
  formatPrice,
  SERVICE_AREA_COPY,
} from "@shared/bakery";

/** Flavor options for the Four Corners Cheesecake — editable by the owner. */
const CHEESECAKE_FLAVORS = [
  "Classic",
  "Strawberry",
  "Oreo",
  "Caramel",
  "Lemon",
  "Chocolate",
];

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading, error } = trpc.products.bySlug.useQuery(
    { slug: slug ?? "" },
    { enabled: !!slug, retry: false },
  );
  const { addItem } = useCart();
  const [quantity, setQuantityState] = useState(1);
  const [flavors, setFlavors] = useState<string[]>([]);

  const isFourCorners = product?.slug === "four-corners-cheesecake";

  const toggleFlavor = (flavor: string) => {
    setFlavors(prev =>
      prev.includes(flavor)
        ? prev.filter(f => f !== flavor)
        : prev.length < FOUR_CORNERS_MAX_FLAVORS
          ? [...prev, flavor]
          : prev,
    );
  };

  if (isLoading) {
    return (
      <div className="container grid gap-8 py-10 md:grid-cols-2">
        <Skeleton className="aspect-square rounded-3xl" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container py-20 text-center">
        <p className="text-4xl">🍪</p>
        <h1 className="font-display mt-4 text-2xl font-extrabold">
          We couldn't find that treat
        </h1>
        <p className="text-muted-foreground mt-2">
          It may have been a seasonal item that's taking a break.
        </p>
        <Button asChild className="mt-6 rounded-full font-bold">
          <Link href="/shop">Back to the Menu</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8 md:py-12">
      <Link
        href="/shop"
        className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1.5 text-sm font-semibold"
      >
        <ArrowLeft className="size-4" /> Back to Shop
      </Link>

      <div className="grid gap-8 md:grid-cols-2 md:gap-12">
        <div className="border-border/60 overflow-hidden rounded-3xl border shadow-sm">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="aspect-square w-full object-cover"
            />
          ) : (
            <div
              role="img"
              aria-label={`Photo placeholder for ${product.name}`}
              className="bg-muted text-muted-foreground flex aspect-square flex-col items-center justify-center gap-2"
            >
              <Camera className="size-8 opacity-60" />
              <span className="text-sm font-semibold">Real photo coming soon</span>
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="rounded-full font-bold">
              {CATEGORY_LABELS[product.category]}
            </Badge>
            {!product.inStock && (
              <Badge variant="outline" className="rounded-full font-bold">
                Sold Out
              </Badge>
            )}
          </div>
          <h1 className="font-display mt-3 text-3xl font-extrabold sm:text-4xl">{product.name}</h1>
          <p className="font-display text-secondary-foreground mt-2 text-2xl font-bold">
            {product.priceCents > 0 ? (
              formatPrice(product.priceCents)
            ) : (
              <span className="text-muted-foreground text-lg">Price to be announced</span>
            )}
          </p>
          {product.description && (
            <p className="text-muted-foreground mt-4 text-base leading-relaxed">
              {product.description}
            </p>
          )}

          {isFourCorners && (
            <div className="bg-muted mt-6 rounded-2xl p-4">
              <p className="text-sm font-bold">
                Choose up to {FOUR_CORNERS_MAX_FLAVORS} flavors ({flavors.length}/
                {FOUR_CORNERS_MAX_FLAVORS} selected) *
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {CHEESECAKE_FLAVORS.map(flavor => {
                  const active = flavors.includes(flavor);
                  return (
                    <button
                      key={flavor}
                      onClick={() => toggleFlavor(flavor)}
                      className={`inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-sm font-bold transition-colors ${
                        active
                          ? "bg-primary text-primary-foreground"
                          : "bg-card border-border hover:bg-border border"
                      }`}
                      aria-pressed={active}
                    >
                      {active && <Check className="size-3.5" />}
                      {flavor}
                    </button>
                  );
                })}
              </div>
              <p className="text-muted-foreground mt-2 text-xs">
                Flavors must be chosen before checkout.
              </p>
            </div>
          )}

          <div className="mt-8 flex items-center gap-4">
            <div className="border-border flex items-center gap-3 rounded-full border px-3 py-1.5">
              <button
                onClick={() => setQuantityState(q => Math.max(1, q - 1))}
                className="hover:bg-muted flex size-7 items-center justify-center rounded-full"
                aria-label="Decrease quantity"
              >
                <Minus className="size-4" />
              </button>
              <span className="w-6 text-center font-bold">{quantity}</span>
              <button
                onClick={() => setQuantityState(q => Math.min(50, q + 1))}
                className="hover:bg-muted flex size-7 items-center justify-center rounded-full"
                aria-label="Increase quantity"
              >
                <Plus className="size-4" />
              </button>
            </div>
            <Button
              size="lg"
              className="flex-1 rounded-full text-base font-bold"
              disabled={!product.inStock || product.priceCents <= 0}
              onClick={() => {
                if (isFourCorners && flavors.length === 0) {
                  toast.error("Please choose at least one flavor before adding to your bag.");
                  return;
                }
                addItem(
                  {
                    productId: product.id,
                    name: isFourCorners
                      ? `${product.name} (${flavors.join(", ")})`
                      : product.name,
                    priceCents: product.priceCents,
                    imageUrl: product.imageUrl,
                  },
                  quantity,
                );
                toast.success(`${product.name} added to your bag!`);
              }}
            >
              <ShoppingBag className="size-5" />
              {!product.inStock
                ? "Sold Out"
                : product.priceCents <= 0
                  ? "Coming Soon"
                  : "Add to Bag"}
            </Button>
          </div>

          <div className="bg-muted mt-8 rounded-2xl p-4">
            <p className="text-sm font-semibold">Local pickup only</p>
            <p className="text-muted-foreground mt-1 text-sm">
              {SERVICE_AREA_COPY} Pickup details are shared once your order is confirmed. Our menu
              changes seasonally, so favorites may rotate!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
