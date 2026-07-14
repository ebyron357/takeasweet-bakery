import { Link } from "wouter";
import { Plus } from "lucide-react";
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

export default function ProductCard({ product }: { product: ProductCardData }) {
  const { addItem } = useCart();

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
            <div className="text-muted-foreground flex size-full items-center justify-center text-4xl">
              🍪
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
            {formatPrice(product.priceCents)}
          </span>
          <Button
            size="sm"
            className="rounded-full font-bold"
            disabled={!product.inStock}
            aria-label={`Add ${product.name} to cart`}
            onClick={() => {
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
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
