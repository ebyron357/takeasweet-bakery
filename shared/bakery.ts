/** Shared bakery business constants used by both client and server. */

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

/** The bakery's local time zone, used for "today" in date checks. */
export const BAKERY_TIME_ZONE = "America/New_York";

/** Today's calendar date in Charlotte as YYYY-MM-DD. */
export function bakeryTodayIso(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: BAKERY_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: string) => parts.find(part => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** True when value is a real YYYY-MM-DD date that is today or later in Charlotte. */
export function isEventDateTodayOrLater(value: string, now: Date = new Date()): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return false;
  }
  return value >= bakeryTodayIso(now);
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export const CATEGORY_LABELS: Record<string, string> = {
  limber: "Limber",
  "treat-cups": "Treat Cups",
  cookies: "Cookies",
  cheesecake: "Cheesecake",
  seasonal: "Seasonal Treats",
};

export const PRODUCT_CATEGORIES = [
  "limber",
  "treat-cups",
  "cookies",
  "cheesecake",
  "seasonal",
] as const;
