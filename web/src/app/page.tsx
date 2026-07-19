import Link from "next/link";
import { ArrowRight, CakeSlice } from "lucide-react";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-6xl items-center px-5 py-16 sm:px-8">
      <section aria-labelledby="page-title" className="max-w-2xl">
        <CakeSlice className="text-primary mb-6 size-10" aria-hidden="true" />
        <p className="text-muted-foreground mb-3 text-sm font-semibold tracking-widest uppercase">
          {siteConfig.serviceArea}
        </p>
        <h1
          id="page-title"
          className="text-5xl font-bold tracking-tight sm:text-6xl"
        >
          {siteConfig.name}
        </h1>
        <p className="text-muted-foreground mt-6 max-w-xl text-lg leading-8">
          Browse the verified TakeASweet menu for local pickup and delivery in
          Charlotte.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/menu">
            Browse the menu <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </section>
    </main>
  );
}
