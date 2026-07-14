import { Link, useLocation } from "wouter";
import { Camera, Plus, Store, Truck } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@shared/bakery";

/**
 * Public product shape consumed by storefront components.
 * Internal-only fields (ingredients, allergens, leadTime, etc.) are already
 * sanitized server-side and never reach this component.
 */
export type ProductCardData = {
  id: number;
  name: string;
  slug: string;
  priceCents: number;
  imageUrl: string | null;
  category: string;
  size: string | null;
  flavorOptions: string[] | null;
  maxFlavorSelections: number | null;
  inStock: boolean;
  isSeasonal: boolean;
  pickupEligible: boolean;
  deliveryEligible: boolean;
};

export default function ProductCard({ product }: { product: ProductCardData }) {
  const { addItem } = useCart();
  const [, navigate] = useLocation();
  // Products with selectable flavors must be configured on their detail page.
  const requiresOptions = (product.flavorOptions?.length ?? 0) > 0;

  return (
    <article className="group bg-card border-border/60 flex flex-col overflow-hidden rounded-2xl border shadow-sm transition-shadow hover:shadow-md">
      <Link href={`/product/${product.slug}`} className="relative block overflow-hidden">
        <div className="bg-muted aspect-square w-full overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              loading="lazy"
              className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="text-muted-foreground border-border m-3 flex h-[calc(100%-1.5rem)] flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed text-center">
              <Camera className="size-6 opacity-60" aria-hidden />
              <span className="px-3 text-[11px] leading-snug font-semibold">
                Real photo coming soon
              </span>
            </div>
          )}
        </div>
        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
          {product.isSeasonal && (
            <Badge className="bg-accent text-accent-foreground rounded-full font-bold">
              Seasonal
            </Badge>
          )}
          {!product.inStock && (
            <Badge variant="secondary" className="rounded-full font-bold">
              Sold Out
            </Badge>
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-3.5">
        <Link href={`/product/${product.slug}`}>
          <h3 className="text-sm leading-snug font-bold hover:underline sm:text-base">
            {product.name}
          </h3>
        </Link>
        {product.size && <p className="text-muted-foreground text-xs">{product.size}</p>}
        {requiresOptions && (
          <p className="text-muted-foreground line-clamp-2 text-xs">
            <span className="font-semibold">Flavors:</span> {product.flavorOptions!.join(", ")}
          </p>
        )}
        <div
          className="text-muted-foreground mt-0.5 flex items-center gap-2 text-[11px]"
          aria-label="Fulfillment options"
        >
          {product.pickupEligible && (
            <span className="inline-flex items-center gap-0.5">
              <Store className="size-3" aria-hidden /> Pickup
            </span>
          )}
          {product.deliveryEligible && (
            <span className="inline-flex items-center gap-0.5">
              <Truck className="size-3" aria-hidden /> Delivery
            </span>
          )}
        </div>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-display text-base font-bold sm:text-lg">
            {product.priceCents > 0 ? (
              formatPrice(product.priceCents)
            ) : (
              <span className="text-muted-foreground text-sm font-semibold">Price TBD</span>
            )}
          </span>
          <Button
            size="sm"
            className="rounded-full font-bold"
            disabled={!product.inStock || product.priceCents <= 0}
            aria-label={
              requiresOptions
                ? `Choose options for ${product.name}`
                : `Add ${product.name} to cart`
            }
            onClick={() => {
              if (requiresOptions) {
                navigate(`/product/${product.slug}`);
                toast.info("Choose your flavor before adding to your bag!");
                return;
              }
              addItem({
                productId: product.id,
                name: product.name,
                priceCents: product.priceCents,
                imageUrl: product.imageUrl,
              });
              toast.success(`${product.name} added to your bag!`);
            }}
          >
            <Plus className="size-4" aria-hidden />
            {requiresOptions ? "Choose" : "Add"}
          </Button>
        </div>
      </div>
    </article>
  );
}
