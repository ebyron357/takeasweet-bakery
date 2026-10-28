import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Facebook, Instagram, Menu, Minus, Music2, Plus, ShoppingBag, Trash2, X } from "lucide-react";
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
import CheckoutButton from "@/components/CheckoutButton";
import { useCart } from "@/contexts/CartContext";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { trpc } from "@/lib/trpc";
import { formatPrice } from "@shared/bakery";
import type { PublicSiteSettings } from "@shared/site-settings";

const NAV_LINKS: { href: string; label: string }[] = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Menu" },
  { href: "/custom-orders", label: "Custom Orders" },
  { href: "/gallery", label: "Gallery" },
  { href: "/our-story", label: "Our Story" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

/** Pages hidden from navigation while they have no content to show. */
function visibleNavLinks(settings: PublicSiteSettings) {
  return NAV_LINKS.filter(link => {
    if (link.href === "/gallery") return settings.gallery.length > 0;
    if (link.href === "/faq") return settings.faq.length > 0;
    return true;
  });
}

const SOCIAL_LINKS = [
  { key: "facebook", label: "Facebook", Icon: Facebook },
  { key: "instagram", label: "Instagram", Icon: Instagram },
  { key: "tiktok", label: "TikTok", Icon: Music2 },
] as const;

/** The uploaded logo when one is set in admin settings, otherwise the brand mark. */
function LogoMark({ className = "size-9" }: { className?: string }) {
  const { settings } = useSiteSettings();
  if (settings.logo) {
    return (
      <img
        src={settings.logo.url}
        alt=""
        aria-hidden
        className={`shrink-0 rounded-2xl object-contain ${className}`}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={`bg-primary font-display relative flex shrink-0 rotate-[-4deg] items-center justify-center rounded-2xl shadow-sm ${className}`}
    >
      <span className="text-primary-foreground text-lg leading-none font-extrabold">🍪</span>
      <span className="bg-secondary absolute -right-1 -bottom-1 size-2.5 rounded-full" />
    </span>
  );
}

function AnnouncementBanner() {
  const copy = useSiteSettings().settings.announcement;
  if (!copy) return null;
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
  const { settings } = useSiteSettings();

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
                        className="text-muted-foreground hover:text-destructive -m-2 flex size-9 items-center justify-center rounded-full"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <p className="text-muted-foreground text-xs">{formatPrice(item.priceCents)}</p>
                    <div className="mt-auto flex items-center gap-2">
                      <button
                        className="border-border hover:bg-muted flex size-9 items-center justify-center rounded-full border"
                        onClick={() => setQuantity(item.productId, item.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        className="border-border hover:bg-muted flex size-9 items-center justify-center rounded-full border"
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
                Pickup details are shared after your order is confirmed. {settings.serviceArea}
              </p>
              <CheckoutButton compact />
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
  const { settings } = useSiteSettings();
  const subscribe = trpc.newsletter.subscribe.useMutation({
    onSuccess: () => {
      toast.success("You're on the list! Sweet news coming your way.");
      setEmail("");
    },
    onError: () => toast.error("Could not subscribe. Please check your email and try again."),
  });

  // During client review, email collection is fully disabled.
  if (settings.reviewMode) {
    return (
      <p
        className={`text-muted-foreground text-sm ${compact ? "" : "mx-auto max-w-md text-center"}`}
      >
        Email signup will open when the bakery launches online ordering.
      </p>
    );
  }

  return (
    <form
      className={compact ? "flex gap-2" : "mx-auto flex max-w-md gap-2"}
      onSubmit={e => {
        e.preventDefault();
        if (!email.trim()) return;
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
  const { settings } = useSiteSettings();
  const navLinks = visibleNavLinks(settings);
  const socialLinks = SOCIAL_LINKS.filter(link => settings.socialLinks[link.key]);

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
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={location === link.href ? "page" : undefined}
                className={`focus-visible:ring-ring rounded-full px-3 py-2 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none ${
                  location === link.href
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <CartDrawer />
          </div>
        </div>

        {mobileOpen && (
          <nav className="fade-up border-t px-4 pt-2 pb-4 md:hidden">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                aria-current={location === link.href ? "page" : undefined}
                className={`focus-visible:ring-ring block min-h-11 rounded-xl px-3 py-2.5 text-base font-semibold focus-visible:ring-2 focus-visible:outline-none ${
                  location === link.href ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}
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
            {settings.serviceArea && (
              <p className="mt-3 text-sm font-bold">{settings.serviceArea}</p>
            )}
            {socialLinks.length > 0 && (
              <div className="mt-4 flex gap-2">
                {socialLinks.map(({ key, label, Icon }) => (
                  <a
                    key={key}
                    href={settings.socialLinks[key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`TakeASweet on ${label}`}
                    className="bg-card border-border hover:bg-muted flex size-9 items-center justify-center rounded-full border"
                  >
                    <Icon className="size-4" />
                  </a>
                ))}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-display mb-3 text-sm font-bold tracking-widest uppercase">
              Explore
            </h3>
            <ul className="space-y-0.5 text-sm">
              {navLinks.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-secondary-foreground inline-block py-1 hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="font-display mt-5 mb-2 text-sm font-bold tracking-widest uppercase">
              Policies
            </h3>
            <ul className="space-y-0.5 text-sm">
              <li>
                <Link href="/order-info" className="hover:text-secondary-foreground inline-block py-1 hover:underline">
                  Order Information
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-secondary-foreground inline-block py-1 hover:underline">
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
            © {new Date().getFullYear()} TakeASweet Cookies & Treats
            {settings.serviceArea && ` · ${settings.serviceArea}`}
          </p>
          <p className="text-muted-foreground container mt-2 text-center text-xs leading-relaxed">
            Website designed and maintained by{" "}
            <a
              href="https://clientverse.io"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground focus-visible:ring-ring rounded font-semibold underline underline-offset-2 transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              Clientverse®
            </a>
            . AI-powered websites, automation, and business systems.
          </p>
        </div>
      </footer>
    </div>
  );
}
