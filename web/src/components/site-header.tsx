import Link from "next/link";
import { CakeSlice } from "lucide-react";

import { CartLink } from "@/components/cart/cart-link";
import { siteConfig } from "@/config/site";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
] as const;

export function SiteHeader() {
  return (
    <header className="bg-background/95 border-b">
      <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-6 px-5 sm:px-8">
        <Link
          href="/"
          className="focus-visible:ring-ring flex min-h-11 items-center gap-2 rounded-md font-bold focus-visible:ring-2 focus-visible:outline-none"
        >
          <CakeSlice className="text-primary size-5" aria-hidden="true" />
          <span>{siteConfig.name}</span>
        </Link>
        <nav
          aria-label="Primary navigation"
          className="flex items-center gap-1"
        >
          <ul className="flex items-center gap-1">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="hover:bg-muted focus-visible:ring-ring inline-flex min-h-11 items-center rounded-md px-3 text-sm font-semibold focus-visible:ring-2 focus-visible:outline-none"
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
