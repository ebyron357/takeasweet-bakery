import { useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  CakeSlice,
  CalendarHeart,
  Check,
  Cookie,
  CupSoda,
  Heart,
  IceCream,
  MapPin,
  MessageSquareQuote,
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
import { CATEGORY_LABELS, FAQ_ITEMS, SERVICE_AREA_COPY } from "@shared/bakery";

const FOUNDER_PORTRAIT = "/manus-storage/founder-portrait_084f259e.webp";
const FOUNDER_FAMILY = "/manus-storage/founder-family_f9035642.webp";

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

const CATEGORY_CARDS = [
  { key: "limber", Icon: CupSoda },
  { key: "treat-cups", Icon: IceCream },
  { key: "cookies", Icon: Cookie },
  { key: "cheesecake", Icon: CakeSlice },
  { key: "seasonal", Icon: Sparkles },
];

const FLAVOR_CARDS = [
  { label: "Strawberry", available: true },
  { label: "Oreo", available: true },
  { label: "Flavor Coming Soon", available: false },
  { label: "Flavor Coming Soon", available: false },
];

function FourCornersPreview() {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (flavor: string) => {
    setSelected(prev =>
      prev.includes(flavor)
        ? prev.filter(item => item !== flavor)
        : prev.length < 4
          ? [...prev, flavor]
          : prev,
    );
  };

  return (
    <div className="bg-card border-border/60 rounded-3xl border p-6 shadow-sm">
      <p className="mb-4 text-sm font-bold">Choose your corners:</p>
      <div className="grid grid-cols-2 gap-3">
        {FLAVOR_CARDS.map((flavor, index) => {
          const active = selected.includes(flavor.label);
          const key = `${flavor.label}-${index}`;

          if (!flavor.available) {
            return (
              <div
                key={key}
                aria-disabled="true"
                className="bg-muted text-muted-foreground border-border/60 flex aspect-[2/1] flex-col items-center justify-center gap-2 rounded-2xl border p-3 text-center shadow-sm"
              >
                <CakeSlice className="size-5 stroke-[1.5]" aria-hidden="true" />
                <span className="text-xs font-semibold italic">{flavor.label}</span>
              </div>
            );
          }

          return (
            <button
              key={key}
              type="button"
              onClick={() => toggle(flavor.label)}
              aria-pressed={active}
              className={`border-border/60 focus-visible:ring-ring flex aspect-[2/1] flex-col items-center justify-center gap-2 rounded-2xl border p-3 text-center shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-offset-2 ${
                active
                  ? "bg-secondary text-secondary-foreground border-primary"
                  : "bg-card hover:border-primary"
              }`}
            >
              <CakeSlice className="size-5 stroke-[1.5]" aria-hidden="true" />
              <span className="inline-flex items-center gap-1 text-xs font-bold">
                {active && <Check className="size-3" aria-hidden="true" />}
                {flavor.label}
              </span>
            </button>
          );
        })}
      </div>
      <p className="text-muted-foreground mt-3 text-xs">
        This preview does not add an item to your order. Final flavor choices are confirmed on the
        product page.
      </p>
    </div>
  );
}

export default function Home() {
  return (
    <div>
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
                  Shop the Menu <ArrowRight className="size-4" />
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
                alt="Illustrative assortment of colorful cookies"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
            <p className="text-muted-foreground mt-2 text-center text-xs">
              Illustrative menu image.
            </p>
          </div>
        </div>
        <div className="sprinkle-dots w-full" />
      </section>

      <section className="container py-12 md:py-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-secondary-foreground flex items-center gap-1.5 text-sm font-bold tracking-widest uppercase">
              <Sparkles className="size-4" /> Menu highlights
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
      </section>

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
                <cat.Icon className="text-foreground size-8 stroke-[1.5]" aria-hidden="true" />
                <span className="font-display font-bold">{CATEGORY_LABELS[cat.key]}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

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

      <section className="bg-secondary/40 py-12 md:py-16">
        <div className="container grid items-center gap-8 md:grid-cols-2">
          <div className="relative mx-auto w-full max-w-sm">
            <img
              src={FOUNDER_PORTRAIT}
              alt="Portrait of the young founder of TakeASweet Cookies & Treats smiling in a bright blue blazer"
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
              that big idea grew into a bakery known for colorful, handmade treats — and it is still
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
            alt="The TakeASweet founder and her mother smiling together at a Charlotte community event in matching bakery shirts and pink caps"
            width={1200}
            height={900}
            loading="lazy"
            decoding="async"
            className="order-1 aspect-[4/3] w-full rounded-3xl object-cover object-center shadow-md md:order-2"
          />
        </div>
      </section>

      <section className="bg-muted/60 py-12 md:py-14">
        <div className="container">
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
              Illustrated menu inspiration
            </h2>
            <Button asChild variant="ghost" className="hidden rounded-full font-bold sm:inline-flex">
              <Link href="/shop">
                View the Menu <ArrowRight className="size-4" aria-hidden="true" />
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
                  alt={`Illustrative ${item.label.toLowerCase()} menu image`}
                  loading="lazy"
                  className="aspect-square w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

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
            are not able to accept wedding orders.
          </p>
          <Button asChild size="lg" className="mt-6 rounded-full text-base font-bold">
            <Link href="/custom-orders">
              Request a Custom Order <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

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
                <item.icon className="text-primary-foreground size-5" aria-hidden="true" />
              </div>
              <h3 className="font-display mt-3 font-bold">{item.title}</h3>
              <p className="text-muted-foreground mt-1 text-sm">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container max-w-3xl py-12 md:py-16">
        <h2 className="font-display mb-6 text-center text-3xl font-extrabold sm:text-4xl">
          Good to know
        </h2>
        <Accordion type="single" collapsible className="w-full">
          {FAQ_ITEMS.slice(0, 4).map((item, index) => (
            <AccordionItem key={item.question} value={`faq-${index}`}>
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
    </div>
  );
}
