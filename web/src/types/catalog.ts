export const productCategories = [
  "limber",
  "treat-cups",
  "cookies",
  "cheesecake",
] as const;

export type ProductCategory = (typeof productCategories)[number];

export type CatalogProduct = Readonly<{
  name: string;
  slug: string;
  description: string | null;
  priceCents: number;
  category: ProductCategory;
  size: string | null;
  flavorOptions: readonly string[];
  maxFlavorSelections: number | null;
  featured: boolean;
  sortOrder: number;
}>;
