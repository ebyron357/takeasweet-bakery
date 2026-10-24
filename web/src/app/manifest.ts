import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: "TakeASweet",
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#fdfaf2",
    theme_color: "#fdfaf2",
  };
}
