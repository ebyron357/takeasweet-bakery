import type { Metadata } from "next";

import { CustomOrderForm } from "@/components/custom-order-form";
import { isCustomOrderStorageEnabled } from "@/server/database";

export const metadata: Metadata = {
  title: "Custom Orders",
  description: "Request custom bakery treats for a Charlotte-area celebration.",
};

export default function CustomOrdersPage() {
  const acceptingRequests = isCustomOrderStorageEnabled();

  return (
    <main className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <header>
        <p className="text-muted-foreground text-sm font-semibold tracking-widest uppercase">
          Request review
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
          Custom orders
        </h1>
        <p className="text-muted-foreground mt-4 max-w-2xl leading-7">
          Tell TakeASweet about your celebration in the Charlotte area. Sending
          this form starts a review; it does not confirm availability, pricing,
          delivery, or an order.
        </p>
      </header>

      <aside
        className="bg-muted mt-8 rounded-lg border p-5"
        aria-label="Before you submit"
      >
        <h2 className="font-bold">Before you submit</h2>
        <ul className="text-muted-foreground mt-2 list-disc space-y-1 pl-5 text-sm leading-6">
          <li>TakeASweet is not accepting wedding orders.</li>
          <li>Custom requests are reviewed before any payment is requested.</li>
          <li>Large or custom orders may require a deposit after review.</li>
        </ul>
      </aside>

      {acceptingRequests ? (
        <CustomOrderForm />
      ) : (
        <p
          className="bg-muted mt-10 rounded-lg border p-5 font-semibold"
          role="status"
        >
          Online custom-order requests are temporarily unavailable.
        </p>
      )}
    </main>
  );
}
