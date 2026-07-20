import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Facebook, Instagram, Menu, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";
import { ANNOUNCEMENT_COPY, SERVICE_AREA_COPY, formatPrice } from "@shared/bakery";
import {
  CLIENT_REVIEW_MODE,
  REVIEW_CHECKOUT_NOTICE,
  REVIEW_FORM_NOTICE,
} from "@shared/review-mode";
import { useAuth } from "@/_core/hooks/useAuth";

const NAV_LINKS: { href: string; label: string; key?: string }[] = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Menu" },
  { href: "/custom-orders", label: "Custom Orders" },
  { href: "/gallery", label: "Gallery" },
  { href: "/our-story", label: "Our Story" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

/** Logo placeholder — replace with the real TakeASweet logo file when provided. */
function LogoMark({ className = "size-9" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`bg-primary text-primary-foreground font-display flex shrink-0 items-center justify-center rounded-full text-base font-extrabold ${className}`}
    >
      TS
    </span>
  );
}

function AnnouncementBanner() {
  const copy = ANNOUNCEMENT_COPY;
  return (
    <div className="bg-foreground text-background overflow-hidden py-1.5 text-xs font-semibold tracking-wide">
      <div className="animate-marquee flex w-max whitespace-nowrap">
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i} className="mx-8">
            {copy}
          </span>
        ))}
      </div>
    </div>
  );
}

