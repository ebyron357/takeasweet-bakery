import type { MetadataRoute } from "next";

import {
  getCanonicalUrl,
  getSiteUrl,
  isSearchIndexingEnabled,
} from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  if (!isSearchIndexingEnabled()) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: getCanonicalUrl("/sitemap.xml"),
    host: getSiteUrl().origin,
  };
}
