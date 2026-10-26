import type Stripe from "stripe";
import { formatPrice } from "../shared/bakery";
import { notifyOwner, type NotificationPayload } from "./_core/notification";
import { getOrderBySessionId, getOrderItems, type CheckoutCustomer } from "./db-features";

/** Name and email the customer entered on the Stripe Checkout page. */
export function customerFromSession(session: Stripe.Checkout.Session): CheckoutCustomer {
  return {
    name: session.customer_details?.name ?? null,
    email: session.customer_details?.email ?? null,
  };
}

/**
 * Sends an owner notification without ever failing the caller: a customer's
 * order or request must not error because the notification service is down.
 */
export async function notifyOwnerSafely(payload: NotificationPayload): Promise<void> {
  try {
    const delivered = await notifyOwner(payload);
    if (!delivered) console.warn(`[Notify] Owner notification not delivered: ${payload.title}`);
  } catch (error) {
    console.warn(`[Notify] Owner notification skipped: ${payload.title}`, error);
  }
}

export async function notifyOrderPaid(sessionId: string): Promise<void> {
  try {
    const order = await getOrderBySessionId(sessionId);
    if (!order) return;
    const items = await getOrderItems(order.id);
    const lines = [
      `Order ${order.orderRef} was paid: ${formatPrice(order.totalCents)}.`,
      "",
      ...items.map(item => `- ${item.quantity} × ${item.productName}`),
      "",
      `Customer: ${order.customerName ?? "(no name given)"}`,
      `Email: ${order.customerEmail ?? "(no email given)"}`,
      "",
      "Email the customer to confirm their pickup day and location.",
    ];
    await notifyOwnerSafely({
      title: `New paid order ${order.orderRef}`,
      content: lines.join("\n"),
    });
  } catch (error) {
    console.warn("[Notify] Could not build paid-order notification:", error);
  }
}
