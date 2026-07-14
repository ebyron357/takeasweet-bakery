/** Shared bakery business constants used by both client and server. */

export const SERVICE_AREA_COPY = "Serving Charlotte, North Carolina.";

export const ANNOUNCEMENT_COPY =
  "Fresh batches every week — order online for local pickup in Charlotte!";

/**
 * Pickup details are ONLY shown after a completed purchase.
 * Never render this on a public-facing page.
 */
export const PICKUP_INSTRUCTIONS =
  "Thanks for your order! We'll email you within 24 hours to confirm your pickup day and our Charlotte pickup location. Pickup is typically available Friday through Sunday.";

/** Event types offered on the custom order form. Weddings are intentionally excluded. */
export const CUSTOM_EVENT_TYPES = [
  "Birthday party",
  "Baby shower",
  "Graduation",
  "School event",
  "Sports team celebration",
  "Corporate / office event",
  "Holiday gathering",
  "Other celebration",
] as const;

/** Keywords used to detect and block wedding-related requests server-side. */
export const WEDDING_KEYWORDS = ["wedding", "bridal", "bride", "groom", "elopement"];

export function containsWeddingKeyword(text: string): boolean {
  const lower = text.toLowerCase();
  return WEDDING_KEYWORDS.some(keyword => lower.includes(keyword));
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export const CATEGORY_LABELS: Record<string, string> = {
  cookies: "Cookies",
  treats: "Treats",
  seasonal: "Seasonal",
};