function CartDrawer() {
  const { items, itemCount, totalCents, setQuantity, removeItem, isOpen, setIsOpen, clearCart } =
    useCart();
  const checkout = trpc.checkout.createSession.useMutation({
    onSuccess: data => {
      if (data.url) {
        toast.success("Taking you to secure checkout…");
        window.open(data.url, "_blank");
      }
    },
    onError: err => {
      toast.error(err.message || "Could not start checkout. Please try again.");
    },
  });

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`Open cart, ${itemCount} items`}
        >
          <ShoppingBag className="size-5" />
          {itemCount > 0 && (
            <span className="bg-secondary text-secondary-foreground absolute -top-0.5 -right-0.5 flex size-4.5 items-center justify-center rounded-full text-[10px] font-bold">
              {itemCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-display text-xl">Your Sweet Bag</SheetTitle>
        </SheetHeader>
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <ShoppingBag className="text-muted-foreground size-10" />
            <p className="text-muted-foreground text-sm">
              Your bag is empty. Let's fix that with something sweet!
            </p>
            <Button
              asChild
              className="rounded-full font-semibold"
              onClick={() => setIsOpen(false)}
            >
              <Link href="/shop">Browse the Menu</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto px-4">
              {items.map(item => (
                <div key={item.productId} className="flex gap-3">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="size-16 shrink-0 rounded-xl object-cover"
                    />
                  )}
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm leading-tight font-semibold">{item.name}</p>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-muted-foreground hover:text-destructive"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <p className="text-muted-foreground text-xs">{formatPrice(item.priceCents)}</p>
                    <div className="mt-auto flex items-center gap-2">
                      <button
                        className="border-border hover:bg-muted flex size-6 items-center justify-center rounded-full border"
                        onClick={() => setQuantity(item.productId, item.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        className="border-border hover:bg-muted flex size-6 items-center justify-center rounded-full border"
                        onClick={() => setQuantity(item.productId, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        <Plus className="size-3" />
                      </button>
                      <span className="ml-auto text-sm font-bold">
                        {formatPrice(item.priceCents * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t px-4 pt-4 pb-6">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold">Subtotal</span>
                <span className="font-display text-lg font-bold">{formatPrice(totalCents)}</span>
              </div>
              <p className="text-muted-foreground mb-3 text-xs">
                Pickup details are shared after your order is confirmed. {SERVICE_AREA_COPY}
              </p>
              {CLIENT_REVIEW_MODE && (
                <p
                  role="status"
                  className="bg-accent/60 text-accent-foreground mb-3 rounded-xl px-3 py-2 text-xs font-semibold"
                >
                  {REVIEW_CHECKOUT_NOTICE}
                </p>
              )}
              <Button
                className="min-h-12 w-full rounded-full text-base font-bold"
                size="lg"
                disabled={CLIENT_REVIEW_MODE || checkout.isPending}
                onClick={() =>
                  checkout.mutate({
                    items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
                  })
                }
              >
                {CLIENT_REVIEW_MODE
                  ? "Checkout Disabled (Preview)"
                  : checkout.isPending
                    ? "Preparing checkout…"
                    : "Checkout Securely"}
              </Button>
              <button
                onClick={clearCart}
                className="text-muted-foreground hover:text-foreground mt-2 w-full text-center text-xs underline"
              >
                Clear bag
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const subscribe = trpc.newsletter.subscribe.useMutation({
    onSuccess: () => {
      toast.success("You're on the list! Sweet news coming your way.");
      setEmail("");
    },
    onError: () => toast.error("Could not subscribe. Please check your email and try again."),
  });

  return (
    <form
      className={compact ? "flex gap-2" : "mx-auto flex max-w-md gap-2"}
      onSubmit={e => {
        e.preventDefault();
        if (!email.trim()) return;
        if (CLIENT_REVIEW_MODE) {
          // Review mode: no data is transmitted or stored.
          toast.info(REVIEW_FORM_NOTICE);
          setEmail("");
          return;
        }
        subscribe.mutate({ email: email.trim() });
      }}
    >
      <Input
        type="email"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Your email address"
        className="bg-card rounded-full"
        aria-label="Email address for newsletter"
      />
      <Button
        type="submit"
        className="shrink-0 rounded-full font-bold"
        disabled={subscribe.isPending}
      >
        {subscribe.isPending ? "…" : "Sign Up"}
      </Button>
    </form>
  );
}

export { NewsletterForm };

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBanner />
      <header className="bg-background/90 sticky top-0 z-40 border-b backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between gap-2">
          <div className="flex items-center gap-1 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(v => !v)}
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>

          <Link href="/" className="flex items-center gap-2">
            <LogoMark />
            <span className="font-display text-lg leading-none font-bold sm:text-xl">
              TakeASweet
              <span className="text-muted-foreground block text-[10px] font-semibold tracking-widest uppercase">
                Cookies & Treats
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map(link => (
              <Link
                key={link.key ?? link.href}
                href={link.href}
                aria-current={location === link.href ? "page" : undefined}
                className={`focus-visible:ring-ring rounded-full px-3 py-2 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none ${
                  location === link.href && !link.key
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user?.role === "admin" && (
              <Link
                href="/admin"
                className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                  location.startsWith("/admin")
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-muted text-foreground"
                }`}
              >
                Admin
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-1">
            <CartDrawer />
          </div>
        </div>

        {mobileOpen && (
          <nav className="fade-up border-t px-4 pt-2 pb-4 md:hidden">
            {NAV_LINKS.map(link => (
              <Link
                key={link.key ?? link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                aria-current={location === link.href ? "page" : undefined}
                className={`focus-visible:ring-ring block min-h-11 rounded-xl px-3 py-2.5 text-base font-semibold focus-visible:ring-2 focus-visible:outline-none ${
                  location === link.href && !link.key
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user?.role === "admin" && (
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className="hover:bg-muted block rounded-xl px-3 py-2.5 text-base font-semibold"
              >
                Admin
              </Link>
            )}
          </nav>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-secondary/50 mt-16 border-t">
        <div className="sprinkle-dots w-full" />
        <div className="container grid gap-10 py-12 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <LogoMark className="size-10" />
              <span className="font-display text-lg font-bold">TakeASweet</span>
            </div>
            <p className="text-muted-foreground mt-3 max-w-xs text-sm">
              Handmade cookies and treats baked with big dreams by a young Charlotte entrepreneur.
            </p>
            <p className="mt-3 text-sm font-bold">{SERVICE_AREA_COPY}</p>
            <div className="mt-4 flex gap-2">
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TakeASweet on Facebook"
                className="bg-card border-border hover:bg-muted flex size-9 items-center justify-center rounded-full border"
              >
                <Facebook className="size-4" />
              </a>
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TakeASweet on Instagram"
                className="bg-card border-border hover:bg-muted flex size-9 items-center justify-center rounded-full border"
              >
                <Instagram className="size-4" />
              </a>
            </div>
          </div>
          <div>
            <h3 className="font-display mb-3 text-sm font-bold tracking-widest uppercase">
              Explore
            </h3>
            <ul className="space-y-2 text-sm">
              {NAV_LINKS.filter(link => !link.key).map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-secondary-foreground hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="font-display mt-5 mb-2 text-sm font-bold tracking-widest uppercase">
              Policies
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/order-info" className="hover:text-secondary-foreground hover:underline">
                  Order Information
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-secondary-foreground hover:underline">
                  Privacy Policy
                </Link>
              </li>
            </ul>
            <ul className="text-muted-foreground mt-3 space-y-1.5 text-xs">
              <li>Custom orders are reviewed before payment.</li>
              <li>Wedding orders are not accepted.</li>
              <li>No shipping — local pickup and delivery only.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-display mb-3 text-sm font-bold tracking-widest uppercase">
              Stay in the Sweet Loop
            </h3>
            <p className="text-muted-foreground mb-3 text-sm">
              New flavors, seasonal drops, and restock alerts — right to your inbox.
            </p>
            <NewsletterForm compact />
          </div>
        </div>
        <div className="border-t py-4">
          <p className="text-muted-foreground container text-center text-xs">
            © {new Date().getFullYear()} TakeASweet Cookies & Treats · {SERVICE_AREA_COPY}
          </p>
        </div>
      </footer>
    </div>
  );
}
