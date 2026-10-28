import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { trpc } from "@/lib/trpc";
import { CHECKOUT_UNAVAILABLE_NOTICE, REVIEW_CHECKOUT_NOTICE } from "@shared/site-settings";

/** Checkout notice, button, and test-card hint, driven by the site settings. */
export default function CheckoutButton({ compact = false }: { compact?: boolean }) {
  const { items } = useCart();
  const { settings, checkoutOpen, paymentsLive } = useSiteSettings();
  const checkout = trpc.checkout.createSession.useMutation({
    onSuccess: data => {
      if (data.url) {
        toast.success("Taking you to secure checkout…");
        window.open(data.url, "_blank");
      }
    },
    onError: err => toast.error(err.message || "Could not start checkout. Please try again."),
  });

  return (
    <>
      {!checkoutOpen && (
        <p
          role="status"
          className={`bg-accent/60 text-accent-foreground rounded-xl font-semibold ${
            compact ? "mb-3 px-3 py-2 text-xs" : "mt-3 px-4 py-3 text-sm"
          }`}
        >
          {settings.reviewMode ? REVIEW_CHECKOUT_NOTICE : CHECKOUT_UNAVAILABLE_NOTICE}
        </p>
      )}
      <Button
        size="lg"
        className={`min-h-12 w-full rounded-full text-base font-bold ${compact ? "" : "mt-4"}`}
        disabled={!checkoutOpen || checkout.isPending}
        onClick={() =>
          checkout.mutate({
            items: items.map(i => ({
              productId: i.productId,
              quantity: i.quantity,
            })),
          })
        }
      >
        {!checkoutOpen
          ? settings.reviewMode
            ? "Checkout Disabled (Preview)"
            : "Checkout Unavailable"
          : checkout.isPending
            ? "Preparing checkout…"
            : paymentsLive
              ? "Checkout Securely"
              : "Checkout (Test Mode)"}
      </Button>
      {checkoutOpen && !paymentsLive && (
        <p className="text-muted-foreground mt-3 text-center text-xs">
          Test card: 4242 4242 4242 4242 · any future expiry · any CVC · any ZIP
        </p>
      )}
    </>
  );
}
