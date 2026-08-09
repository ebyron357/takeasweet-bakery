import { Link } from "wouter";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { SERVICE_AREA_COPY } from "@shared/bakery";

export default function OrderCanceled() {
  const { itemCount } = useCart();

  return (
    <div className="container max-w-xl py-16 text-center md:py-20">
      <div className="bg-secondary/60 mx-auto flex size-16 items-center justify-center rounded-full">
        <ShoppingBag className="text-secondary-foreground size-8" aria-hidden />
      </div>
      <h1 className="font-display mt-4 text-3xl font-extrabold sm:text-4xl">
        No worries — nothing was charged
      </h1>
      <p className="text-muted-foreground mt-3">
        Your checkout was canceled before payment.
        {itemCount > 0
          ? " Your bag is still saved, so you can pick up right where you left off."
          : " Your bag is empty, but the menu is always open."}
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {itemCount > 0 && (
          <Button asChild size="lg" className="min-h-12 rounded-full text-base font-bold">
            <Link href="/cart">
              <ArrowLeft className="size-4" aria-hidden />
              Back to My Bag
            </Link>
          </Button>
        )}
        <Button
          asChild
          size="lg"
          variant="outline"
          className="bg-card min-h-12 rounded-full text-base font-bold"
        >
          <Link href="/shop">Browse the Menu</Link>
        </Button>
      </div>

      <p className="text-muted-foreground mt-8 text-sm">
        Questions about an order?{" "}
        <Link href="/contact" className="underline">
          Contact us
        </Link>
        . {SERVICE_AREA_COPY}
      </p>
    </div>
  );
}
