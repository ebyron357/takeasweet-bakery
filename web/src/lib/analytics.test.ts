import { describe, expect, it } from "vitest";

import {
  analyticsBrowserEventName,
  createAnalyticsEventDetail,
  trackAnalyticsEvent,
} from "@/lib/analytics";

describe("provider-neutral analytics events", () => {
  it("creates a stable, non-identifying commerce event", () => {
    const detail = createAnalyticsEventDetail({
      name: "add_to_cart",
      properties: {
        productSlug: "verified-product",
        quantity: 2,
        flavorCount: 1,
      },
    });

    expect(analyticsBrowserEventName).toBe("takeasweet:analytics");
    expect(detail).toEqual({
      schemaVersion: 1,
      event: {
        name: "add_to_cart",
        properties: {
          productSlug: "verified-product",
          quantity: 2,
          flavorCount: 1,
        },
      },
    });
    expect(JSON.stringify(detail)).not.toMatch(
      /email|phone|address|customer|payment/i
    );
  });

  it("does nothing safely when rendered outside a browser", () => {
    expect(() =>
      trackAnalyticsEvent({
        name: "custom_order_request_submitted",
        properties: {},
      })
    ).not.toThrow();
  });
});
