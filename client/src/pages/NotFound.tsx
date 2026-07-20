import { Link } from "wouter";
import { Home, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center justify-center py-24 text-center">
      <p className="text-6xl" aria-hidden>
        🍪
      </p>
      <h1 className="font-display mt-4 text-5xl font-extrabold">404</h1>
      <h2 className="font-display mt-2 text-xl font-bold">
        This page must have been eaten
      </h2>
      <p className="text-muted-foreground mt-3 max-w-sm">
        Sorry, we couldn't find the page you're looking for. It may have been moved — or it was
        just that delicious.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild className="min-h-11 rounded-full font-bold">
          <Link href="/">
            <Home className="size-4" aria-hidden />
            Back to Home
          </Link>
        </Button>
        <Button asChild variant="outline" className="bg-card min-h-11 rounded-full font-bold">
          <Link href="/shop">
            <UtensilsCrossed className="size-4" aria-hidden />
            Browse the Menu
          </Link>
        </Button>
      </div>
    </div>
  );
}
