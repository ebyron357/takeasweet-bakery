import { useEffect, useMemo } from "react";
import { Link, useSearch } from "wouter";
import { CheckCircle2, MapPin, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";
import { formatPrice } from "@shared/bakery";

export default function OrderConfirmation() {
  const search = useSearch();
  const sessionId = useMemo(() => new URLSearchParams(search).get("session_id") ?? "", [search]);
  const { clearCart } = useCart();

  const { data, isLoading, error } = trpc.checkout.confirmation.useQuery(
    { sessionId },
    { enabled: !!sessionId, retry: 2 },
  );

  useEffect(() => {
    if (data) clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  if (!sessionId) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display text-2xl font-extrabold">Missing order information</h1>
        <Button asChild className="mt-6 rounded-full font-bold">
          <Link href="/shop">Back to the Shop</Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container max-w-xl space-y-4 py-16">
        <Skeleton className="mx-auto h-12 w-12 rounded-full" />
        <Skeleton className="mx-auto h-8 w-64" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display text-2xl font-extrabold">
          We're still confirming your payment
        </h1>
        <p className="text-muted-foreground mt-2 max-w-md text-sm sm:mx-auto">
          If you just completed checkout, give it a moment and refresh this page. If the problem
          continues, reach out through our contact page and we'll make it right.
        </p>
        <Button asChild className="mt-6 rounded-full font-bold">
          <Link href="/contact">Contact Us</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-xl py-12 md:py-16">
      <div className="text-center">
        <div className="bg-primary/20 mx-auto flex size-16 items-center justify-center rounded-full">
          <PartyPopper className="text-primary-foreground size-8" />
        </div>
        <h1 className="font-display mt-4 text-3xl font-extrabold sm:text-4xl">
          Order confirmed — sweet!
        </h1>
        <p className="text-muted-foreground mt-2">
          Order reference: <span className="text-foreground font-bold">{data.orderRef}</span>
        </p>
      </div>

      <div className="bg-card border-border/60 mt-8 rounded-2xl border p-5 shadow-sm">
        <h2 className="font-display mb-3 text-lg font-bold">Your treats</h2>
        <ul className="divide-y">
          {data.items.map((item, i) => (
            <li key={i} className="flex items-center justify-between py-2.5 text-sm">
              <span>
                {item.name} <span className="text-muted-foreground">× {item.quantity}</span>
              </span>
              <span className="font-semibold">
                {formatPrice(item.unitPriceCents * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-center justify-between border-t pt-3">
          <span className="font-bold">Total</span>
          <span className="font-display text-xl font-extrabold">
            {formatPrice(data.totalCents)}
          </span>
        </div>
      </div>

      {/* Pickup details — only revealed post-purchase */}
      <div className="bg-accent/60 mt-6 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <MapPin className="text-accent-foreground mt-0.5 size-5 shrink-0" />
          <div>
            <h2 className="font-display text-accent-foreground text-lg font-bold">
              Pickup details
            </h2>
            <p className="text-accent-foreground/90 mt-1 text-sm leading-relaxed">
              {data.pickupInstructions}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center gap-2">
        <CheckCircle2 className="text-primary size-4" />
        <p className="text-muted-foreground text-sm">A confirmation email is on its way.</p>
      </div>

      <div className="mt-6 text-center">
        <Button asChild variant="outline" className="bg-card rounded-full font-bold">
          <Link href="/shop">Keep Shopping</Link>
        </Button>
      </div>
    </div>
  );
}
