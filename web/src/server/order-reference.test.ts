import { describe, expect, it } from "vitest";

import { createOrderReference } from "@/server/order-reference";

describe("order references", () => {
  it("is stable for retries of the same checkout", () => {
    const token = "6c744875-3817-45c9-80de-b23f7180d39c";

    expect(createOrderReference(token)).toBe(createOrderReference(token));
    expect(createOrderReference(token)).toMatch(/^TAS-[A-F0-9]{10}$/);
  });

  it("does not reuse a reference for another checkout token", () => {
    expect(
      createOrderReference("6c744875-3817-45c9-80de-b23f7180d39c")
    ).not.toBe(createOrderReference("aef5f864-9631-48fb-8ecf-6eb90e5c23e8"));
  });
});
