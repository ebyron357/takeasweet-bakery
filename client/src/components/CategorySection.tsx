import ProductCard, { type ProductCardData } from "@/components/ProductCard";
import { CATEGORY_LABELS } from "@shared/bakery";

/**
 * Reusable category section — renders a titled grid of product cards.
 * Adding/removing products in the database updates this automatically;
 * no layout edits required.
 */
export default function CategorySection({
  category,
  products,
  priceNote,
}: {
  category: string;
  products: ProductCardData[];
  priceNote?: string;
}) {
  if (products.length === 0) return null;

  return (
    <section id={category} aria-labelledby={`heading-${category}`} className="scroll-mt-24">
      <div className="mb-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 id={`heading-${category}`} className="font-display text-2xl font-extrabold sm:text-3xl">
          {CATEGORY_LABELS[category] ?? category}
        </h2>
        {priceNote && <span className="text-muted-foreground text-sm font-semibold">{priceNote}</span>}
        <div className="sprinkle-dots max-w-40 flex-1" aria-hidden />
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
