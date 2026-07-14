import { Link } from "wouter";
import { ArrowRight, Cookie, Heart, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "@/components/ProductCard";
import { NewsletterForm } from "@/components/SiteLayout";
import { trpc } from "@/lib/trpc";
import { SERVICE_AREA_COPY } from "@shared/bakery";

const HERO_URL = "/manus-storage/tas-hero_abd5c266.png";
const STORY_URL = "/manus-storage/tas-story_effcc053.png";

export default function Home() {
  const { data: products, isLoading } = trpc.products.list.useQuery();
  const featured = products?.filter(p => p.featured) ?? [];
  const carouselItems = featured.length >= 4 ? featured : (products ?? []).slice(0, 8);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container grid items-center gap-8 py-10 md:grid-cols-2 md:py-16">
          <div className="fade-up order-2 md:order-1">
            <div className="bg-accent text-accent-foreground mb-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold">
              <MapPin className="size-3.5" />
              {SERVICE_AREA_COPY}
            </div>
            <h1 className="font-display text-4xl leading-tight font-extrabold sm:text-5xl lg:text-6xl">
              Handmade cookies,
              <span className="text-secondary-foreground bg-secondary mt-1 inline-block -rotate-1 rounded-2xl px-3">
                baked with big dreams
              </span>
            </h1>
            <p className="text-muted-foreground mt-4 max-w-md text-base sm:text-lg">
              TakeASweet is a kid-owned Charlotte bakery serving up small-batch cookies and treats
              made from scratch — with a whole lot of heart.
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
                <Link href="/custom-orders">Custom Orders</Link>
              </Button>
            </div>
          </div>
          <div className="fade-up order-1 md:order-2">
            <div className="border-primary/40 relative mx-auto max-w-lg overflow-hidden rounded-3xl border-4 shadow-lg">
              <img
                src={HERO_URL}
                alt="Freshly baked TakeASweet cookies with milk"
                className="aspect-[16/11] w-full object-cover"
              />
            </div>
          </div>
        </div>
        <div className="sprinkle-dots w-full" />
      </section>

      {/* Featured products carousel */}
      <section className="container py-12 md:py-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-secondary-foreground flex items-center gap-1.5 text-sm font-bold tracking-widest uppercase">
              <Sparkles className="size-4" /> Fresh from the oven
            </p>
            <h2 className="font-display mt-1 text-3xl font-extrabold sm:text-4xl">
              This Week's Favorites
            </h2>
          </div>
          <Button asChild variant="ghost" className="hidden rounded-full font-bold sm:inline-flex">
            <Link href="/shop">
              View all <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
            ))}
          </div>
        ) : (
          <Carousel opts={{ align: "start" }} className="w-full">
            <CarouselContent>
              {carouselItems.map(product => (
                <CarouselItem
                  key={product.id}
                  className="basis-3/4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                >
                  <ProductCard product={product} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="bg-card -left-3 hidden sm:flex" />
            <CarouselNext className="bg-card -right-3 hidden sm:flex" />
          </Carousel>
        )}

        <div className="mt-6 text-center sm:hidden">
          <Button asChild variant="outline" className="bg-card rounded-full font-bold">
            <Link href="/shop">View the Full Menu</Link>
          </Button>
        </div>
      </section>

      {/* Story snippet */}
      <section className="bg-secondary/40 py-12 md:py-16">
        <div className="container grid items-center gap-8 md:grid-cols-2">
          <div className="relative mx-auto max-w-md">
            <img
              src={STORY_URL}
              alt="Young baker rolling cookie dough in a bright kitchen"
              className="rounded-3xl shadow-md"
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
              From summer camp to small business
            </h2>
            <p className="text-muted-foreground mt-4 text-base leading-relaxed">
              When our founder aged out of summer camp, she didn't want to spend the break on the
              couch — she wanted to build something. With family cheering her on and a kitchen full
              of flour, TakeASweet was born. Every cookie is mixed, scooped, and baked by hand,
              right here in Charlotte.
            </p>
            <Button asChild className="mt-6 rounded-full font-bold" size="lg">
              <Link href="/our-story">
                Read Our Story <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="container py-14 text-center md:py-20">
        <Cookie className="text-primary mx-auto size-10" />
        <h2 className="font-display mt-3 text-3xl font-extrabold sm:text-4xl">
          Never miss a fresh batch
        </h2>
        <p className="text-muted-foreground mx-auto mt-2 max-w-md">
          Join the sweet list for new flavors, seasonal drops, and restock alerts.
        </p>
        <div className="mt-6">
          <NewsletterForm />
        </div>
      </section>
    </div>
  );
}
