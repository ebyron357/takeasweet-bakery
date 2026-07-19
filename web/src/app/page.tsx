import { CakeSlice } from "lucide-react";

import { siteConfig } from "@/config/site";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl items-center px-6 py-16">
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
      </section>
    </main>
  );
}
