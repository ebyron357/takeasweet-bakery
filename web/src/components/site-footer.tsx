import Link from "next/link";

import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="bg-muted/40 border-t">
      <div className="text-muted-foreground mx-auto flex max-w-6xl flex-col gap-2 px-5 py-8 text-sm sm:px-8">
        <p className="text-foreground font-semibold">{siteConfig.name}</p>
        <p>Serving {siteConfig.serviceArea}.</p>
        <nav className="mt-2" aria-label="Footer navigation">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            <li>
              <Link
                className="hover:text-foreground underline-offset-4 hover:underline"
                href="/menu"
              >
                Menu
              </Link>
            </li>
            <li>
              <Link
                className="hover:text-foreground underline-offset-4 hover:underline"
                href="/gallery"
              >
                Authentic gallery
              </Link>
            </li>
            <li>
              <Link
                className="hover:text-foreground underline-offset-4 hover:underline"
                href="/custom-orders"
              >
                Custom orders
              </Link>
            </li>
            <li>
              <Link
                className="hover:text-foreground underline-offset-4 hover:underline"
                href="/order-information"
              >
                Ordering information
              </Link>
            </li>
            <li>
              <Link
                className="hover:text-foreground underline-offset-4 hover:underline"
                href="/privacy"
              >
                Privacy
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
