import { describe, expect, it } from "vitest";

import {
  confirmedOrderInformation,
  policyLaunchBlockers,
} from "@/data/customer-information";

describe("customer policy integrity", () => {
  it("tracks every unresolved launch policy with a unique identifier", () => {
    const ids = policyLaunchBlockers.map((item) => item.id);

    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain("refund-cancellation");
    expect(ids).toContain("allergen-cross-contact");
    expect(ids).toContain("privacy-contact");
  });

  it("does not publish fabricated refund or cancellation promises", () => {
    const publishedCopy = confirmedOrderInformation
      .map((item) => `${item.title} ${item.detail}`)
      .join(" ");

    expect(publishedCopy).not.toMatch(/guaranteed refund/i);
    expect(publishedCopy).not.toMatch(/free cancellation/i);
    expect(publishedCopy).not.toMatch(/allergen[- ]free/i);
  });

  it("keeps confirmed ordering information uniquely addressable", () => {
    const ids = confirmedOrderInformation.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
