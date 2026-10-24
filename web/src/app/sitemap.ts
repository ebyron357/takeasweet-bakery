import type { MetadataRoute } from "next";

import { getCanonicalUrl } from "@/config/site";
import { catalog } from "@/data/catalog";

const publicRoutes = [
  "/",
  "/menu",
  "/gallery",
  "/custom-orders",
  "/order-information",
  "/privacy",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...publicRoutes.map((route) => ({ url: getCanonicalUrl(route) })),
    ...catalog.map((product) => ({
      url: getCanonicalUrl(`/menu/${product.slug}`),
    })),
  ];
}
