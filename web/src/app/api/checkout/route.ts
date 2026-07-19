import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { getSiteUrl } from "@/config/site";
import {
  CartValidationError,
  checkoutRequestSchema,
  validateCart,
} from "@/server/cart";
import { getStripe, isCheckoutEnabled } from "@/server/stripe";

export const runtime = "nodejs";

function createOrderReference() {
  return `TAS-${randomBytes(4).toString("hex").toUpperCase()}`;
}

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
    const siteUrl = getSiteUrl();
    const orderReference = createOrderReference();
    const cartDigest = createHash("sha256")
      .update(JSON.stringify(cart.items))
      .digest("hex")
      .slice(0, 32);

    const session = await getStripe().checkout.sessions.create(
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
    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (error instanceof ZodError || error instanceof CartValidationError) {
      return NextResponse.json(
        {
          error:
            error instanceof CartValidationError
              ? error.message
              : "The cart is invalid.",
        },
        { status: 400 }
      );
    }

    console.error("Checkout session creation failed", error);
    return NextResponse.json(
      { error: "Checkout could not be started." },
      { status: 500 }
    );
  }
}
