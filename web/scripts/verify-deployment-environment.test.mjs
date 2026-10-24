import { describe, expect, it } from "vitest";

import { inspectDeploymentEnvironment } from "./verify-deployment-environment.mjs";

const safeEnvironment = {
  NEXT_PUBLIC_SITE_URL: "https://takeasweet.example.com",
  PAYMENTS_ENABLED: "false",
  CUSTOM_ORDER_REQUESTS_ENABLED: "false",
  SEARCH_INDEXING_ENABLED: "false",
};

describe("deployment environment preflight", () => {
  it("accepts a production origin with launch gates disabled", () => {
    expect(inspectDeploymentEnvironment(safeEnvironment).failures).toEqual([]);
  });

  it("rejects invalid origins and ambiguous feature flags", () => {
    const result = inspectDeploymentEnvironment({
      ...safeEnvironment,
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000/path",
      PAYMENTS_ENABLED: "yes",
    });

    expect(result.failures).toEqual(
      expect.arrayContaining([
        expect.stringContaining("NEXT_PUBLIC_SITE_URL"),
        expect.stringContaining("PAYMENTS_ENABLED"),
      ])
    );
  });

  it("requires the full payment configuration when enabled", () => {
    const result = inspectDeploymentEnvironment({
      ...safeEnvironment,
      PAYMENTS_ENABLED: "true",
      STRIPE_SECRET_KEY: "sk_test_example",
      STRIPE_WEBHOOK_SECRET: "not-a-signing-secret",
    });

    expect(result.failures).toEqual(
      expect.arrayContaining([
        expect.stringContaining("STRIPE_WEBHOOK_SECRET"),
        expect.stringContaining("DATABASE_URL"),
        expect.stringContaining("PRIVACY_CONTACT_EMAIL"),
      ])
    );
  });

  it("rejects search indexing on Vercel previews", () => {
    const result = inspectDeploymentEnvironment({
      ...safeEnvironment,
      SEARCH_INDEXING_ENABLED: "true",
      VERCEL: "1",
      VERCEL_ENV: "preview",
    });

    expect(result.failures).toContain(
      "SEARCH_INDEXING_ENABLED: must remain false on Vercel preview deployments."
    );
  });
});
