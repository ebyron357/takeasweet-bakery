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
  PackageX,
  Sparkles,
  Truck,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import ProductCard, { type ProductCardData } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { trpc } from "@/lib/trpc";
import { CATEGORY_LABELS, formatPrice, PRODUCT_CATEGORIES } from "@shared/bakery";
import type { SiteImage } from "@shared/site-settings";

const CATEGORY_ICONS: Record<string, typeof Cookie> = {
  limber: CupSoda,
  "treat-cups": IceCream,
  cookies: Cookie,
  cheesecake: CakeSlice,
  seasonal: Sparkles,
};

/** How many menu items the home page highlights. */
const FEATURED_COUNT = 4;

type SignatureProduct = ProductCardData & {
  flavorOptions: string[];
  maxFlavorSelections: number;
};

/** An image from the admin settings, with its optional caption. */
function SettingsImage({ image, className }: { image: SiteImage; className: string }) {
  return (
    <figure>
      <img src={image.url} alt={image.alt} loading="lazy" decoding="async" className={className} />
      {image.caption && (
        <figcaption className="text-muted-foreground mt-2 text-center text-xs">
          {image.caption}
        </figcaption>
      )}
    </figure>
  );
}

function FlavorPreview({ product }: { product: SignatureProduct }) {
  const [selected, setSelected] = useState<string[]>([]);
  const max = product.maxFlavorSelections;

  const toggle = (flavor: string) => {
    setSelected(prev =>
      prev.includes(flavor)
        ? prev.filter(item => item !== flavor)
        : prev.length < max
          ? [...prev, flavor]
          : prev,
    );
  };

  return (
    <div className="bg-card border-border/60 rounded-3xl border p-6 shadow-sm">
      <p className="mb-4 text-sm font-bold">
        Choose up to {max} flavors ({selected.length}/{max}):
      </p>
      <div className="flex flex-wrap gap-2">
        {product.flavorOptions.map(flavor => {
          const active = selected.includes(flavor);
          return (
            <button
              key={flavor}
              type="button"
              onClick={() => toggle(flavor)}
              aria-pressed={active}
              className={`border-border/60 focus-visible:ring-ring inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-sm font-bold shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-offset-2 ${
                active
                  ? "bg-secondary text-secondary-foreground border-primary"
                  : "bg-card hover:border-primary"
              }`}
            >
              {active && <Check className="size-3.5" aria-hidden="true" />}
              {flavor}
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
  const { settings } = useSiteSettings();
  const { data: products = [] } = trpc.products.list.useQuery();
  const { images } = settings;

  const available = products.filter(p => p.inStock);
  const flagged = available.filter(p => p.featured);
  const featured = (flagged.length > 0 ? flagged : available).slice(0, FEATURED_COUNT);
  const categories = PRODUCT_CATEGORIES.filter(c => products.some(p => p.category === c));
  const signature = products.find(
    (p): p is typeof p & SignatureProduct =>
      (p.maxFlavorSelections ?? 0) > 1 && (p.flavorOptions?.length ?? 0) > 1,
  );

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="container grid items-center gap-8 py-10 md:grid-cols-2 md:py-16">
          <div className="fade-up order-2 md:order-1">
            <div className="bg-accent text-accent-foreground mb-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold">
              <MapPin className="size-3.5" />
              Kid-owned bakery
              {settings.serviceArea ? ` · ${settings.serviceArea}` : ""}
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
          {images.hero && (
            <div className="fade-up order-1 mx-auto w-full max-w-lg md:order-2">
              <SettingsImage
                image={images.hero}
                className="border-primary/40 aspect-[4/3] w-full rounded-3xl border-4 object-cover shadow-md"
              />
            </div>
          )}
        </div>
        <div className="sprinkle-dots w-full" />
      </section>

      {featured.length > 0 && (
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
            <Button
              asChild
              variant="ghost"
              className="hidden rounded-full font-bold sm:inline-flex"
            >
              <Link href="/shop">
                View menu <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
          <div
            className={`grid gap-4 sm:grid-cols-2 ${
              featured.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"
            }`}
          >
            {featured.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {categories.length > 0 && (
        <section className="bg-muted/60 py-12 md:py-14">
          <div className="container">
            <h2 className="font-display mb-6 text-center text-3xl font-extrabold sm:text-4xl">
              Shop by Category
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {categories.map(category => {
                const Icon = CATEGORY_ICONS[category] ?? Cookie;
                return (
                  <Link
                    key={category}
                    href={`/shop#${category}`}
                    className="bg-card border-border/60 hover:border-primary flex flex-col items-center gap-2 rounded-2xl border p-5 text-center shadow-sm transition-colors"
                  >
                    <Icon className="text-foreground size-8 stroke-[1.5]" aria-hidden="true" />
                    <span className="font-display font-bold">{CATEGORY_LABELS[category]}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {signature && (
        <section className="container py-12 md:py-16">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <p className="text-secondary-foreground flex items-center gap-1.5 text-sm font-bold tracking-widest uppercase">
                <CakeSlice className="size-4" /> Signature item
              </p>
              <h2 className="font-display mt-1 text-3xl font-extrabold sm:text-4xl">
                {signature.name}
              </h2>
              <p className="text-muted-foreground mt-4 leading-relaxed">
                For <strong>{formatPrice(signature.priceCents)}</strong>, pick up to{" "}
                <strong>{signature.maxFlavorSelections} flavors</strong> — perfect when everyone at
                the table wants something different. Flavors are chosen before checkout so your
                order is exactly how you want it.
              </p>
              <Button asChild size="lg" className="mt-6 rounded-full text-base font-bold">
                <Link href={`/product/${signature.slug}`}>
                  Choose Your Flavors <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
            <FlavorPreview product={signature} />
          </div>
        </section>
      )}

      <section className="bg-secondary/40 py-12 md:py-16">
        <div className="container grid items-center gap-8 md:grid-cols-2">
          {images.founderPortrait && (
            <div className="relative mx-auto w-full max-w-sm">
              <img
                src={images.founderPortrait.url}
                alt={images.founderPortrait.alt}
                loading="lazy"
                decoding="async"
                className="aspect-[2/3] w-full rounded-3xl object-cover object-top shadow-md"
              />
              <div className="bg-primary text-primary-foreground absolute -right-3 -bottom-3 rotate-3 rounded-2xl px-4 py-2 shadow-md">
                <span className="font-display text-sm font-extrabold">Kid-owned & proud!</span>
              </div>
            </div>
          )}
          <div>
            <p className="text-secondary-foreground flex items-center gap-1.5 text-sm font-bold tracking-widest uppercase">
              <Heart className="size-4" /> Our story
            </p>
            <h2 className="font-display mt-1 text-3xl font-extrabold sm:text-4xl">
              Built from a Big Idea
            </h2>
            <p className="text-muted-foreground mt-4 leading-relaxed">
              TakeASweet started when a young Charlotte entrepreneur decided to turn creativity and
              hard work into something real. With family support and a lot of practice batches, that
              big idea grew into a bakery known for colorful, handmade treats — and it is still
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
              From local events to special celebrations, TakeASweet brings colorful, handmade treats
              to the Charlotte community.
            </p>
          </div>
          {images.community && (
            <div className="order-1 md:order-2">
              <SettingsImage
                image={images.community}
                className="aspect-[4/3] w-full rounded-3xl object-cover object-center shadow-md"
              />
            </div>
          )}
        </div>
      </section>

      {settings.gallery.length > 0 && (
        <section className="bg-muted/60 py-12 md:py-14">
          <div className="container">
            <div className="mb-6 flex items-end justify-between gap-4">
              <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
                Fresh from our kitchen
              </h2>
              <Button
                asChild
                variant="ghost"
                className="hidden rounded-full font-bold sm:inline-flex"
              >
                <Link href="/gallery">
                  See the Gallery <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {settings.gallery.slice(0, 4).map(image => (
                <img
                  key={image.url}
                  src={image.url}
                  alt={image.alt}
                  loading="lazy"
                  decoding="async"
                  className="aspect-square w-full rounded-xl object-cover"
                />
              ))}
            </div>
            <div className="mt-6 text-center sm:hidden">
              <Button asChild variant="outline" className="bg-card rounded-full font-bold">
                <Link href="/gallery">See the Gallery</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      <section className="bg-accent/40 py-12 md:py-14">
        <div className="container max-w-3xl text-center">
          <p className="text-accent-foreground flex items-center justify-center gap-1.5 text-sm font-bold tracking-widest uppercase">
            <CalendarHeart className="size-4" /> Custom orders
          </p>
          <h2 className="font-display mt-1 text-3xl font-extrabold sm:text-4xl">
            Something special for your celebration
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-xl leading-relaxed">
            Custom desserts are available for birthdays, showers, and celebrations. Every request is
            reviewed before payment, and large orders may require a deposit. Please note: we are not
            able to accept wedding orders.
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(0,1fr))]">
          {[
            ...(settings.serviceArea
              ? [
                  {
                    icon: MapPin,
                    title: "Local to Charlotte",
                    text: settings.serviceArea,
                  },
                ]
              : []),
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
              icon: PackageX,
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

      {settings.faq.length > 0 && (
        <section className="container max-w-3xl py-12 md:py-16">
          <h2 className="font-display mb-6 text-center text-3xl font-extrabold sm:text-4xl">
            Good to know
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {settings.faq.slice(0, 4).map((item, index) => (
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
      )}
    </div>
  );
}
