import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { categoryLabels, formatPrice } from "@/lib/catalog";
import type { CatalogProduct } from "@/types/catalog";

export function ProductCard({ product }: { product: CatalogProduct }) {
  return (
    <article className="bg-card flex h-full flex-col rounded-xl border p-5 shadow-sm">
      <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
        {categoryLabels[product.category]}
      </p>
      <h3 className="mt-2 text-xl font-bold">{product.name}</h3>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <span className="font-bold">{formatPrice(product.priceCents)}</span>
        {product.size ? (
          <span className="text-muted-foreground">{product.size}</span>
        ) : null}
      </div>
      {product.description ? (
        <p className="text-muted-foreground mt-4 text-sm leading-6">
          {product.description}
        </p>
      ) : null}
      {product.flavorOptions.length > 0 ? (
        <p className="text-muted-foreground mt-4 text-sm">
          {product.flavorOptions.length} flavor options
        </p>
      ) : null}
      <Link
        href={`/menu/${product.slug}`}
        className="text-foreground focus-visible:ring-ring mt-auto inline-flex min-h-11 items-center gap-2 pt-5 text-sm font-bold underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:outline-none"
        aria-label={`View ${product.name}`}
      >
        View details <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </article>
  );
}
