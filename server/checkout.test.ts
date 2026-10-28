import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const { createSession, expireSession, createOrder, notifyOwner, getSiteSettingsData } = vi.hoisted(
  () => ({
    createSession: vi.fn(),
    expireSession: vi.fn(),
    createOrder: vi.fn(),
    notifyOwner: vi.fn(),
    getSiteSettingsData: vi.fn(),
  }),
);

vi.mock("./_core/notification", () => ({ notifyOwner }));

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
  createCustomOrderRequest: vi.fn().mockResolvedValue(undefined),
  createContactMessage: vi.fn().mockResolvedValue(undefined),
  getSiteSettingsData,
}));

import { appRouter } from "./routers";
import { clearSiteSettingsCache } from "./site-settings";

// Checkout and forms are blocked during client review; open them here so the
// session-creation path itself can be exercised.
const OPEN_FOR_BUSINESS = { reviewMode: false, paymentsEnabled: true };

beforeEach(() => {
  getSiteSettingsData.mockReset().mockResolvedValue(OPEN_FOR_BUSINESS);
  clearSiteSettingsCache();
});

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

  it("stays closed when online payments are switched off", async () => {
    getSiteSettingsData.mockResolvedValue({ reviewMode: false, paymentsEnabled: false });
    clearSiteSettingsCache();
    await expect(
      appRouter.createCaller(createContext()).checkout.createSession({
        items: [{ productId: 1, quantity: 1 }],
      }),
    ).rejects.toThrow(/checkout is disabled/i);
    expect(createSession).not.toHaveBeenCalled();
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

describe("owner notifications for form submissions", () => {
  beforeEach(() => {
    notifyOwner.mockReset().mockResolvedValue(true);
  });

  it("notifies the owner about a new custom order request", async () => {
    const caller = appRouter.createCaller(createContext());
    await caller.customOrders.submit({
      name: "Jamie",
      email: "jamie@example.com",
      eventType: "Birthday party",
      eventDate: "2099-08-01",
      quantity: 24,
      details: "Pink sprinkles please",
    });

    const { title, content } = notifyOwner.mock.calls[0][0];
    expect(title).toBe("New custom order request from Jamie");
    expect(content).toContain("Birthday party on 2099-08-01");
    expect(content).toContain("jamie@example.com");
    expect(content).toContain("Pink sprinkles please");
  });

  it("notifies the owner about a new contact message", async () => {
    const caller = appRouter.createCaller(createContext());
    await caller.contact.submit({
      name: "Jamie",
      email: "jamie@example.com",
      message: "Do you have nut-free cookies?",
    });

    const { title, content } = notifyOwner.mock.calls[0][0];
    expect(title).toBe("New contact message from Jamie");
    expect(content).toContain("Do you have nut-free cookies?");
  });

  it("still accepts the request when the notification fails", async () => {
    notifyOwner.mockRejectedValue(new Error("Notification service URL is not configured."));
    const caller = appRouter.createCaller(createContext());
    await expect(
      caller.contact.submit({ name: "Jamie", email: "jamie@example.com", message: "Hi" }),
    ).resolves.toEqual({ success: true });
  });
});
