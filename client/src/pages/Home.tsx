import { useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  CakeSlice,
  CalendarHeart,
  Check,
  Cookie,
  Facebook,
  Heart,
  IceCreamBowl,
  Instagram,
  MapPin,
  MessageSquareQuote,
  Snowflake,
  Sparkles,
  Truck,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { NewsletterForm } from "@/components/SiteLayout";
import { CATEGORY_LABELS, FAQ_ITEMS, SERVICE_AREA_COPY } from "@shared/bakery";

const FOUNDER_PORTRAIT = "/manus-storage/founder-portrait_084f259e.webp";
const FOUNDER_FAMILY = "/manus-storage/founder-family_f9035642.webp";

/* ---------- 4. Featured Favorites (verified items, illustrative category images) ---------- */
const FEATURED_FAVORITES = [
  {
    name: "Banana Pudding",
    href: "/product/banana-pudding",
    image: "/manus-storage/cat-treat-cups_6ff55c37.png",
  },
  {
    name: "Cookies",
    href: "/shop#cookies",
    image: "/manus-storage/cat-cookies_e5f3f90b.png",
  },
  {
    name: "Four Corners Cheesecake",
    href: "/product/four-corners-cheesecake",
    image: "/manus-storage/cat-cheesecake_85fb2916.png",
  },
  {
    name: "Treat Cups",
    href: "/shop#treat-cups",
    image: "/manus-storage/cat-treat-cups_6ff55c37.png",
  },
];

/* ---------- 5. Shop by Category ---------- */
const CATEGORY_CARDS = [
  { key: "limber", icon: Snowflake },
  { key: "treat-cups", icon: IceCreamBowl },
  { key: "cookies", icon: Cookie },
  { key: "cheesecake", icon: CakeSlice },
  { key: "seasonal", icon: Sparkles },
];

/* ---------- 6. Four Corners flavor preview (illustrative only) ---------- */
const PREVIEW_FLAVORS = [
  { name: "Strawberry", available: true },
  { name: "Oreo", available: true },
  { name: "Flavor Coming Soon", available: false },
  { name: "Flavor Coming Soon", available: false },
];

function FourCornersPreview() {
  const [selected, setSelected] = useState<string[]>(["Strawberry", "Oreo"]);

  const toggle = (flavor: { name: string; available: boolean }) => {
    if (!flavor.available) return;
    setSelected(prev =>
      prev.includes(flavor.name)
        ? prev.filter(f => f !== flavor.name)
        : prev.length < 4
          ? [...prev, flavor.name]
          : prev,
    );
  };

  return (
    <div className="bg-card border-border/60 rounded-3xl border p-6 shadow-sm">
      <p className="mb-3 text-sm font-bold">Pick up to 4 flavors:</p>
      <div className="grid grid-cols-2 gap-3">
        {PREVIEW_FLAVORS.map((flavor, i) => {
          const active = flavor.available && selected.includes(flavor.name);
          return (
            <button
              key={`${flavor.name}-${i}`}
              type="button"
              onClick={() => toggle(flavor)}
              disabled={!flavor.available}
              aria-pressed={flavor.available ? active : undefined}
              className={`flex aspect-[2/1] flex-col items-center justify-center gap-1 rounded-xl border p-3 text-center text-xs font-bold transition-colors ${
                active
                  ? "bg-secondary text-secondary-foreground border-secondary shadow-sm"
                  : flavor.available
                    ? "bg-secondary/20 text-foreground border-border/60 hover:bg-secondary/40 hover:border-secondary shadow-sm"
                    : "bg-muted/50 text-muted-foreground border-border/40 cursor-not-allowed"
              }`}
            >
              <CakeSlice className="size-4" strokeWidth={1.75} aria-hidden />
              <span className="inline-flex items-center gap-1">
                {active && <Check className="size-3" />}
                {flavor.name}
              </span>
            </button>
          );
        })}
      </div>
      <p className="text-muted-foreground mt-3 text-xs">
        Flavor list shown for preview — final flavors are confirmed on the product page before
        checkout.
      </p>
    </div>
  );
}

export default function Home() {
  return (
    <div>
      {/* ---------- 3. Hero ---------- */}
      <section className="relative overflow-hidden">
        <div className="container grid items-center gap-8 py-10 md:grid-cols-2 md:py-16">
          <div className="fade-up order-2 md:order-1">
            <div className="bg-accent text-accent-foreground mb-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold">
              <MapPin className="size-3.5" />
              Kid-owned bakery serving Charlotte, North Carolina.
            </div>
            <h1 className="font-display text-4xl leading-tight font-extrabold sm:text-5xl lg:text-6xl">
              Big Dreams.
              <span className="text-secondary-foreground bg-secondary mt-1 inline-block -rotate-1 rounded-2xl px-3">
                Seriously Sweet Treats.
              </span>
            </h1>
            <p className="text-muted-foreground mt-4 max-w-md text-base sm:text-lg">
              TakeASweet is a kid-owned Charlotte bakery serving colorful cookies, dessert cups,
              cheesecake, frozen limber, and seasonal favorites.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full text-base font-bold">
                <Link href="/shop">
                  Shop the Menu
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-card rounded-full text-base font-bold"
              >
                <Link href="/our-story">Meet the Founder</Link>
              </Button>
            </div>
          </div>
          <div className="fade-up order-1 md:order-2">
            <div className="border-primary/40 mx-auto max-w-lg overflow-hidden rounded-3xl border-4 shadow-md">
              <img
                src="/manus-storage/cat-cookies_e5f3f90b.png"
                alt="Colorful handmade cookies"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          </div>
        </div>
        <div className="sprinkle-dots w-full" />
      </section>

      {/* ---------- 4. Featured Favorites ---------- */}
      <section className="container py-12 md:py-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-secondary-foreground flex items-center gap-1.5 text-sm font-bold tracking-widest uppercase">
              <Sparkles className="size-4" /> Customer favorites
            </p>
            <h2 className="font-display mt-1 text-3xl font-extrabold sm:text-4xl">
              Featured Favorites
            </h2>
          </div>
          <Button asChild variant="ghost" className="hidden rounded-full font-bold sm:inline-flex">
            <Link href="/shop">
              View menu <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {FEATURED_FAVORITES.map(item => (
            <Link
              key={item.name}
              href={item.href}
              className="group bg-card border-border/60 overflow-hidden rounded-xl border shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="bg-secondary/30 aspect-[4/3] w-full overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-3.5">
                <h3 className="text-sm font-bold group-hover:underline sm:text-base">
                  {item.name}
                </h3>
                <p className="text-muted-foreground text-xs">See details on the menu</p>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-6 text-center sm:hidden">
          <Button asChild variant="outline" className="bg-card rounded-full font-bold">
            <Link href="/shop">View the Full Menu</Link>
          </Button>
        </div>
      </section>

      {/* ---------- 5. Shop by Category ---------- */}
      <section className="bg-muted/60 py-12 md:py-14">
        <div className="container">
          <h2 className="font-display mb-6 text-center text-3xl font-extrabold sm:text-4xl">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {CATEGORY_CARDS.map(cat => (
              <Link
                key={cat.key}
                href={`/shop#${cat.key}`}
                className="bg-card border-border/60 hover:border-primary flex flex-col items-center gap-2 rounded-2xl border p-5 text-center shadow-sm transition-colors"
              >
                <cat.icon className="text-foreground size-8" strokeWidth={1.75} aria-hidden />
                <span className="font-display font-bold">{CATEGORY_LABELS[cat.key]}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- 6. Four Corners Cheesecake feature ---------- */}
      <section className="container py-12 md:py-16">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <p className="text-secondary-foreground flex items-center gap-1.5 text-sm font-bold tracking-widest uppercase">
              <CakeSlice className="size-4" /> Signature item
            </p>
            <h2 className="font-display mt-1 text-3xl font-extrabold sm:text-4xl">
              Four Corners Cheesecake
            </h2>
            <p className="text-muted-foreground mt-4 leading-relaxed">
              One cheesecake, four corners, your call. For <strong>$20</strong>, pick up to{" "}
              <strong>four flavors</strong> for a single cheesecake — perfect when everyone at the
              table wants something different. Flavors are chosen before checkout so your bake is
              exactly how you want it.
            </p>
            <Button asChild size="lg" className="mt-6 rounded-full text-base font-bold">
              <Link href="/product/four-corners-cheesecake">
                Build Your Cheesecake <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
          <FourCornersPreview />
        </div>
      </section>

      {/* ---------- 7. Our Story ---------- */}
      <section className="bg-secondary/40 py-12 md:py-16">
        <div className="container grid items-center gap-8 md:grid-cols-2">
          <div className="relative mx-auto w-full max-w-sm">
            <img
              src={FOUNDER_PORTRAIT}
              alt="Portrait of the young founder of TakeASweet Cookies & Treats, smiling in a bright blue blazer in front of green hedges"
              width={900}
              height={1350}
              loading="lazy"
              decoding="async"
              className="aspect-[2/3] w-full rounded-3xl object-cover object-top shadow-md"
            />
            <div className="bg-primary text-primary-foreground absolute -right-3 -bottom-3 rotate-3 rounded-2xl px-4 py-2 shadow-md">
              <span className="font-display text-sm font-extrabold">Kid-owned & proud!</span>
            </div>
          </div>
          <div>
            <p className="text-secondary-foreground flex items-center gap-1.5 text-sm font-bold tracking-widest uppercase">
              <Heart className="size-4" /> Our story
            </p>
            <h2 className="font-display mt-1 text-3xl font-extrabold sm:text-4xl">
              Built from a Big Idea
            </h2>
            <p className="text-muted-foreground mt-4 leading-relaxed">
              TakeASweet started when a young Charlotte entrepreneur decided to turn creativity and
              hard work into something real. With family support and a lot of practice batches,
              that big idea grew into a bakery known for colorful, handmade treats — and it's still
              growing.
            </p>
            <Button asChild className="mt-6 rounded-full font-bold" size="lg">
              <Link href="/our-story">
                Read the Full Story <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ---------- 8. Community ---------- */}
      <section className="container py-12 md:py-16">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div className="order-2 md:order-1">
            <p className="text-secondary-foreground text-sm font-bold tracking-widest uppercase">
              In the community
            </p>
            <h2 className="font-display mt-1 text-3xl font-extrabold sm:text-4xl">
              Made in Charlotte, shared with Charlotte
            </h2>
            <p className="text-muted-foreground mt-4 leading-relaxed">
              From local events to special celebrations, TakeASweet brings colorful, handmade
              treats to the Charlotte community.
            </p>
          </div>
          <img
            src={FOUNDER_FAMILY}
            alt="The founder of TakeASweet and her mother smiling together at a Charlotte community event, both wearing pink TakeASweet Cookies & Treats caps and logo shirts"
            width={1200}
            height={900}
            loading="lazy"
            decoding="async"
            className="order-1 aspect-[4/3] w-full rounded-3xl object-cover object-center shadow-md md:order-2"
          />
        </div>
      </section>

      {/* ---------- Gallery preview ---------- */}
      <section className="bg-muted/60 py-12 md:py-14">
        <div className="container">
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
              A peek at our work
            </h2>
            <Button
              asChild
              variant="ghost"
              className="hidden rounded-full font-bold sm:inline-flex"
            >
              <Link href="/gallery">
                Visit the Gallery <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: "Cookies", image: "/manus-storage/cat-cookies_e5f3f90b.png" },
              { label: "Treat cups", image: "/manus-storage/cat-treat-cups_6ff55c37.png" },
              { label: "Cheesecake", image: "/manus-storage/cat-cheesecake_85fb2916.png" },
              { label: "Limber", image: "/manus-storage/cat-limber_9edac5a4.png" },
            ].map(item => (
              <div key={item.label} className="overflow-hidden rounded-xl">
                <img
                  src={item.image}
                  alt={item.label}
                  loading="lazy"
                  className="aspect-square w-full object-cover"
                />
              </div>
            ))}
          </div>
          <div className="mt-6 text-center sm:hidden">
            <Button asChild variant="outline" className="bg-card rounded-full font-bold">
              <Link href="/gallery">Visit the Gallery</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ---------- 9. Custom Orders ---------- */}
      <section className="bg-accent/40 py-12 md:py-14">
        <div className="container max-w-3xl text-center">
          <p className="text-accent-foreground flex items-center justify-center gap-1.5 text-sm font-bold tracking-widest uppercase">
            <CalendarHeart className="size-4" /> Custom orders
          </p>
          <h2 className="font-display mt-1 text-3xl font-extrabold sm:text-4xl">
            Something special for your celebration
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-xl leading-relaxed">
            Custom desserts are available for birthdays, showers, and celebrations. Every request
            is reviewed before payment, and large orders may require a deposit. Please note: we
            aren't able to accept wedding orders.
          </p>
          <Button asChild size="lg" className="mt-6 rounded-full text-base font-bold">
            <Link href="/custom-orders">
              Request a Custom Order <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* ---------- 10. Pickup & Delivery ---------- */}
      <section className="container py-12 md:py-16">
        <h2 className="font-display mb-8 text-center text-3xl font-extrabold sm:text-4xl">
          Pickup & Delivery
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: MapPin, title: "Local to Charlotte", text: SERVICE_AREA_COPY },
            {
              icon: Check,
              title: "Pickup",
              text: "Pickup details are shared after your order is confirmed.",
            },
            {
              icon: Truck,
              title: "Local delivery",
              text: "Local delivery is available within the approved service area.",
            },
            {
              icon: MessageSquareQuote,
              title: "No shipping (yet)",
              text: "Shipping is not currently available — local love only for now.",
            },
          ].map(item => (
            <div
              key={item.title}
              className="bg-card border-border/60 rounded-2xl border p-5 text-center shadow-sm"
            >
              <div className="bg-primary/20 mx-auto flex size-11 items-center justify-center rounded-full">
                <item.icon className="text-primary-foreground size-5" />
              </div>
              <h3 className="font-display mt-3 font-bold">{item.title}</h3>
              <p className="text-muted-foreground mt-1 text-sm">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- 11. Social proof (component ready, no fake testimonials) ---------- */}
      <section className="bg-muted/60 py-12 md:py-14">
        <div className="container max-w-2xl text-center">
          <MessageSquareQuote className="text-primary mx-auto size-9" />
          <h2 className="font-display mt-3 text-3xl font-extrabold sm:text-4xl">
            Sweet words from Charlotte
          </h2>
          <div className="border-border bg-card mt-6 rounded-2xl border-2 border-dashed p-8">
            <p className="text-muted-foreground text-sm">
              Real customer reviews will appear here soon. Tried our treats? We'd love to hear from
              you — send us a note through the contact page!
            </p>
            <Button asChild variant="outline" className="bg-card mt-4 rounded-full font-bold">
              <Link href="/contact">Share Your Experience</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ---------- 13. FAQ preview ---------- */}
      <section className="container max-w-3xl py-12 md:py-16">
        <h2 className="font-display mb-6 text-center text-3xl font-extrabold sm:text-4xl">
          Good to know
        </h2>
        <Accordion type="single" collapsible className="w-full">
          {FAQ_ITEMS.slice(0, 4).map((item, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-left font-bold">{item.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="mt-6 text-center">
          <Button asChild variant="outline" className="bg-card rounded-full font-bold">
            <Link href="/faq">
              See All FAQs <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* ---------- 12. Social media + newsletter ---------- */}
      <section className="container pb-14 text-center md:pb-20">
        <h2 className="font-display text-3xl font-extrabold sm:text-4xl">Follow the sweetness</h2>
        <p className="text-muted-foreground mx-auto mt-2 max-w-md">
          New flavors and event pop-ups drop on social first — and the sweet list gets restock
          alerts by email.
        </p>
        <div className="mt-5 flex justify-center gap-3">
          <Button
            asChild
            variant="outline"
            className="bg-card rounded-full font-bold"
            aria-label="TakeASweet on Facebook"
          >
            <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer">
              <Facebook className="size-4" /> Facebook
            </a>
          </Button>
          <Button
            asChild
            variant="outline"
            className="bg-card rounded-full font-bold"
            aria-label="TakeASweet on Instagram"
          >
            <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer">
              <Instagram className="size-4" /> Instagram
            </a>
          </Button>
        </div>
        <div className="mt-8">
          <NewsletterForm />
        </div>
      </section>
    </div>
  );
}
