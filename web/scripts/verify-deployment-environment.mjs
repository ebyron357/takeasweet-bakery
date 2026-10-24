import { pathToFileURL } from "node:url";

const booleanFlags = [
  "PAYMENTS_ENABLED",
  "CUSTOM_ORDER_REQUESTS_ENABLED",
  "SEARCH_INDEXING_ENABLED",
];
const localHostnames = new Set(["localhost", "127.0.0.1", "[::1]"]);

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value ?? "");
}

export function inspectDeploymentEnvironment(environment) {
  const failures = [];
  const warnings = [];
  const requireValue = (name, reason) => {
    if (!environment[name]?.trim()) failures.push(`${name}: ${reason}`);
  };

  for (const name of booleanFlags) {
    const value = environment[name];
    if (value !== undefined && value !== "true" && value !== "false") {
      failures.push(`${name}: use exactly true or false.`);
    }
  }

  let siteUrl;
  try {
    siteUrl = new URL(environment.NEXT_PUBLIC_SITE_URL);
    if (
      siteUrl.protocol !== "https:" ||
      localHostnames.has(siteUrl.hostname) ||
      siteUrl.origin !== siteUrl.href.replace(/\/$/, "")
    ) {
      failures.push(
        "NEXT_PUBLIC_SITE_URL: use the final HTTPS origin without a path, query, or fragment."
      );
    }
  } catch {
    failures.push("NEXT_PUBLIC_SITE_URL: set a valid final HTTPS origin.");
  }

  const privacyContact = environment.PRIVACY_CONTACT_EMAIL?.trim();
  const databaseUrl = environment.DATABASE_URL?.trim();

  if (environment.PAYMENTS_ENABLED === "true") {
    requireValue("STRIPE_SECRET_KEY", "required when payments are enabled.");
    requireValue(
      "STRIPE_WEBHOOK_SECRET",
      "required when payments are enabled."
    );
    requireValue("DATABASE_URL", "required when payments are enabled.");
    requireValue(
      "PRIVACY_CONTACT_EMAIL",
      "required when payments are enabled."
    );

    if (
      environment.STRIPE_WEBHOOK_SECRET &&
      !environment.STRIPE_WEBHOOK_SECRET.startsWith("whsec_")
    ) {
      failures.push(
        "STRIPE_WEBHOOK_SECRET: expected a Stripe webhook signing secret beginning with whsec_."
      );
    }
  }

  if (environment.CUSTOM_ORDER_REQUESTS_ENABLED === "true") {
    requireValue(
      "DATABASE_URL",
      "required when custom-order requests are enabled."
    );
    requireValue(
      "PRIVACY_CONTACT_EMAIL",
      "required when custom-order requests are enabled."
    );
  }

  if (databaseUrl) {
    try {
      if (new URL(databaseUrl).protocol !== "mysql:") {
        failures.push("DATABASE_URL: expected a mysql:// connection URL.");
      }
    } catch {
      failures.push("DATABASE_URL: expected a valid mysql:// connection URL.");
    }
  }

  if (privacyContact && !isValidEmail(privacyContact)) {
    failures.push("PRIVACY_CONTACT_EMAIL: expected a valid email address.");
  }

  if (
    environment.SEARCH_INDEXING_ENABLED === "true" &&
    environment.VERCEL === "1" &&
    environment.VERCEL_ENV !== "production"
  ) {
    failures.push(
      "SEARCH_INDEXING_ENABLED: must remain false on Vercel preview deployments."
    );
  }

  for (const name of booleanFlags) {
    if (environment[name] === undefined) {
      warnings.push(
        `${name}: unset; the application safely treats it as false.`
      );
    }
  }

  return { failures, warnings };
}

function run() {
  const result = inspectDeploymentEnvironment(process.env);
  for (const warning of result.warnings) console.warn(`WARN: ${warning}`);
  for (const failure of result.failures) console.error(`FAIL: ${failure}`);

  if (result.failures.length > 0) {
    process.exitCode = 1;
    return;
  }

  console.log("Deployment environment preflight passed.");
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  run();
}
