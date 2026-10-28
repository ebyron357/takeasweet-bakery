import { parseSiteSettings, type SiteSettings } from "../shared/site-settings";
import * as dbf from "./db-features";

/** How long a read stays cached; saves through this module refresh it at once. */
const CACHE_MS = 30_000;

let cached: { settings: SiteSettings; expiresAt: number } | undefined;

/**
 * Current site settings. Falls back to the fail-closed defaults (review mode
 * on, payments off, no content) when the database is unavailable.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  if (cached && cached.expiresAt > Date.now()) return cached.settings;
  let settings: SiteSettings;
  try {
    settings = parseSiteSettings(await dbf.getSiteSettingsData());
  } catch (error) {
    console.error("[Settings] Failed to load site settings:", error);
    settings = parseSiteSettings(undefined);
  }
  cached = { settings, expiresAt: Date.now() + CACHE_MS };
  return settings;
}

export async function saveSiteSettings(settings: SiteSettings) {
  await dbf.saveSiteSettingsData(settings);
  cached = { settings, expiresAt: Date.now() + CACHE_MS };
}

/** Stripe test keys start with sk_test_ / rk_test_; anything else moves real money. */
export function isStripeTestMode(secretKey = process.env.STRIPE_SECRET_KEY): boolean {
  return !secretKey || /^(sk|rk)_test_/.test(secretKey);
}

export function clearSiteSettingsCache() {
  cached = undefined;
}
