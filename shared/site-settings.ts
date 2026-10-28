import { z } from "zod";

/**
 * Owner-editable site settings, stored in the database and managed from the
 * admin panel. Every field has a fail-closed default: if the settings row is
 * missing or unreadable, data collection and checkout stay off and empty
 * content sections are hidden rather than filled with placeholder text.
 */

const text = (max: number) => z.string().trim().max(max).default("");

const linkSchema = z
  .string()
  .trim()
  .max(500)
  .refine(value => value === "" || /^https:\/\//.test(value), {
    message: "Links must start with https://",
  })
  .default("");

const imageUrlSchema = z
  .string()
  .trim()
  .min(1)
  .max(500)
  .refine(value => value.startsWith("/") || /^https:\/\//.test(value), {
    message: "Image URLs must start with / or https://",
  });

export const siteImageSchema = z.object({
  url: imageUrlSchema,
  alt: z.string().trim().min(1).max(300),
  /** Optional line shown under the image, e.g. a note that it is illustrative. */
  caption: text(200),
});

export const faqItemSchema = z.object({
  question: z.string().trim().min(1).max(300),
  answer: z.string().trim().min(1).max(2000),
});

export const siteSettingsSchema = z.object({
  /**
   * While true, the custom order, contact, and newsletter forms transmit
   * nothing, checkout is blocked, and search engines are asked not to index.
   */
  reviewMode: z.boolean().default(true),
  /** Lets the cart start a Stripe Checkout session (also needs a Stripe key). */
  paymentsEnabled: z.boolean().default(false),

  announcement: text(200),
  serviceArea: text(200),
  contactEmail: z.union([z.literal(""), z.string().trim().email().max(320)]).default(""),
  socialLinks: z
    .object({ facebook: linkSchema, instagram: linkSchema, tiktok: linkSchema })
    .prefault({}),

  logo: siteImageSchema.nullable().default(null),
  images: z
    .object({
      hero: siteImageSchema.nullable().default(null),
      founderPortrait: siteImageSchema.nullable().default(null),
      community: siteImageSchema.nullable().default(null),
      customOrders: siteImageSchema.nullable().default(null),
      storyFeature: siteImageSchema.nullable().default(null),
    })
    .prefault({}),
  /** Authentic photos of the bakery's work. The gallery is hidden while empty. */
  gallery: z.array(siteImageSchema).max(60).default([]),
  faq: z.array(faqItemSchema).max(40).default([]),

  /** Private: shown only on the confirmation page after a paid order. */
  pickupInstructions: text(2000),
});

export type SiteImage = z.infer<typeof siteImageSchema>;
export type FaqItem = z.infer<typeof faqItemSchema>;
export type SiteSettings = z.infer<typeof siteSettingsSchema>;
export type SiteImageKey = keyof SiteSettings["images"];

/** Settings safe to send to every visitor, plus payment state derived on the server. */
export type PublicSiteSettings = Omit<SiteSettings, "pickupInstructions"> & {
  /** True when Stripe is configured with test keys, so no real money can move. */
  paymentsTestMode: boolean;
};

/** Parses stored settings, falling back to the fail-closed default per field. */
export function parseSiteSettings(raw: unknown): SiteSettings {
  const parsed = siteSettingsSchema.safeParse(raw ?? {});
  return parsed.success ? parsed.data : siteSettingsSchema.parse({});
}

export const REVIEW_CHECKOUT_NOTICE =
  "Online checkout is disabled during client review. Prices and cart totals are shown for preview only.";

export const REVIEW_FORM_NOTICE =
  "During client review, this form does not send or store any information.";

export const CHECKOUT_UNAVAILABLE_NOTICE =
  "Online checkout isn't available right now. Please contact us to place an order.";
