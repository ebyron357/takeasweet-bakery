import type { Metadata } from "next";

import { ProductCard } from "@/components/product-card";
import { StructuredData } from "@/components/structured-data";
import { categoryLabels, groupCatalogByCategory } from "@/lib/catalog";
import { createPageMetadata } from "@/lib/metadata";
import { createMenuStructuredData } from "@/lib/structured-data";
import { productCategories } from "@/types/catalog";

export const metadata: Metadata = createPageMetadata({
  title: "Menu",
  description: "Browse the verified TakeASweet bakery menu.",
  path: "/menu",
});

export default function MenuPage() {
  const groups = groupCatalogByCategory();

  return (
    <>
      <StructuredData data={createMenuStructuredData()} />
      <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <header className="max-w-2xl">
          <p className="text-muted-foreground text-sm font-semibold tracking-widest uppercase">
            Verified menu
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
            Treats and sweets
          </h1>
          <p className="text-muted-foreground mt-4 leading-7">
            Prices and selections below are drawn from the bakery&apos;s
            approved catalog. Contact the bakery before relying on availability
            or allergen information.
          </p>
        </header>

        <nav className="mt-8 overflow-x-auto" aria-label="Menu categories">
          <ul className="flex min-w-max gap-2 pb-2">
            {productCategories.map((category) => (
              <li key={category}>
                <a
                  href={`#${category}`}
                  className="bg-card hover:bg-muted focus-visible:ring-ring inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-semibold focus-visible:ring-2 focus-visible:outline-none"
                >
                  {categoryLabels[category]}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-12 space-y-16">
          {productCategories.map((category) => {
            const products = groups[category] ?? [];
            if (products.length === 0) return null;

            return (
              <section
                key={category}
                id={category}
                aria-labelledby={`${category}-title`}
              >
                <h2
                  id={`${category}-title`}
                  className="text-3xl font-bold tracking-tight"
                >
                  {categoryLabels[category]}
                </h2>
                <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {products.map((product) => (
                    <ProductCard key={product.slug} product={product} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </main>
    </>
  );
}
