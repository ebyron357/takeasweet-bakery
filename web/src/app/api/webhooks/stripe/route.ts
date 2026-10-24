import { NextResponse } from "next/server";

import { getPaymentStateUpdate } from "@/server/payment-events";
import { processStripeWebhook } from "@/server/database";
import {
  getStripe,
  getStripeWebhookSecret,
  hasStripeCredentials,
} from "@/server/stripe";

export const runtime = "nodejs";

const maximumWebhookBodyLength = 1_000_000;

export async function POST(request: Request) {
  if (
    !hasStripeCredentials() ||
    !process.env.STRIPE_WEBHOOK_SECRET ||
    !process.env.DATABASE_URL
  ) {
    return NextResponse.json(
      { error: "Payment processing is not configured." },
      { status: 503 }
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature." },
      { status: 400 }
    );
  }

  const rawBody = await request.text();
  if (rawBody.length > maximumWebhookBodyLength) {
    return NextResponse.json(
      { error: "Webhook payload is too large." },
      { status: 413 }
    );
  }

  let event;
  try {
    event = getStripe().webhooks.constructEvent(
      rawBody,
      signature,
      getStripeWebhookSecret()
    );
  } catch (error) {
    console.warn("Stripe webhook signature verification failed", error);
    return NextResponse.json(
      { error: "Invalid Stripe webhook signature." },
      { status: 400 }
    );
  }

  try {
    await processStripeWebhook(
      event.id,
      event.type,
      getPaymentStateUpdate(event)
    );
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook processing failed", {
      eventId: event.id,
      eventType: event.type,
      error,
    });
    return NextResponse.json(
      { error: "Stripe webhook processing failed." },
      { status: 500 }
    );
  }
}
