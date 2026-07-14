import { useState } from "react";
import { Link, useParams } from "wouter";
import {
  ArrowLeft,
  Camera,
  Check,
  Clock,
  Minus,
  Plus,
  ShoppingBag,
  Store,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";
import { CATEGORY_LABELS, formatPrice, SERVICE_AREA_COPY } from "@shared/bakery";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading, error } = trpc.products.bySlug.useQuery(
    { slug: slug ?? "" },
    { enabled: !!slug, retry: false },
  );
  const { addItem } = useCart();
  const [quantity, setQuantityState] = useState(1);
  const [flavors, setFlavors] = useState<string[]>([]);

  const flavorOptions = product?.flavorOptions ?? [];
  const maxFlavors = product?.maxFlavorSelections ?? 1;
  const hasFlavors = flavorOptions.length > 0;

  const toggleFlavor = (flavor: string) => {
    setFlavors(prev => {
      if (prev.includes(flavor)) return prev.filter(f => f !== flavor);
      if (maxFlavors === 1) return [flavor];
      return prev.length < maxFlavors ? [...prev, flavor] : prev;
    });
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
        <p className="text-4xl" aria-hidden>
          🍪
        </p>
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

  const canPurchase = product.inStock && product.priceCents > 0;

  return (
    <div className="container py-8 md:py-12">
      <Link
        href="/shop"
        className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1.5 text-sm font-semibold"
      >
        <ArrowLeft className="size-4" aria-hidden /> Back to Menu
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
              <Camera className="size-8 opacity-60" aria-hidden />
              <span className="text-sm font-semibold">Real photo coming soon</span>
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full font-bold">
              {CATEGORY_LABELS[product.category] ?? product.category}
            </Badge>
            {product.isSeasonal && (
              <Badge className="bg-accent text-accent-foreground rounded-full font-bold">
                Seasonal
              </Badge>
            )}
            {!product.inStock && (
              <Badge variant="outline" className="rounded-full font-bold">
                Sold Out
              </Badge>
            )}
          </div>
          <h1 className="font-display mt-3 text-3xl font-extrabold sm:text-4xl">{product.name}</h1>
          <p className="font-display text-secondary-foreground mt-2 text-2xl font-bold">
            {product.priceCents > 0 ? (
              <>
                {formatPrice(product.priceCents)}
                {product.size && (
                  <span className="text-muted-foreground ml-2 text-base font-semibold">
                    / {product.size}
                  </span>
                )}
              </>
            ) : (
              <span className="text-muted-foreground text-lg">Price to be announced</span>
            )}
          </p>
          {product.description && (
            <p className="text-muted-foreground mt-4 text-base leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Flavor selection (driven by product data) */}
          {hasFlavors && (
            <fieldset className="bg-muted mt-6 rounded-2xl p-4">
              <legend className="sr-only">Flavor selection</legend>
              <p className="text-sm font-bold">
                {maxFlavors > 1
                  ? `Choose up to ${maxFlavors} flavors (${flavors.length}/${maxFlavors} selected) *`
                  : "Choose your flavor *"}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {flavorOptions.map(flavor => {
                  const active = flavors.includes(flavor);
                  return (
                    <button
                      key={flavor}
                      type="button"
                      onClick={() => toggleFlavor(flavor)}
                      className={`focus-visible:ring-ring inline-flex min-h-11 items-center gap-1 rounded-full px-4 py-2 text-sm font-bold transition-colors focus-visible:ring-2 focus-visible:outline-none ${
                        active
                          ? "bg-primary text-primary-foreground ring-primary/40 shadow-sm ring-2"
                          : "bg-card border-border hover:bg-border border"
                      }`}
                      aria-pressed={active}
                    >
                      {active && <Check className="size-3.5" aria-hidden />}
                      {flavor}
                    </button>
                  );
                })}
              </div>
              <p className="text-muted-foreground mt-2 text-xs">
                {maxFlavors > 1
                  ? "Flavors must be chosen before checkout."
                  : "Please pick one flavor before adding to your bag."}
              </p>
            </fieldset>
          )}

          <div className="mt-8 flex items-center gap-4">
          <div
            className="border-border flex items-center gap-2 rounded-full border px-2 py-1"
            role="group"
            aria-label="Quantity"
          >
              <button
                onClick={() => setQuantityState(q => Math.max(1, q - 1))}
                className="hover:bg-muted focus-visible:ring-ring flex size-10 items-center justify-center rounded-full focus-visible:ring-2 focus-visible:outline-none"
                aria-label="Decrease quantity"
              >
                <Minus className="size-4" aria-hidden />
              </button>
              <span className="w-6 text-center font-bold" aria-live="polite">
                {quantity}
              </span>
              <button
                onClick={() => setQuantityState(q => Math.min(50, q + 1))}
                className="hover:bg-muted focus-visible:ring-ring flex size-10 items-center justify-center rounded-full focus-visible:ring-2 focus-visible:outline-none"
                aria-label="Increase quantity"
              >
                <Plus className="size-4" aria-hidden />
              </button>
            </div>
            <Button
              size="lg"
              className="flex-1 rounded-full text-base font-bold"
              disabled={!canPurchase}
              onClick={() => {
                if (hasFlavors && flavors.length === 0) {
                  toast.error(
                    maxFlavors > 1
                      ? "Please choose at least one flavor before adding to your bag."
                      : "Please pick a flavor before adding to your bag.",
                  );
                  return;
                }
                addItem(
                  {
                    productId: product.id,
                    name: hasFlavors ? `${product.name} (${flavors.join(", ")})` : product.name,
                    priceCents: product.priceCents,
                    imageUrl: product.imageUrl,
                  },
                  quantity,
                );
                toast.success(`${product.name} added to your bag!`);
              }}
            >
              <ShoppingBag className="size-5" aria-hidden />
              {!product.inStock
                ? "Sold Out"
                : product.priceCents <= 0
                  ? "Coming Soon"
                  : "Add to Bag"}
            </Button>
          </div>

          {/* Fulfillment + practical details (only confirmed data shown) */}
          <div className="bg-muted mt-8 space-y-3 rounded-2xl p-4">
            <div className="flex flex-wrap gap-3 text-sm font-semibold">
              {product.pickupEligible && (
                <span className="inline-flex items-center gap-1.5">
                  <Store className="size-4" aria-hidden /> Pickup available
                </span>
              )}
              {product.deliveryEligible && (
                <span className="inline-flex items-center gap-1.5">
                  <Truck className="size-4" aria-hidden /> Local delivery
                </span>
              )}
              {product.leadTime && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-4" aria-hidden /> {product.leadTime}
                </span>
              )}
            </div>
            {product.allergens && (
              <p className="text-muted-foreground text-sm">
                <strong>Allergens:</strong> {product.allergens}
              </p>
            )}
            {product.ingredients && (
              <p className="text-muted-foreground text-sm">
                <strong>Ingredients:</strong> {product.ingredients}
              </p>
            )}
            {product.storageInstructions && (
              <p className="text-muted-foreground text-sm">
                <strong>Storage:</strong> {product.storageInstructions}
              </p>
            )}
            <p className="text-muted-foreground text-sm">
              {SERVICE_AREA_COPY} Pickup details are shared once your order is confirmed. Questions
              about allergens or ingredients?{" "}
              <Link href="/contact" className="underline">
                Contact us
              </Link>
              .
            </p>
          </div>
        </div>
      </div>

      {/* Related products */}
      {product.related && product.related.length > 0 && (
        <section aria-labelledby="related-heading" className="mt-14">
          <h2 id="related-heading" className="font-display mb-5 text-2xl font-extrabold">
            You might also like
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {product.related.map(rel => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
