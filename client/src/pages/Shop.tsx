import { useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "@/components/ProductCard";
import { trpc } from "@/lib/trpc";
import { CATEGORY_LABELS } from "@shared/bakery";

const CATEGORIES = ["all", "limber", "treat-cups", "cookies", "cheesecake", "seasonal"] as const;

export default function Shop() {
  const { data: products, isLoading } = trpc.products.list.useQuery();
  const [activeCategory, setActiveCategory] = useState<(typeof CATEGORIES)[number]>("all");

  const grouped = useMemo(() => {
    const list = products ?? [];
    const filtered =
      activeCategory === "all" ? list : list.filter(p => p.category === activeCategory);
    const groups: Record<string, typeof list> = {};
    for (const product of filtered) {
      groups[product.category] = groups[product.category] ?? [];
      groups[product.category].push(product);
    }
    return groups;
  }, [products, activeCategory]);

  const orderedCategories = ["cookies", "cheesecake", "treat-cups", "limber", "seasonal"].filter(
    c => grouped[c]?.length,
  );

  return (
    <div className="container py-10 md:py-14">
      <div className="mb-8 text-center">
        <h1 className="font-display text-4xl font-extrabold sm:text-5xl">Shop All Treats</h1>
        <p className="text-muted-foreground mx-auto mt-2 max-w-md">
          Every item is handmade in small batches. Menu changes with the seasons — grab your
          favorites while they last!
        </p>
      </div>

      {/* Category filter pills */}
      <div className="mb-10 flex flex-wrap justify-center gap-2">
        {CATEGORIES.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`rounded-full px-5 py-2 text-sm font-bold transition-colors ${
              activeCategory === category
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-card hover:bg-muted border"
            }`}
          >
            {category === "all" ? "Everything" : CATEGORY_LABELS[category]}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
          ))}
        </div>
      ) : orderedCategories.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-4xl">🍪</p>
          <p className="text-muted-foreground mt-3">
            Nothing here right now — check back soon for fresh batches!
          </p>
        </div>
      ) : (
        <div className="space-y-14">
          {orderedCategories.map(category => (
            <section key={category} id={category}>
              <div className="mb-5 flex items-center gap-3">
                <h2 className="font-display text-2xl font-extrabold sm:text-3xl">
                  {CATEGORY_LABELS[category]}
                </h2>
                <div className="sprinkle-dots max-w-40 flex-1" />
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {grouped[category].map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
