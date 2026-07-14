/** Shared bakery business constants used by both client and server. */

export const SERVICE_AREA_COPY = "Serving Charlotte, North Carolina.";

export const ANNOUNCEMENT_COPY =
  "Fresh treats made in Charlotte — pickup and local delivery available.";

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

/** Four Corners Cheesecake configuration. */
export const FOUR_CORNERS_PRICE_CENTS = 2000;
export const FOUR_CORNERS_MAX_FLAVORS = 4;

/**
 * Editable FAQ content. The bakery owner should review and adjust these
 * answers — placeholders avoid inventing policies not confirmed by the client.
 */
export const FAQ_ITEMS = [
  {
    question: "How much advance notice do you need for an order?",
    answer:
      "Standard menu items are baked in weekly batches. For custom orders, please reach out as early as you can — we confirm availability when we review your request.",
  },
  {
    question: "Where do I pick up my order?",
    answer:
      "Pickup details are shared after your order is confirmed. We serve Charlotte, North Carolina.",
  },
  {
    question: "Do you deliver?",
    answer:
      "Local delivery is available within our approved service area. Delivery details are confirmed when your order is reviewed.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "Standard menu items can be paid for securely online at checkout. Custom orders are invoiced after your request is approved.",
  },
  {
    question: "Do custom orders require a deposit?",
    answer:
      "Large or custom orders may require approval and a deposit before we begin baking. We'll include the details in your quote.",
  },
  {
    question: "Do you list allergens?",
    answer:
      "Please contact us about allergens before ordering — we're happy to answer questions about specific items.",
  },
  {
    question: "Can I request a custom dessert?",
    answer:
      "Yes! We love custom requests for birthdays, showers, and celebrations. Please note we aren't able to take wedding orders.",
  },
] as const;
