import type { Metadata } from "next";

import { getPrivacyContactEmail } from "@/config/launch";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Privacy Notice",
  description:
    "How the TakeASweet website handles cart, custom-order, and checkout information.",
  path: "/privacy",
});

export default function PrivacyPage() {
  const privacyContactEmail = getPrivacyContactEmail();
  return (
    <main className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <header>
        <p className="text-muted-foreground text-sm font-semibold tracking-widest uppercase">
          Last updated July 19, 2026
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
          Privacy notice
        </h1>
        <p className="text-muted-foreground mt-4 leading-7">
          This notice describes the information handled by the current
          TakeASweet website. Payment and custom-order collection remain
          launch-gated until their required configuration and business review
          are complete.
        </p>
      </header>

      <div className="mt-10 space-y-10 leading-7">
        <section aria-labelledby="information-title">
          <h2 id="information-title" className="text-2xl font-bold">
            Information you choose to provide
          </h2>
          <ul className="text-muted-foreground mt-3 list-disc space-y-2 pl-6">
            <li>
              Custom-order requests may include your name, email address,
              optional phone number, event type and date, estimated quantity,
              and request details.
            </li>
            <li>
              Checkout sends validated product names, quantities, selected
              flavors, totals, and an order reference to Stripe. Contact and
              payment information is entered on Stripe&apos;s hosted checkout
              page.
            </li>
            <li>
              The bakery database stores the order reference, products, selected
              flavors, quantities, total, payment status, and the customer name
              and email returned by Stripe for fulfillment. Signed Stripe event
              identifiers are retained to prevent the same payment event from
              being processed twice.
            </li>
          </ul>
        </section>

        <section aria-labelledby="device-title">
          <h2 id="device-title" className="text-2xl font-bold">
            Information stored on your device
          </h2>
          <p className="text-muted-foreground mt-3">
            The shopping cart is saved in your browser&apos;s local storage so
            it can remain available between visits. It contains product slugs,
            quantities, and selected flavors. You can remove it by clearing the
            cart or your browser&apos;s site data.
          </p>
        </section>

        <section aria-labelledby="use-title">
          <h2 id="use-title" className="text-2xl font-bold">
            How information is used
          </h2>
          <p className="text-muted-foreground mt-3">
            Submitted information is used to review custom requests, create and
            verify checkout sessions, record payment state, respond about an
            order, protect the checkout process, and support fulfillment. The
            application emits limited, non-identifying browser events for core
            cart, checkout, and request interactions, but no analytics provider
            receives them unless one is approved and configured later. The
            current application has no advertising integration, analytics
            identifier, tracking cookie, or data-sale integration.
          </p>
        </section>

        <section aria-labelledby="sharing-title">
          <h2 id="sharing-title" className="text-2xl font-bold">
            Payment processing
          </h2>
          <p className="text-muted-foreground mt-3">
            Stripe hosts the payment page and processes payment and transaction
            information under its own privacy practices. Review the{" "}
            <a
              className="text-foreground font-semibold underline underline-offset-4"
              href="https://stripe.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Stripe Privacy Policy
            </a>{" "}
            before using checkout. TakeASweet does not receive raw card details
            through this application.
          </p>
        </section>

        <section aria-labelledby="retention-title">
          <h2 id="retention-title" className="text-2xl font-bold">
            Retention and access
          </h2>
          <p className="text-muted-foreground mt-3">
            The final record-retention schedule and privacy-request procedure
            require owner and legal review before data collection is enabled.
            Access to submitted custom-order information is intended to be
            limited to authorized bakery operations.
          </p>
        </section>

        <section aria-labelledby="contact-title">
          <h2 id="contact-title" className="text-2xl font-bold">
            Privacy questions
          </h2>
          {privacyContactEmail ? (
            <p className="text-muted-foreground mt-3">
              Email{" "}
              <a
                className="text-foreground font-semibold underline underline-offset-4"
                href={`mailto:${privacyContactEmail}`}
              >
                {privacyContactEmail}
              </a>{" "}
              with a privacy question or request.
            </p>
          ) : (
            <p className="text-muted-foreground mt-3">
              The approved privacy contact address has not been configured.
              Data-collection features must remain launch-gated until it is
              published.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
