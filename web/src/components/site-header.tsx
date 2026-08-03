import Link from "next/link";
import { CakeSlice } from "lucide-react";

import { CartLink } from "@/components/cart/cart-link";
import { siteConfig } from "@/config/site";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/gallery", label: "Gallery" },
  { href: "/custom-orders", label: "Custom orders" },
] as const;

export function SiteHeader() {
  return (
    <header className="bg-background/95 border-b">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-1 px-5 py-2 sm:min-h-16 sm:flex-nowrap sm:gap-6 sm:px-8 sm:py-0">
        <Link
          href="/"
          className="focus-visible:ring-ring flex min-h-11 items-center gap-2 rounded-md font-bold focus-visible:ring-2 focus-visible:outline-none"
        >
          <CakeSlice className="text-primary size-5" aria-hidden="true" />
          <span>{siteConfig.name}</span>
        </Link>
        <nav
          aria-label="Primary navigation"
          className="flex w-full items-center justify-between gap-1 overflow-x-auto sm:w-auto"
        >
          <ul className="flex items-center gap-1">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="hover:bg-muted focus-visible:ring-ring inline-flex min-h-11 items-center rounded-md px-2 text-sm font-semibold whitespace-nowrap focus-visible:ring-2 focus-visible:outline-none sm:px-3"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <CartLink />
        </nav>
      </div>
    </header>
  );
}
