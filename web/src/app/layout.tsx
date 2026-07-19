import type { Metadata } from "next";

import { getSiteUrl, siteConfig } from "@/config/site";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: { default: siteConfig.name, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
