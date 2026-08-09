import { Link } from "wouter";
import { ArrowRight, Cookie, Handshake, Heart, Lightbulb, Rocket, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SERVICE_AREA_COPY } from "@shared/bakery";

const FOUNDER_PORTRAIT = "/manus-storage/founder-portrait_084f259e.webp";
const FOUNDER_FAMILY = "/manus-storage/founder-family_f9035642.webp";


const VALUES = [
  {
    icon: Lightbulb,
    title: "Creativity first",
    text: "Every flavor starts as a wild idea scribbled in a notebook — then tested (and taste-tested) until it's just right.",
  },
  {
    icon: Rocket,
    title: "Hard work pays off",
    text: "Running a bakery means early mornings, careful math, and lots of dishes. We wouldn't trade it for anything.",
  },
  {
    icon: Users,
    title: "Family behind us",
    text: "From kitchen supervision to delivery runs, this is a family effort — with a young boss leading the way.",
  },
  {
    icon: Handshake,
    title: "Community always",
    text: "Charlotte is home. We love showing up for local events, markets, and neighbors who cheer us on.",
  },
];

export default function OurStory() {
  return (
    <div>
      <section className="bg-secondary/40">
        <div className="container py-12 text-center md:py-16">
          <p className="text-secondary-foreground flex items-center justify-center gap-1.5 text-sm font-bold tracking-widest uppercase">
            <Heart className="size-4" /> Our story
          </p>
          <h1 className="font-display mx-auto mt-2 max-w-2xl text-4xl font-extrabold sm:text-5xl">
            A big dream that started in a small kitchen
          </h1>
        </div>
      </section>

      {/* Founder portrait beside the story */}
      <section className="container py-12">
        <div className="grid items-start gap-8 md:grid-cols-[minmax(0,22rem)_1fr] md:gap-10">
          <figure className="mx-auto w-full max-w-sm">
            <img
              src={FOUNDER_PORTRAIT}
              alt="Portrait of the young founder of TakeASweet Cookies & Treats, smiling in a bright blue blazer in front of green hedges"
              width={900}
              height={1350}
              loading="eager"
              decoding="async"
              className="aspect-[2/3] w-full rounded-3xl object-cover object-top shadow-md"
            />
            <figcaption className="text-muted-foreground mt-3 text-center text-sm">
              Our founder — the baker behind every batch.
            </figcaption>
          </figure>
          <div className="prose prose-lg max-w-none">
            <p className="text-lg leading-relaxed">
              TakeASweet Cookies & Treats began the summer our founder aged out of summer camp. With
              long days ahead and lots of energy to spend, she decided to do something productive —
              and something delicious. What started as an afternoon of baking with family quickly
              turned into recipe experiments, taste tests with neighbors, and finally a real business
              with real customers across Charlotte.
            </p>
            <p className="text-lg leading-relaxed">
              Today, every cookie and treat is still mixed, scooped, and decorated by hand in small
              batches. Being a young entrepreneur means learning as we grow: pricing spreadsheets,
              packaging design, customer service, and the fine art of not eating all the inventory.
              Our family supports every step, but the ideas, the recipes, and the drive all come from
              one determined kid with a very big dream.
            </p>
            <p className="text-lg leading-relaxed">
              We're proud to be part of the Charlotte community — baking for birthdays, school
              events, and neighbors who have become friends. Thank you for supporting a kid-owned
              small business. It means more than you know.
            </p>
          </div>
        </div>
      </section>

      {/* Family support */}
      <section className="bg-secondary/30 py-12 md:py-14">
        <div className="container grid items-center gap-8 md:grid-cols-2 md:gap-10">
          <figure className="mx-auto w-full max-w-xl">
            <img
              src={FOUNDER_FAMILY}
              alt="The founder of TakeASweet and her mother smiling together at a Charlotte community event, both wearing pink TakeASweet Cookies & Treats caps and logo shirts"
              width={1200}
              height={900}
              loading="lazy"
              decoding="async"
              className="aspect-[4/3] w-full rounded-3xl object-cover object-center shadow-md"
            />
          </figure>
          <div>
            <p className="text-secondary-foreground flex items-center gap-1.5 text-sm font-bold tracking-widest uppercase">
              <Users className="size-4" aria-hidden /> Family support
            </p>
            <h2 className="font-display mt-1 text-3xl font-extrabold">A family effort</h2>
            <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
              Behind every market table and every box of treats is a family that shows up — early
              mornings, packing help, and plenty of encouragement. The recipes and the drive belong
              to our young founder; the cheering section is all TakeASweet family.
            </p>
          </div>
        </div>
      </section>

      <section className="container py-8 pb-16">
        <h2 className="font-display mb-8 text-center text-3xl font-extrabold">What we believe</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map(value => (
            <div
              key={value.title}
              className="bg-card border-border/60 rounded-2xl border p-5 text-center shadow-sm"
            >
              <div className="bg-primary/20 mx-auto flex size-12 items-center justify-center rounded-full">
                <value.icon className="text-primary-foreground size-6" />
              </div>
              <h3 className="font-display mt-3 font-bold">{value.title}</h3>
              <p className="text-muted-foreground mt-1 text-sm">{value.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-secondary/40 py-14">
        <div className="container grid items-center gap-8 md:grid-cols-2">
          <div className="mx-auto w-full max-w-md overflow-hidden rounded-3xl shadow-md">
            <img
              src="/manus-storage/cat-cheesecake_85fb2916.png"
              alt="Four Corners cheesecake with assorted toppings"
              loading="lazy"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
          <div className="text-center md:text-left">
            <Cookie className="text-primary mx-auto size-10 md:mx-0" />
            <h2 className="font-display mt-3 text-3xl font-extrabold">Taste the dream</h2>
            <p className="text-muted-foreground mx-auto mt-2 max-w-md md:mx-0">
              The best way to support a young baker? Try the cookies. {SERVICE_AREA_COPY}
            </p>
            <Button asChild size="lg" className="mt-5 rounded-full text-base font-bold">
              <Link href="/shop">
                Shop the Menu <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
