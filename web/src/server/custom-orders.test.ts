import { describe, expect, it } from "vitest";

import {
  customEventTypes,
  customOrderRequestSchema,
} from "@/server/custom-orders";

const futureDate = new Date(Date.now() + 86_400_000 * 30)
  .toISOString()
  .slice(0, 10);

const validRequest = {
  name: "Sample Customer",
  email: "customer@example.com",
  phone: "",
  eventType: customEventTypes[0],
  eventDate: futureDate,
  quantity: 24,
  details: "Please review this birthday celebration request.",
  website: "",
};

describe("custom order request validation", () => {
  it("accepts a valid request using an approved event type", () => {
    expect(customOrderRequestSchema.safeParse(validRequest).success).toBe(true);
  });

  it("rejects unsupported event types and past dates", () => {
    expect(
      customOrderRequestSchema.safeParse({
        ...validRequest,
        eventType: "Reception",
        eventDate: "2020-01-01",
      }).success
    ).toBe(false);
  });

  it.each(["wedding", "bridal", "bride", "groom", "elopement"])(
    "rejects %s requests",
    (term) => {
      const result = customOrderRequestSchema.safeParse({
        ...validRequest,
        details: `This is for a ${term} celebration.`,
      });

      expect(result.success).toBe(false);
    }
  );

  it("enforces sensible quantity and description limits", () => {
    expect(
      customOrderRequestSchema.safeParse({
        ...validRequest,
        quantity: 0,
        details: "Too short",
      }).success
    ).toBe(false);
  });
});
