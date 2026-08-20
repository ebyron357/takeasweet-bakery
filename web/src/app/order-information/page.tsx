import type { Metadata } from "next";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

import {
  confirmedOrderInformation,
  policyLaunchBlockers,
} from "@/data/customer-information";
import { createPageMetadata } from "@/lib/metadata";
import { isCustomOrderStorageEnabled } from "@/server/database";
import { isCheckoutEnabled } from "@/server/stripe";

export const metadata: Metadata = createPageMetadata({
  title: "Ordering Information",
  description:
    "Confirmed ordering and fulfillment information for TakeASweet Bakery.",
  path: "/order-information",
});

export default function OrderInformationPage() {
  const checkoutEnabled = isCheckoutEnabled();
  const customOrdersEnabled = isCustomOrderStorageEnabled();

  return (
    <main className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
      <header className="max-w-3xl">
        <p className="text-muted-foreground text-sm font-semibold tracking-widest uppercase">
          Confirmed details only
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
          Ordering information
        </h1>
        <p className="text-muted-foreground mt-4 leading-7">
          This page separates confirmed bakery information from policies that
          still need owner approval. It does not invent terms for refunds,
          cancellations, allergens, delivery, or lead times.
        </p>
      </header>

      <section className="mt-10" aria-labelledby="confirmed-title">
        <h2 id="confirmed-title" className="text-3xl font-bold">
          What is confirmed
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {confirmedOrderInformation.map((item) => (
            <article className="bg-card rounded-xl border p-5" key={item.id}>
              <CheckCircle2
                className="text-primary size-5"
                aria-hidden="true"
              />
              <h3 className="mt-3 text-lg font-bold">{item.title}</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-6">
                {item.detail}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section
        className="bg-muted mt-12 rounded-xl border p-6 sm:p-8"
        aria-labelledby="status-title"
      >
        <h2 id="status-title" className="text-2xl font-bold">
          Online ordering status
        </h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="font-semibold">Standard checkout</dt>
            <dd className="text-muted-foreground mt-1 text-sm">
              {checkoutEnabled
                ? "Enabled through Stripe Checkout."
                : "Not enabled for public orders yet."}
            </dd>
          </div>
          <div>
            <dt className="font-semibold">Custom-order requests</dt>
            <dd className="text-muted-foreground mt-1 text-sm">
              {customOrdersEnabled
                ? "Enabled for bakery review."
                : "Not enabled for public submissions yet."}
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-12" aria-labelledby="pending-title">
        <div className="flex items-start gap-3">
          <AlertTriangle
            className="text-destructive mt-1 size-5 shrink-0"
            aria-hidden="true"
          />
          <div>
            <h2 id="pending-title" className="text-2xl font-bold">
              Required before full launch
            </h2>
            <p className="text-muted-foreground mt-2 leading-7">
              The bakery must approve and publish the following details before
              customers are asked to rely on them:
            </p>
          </div>
        </div>
        <ul className="text-muted-foreground mt-5 list-disc space-y-2 pl-10">
          {policyLaunchBlockers.map((item) => (
            <li key={item.id}>{item.label}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
