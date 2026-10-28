import { trpc } from "@/lib/trpc";
import { parseSiteSettings, type PublicSiteSettings } from "@shared/site-settings";

const { pickupInstructions: _private, ...defaults } = parseSiteSettings(undefined);

/** Fail-closed settings used until the server answers: review mode on, no content. */
const FALLBACK: PublicSiteSettings = { ...defaults, paymentsTestMode: true };

/**
 * Owner-managed site settings. Until they load, sections that depend on them
 * stay hidden and checkout and forms stay disabled.
 */
export function useSiteSettings() {
  const { data, isLoading } = trpc.site.settings.useQuery(undefined, {
    staleTime: 60_000,
  });
  const settings = data ?? FALLBACK;
  return {
    settings,
    isLoading,
    /** Checkout can start a Stripe session. */
    checkoutOpen: !settings.reviewMode && settings.paymentsEnabled,
    /** Checkout is open and running on live Stripe keys. */
    paymentsLive: !settings.reviewMode && settings.paymentsEnabled && !settings.paymentsTestMode,
  };
}
