import { describe, expect, it } from "vitest";

import {
  getTrustedDeploymentHostnames,
  isTrustedDeploymentHost,
  parseBaseUrl,
} from "./smoke-deployment.mjs";

describe("getTrustedDeploymentHostnames", () => {
  it("returns the hostname from NEXT_PUBLIC_SITE_URL", () => {
    const hostnames = getTrustedDeploymentHostnames({
      NEXT_PUBLIC_SITE_URL: "https://takeasweet.com",
    });
    expect(hostnames.has("takeasweet.com")).toBe(true);
    expect(hostnames.size).toBe(1);
  });

  it("returns the hostname from VERCEL_URL", () => {
    const hostnames = getTrustedDeploymentHostnames({
      VERCEL_URL: "my-project-abc123.vercel.app",
    });
    expect(hostnames.has("my-project-abc123.vercel.app")).toBe(true);
    expect(hostnames.size).toBe(1);
  });

  it("returns both hostnames when both env vars are set", () => {
    const hostnames = getTrustedDeploymentHostnames({
      NEXT_PUBLIC_SITE_URL: "https://takeasweet.com",
      VERCEL_URL: "my-project-abc123.vercel.app",
    });
    expect(hostnames.has("takeasweet.com")).toBe(true);
    expect(hostnames.has("my-project-abc123.vercel.app")).toBe(true);
    expect(hostnames.size).toBe(2);
  });

  it("returns an empty set when no env vars are set", () => {
    const hostnames = getTrustedDeploymentHostnames({});
    expect(hostnames.size).toBe(0);
  });

  it("ignores unparseable values", () => {
    const hostnames = getTrustedDeploymentHostnames({
      NEXT_PUBLIC_SITE_URL: "not-a-url",
    });
    expect(hostnames.size).toBe(0);
  });
});

describe("isTrustedDeploymentHost", () => {
  it("accepts the configured production host", () => {
    expect(
      isTrustedDeploymentHost("takeasweet.com", {
        NEXT_PUBLIC_SITE_URL: "https://takeasweet.com",
      })
    ).toBe(true);
  });

  it("accepts the configured Vercel preview host", () => {
    expect(
      isTrustedDeploymentHost("my-project-abc123.vercel.app", {
        VERCEL_URL: "my-project-abc123.vercel.app",
      })
    ).toBe(true);
  });

  it("rejects a different vercel.app subdomain not in configured hosts", () => {
    expect(
      isTrustedDeploymentHost("attacker.vercel.app", {
        VERCEL_URL: "my-project-abc123.vercel.app",
      })
    ).toBe(false);
  });

  it("rejects arbitrary non-configured hosts", () => {
    expect(
      isTrustedDeploymentHost("example.com", {
        NEXT_PUBLIC_SITE_URL: "https://takeasweet.com",
      })
    ).toBe(false);
  });

  it("fails closed when no env vars are set", () => {
    expect(isTrustedDeploymentHost("takeasweet.com", {})).toBe(false);
    expect(isTrustedDeploymentHost("my-project.vercel.app", {})).toBe(false);
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
