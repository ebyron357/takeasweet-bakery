import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import {
  bakeryTodayIso,
  containsWeddingKeyword,
  isEventDateTodayOrLater,
} from "../shared/bakery";
import { parseSiteSettings } from "../shared/site-settings";
import { clearSiteSettingsCache, isStripeTestMode } from "./site-settings";

vi.mock("./db-features", () => ({
  listActiveProducts: vi.fn().mockResolvedValue([
    {
      id: 1,
      name: "Limber",
      slug: "limber",
      priceCents: 150,
      category: "limber",
      inStock: true,
      isSeasonalActive: true,
      description: null,
      leadTime: null,
      ingredients: null,
      allergens: null,
      storageInstructions: null,
      flavorOptions: [
        "Coconut",
        "Cherry",
        "Mango",
        "Pineapple",
        "Pina Colada",
        "Lemon",
        "Grape",
        "Tamarin",
      ],
    },
  ]),
  getProductBySlug: vi.fn().mockResolvedValue(undefined),
  getProductsByIds: vi.fn().mockResolvedValue([]),
  getProductsBySlugs: vi.fn().mockResolvedValue([]),
  listAllProducts: vi.fn().mockResolvedValue([]),
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
  createOrder: vi.fn(),
  getOrderBySessionId: vi.fn(),
  getOrderItems: vi.fn().mockResolvedValue([]),
  markOrderPaid: vi.fn(),
  cancelOrderBySessionId: vi.fn(),
  updateOrderStatus: vi.fn(),
  listOrders: vi.fn().mockResolvedValue([]),
  createCustomOrderRequest: vi.fn().mockResolvedValue(undefined),
  listCustomOrderRequests: vi.fn().mockResolvedValue([]),
  updateCustomOrderRequest: vi.fn(),
  subscribeNewsletter: vi.fn().mockResolvedValue(undefined),
  createContactMessage: vi.fn().mockResolvedValue(undefined),
  listContactMessages: vi.fn().mockResolvedValue([]),
  // No stored settings: everything falls back to the fail-closed defaults.
  getSiteSettingsData: vi.fn().mockResolvedValue(undefined),
  saveSiteSettingsData: vi.fn().mockResolvedValue(undefined),
}));

const { retrieveSession } = vi.hoisted(() => ({ retrieveSession: vi.fn() }));
vi.mock("stripe", () => ({
  default: class {
    checkout = { sessions: { retrieve: retrieveSession } };
  },
}));

function createContext(user: TrpcContext["user"] = null): TrpcContext {
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as unknown as TrpcContext["res"],
  };
}

const regularUser = {
  id: 2,
  openId: "regular-user",
  email: "user@example.com",
  name: "Regular User",
  loginMethod: "manus",
  role: "user" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

describe("shared bakery rules", () => {
  it("detects wedding keywords in any casing", () => {
    expect(containsWeddingKeyword("Wedding reception")).toBe(true);
    expect(containsWeddingKeyword("BRIDAL shower cookies")).toBe(true);
    expect(containsWeddingKeyword("birthday party")).toBe(false);
  });
});

describe("custom-order event dates", () => {
  // 11:30pm Oct 25 in Charlotte is already Oct 26 in UTC.
  const lateEveningInCharlotte = new Date("2026-10-26T03:30:00Z");

  it("uses Charlotte's calendar date for today", () => {
    expect(bakeryTodayIso(lateEveningInCharlotte)).toBe("2026-10-25");
  });

  it("accepts today and later in Charlotte, rejects earlier dates", () => {
    expect(isEventDateTodayOrLater("2026-10-25", lateEveningInCharlotte)).toBe(true);
    expect(isEventDateTodayOrLater("2026-12-01", lateEveningInCharlotte)).toBe(true);
    expect(isEventDateTodayOrLater("2026-10-24", lateEveningInCharlotte)).toBe(false);
  });

  it("rejects malformed and impossible dates", () => {
    expect(isEventDateTodayOrLater("2099-02-30")).toBe(false);
    expect(isEventDateTodayOrLater("12/01/2099")).toBe(false);
    expect(isEventDateTodayOrLater("")).toBe(false);
  });

  it("rejects a past event date server-side", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(
      caller.customOrders.submit({
        name: "Jamie",
        email: "jamie@example.com",
        eventType: "Birthday party",
        eventDate: "2020-01-01",
        quantity: 24,
      }),
    ).rejects.toThrow(/today or later/i);
  });
});

describe("client-review data controls", () => {
  it("blocks custom-order persistence server-side", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(
      caller.customOrders.submit({
        name: "Jamie",
        email: "jamie@example.com",
        eventType: "Birthday party",
        eventDate: "2099-08-01",
        quantity: 24,
      }),
    ).rejects.toThrow(/does not send or store/i);
  });

  it("blocks newsletter persistence server-side", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(
      caller.newsletter.subscribe({ email: "jamie@example.com" }),
    ).rejects.toThrow(/does not send or store/i);
  });

  it("blocks contact-message persistence server-side", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(
      caller.contact.submit({
        name: "Jamie",
        email: "jamie@example.com",
        message: "Hello",
      }),
    ).rejects.toThrow(/does not send or store/i);
  });
});

describe("products.list", () => {
  it("returns active products publicly", async () => {
    const caller = appRouter.createCaller(createContext());
    const products = await caller.products.list();
    expect(products).toHaveLength(1);
    expect(products[0].name).toBe("Limber");
    expect(products[0].flavorOptions).toContain("Tamarin");
  });
});

