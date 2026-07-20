import { Link } from "wouter";
import { ShieldCheck } from "lucide-react";
import { SERVICE_AREA_COPY } from "@shared/bakery";
import { CLIENT_REVIEW_MODE } from "@shared/review-mode";

export default function Privacy() {
  return (
    <div className="container max-w-2xl py-12 md:py-16">
      <p className="text-secondary-foreground flex items-center gap-1.5 text-sm font-bold tracking-widest uppercase">
        <ShieldCheck className="size-4" aria-hidden /> Privacy
      </p>
      <h1 className="font-display mt-2 text-4xl font-extrabold">Privacy Policy</h1>

      {CLIENT_REVIEW_MODE && (
        <div className="bg-accent/50 text-accent-foreground mt-6 rounded-xl p-4 text-sm font-semibold">
          This website is currently in preview. Online checkout and form submissions are disabled,
          and no customer information is collected during this stage.
        </div>
      )}

      <div className="text-foreground/90 mt-8 space-y-6 text-base leading-relaxed">
        <section aria-labelledby="privacy-what">
          <h2 id="privacy-what" className="font-display text-xl font-bold">
            What we collect
          </h2>
          <p className="mt-2">
            When ordering is active, TakeASweet Cookies & Treats collects only the information
            needed to prepare and hand off your order: your name, email address, and the details of
            what you ordered. If you submit a custom order request or contact form, we receive the
            information you choose to share.
          </p>
        </section>

        <section aria-labelledby="privacy-use">
          <h2 id="privacy-use" className="font-display text-xl font-bold">
            How we use it
          </h2>
          <p className="mt-2">
            Order information is used to fulfill your order and communicate pickup or delivery
            details. Newsletter emails are used only to share bakery updates, and you can
            unsubscribe at any time. We do not sell or share customer information with third
            parties for marketing.
          </p>
        </section>

        <section aria-labelledby="privacy-payments">
          <h2 id="privacy-payments" className="font-display text-xl font-bold">
            Payments
          </h2>
          <p className="mt-2">
            When online payment is active, card details are processed securely by our payment
            provider and are never stored on our servers.
          </p>
        </section>

        <section aria-labelledby="privacy-privacy">
          <h2 id="privacy-privacy" className="font-display text-xl font-bold">
            Our home base
          </h2>
          <p className="mt-2">
            {SERVICE_AREA_COPY} As a home-based small business, our pickup location is shared
            privately with customers after an order is confirmed and is never published on this
            website.
          </p>
        </section>

        <section aria-labelledby="privacy-contact">
          <h2 id="privacy-contact" className="font-display text-xl font-bold">
            Questions
          </h2>
          <p className="mt-2">
            For any privacy questions, reach out through our{" "}
            <Link href="/contact" className="underline">
              contact page
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
