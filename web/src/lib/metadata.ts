import type { Metadata } from "next";

import { siteConfig } from "@/config/site";

type PageMetadataInput = Readonly<{
  title: string;
  description: string;
  path: `/${string}` | "/";
}>;

export function createPageMetadata({
  title,
  description,
  path,
}: PageMetadataInput): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: siteConfig.name,
      title,
      description,
      url: path,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
