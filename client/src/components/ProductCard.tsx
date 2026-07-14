import { Link, useLocation } from "wouter";
import { Camera, Plus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@shared/bakery";

export type ProductCardData = {
  id: number;
  name: string;
  slug: string;
  priceCents: number;
  imageUrl: string | null;
  category: string;
  inStock: boolean;
};

/** Products that require options (e.g. flavor selection) before adding to cart. */
const REQUIRES_OPTIONS_SLUGS = ["four-corners-cheesecake"];

export default function ProductCard({ product }: { product: ProductCardData }) {
  const { addItem } = useCart();
  const [, navigate] = useLocation();
  const requiresOptions = REQUIRES_OPTIONS_SLUGS.includes(product.slug);

  return (
    <div className="group bg-card border-border/60 flex flex-col overflow-hidden rounded-2xl border shadow-sm transition-shadow hover:shadow-md">
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
              <Camera className="size-6 opacity-60" />
              <span className="px-3 text-[11px] leading-snug font-semibold">
                Real photo coming soon
              </span>
            </div>
          )}
        </div>
        {!product.inStock && (
          <Badge
            variant="secondary"
            className="absolute top-2 left-2 rounded-full font-bold"
          >
            Sold Out
          </Badge>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-3.5">
        <Link href={`/product/${product.slug}`}>
          <h3 className="text-sm leading-snug font-bold hover:underline sm:text-base">
            {product.name}
          </h3>
        </Link>
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
            aria-label={`Add ${product.name} to cart`}
            onClick={() => {
              if (requiresOptions) {
                navigate(`/product/${product.slug}`);
                toast.info("Choose your flavors before adding to your bag!");
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
            <Plus className="size-4" />
            {requiresOptions ? "Choose" : "Add"}
          </Button>
        </div>
      </div>
    </div>
  );
}
