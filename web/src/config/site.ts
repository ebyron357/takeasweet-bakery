export const siteConfig = {
  name: "TakeASweet Bakery",
  description:
    "TakeASweet bakery menu, custom-order requests, and local fulfillment information.",
  serviceArea: "Charlotte, North Carolina",
} as const;

const localHostnames = new Set(["localhost", "127.0.0.1", "[::1]"]);

export function getSiteUrl() {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

  if (!configured) return new URL("http://localhost:3000");

  return new URL(configured);
}

export function isProductionSiteUrl() {
  try {
    const siteUrl = getSiteUrl();
    const isVercelPreview =
      process.env.VERCEL === "1" && process.env.VERCEL_ENV !== "production";

    return (
      siteUrl.protocol === "https:" &&
      !localHostnames.has(siteUrl.hostname) &&
      !isVercelPreview
    );
  } catch {
    return false;
  }
}

export function isSearchIndexingEnabled() {
  return (
    process.env.SEARCH_INDEXING_ENABLED === "true" && isProductionSiteUrl()
  );
}

export function getCanonicalUrl(pathname: string) {
  return new URL(pathname, getSiteUrl()).toString();
}
