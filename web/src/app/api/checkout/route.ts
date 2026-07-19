import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { getSiteUrl } from "@/config/site";
import {
  CartValidationError,
  checkoutRequestSchema,
  validateCart,
} from "@/server/cart";
import {
  OrderPersistenceError,
  resolvePersistableOrderItems,
  savePendingOrder,
} from "@/server/database";
import { createOrderReference } from "@/server/order-reference";
import { getStripe, isCheckoutEnabled } from "@/server/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isCheckoutEnabled()) {
    return NextResponse.json(
      { error: "Online checkout is not available yet." },
      { status: 503 }
    );
  }

  try {
    const payload = checkoutRequestSchema.parse(await request.json());
    const cart = validateCart(payload.items);
    const persistableItems = await resolvePersistableOrderItems(cart.items);
    const siteUrl = getSiteUrl();
    const orderReference = createOrderReference(payload.checkoutToken);
    const cartDigest = createHash("sha256")
      .update(JSON.stringify(cart.items))
      .digest("hex")
      .slice(0, 32);

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        billing_address_collection: "auto",
        customer_creation: "always",
        success_url: new URL(
          "/order/success?session_id={CHECKOUT_SESSION_ID}",
          siteUrl
        ).toString(),
        cancel_url: new URL("/cart", siteUrl).toString(),
        client_reference_id: orderReference,
        metadata: { orderReference, cartDigest },
        payment_intent_data: { metadata: { orderReference, cartDigest } },
        line_items: cart.items.map((item) => ({
          quantity: item.quantity,
          price_data: {
            currency: "usd",
            unit_amount: item.unitPriceCents,
            product_data: {
              name: item.name,
              description:
                item.selectedFlavors.length > 0
                  ? `Flavors: ${item.selectedFlavors.join(", ")}`
                  : undefined,
              metadata: { slug: item.slug },
            },
          },
        })),
      },
      { idempotencyKey: `checkout-${payload.checkoutToken}-${cartDigest}` }
    );

    if (!session.url) throw new Error("Stripe did not return a checkout URL.");

    try {
      await savePendingOrder({
        orderReference,
        stripeSessionId: session.id,
        totalCents: cart.totalCents,
        items: persistableItems,
      });
    } catch (error) {
      try {
        if (session.status === "open") {
          await stripe.checkout.sessions.expire(session.id);
        }
      } catch (expirationError) {
        console.error("Orphaned Checkout Session could not be expired", {
          sessionId: session.id,
          expirationError,
        });
      }
      throw error;
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (
      error instanceof ZodError ||
      error instanceof CartValidationError ||
      error instanceof OrderPersistenceError
    ) {
      return NextResponse.json(
        {
          error:
            error instanceof CartValidationError ||
            error instanceof OrderPersistenceError
              ? error.message
              : "The cart is invalid.",
        },
        { status: error instanceof OrderPersistenceError ? 409 : 400 }
      );
    }

    console.error("Checkout session creation failed", error);
    return NextResponse.json(
      { error: "Checkout could not be started." },
      { status: 500 }
    );
  }
}
