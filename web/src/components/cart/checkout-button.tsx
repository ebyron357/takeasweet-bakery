"use client";

import { useState } from "react";

import { useCart } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";

export function CheckoutButton() {
  const { items } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function beginCheckout() {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, checkoutToken: crypto.randomUUID() }),
      });
      const data: unknown = await response.json();

      if (
        !response.ok ||
        typeof data !== "object" ||
        data === null ||
        !("url" in data) ||
        typeof data.url !== "string"
      ) {
        const message =
          typeof data === "object" &&
          data !== null &&
          "error" in data &&
          typeof data.error === "string"
            ? data.error
            : "Checkout could not be started.";
        throw new Error(message);
      }

      window.location.assign(data.url);
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Checkout failed."
      );
      setIsLoading(false);
    }
  }

  return (
    <div>
      <Button
        type="button"
        size="lg"
        className="w-full"
        disabled={isLoading || items.length === 0}
        onClick={beginCheckout}
      >
        {isLoading ? "Opening secure checkout…" : "Continue to secure checkout"}
      </Button>
      {error ? (
        <p className="text-destructive mt-3 text-sm font-semibold" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
