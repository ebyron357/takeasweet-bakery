import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { containsWeddingKeyword, SERVICE_AREA_COPY } from "../shared/bakery";

vi.mock("./db-features", () => ({
  listActiveProducts: vi.fn().mockResolvedValue([
    {
      id: 1,
      name: "Classic Chocolate Chip",
      slug: "classic-chocolate-chip",
      priceCents: 350,
      category: "cookies",
      inStock: true,
      isSeasonalActive: true,
    },
  ]),
  getProductBySlug: vi.fn().mockResolvedValue(undefined),
  getProductsByIds: vi.fn().mockResolvedValue([]),
  listAllProducts: vi.fn().mockResolvedValue([]),
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
  createOrder: vi.fn(),
  getOrderBySessionId: vi.fn(),
  getOrderItems: vi.fn().mockResolvedValue([]),
  markOrderPaid: vi.fn(),
  updateOrderStatus: vi.fn(),
  listOrders: vi.fn().mockResolvedValue([]),
  createCustomOrderRequest: vi.fn().mockResolvedValue(undefined),
  listCustomOrderRequests: vi.fn().mockResolvedValue([]),
  updateCustomOrderRequest: vi.fn(),
  subscribeNewsletter: vi.fn().mockResolvedValue(undefined),
  createContactMessage: vi.fn().mockResolvedValue(undefined),
  listContactMessages: vi.fn().mockResolvedValue([]),
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
  it("exposes the exact service-area copy", () => {
    expect(SERVICE_AREA_COPY).toBe("Serving Charlotte, North Carolina.");
  });

  it("detects wedding keywords in any casing", () => {
    expect(containsWeddingKeyword("Wedding reception")).toBe(true);
    expect(containsWeddingKeyword("BRIDAL shower cookies")).toBe(true);
    expect(containsWeddingKeyword("birthday party")).toBe(false);
  });
});

describe("customOrders.submit", () => {
  const validInput = {
    name: "Jamie",
    email: "jamie@example.com",
    eventType: "Birthday party",
    eventDate: "2026-08-01",
    quantity: 24,
  };

  it("accepts a non-wedding custom order request", async () => {
    const caller = appRouter.createCaller(createContext());
    const result = await caller.customOrders.submit(validInput);
    expect(result).toEqual({ success: true });
  });

  it("blocks wedding orders via event type", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(
      caller.customOrders.submit({ ...validInput, eventType: "Wedding" }),
    ).rejects.toThrow(/wedding orders/i);
  });

  it("blocks wedding orders hidden in details", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(
      caller.customOrders.submit({
        ...validInput,
        details: "These are for my bridal party favors",
      }),
    ).rejects.toThrow(/wedding orders/i);
  });
});

describe("products.list", () => {
  it("returns active products publicly", async () => {
    const caller = appRouter.createCaller(createContext());
    const products = await caller.products.list();
    expect(products).toHaveLength(1);
    expect(products[0].name).toBe("Classic Chocolate Chip");
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

  it("rejects unknown products", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(
      caller.checkout.createSession({ items: [{ productId: 999, quantity: 1 }] }),
    ).rejects.toThrow(/not found/i);
  });
});
