import { describe, expect, it } from "vitest";

import { GET } from "@/app/api/health/route";

describe("health endpoint", () => {
  it("reports process health without exposing configuration", async () => {
    const response = GET();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(await response.json()).toEqual({
      status: "ok",
      service: "takeasweet-web",
    });
  });
});
