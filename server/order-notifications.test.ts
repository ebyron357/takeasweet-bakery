import { beforeEach, describe, expect, it, vi } from "vitest";

const { notifyOwner, getOrderBySessionId, getOrderItems } = vi.hoisted(() => ({
  notifyOwner: vi.fn(),
  getOrderBySessionId: vi.fn(),
  getOrderItems: vi.fn(),
}));

vi.mock("./_core/notification", () => ({ notifyOwner }));
vi.mock("./db-features", () => ({ getOrderBySessionId, getOrderItems }));

import { customerFromSession, notifyOrderPaid, notifyOwnerSafely } from "./order-notifications";

describe("order notifications", () => {
  beforeEach(() => {
    notifyOwner.mockReset().mockResolvedValue(true);
    getOrderBySessionId.mockReset();
    getOrderItems.mockReset();
  });

  it("reads the name and email entered on Stripe Checkout", () => {
    expect(
      customerFromSession({
        customer_details: { name: "Jamie Guest", email: "jamie@example.com" },
      } as never),
    ).toEqual({ name: "Jamie Guest", email: "jamie@example.com" });
    expect(customerFromSession({} as never)).toEqual({ name: null, email: null });
  });

  it("tells the owner who paid, what they ordered, and how to reach them", async () => {
    getOrderBySessionId.mockResolvedValue({
      id: 3,
      orderRef: "TAS-ABC123",
      totalCents: 1150,
      customerName: "Jamie Guest",
      customerEmail: "jamie@example.com",
    });
    getOrderItems.mockResolvedValue([
      { productName: "Limber", quantity: 1 },
      { productName: "Sprinkle Cookie", quantity: 2 },
    ]);

    await notifyOrderPaid("cs_test_123");

    expect(notifyOwner).toHaveBeenCalledTimes(1);
    const { title, content } = notifyOwner.mock.calls[0][0];
    expect(title).toBe("New paid order TAS-ABC123");
    expect(content).toContain("$11.50");
    expect(content).toContain("2 × Sprinkle Cookie");
    expect(content).toContain("jamie@example.com");
  });

  it("never throws when the notification service is unavailable", async () => {
    notifyOwner.mockRejectedValue(new Error("Notification service URL is not configured."));
    await expect(notifyOwnerSafely({ title: "t", content: "c" })).resolves.toBeUndefined();

    getOrderBySessionId.mockRejectedValue(new Error("database unavailable"));
    await expect(notifyOrderPaid("cs_test_123")).resolves.toBeUndefined();
  });
});
