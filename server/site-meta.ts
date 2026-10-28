import type { Express, NextFunction, Request, Response } from "express";
import { listActiveProducts } from "./db-features";
import { getSiteSettings } from "./site-settings";

/** Public pages listed in the sitemap. Cart, order, and admin routes are excluded. */
export const SITEMAP_PATHS = [
  "/",
  "/shop",
  "/custom-orders",
  "/our-story",
  "/faq",
  "/gallery",
  "/order-info",
  "/privacy",
  "/contact",
] as const;

/** Routes that should never be crawled. */
export const PRIVATE_PATHS = ["/admin", "/cart", "/order/", "/api/"] as const;

/**
 * Indexing stays off during client review so the preview site is not listed
 * in search results. It turns on automatically once review mode is switched
 * off in the admin settings and PUBLIC_SITE_URL is set to the final https://
 * origin.
 */
export function getIndexableSiteUrl(
  reviewMode: boolean,
  siteUrl: string | undefined = process.env.PUBLIC_SITE_URL
): string | null {
  if (reviewMode || !siteUrl) return null;
  try {
    const url = new URL(siteUrl);
    if (url.protocol !== "https:") return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function buildRobotsTxt(siteUrl: string | null): string {
  if (!siteUrl) return "User-agent: *\nDisallow: /\n";
  return [
    "User-agent: *",
    "Allow: /",
    ...PRIVATE_PATHS.map(path => `Disallow: ${path}`),
    "",
    `Sitemap: ${siteUrl}/sitemap.xml`,
    "",
  ].join("\n");
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildSitemapXml(
  siteUrl: string,
  productSlugs: readonly string[],
  pagePaths: readonly string[] = SITEMAP_PATHS
): string {
  const paths = [
    ...pagePaths,
    ...productSlugs.map(slug => `/product/${encodeURIComponent(slug)}`),
  ];
  const urls = paths
    .map(path => `  <url><loc>${escapeXml(`${siteUrl}${path}`)}</loc></url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

/**
 * Conservative security headers. No Content-Security-Policy or frame
 * restrictions yet: the site loads Google Fonts, analytics, and is previewed
 * inside the hosting editor, so those need testing on the final host first.
 */
async function currentIndexableSiteUrl(): Promise<string | null> {
  const { reviewMode } = await getSiteSettings();
  return getIndexableSiteUrl(reviewMode);
}

export async function securityHeaders(
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  res.removeHeader("X-Powered-By");
  if (req.secure || req.headers["x-forwarded-proto"] === "https") {
    res.setHeader("Strict-Transport-Security", "max-age=15552000");
  }
  if (!(await currentIndexableSiteUrl())) {
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
  }
  next();
}

/** Registers security headers plus /robots.txt and /sitemap.xml. */
export function registerSiteMeta(app: Express) {
  app.disable("x-powered-by");
  app.use(securityHeaders);

  app.get("/robots.txt", async (_req, res) => {
    res
      .type("text/plain")
      .send(buildRobotsTxt(await currentIndexableSiteUrl()));
  });

  app.get("/sitemap.xml", async (_req, res) => {
    const siteUrl = await currentIndexableSiteUrl();
    if (!siteUrl) return res.status(404).type("text/plain").send("Not found");
    // The gallery page is hidden while it has no photos.
    const { gallery } = await getSiteSettings();
    const pagePaths = SITEMAP_PATHS.filter(
      path => path !== "/gallery" || gallery.length > 0
    );
    try {
      const products = await listActiveProducts();
      res.type("application/xml").send(
        buildSitemapXml(
          siteUrl,
          products.map(product => product.slug),
          pagePaths
        )
      );
    } catch (error) {
      console.error("[Sitemap] Failed to load products:", error);
      res.type("application/xml").send(buildSitemapXml(siteUrl, [], pagePaths));
    }
  });
}