describe("admin gating", () => {
  it("rejects unauthenticated users", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.admin.listProducts()).rejects.toThrow();
  });

  it("rejects non-admin users", async () => {
    const caller = appRouter.createCaller(createContext(regularUser));
    await expect(caller.admin.listProducts()).rejects.toThrow(/admin/i);
  });

  it("allows admin users", async () => {
    const caller = appRouter.createCaller(
      createContext({ ...regularUser, id: 1, role: "admin" }),
    );
    const products = await caller.admin.listProducts();
    expect(Array.isArray(products)).toBe(true);
  });
});

describe("checkout.createSession validation", () => {
  it("rejects an empty cart", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.checkout.createSession({ items: [] })).rejects.toThrow();
  });

  it("blocks checkout server-side during client review", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(
      caller.checkout.createSession({ items: [{ productId: 999, quantity: 1 }] }),
    ).rejects.toThrow(/checkout is disabled/i);
  });

  it("rejects quantities above the per-item cap", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(
      caller.checkout.createSession({ items: [{ productId: 1, quantity: 999 }] }),
    ).rejects.toThrow();
  });
});

describe("checkout.confirmation protection", () => {
  it("rejects an unknown session id", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(
      caller.checkout.confirmation({ sessionId: "cs_test_does_not_exist" }),
    ).rejects.toThrow(/not found/i);
  });

  it("requires a non-empty session id", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.checkout.confirmation({ sessionId: "" })).rejects.toThrow();
  });

  it("does not confirm an order cancelled while Stripe was being checked", async () => {
    const dbf = await import("./db-features");
    const order = {
      id: 7,
      orderRef: "TAS-RACE01",
      totalCents: 500,
      stripeSessionId: "cs_test_race",
    };
    vi.mocked(dbf.getOrderBySessionId)
      .mockResolvedValueOnce({ ...order, status: "pending" } as never)
      .mockResolvedValueOnce({ ...order, status: "cancelled" } as never);
    retrieveSession.mockResolvedValueOnce({ payment_status: "paid", payment_intent: "pi_1" });
    process.env.STRIPE_SECRET_KEY = "sk_test_dummy";

    const caller = appRouter.createCaller(createContext());
    await expect(
      caller.checkout.confirmation({ sessionId: "cs_test_race" }),
    ).rejects.toThrow(/has not been completed/i);
    expect(dbf.markOrderPaid).toHaveBeenCalledWith("cs_test_race", "pi_1", {
      name: null,
      email: null,
    });
  });
});

describe("site settings", () => {
  const admin = { ...regularUser, id: 1, role: "admin" as const };

  it("fails closed when nothing is stored", () => {
    const settings = parseSiteSettings(undefined);
    expect(settings.reviewMode).toBe(true);
    expect(settings.paymentsEnabled).toBe(false);
    expect(settings.socialLinks).toEqual({ facebook: "", instagram: "", tiktok: "" });
    expect(settings.gallery).toEqual([]);
    expect(settings.faq).toEqual([]);
    expect(settings.images.hero).toBeNull();
  });

  it("falls back to the defaults when the stored document is invalid", () => {
    const settings = parseSiteSettings({ reviewMode: false, socialLinks: { facebook: 42 } });
    expect(settings.reviewMode).toBe(true);
  });

  it("keeps stored values and fills in missing fields", () => {
    const settings = parseSiteSettings({
      reviewMode: false,
      socialLinks: { instagram: "https://www.instagram.com/takeasweet" },
    });
    expect(settings.reviewMode).toBe(false);
    expect(settings.paymentsEnabled).toBe(false);
    expect(settings.socialLinks.instagram).toBe("https://www.instagram.com/takeasweet");
    expect(settings.socialLinks.facebook).toBe("");
  });

  it("never sends pickup instructions to the public", async () => {
    const dbf = await import("./db-features");
    vi.mocked(dbf.getSiteSettingsData).mockResolvedValueOnce({
      pickupInstructions: "Private pickup details",
    });
    clearSiteSettingsCache();
    const settings = await appRouter.createCaller(createContext()).site.settings();
    expect(settings).not.toHaveProperty("pickupInstructions");
    expect(JSON.stringify(settings)).not.toContain("Private pickup details");
    clearSiteSettingsCache();
  });

  it("detects Stripe test keys", () => {
    expect(isStripeTestMode("sk_test_abc")).toBe(true);
    expect(isStripeTestMode("rk_test_abc")).toBe(true);
    expect(isStripeTestMode("sk_live_abc")).toBe(false);
    expect(isStripeTestMode(undefined)).toBe(true);
  });

  it("only lets admins change settings", async () => {
    const caller = appRouter.createCaller(createContext(regularUser));
    await expect(caller.admin.updateSettings(parseSiteSettings(undefined))).rejects.toThrow(
      /admin/i,
    );
  });

  it("saves valid settings from an admin", async () => {
    const dbf = await import("./db-features");
    const settings = { ...parseSiteSettings(undefined), serviceArea: "Serving Charlotte" };
    await appRouter.createCaller(createContext(admin)).admin.updateSettings(settings);
    expect(dbf.saveSiteSettingsData).toHaveBeenCalledWith(settings);
    clearSiteSettingsCache();
  });

  it("rejects social links that are not https", async () => {
    const caller = appRouter.createCaller(createContext(admin));
    await expect(
      caller.admin.updateSettings({
        ...parseSiteSettings(undefined),
        socialLinks: { facebook: "javascript:alert(1)", instagram: "", tiktok: "" },
      }),
    ).rejects.toThrow(/https/);
  });
});
