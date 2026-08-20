import { catalog } from "@/data/catalog";
import type { CatalogProduct, ProductCategory } from "@/types/catalog";

export const categoryLabels: Record<ProductCategory, string> = {
  limber: "Limber",
  "treat-cups": "Treat Cups",
  cookies: "Cookies",
  cheesecake: "Cheesecake",
};

export function formatPrice(priceCents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(priceCents / 100);
}

export function getProductBySlug(slug: string) {
  return catalog.find((product) => product.slug === slug);
}

export function groupCatalogByCategory() {
  return catalog.reduce<Partial<Record<ProductCategory, CatalogProduct[]>>>(
    (groups, product) => {
      const products = groups[product.category] ?? [];
      products.push(product);
      groups[product.category] = products;
      return groups;
    },
    {}
  );
}
