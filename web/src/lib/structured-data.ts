import { catalog } from "@/data/catalog";
import { getCanonicalUrl, siteConfig } from "@/config/site";
import type { CatalogProduct } from "@/types/catalog";

export function createSiteStructuredData() {
  const organizationId = getCanonicalUrl("/#organization");
  const websiteId = getCanonicalUrl("/#website");

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: siteConfig.name,
        url: getCanonicalUrl("/"),
        description: siteConfig.description,
        areaServed: {
          "@type": "City",
          name: siteConfig.serviceArea,
        },
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: getCanonicalUrl("/"),
        name: siteConfig.name,
        description: siteConfig.description,
        publisher: { "@id": organizationId },
        inLanguage: "en-US",
      },
    ],
  };
}

export function createMenuStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "TakeASweet verified bakery menu",
    itemListElement: catalog.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "WebPage",
        "@id": getCanonicalUrl(`/menu/${product.slug}`),
        name: product.name,
      },
    })),
  };
}

export function createProductBreadcrumbs(product: CatalogProduct) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: getCanonicalUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Menu",
        item: getCanonicalUrl("/menu"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: getCanonicalUrl(`/menu/${product.slug}`),
      },
    ],
  };
}
