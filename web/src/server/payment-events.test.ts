import type Stripe from "stripe";
import { describe, expect, it } from "vitest";

import {
  getPaidSessionUpdate,
  getPaymentStateUpdate,
} from "@/server/payment-events";

function event(
  type: string,
  paymentStatus: "paid" | "unpaid" = "paid"
): Pick<Stripe.Event, "type" | "data"> {
  return {
    type,
    data: {
      object: {
        id: "cs_test_123",
        payment_status: paymentStatus,
        payment_intent: "pi_123",
        customer_details: { name: "Customer", email: "customer@example.com" },
      },
    },
  } as Pick<Stripe.Event, "type" | "data">;
}

describe("Stripe payment events", () => {
  it("marks completed paid sessions as paid", () => {
    expect(getPaymentStateUpdate(event("checkout.session.completed"))).toEqual({
      sessionId: "cs_test_123",
      status: "paid",
      paymentIntentId: "pi_123",
      customerName: "Customer",
      customerEmail: "customer@example.com",
    });
  });

  it("waits for a delayed payment to succeed", () => {
    expect(
      getPaymentStateUpdate(event("checkout.session.completed", "unpaid"))
    ).toBeNull();
    expect(
      getPaymentStateUpdate(event("checkout.session.async_payment_succeeded"))
        ?.status
    ).toBe("paid");
  });

  it.each([
    "checkout.session.async_payment_failed",
    "checkout.session.expired",
  ])("cancels pending orders for %s", (type) => {
    expect(getPaymentStateUpdate(event(type))?.status).toBe("cancelled");
  });

  it("ignores unrelated events", () => {
    expect(getPaymentStateUpdate(event("payment_intent.created"))).toBeNull();
  });

  it("can reconcile a paid session loaded on the return page", () => {
    const session = event("checkout.session.completed").data
      .object as Stripe.Checkout.Session;
    expect(getPaidSessionUpdate(session)?.status).toBe("paid");
  });
});
