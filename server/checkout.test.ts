import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

// Checkout is blocked during client review; switch review mode off here so
// the session-creation path itself can be exercised.
vi.mock("../shared/review-mode", async importOriginal => ({
  ...(await importOriginal<typeof import("../shared/review-mode")>()),
  CLIENT_REVIEW_MODE: false,
}));

const { createSession, expireSession, createOrder } = vi.hoisted(() => ({
  createSession: vi.fn(),
  expireSession: vi.fn(),
  createOrder: vi.fn(),
}));

vi.mock("stripe", () => ({
  default: class {
    checkout = { sessions: { create: createSession, expire: expireSession } };
  },
}));

vi.mock("./db-features", () => ({
  getProductsByIds: vi.fn().mockResolvedValue([
    {
      id: 1,
      name: "Limber",
      slug: "limber",
      priceCents: 150,
      description: null,
      inStock: true,
      isSeasonalActive: true,
    },
  ]),
  createOrder: (...args: unknown[]) => createOrder(...args),
}));

import { appRouter } from "./routers";

function createContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: { host: "takeasweet.example" } } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as unknown as TrpcContext["res"],
  };
}

describe("checkout.createSession order persistence", () => {
  beforeEach(() => {
    process.env.STRIPE_SECRET_KEY = "sk_test_dummy";
    createSession.mockReset().mockResolvedValue({
      id: "cs_test_new",
      url: "https://checkout.stripe.com/c/cs_test_new",
    });
    expireSession.mockReset().mockResolvedValue({});
    createOrder.mockReset();
  });

  it("saves a pending order and returns the checkout URL", async () => {
    createOrder.mockResolvedValue(1);
    const caller = appRouter.createCaller(createContext());

    const result = await caller.checkout.createSession({
      items: [{ productId: 1, quantity: 2 }],
    });

    expect(result.url).toBe("https://checkout.stripe.com/c/cs_test_new");
    expect(createOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        stripeSessionId: "cs_test_new",
        totalCents: 300,
        status: "pending",
      }),
      [expect.objectContaining({ productId: 1, quantity: 2, unitPriceCents: 150 })],
    );
    expect(expireSession).not.toHaveBeenCalled();
  });

  it("expires the Stripe session when the order cannot be saved", async () => {
    createOrder.mockRejectedValue(new Error("database unavailable"));
    const caller = appRouter.createCaller(createContext());

    await expect(
      caller.checkout.createSession({ items: [{ productId: 1, quantity: 1 }] }),
    ).rejects.toThrow(/couldn't start checkout/i);
    expect(expireSession).toHaveBeenCalledWith("cs_test_new");
  });
});
