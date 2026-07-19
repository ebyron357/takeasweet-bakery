import { afterEach, describe, expect, it } from "vitest";

import {
  getPrivacyContactEmail,
  isCheckoutLaunchEnabled,
  isCustomOrderLaunchEnabled,
} from "@/config/launch";

const originalEnvironment = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnvironment };
});

describe("production launch controls", () => {
  it("requires a valid public privacy contact", () => {
    process.env.PRIVACY_CONTACT_EMAIL = "not-an-email";
    expect(getPrivacyContactEmail()).toBeNull();

    process.env.PRIVACY_CONTACT_EMAIL = "privacy@example.com";
    expect(getPrivacyContactEmail()).toBe("privacy@example.com");
  });

  it("keeps checkout disabled without every required setting", () => {
    process.env.PAYMENTS_ENABLED = "true";
    process.env.STRIPE_SECRET_KEY = "test-secret";
    process.env.STRIPE_WEBHOOK_SECRET = "test-webhook-secret";
    process.env.DATABASE_URL = "mysql://example.invalid/database";
    delete process.env.PRIVACY_CONTACT_EMAIL;
    expect(isCheckoutLaunchEnabled()).toBe(false);

    process.env.PRIVACY_CONTACT_EMAIL = "privacy@example.com";
    expect(isCheckoutLaunchEnabled()).toBe(true);

    delete process.env.STRIPE_WEBHOOK_SECRET;
    expect(isCheckoutLaunchEnabled()).toBe(false);

    process.env.STRIPE_WEBHOOK_SECRET = "test-webhook-secret";
    delete process.env.DATABASE_URL;
    expect(isCheckoutLaunchEnabled()).toBe(false);
  });

  it("keeps custom-order storage disabled without every required setting", () => {
    process.env.CUSTOM_ORDER_REQUESTS_ENABLED = "true";
    process.env.DATABASE_URL = "mysql://example.invalid/database";
    delete process.env.PRIVACY_CONTACT_EMAIL;
    expect(isCustomOrderLaunchEnabled()).toBe(false);

    process.env.PRIVACY_CONTACT_EMAIL = "privacy@example.com";
    expect(isCustomOrderLaunchEnabled()).toBe(true);
  });
});
