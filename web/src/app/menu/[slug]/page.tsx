import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { catalog } from "@/data/catalog";
import { categoryLabels, formatPrice, getProductBySlug } from "@/lib/catalog";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return catalog.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) return {};

  return {
    title: product.name,
    description:
      product.description ??
      `${product.name} from the verified TakeASweet menu.`,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) notFound();

  return (
    <main className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
      <Link
        href="/menu"
        className="focus-visible:ring-ring inline-flex min-h-11 items-center gap-2 rounded-md text-sm font-semibold hover:underline focus-visible:ring-2 focus-visible:outline-none"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> Back to menu
      </Link>

      <article className="bg-card mt-8 rounded-2xl border p-6 shadow-sm sm:p-10">
        <p className="text-muted-foreground text-sm font-semibold tracking-widest uppercase">
          {categoryLabels[product.category]}
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
          {product.name}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-lg">
          <span className="font-bold">{formatPrice(product.priceCents)}</span>
          {product.size ? (
            <span className="text-muted-foreground">{product.size}</span>
          ) : null}
        </div>

        {product.description ? (
          <p className="text-muted-foreground mt-6 leading-7">
            {product.description}
          </p>
        ) : null}

        {product.flavorOptions.length > 0 ? (
          <section className="mt-10" aria-labelledby="flavors-title">
            <h2 id="flavors-title" className="text-2xl font-bold">
              Flavor options
            </h2>
            {product.maxFlavorSelections ? (
              <p className="text-muted-foreground mt-2 text-sm">
                Choose up to {product.maxFlavorSelections}.
              </p>
            ) : null}
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {product.flavorOptions.map((flavor) => (
                <li
                  key={flavor}
                  className="bg-background rounded-lg border px-4 py-3 font-medium"
                >
                  {flavor}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <aside className="text-muted-foreground mt-10 border-t pt-6 text-sm leading-6">
          Availability and allergen details must be confirmed directly with the
          bakery before ordering.
        </aside>
      </article>
    </main>
  );
}
