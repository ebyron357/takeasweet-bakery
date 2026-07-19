import type { Metadata, Viewport } from "next";

import { CartProvider } from "@/components/cart/cart-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StructuredData } from "@/components/structured-data";
import { getSiteUrl, isSearchIndexingEnabled, siteConfig } from "@/config/site";
import { createSiteStructuredData } from "@/lib/structured-data";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  applicationName: siteConfig.name,
  title: { default: siteConfig.name, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
  robots: isSearchIndexingEnabled()
    ? {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true },
      }
    : {
        index: false,
        follow: false,
        nocache: true,
        googleBot: { index: false, follow: false, noimageindex: true },
      },
};

export const viewport: Viewport = {
  themeColor: "#fdfaf2",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-US">
      <body className="flex min-h-screen flex-col">
        <StructuredData data={createSiteStructuredData()} />
        <CartProvider>
          <SiteHeader />
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </CartProvider>
      </body>
    </html>
  );
}
