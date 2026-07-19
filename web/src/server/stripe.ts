import "server-only";

import Stripe from "stripe";

let stripe: Stripe | undefined;

export function isCheckoutEnabled() {
  return (
    process.env.PAYMENTS_ENABLED === "true" &&
    Boolean(process.env.STRIPE_SECRET_KEY)
  );
}

export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || process.env.PAYMENTS_ENABLED !== "true") {
    throw new Error("Checkout is not enabled.");
  }

  stripe ??= new Stripe(secretKey);
  return stripe;
}
