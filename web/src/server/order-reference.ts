import { createHash } from "node:crypto";

export function createOrderReference(checkoutToken: string) {
  const suffix = createHash("sha256")
    .update(checkoutToken)
    .digest("hex")
    .slice(0, 10)
    .toUpperCase();

  return `TAS-${suffix}`;
}
