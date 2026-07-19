import "server-only";

import Stripe from "stripe";

import { isCheckoutLaunchEnabled } from "@/config/launch";

let stripe: Stripe | undefined;

export function isCheckoutEnabled() {
  return isCheckoutLaunchEnabled();
}

export function hasStripeCredentials() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Stripe is not configured.");
  }

  stripe ??= new Stripe(secretKey);
  return stripe;
}
