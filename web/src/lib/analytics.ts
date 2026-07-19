export const analyticsBrowserEventName = "takeasweet:analytics";

export type AnalyticsEvent =
  | Readonly<{
      name: "add_to_cart" | "remove_from_cart";
      properties: Readonly<{
        productSlug: string;
        quantity: number;
        flavorCount: number;
      }>;
    }>
  | Readonly<{
      name: "change_cart_quantity";
      properties: Readonly<{
        productSlug: string;
        previousQuantity: number;
        quantity: number;
      }>;
    }>
  | Readonly<{
      name: "begin_checkout";
      properties: Readonly<{
        lineCount: number;
        itemCount: number;
      }>;
    }>
  | Readonly<{
      name: "custom_order_request_submitted";
      properties: Readonly<Record<string, never>>;
    }>;

export type AnalyticsEventDetail = Readonly<{
  schemaVersion: 1;
  event: AnalyticsEvent;
}>;

export function createAnalyticsEventDetail(
  event: AnalyticsEvent
): AnalyticsEventDetail {
  return { schemaVersion: 1, event };
}

export function trackAnalyticsEvent(event: AnalyticsEvent) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent<AnalyticsEventDetail>(analyticsBrowserEventName, {
      detail: createAnalyticsEventDetail(event),
    })
  );
}
