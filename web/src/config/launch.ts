import { z } from "zod";

const publicEmailSchema = z.email().max(254);

export function getPrivacyContactEmail() {
  const result = publicEmailSchema.safeParse(
    process.env.PRIVACY_CONTACT_EMAIL?.trim()
  );
  return result.success ? result.data : null;
}

export function isCheckoutLaunchEnabled() {
  return (
    process.env.PAYMENTS_ENABLED === "true" &&
    Boolean(process.env.STRIPE_SECRET_KEY) &&
    Boolean(getPrivacyContactEmail())
  );
}

export function isCustomOrderLaunchEnabled() {
  return (
    process.env.CUSTOM_ORDER_REQUESTS_ENABLED === "true" &&
    Boolean(process.env.DATABASE_URL) &&
    Boolean(getPrivacyContactEmail())
  );
}
