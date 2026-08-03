import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { reconcilePaidOrder } from "@/server/database";
import { getPaidSessionUpdate } from "@/server/payment-events";
import { getStripe, hasStripeCredentials } from "@/server/stripe";

export const metadata: Metadata = {
  title: "Order confirmation",
  robots: { index: false, follow: false },
};

const pickupInstructions =
  "We'll email you within 24 hours to confirm your pickup day and Charlotte pickup location. Pickup is typically available Friday through Sunday.";

type SuccessPageProps = {
  searchParams: Promise<{ session_id?: string }>;
};

export default async function OrderSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const { session_id: sessionId } = await searchParams;

  if (!sessionId || !hasStripeCredentials()) {
    return <UnverifiedConfirmation />;
  }

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    const paymentUpdate = getPaidSessionUpdate(session);
    if (!paymentUpdate) return <UnverifiedConfirmation />;
    await reconcilePaidOrder(paymentUpdate);

    return (
      <main className="mx-auto max-w-2xl px-5 py-16 sm:px-8">
        <p className="text-muted-foreground text-sm font-semibold tracking-widest uppercase">
          Payment confirmed
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">
          Thank you for your order
        </h1>
        {session.client_reference_id ? (
          <p className="mt-4 font-semibold">
            Order reference: {session.client_reference_id}
          </p>
        ) : null}
        <section
          className="bg-card mt-8 rounded-xl border p-6"
          aria-labelledby="pickup-title"
        >
          <h2 id="pickup-title" className="text-xl font-bold">
            What happens next
          </h2>
          <p className="text-muted-foreground mt-3 leading-7">
            {pickupInstructions}
          </p>
        </section>
        <Button asChild className="mt-8">
          <Link href="/menu">Return to menu</Link>
        </Button>
      </main>
    );
  } catch (error) {
    console.error("Checkout session verification failed", error);
    return <UnverifiedConfirmation />;
  }
}

function UnverifiedConfirmation() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-16 sm:px-8">
      <h1 className="text-4xl font-bold tracking-tight">
        Payment confirmation unavailable
      </h1>
      <p className="text-muted-foreground mt-4 leading-7">
        Pickup details are shown only after payment is verified. Check your
        Stripe receipt or try the confirmation link again.
      </p>
      <Button asChild variant="outline" className="mt-8">
        <Link href="/cart">Return to cart</Link>
      </Button>
    </main>
  );
}
