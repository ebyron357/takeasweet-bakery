import { Link } from "wouter";
import { ArrowRight, Cookie, Handshake, Heart, Lightbulb, Rocket, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SERVICE_AREA_COPY } from "@shared/bakery";

const STORY_URL = "/manus-storage/tas-story_effcc053.png";
const HERO_URL = "/manus-storage/tas-hero_abd5c266.png";

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

      <section className="container max-w-3xl py-12">
        <img
          src={STORY_URL}
          alt="Young baker rolling cookie dough with family helping"
          className="mx-auto rounded-3xl shadow-md"
        />
        <div className="prose prose-lg mt-10 max-w-none">
          <p className="text-lg leading-relaxed">
            TakeASweet Cookies & Treats began the summer our founder aged out of summer camp. With
            long days ahead and lots of energy to spend, she decided to do something productive —
            and something delicious. What started as an afternoon of baking with family quickly
            turned into recipe experiments, taste tests with neighbors, and finally a real business
            with real customers.
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
          <img
            src={HERO_URL}
            alt="Fresh cookies and milk on a wooden table"
            className="mx-auto max-w-md rounded-3xl shadow-md"
          />
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
