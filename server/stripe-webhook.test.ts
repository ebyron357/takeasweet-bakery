import express from "express";
import type { Express } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

const markOrderPaid = vi.fn();
const cancelOrderBySessionId = vi.fn();

vi.mock("./db-features", () => ({
  markOrderPaid: (...args: unknown[]) => markOrderPaid(...args),
  cancelOrderBySessionId: (...args: unknown[]) => cancelOrderBySessionId(...args),
}));

const constructEvent = vi.fn();
vi.mock("stripe", () => ({
  default: class {
    webhooks = { constructEvent: (...args: unknown[]) => constructEvent(...args) };
  },
}));

import { registerStripeWebhook } from "./stripe-webhook";

type Handler = (req: unknown, res: unknown) => Promise<void> | void;

/** Captures the webhook handler registered on the express app. */
function captureHandler(): Handler {
  let handler: Handler | undefined;
  const app = {
    post: (_path: string, _raw: unknown, fn: Handler) => {
      handler = fn;
    },
  } as unknown as Express;
  registerStripeWebhook(app);
  if (!handler) throw new Error("webhook handler was not registered");
  return handler;
}

function createRes() {
  const res = {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    json(payload: unknown) {
      res.body = payload;
      return res;
    },
  };
  return res;
}

const req = {
  headers: { "stripe-signature": "sig_test" },
  body: Buffer.from("{}"),
};

describe("stripe webhook order status handling", () => {
  beforeEach(() => {
    markOrderPaid.mockReset();
    cancelOrderBySessionId.mockReset();
    constructEvent.mockReset();
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
  });

  it("marks the order paid on checkout.session.completed", async () => {
    constructEvent.mockReturnValue({
      id: "evt_1",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_123",
          payment_status: "paid",
          payment_intent: "pi_test_123",
          metadata: { order_ref: "TAS-ABC123" },
        },
      },
    });
    const handler = captureHandler();
    const res = createRes();
    await handler(req, res);

    expect(markOrderPaid).toHaveBeenCalledWith("cs_test_123", "pi_test_123");
    expect(cancelOrderBySessionId).not.toHaveBeenCalled();
    expect(res.body).toEqual({ received: true });
  });

  it("does not mark paid when payment_status is unpaid", async () => {
    constructEvent.mockReturnValue({
      id: "evt_2",
      type: "checkout.session.completed",
      data: { object: { id: "cs_test_unpaid", payment_status: "unpaid", metadata: {} } },
    });
    const handler = captureHandler();
    await handler(req, createRes());

    expect(markOrderPaid).not.toHaveBeenCalled();
  });

  it("cancels the order when the checkout session expires", async () => {
    constructEvent.mockReturnValue({
      id: "evt_3",
      type: "checkout.session.expired",
      data: { object: { id: "cs_test_expired", metadata: { order_ref: "TAS-EXP001" } } },
    });
    const handler = captureHandler();
    await handler(req, createRes());

    expect(cancelOrderBySessionId).toHaveBeenCalledWith("cs_test_expired");
    expect(markOrderPaid).not.toHaveBeenCalled();
  });

  it("cancels the order when an async payment fails", async () => {
    constructEvent.mockReturnValue({
      id: "evt_4",
      type: "checkout.session.async_payment_failed",
      data: { object: { id: "cs_test_failed", metadata: {} } },
    });
    const handler = captureHandler();
    await handler(req, createRes());

    expect(cancelOrderBySessionId).toHaveBeenCalledWith("cs_test_failed");
  });

  it("returns the verification response for Stripe test events", async () => {
    constructEvent.mockReturnValue({
      id: "evt_test_abc",
      type: "checkout.session.completed",
      data: { object: { id: "cs_test_x", payment_status: "paid", metadata: {} } },
    });
    const handler = captureHandler();
    const res = createRes();
    await handler(req, res);

    expect(res.body).toEqual({ verified: true });
    expect(markOrderPaid).not.toHaveBeenCalled();
  });

  it("rejects requests with an invalid signature", async () => {
    constructEvent.mockImplementation(() => {
      throw new Error("bad signature");
    });
    const handler = captureHandler();
    const res = createRes();
    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(markOrderPaid).not.toHaveBeenCalled();
  });
});
