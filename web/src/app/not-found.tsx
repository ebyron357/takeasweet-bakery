import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-16">
      <p className="text-muted-foreground text-sm font-semibold">404</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">Page not found</h1>
      <p className="text-muted-foreground mt-4">
        The page you requested is unavailable.
      </p>
      <Button asChild className="mt-8 w-fit">
        <Link href="/">Return home</Link>
      </Button>
    </main>
  );
}
