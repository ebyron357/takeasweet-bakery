export const siteConfig = {
  name: "TakeASweet Bakery",
  description:
    "TakeASweet bakery menu, custom-order requests, and local fulfillment information.",
  serviceArea: "Charlotte, North Carolina",
} as const;

export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;

  if (!configured) return new URL("http://localhost:3000");

  return new URL(configured);
}
