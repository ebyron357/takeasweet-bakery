import type Stripe from "stripe";

export type PaymentStateUpdate = Readonly<{
  sessionId: string;
  status: "paid" | "cancelled";
  paymentIntentId: string | null;
  customerName: string | null;
  customerEmail: string | null;
}>;

function getId(value: string | { id: string } | null) {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

export function getPaymentStateUpdate(
  event: Pick<Stripe.Event, "type" | "data">
): PaymentStateUpdate | null {
  const supportedTypes = new Set([
    "checkout.session.completed",
    "checkout.session.async_payment_succeeded",
    "checkout.session.async_payment_failed",
    "checkout.session.expired",
  ]);

  if (!supportedTypes.has(event.type)) return null;

  const session = event.data.object as Stripe.Checkout.Session;
  if (
    event.type === "checkout.session.completed" &&
    session.payment_status !== "paid"
  ) {
    return null;
  }

  const status =
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
      ? "paid"
      : "cancelled";

  return {
    sessionId: session.id,
    status,
    paymentIntentId: getId(session.payment_intent),
    customerName: session.customer_details?.name ?? null,
    customerEmail: session.customer_details?.email ?? null,
  };
}

export function getPaidSessionUpdate(
  session: Stripe.Checkout.Session
): PaymentStateUpdate | null {
  if (session.payment_status !== "paid") return null;

  return {
    sessionId: session.id,
    status: "paid",
    paymentIntentId: getId(session.payment_intent),
    customerName: session.customer_details?.name ?? null,
    customerEmail: session.customer_details?.email ?? null,
  };
}
