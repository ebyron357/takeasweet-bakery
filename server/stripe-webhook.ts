import express, { type Express, type Request, type Response } from "express";
import Stripe from "stripe";
import { cancelOrderBySessionId, markOrderPaid } from "./db-features";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");

/**
 * Registers the Stripe webhook route. MUST be called BEFORE express.json()
 * middleware so the raw body is available for signature verification.
 *
 * Handled events:
 *  - checkout.session.completed  -> order marked "paid"
 *  - checkout.session.expired    -> order marked "cancelled"
 *  - checkout.session.async_payment_failed -> order marked "cancelled"
 */
export function registerStripeWebhook(app: Express) {
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req: Request, res: Response) => {
      const signature = req.headers["stripe-signature"];
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      let event: Stripe.Event;
      try {
        if (!signature || !webhookSecret) {
          throw new Error("Missing signature or webhook secret");
        }
        event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
      } catch (error) {
        console.error("[Stripe Webhook] Signature verification failed:", error);
        return res.status(400).json({ error: "Invalid signature" });
      }

      if (event.id.startsWith("evt_test_")) {
        console.log("[Webhook] Test event detected, returning verification response");
        return res.json({
          verified: true,
        });
      }

      try {
        switch (event.type) {
          case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            if (session.payment_status === "paid") {
              await markOrderPaid(
                session.id,
                typeof session.payment_intent === "string" ? session.payment_intent : undefined,
              );
              console.log(
                `[Stripe Webhook] Order paid: session=${session.id} ref=${session.metadata?.order_ref}`,
              );
            }
            break;
          }
          case "checkout.session.expired":
          case "checkout.session.async_payment_failed": {
            const session = event.data.object as Stripe.Checkout.Session;
            await cancelOrderBySessionId(session.id);
            console.log(
              `[Stripe Webhook] Order cancelled (${event.type}): session=${session.id} ref=${session.metadata?.order_ref}`,
            );
            break;
          }
          default:
            console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
        }
      } catch (error) {
        console.error("[Stripe Webhook] Handler error:", error);
        return res.status(500).json({ error: "Webhook handler failed" });
      }

      return res.json({ received: true });
    },
  );
}
