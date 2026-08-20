import { describe, expect, it } from "vitest";

import { isTrustedVercelHost, parseBaseUrl } from "./smoke-deployment.mjs";

describe("isTrustedVercelHost", () => {
  it("accepts vercel.app subdomains", () => {
    expect(isTrustedVercelHost("my-project.vercel.app")).toBe(true);
    expect(isTrustedVercelHost("my-project-abc123.vercel.app")).toBe(true);
    expect(isTrustedVercelHost("vercel.app")).toBe(true);
  });

  it("rejects arbitrary non-Vercel hosts", () => {
    expect(isTrustedVercelHost("example.com")).toBe(false);
    expect(isTrustedVercelHost("malicious.vercel.app.example.com")).toBe(false);
    expect(isTrustedVercelHost("localhost")).toBe(false);
    expect(isTrustedVercelHost("127.0.0.1")).toBe(false);
    expect(isTrustedVercelHost("takeasweet.com")).toBe(false);
  });
});

describe("parseBaseUrl", () => {
  it("accepts HTTPS origins", () => {
    const url = parseBaseUrl("https://my-project.vercel.app");
    expect(url.hostname).toBe("my-project.vercel.app");
  });

  it("accepts local HTTP origins", () => {
    const url = parseBaseUrl("http://localhost:3000");
    expect(url.hostname).toBe("localhost");
  });

  it("rejects non-HTTPS non-local origins", () => {
    expect(() => parseBaseUrl("http://example.com")).toThrow(
      "Smoke tests require HTTPS"
    );
  });

  it("rejects origins with a path", () => {
    expect(() => parseBaseUrl("https://example.com/path")).toThrow(
      "must be an origin without a path"
    );
  });
});
