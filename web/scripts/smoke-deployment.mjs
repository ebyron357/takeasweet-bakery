import { fileURLToPath } from "node:url";

export function isTrustedVercelHost(hostname) {
  return hostname === "vercel.app" || hostname.endsWith(".vercel.app");
}

export function parseBaseUrl(value) {
  if (!value) throw new Error("SMOKE_TEST_BASE_URL is required.");

  const url = new URL(value);
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (url.protocol !== "https:" && !(local && url.protocol === "http:")) {
    throw new Error("Smoke tests require HTTPS, except for a local server.");
  }
  if (url.origin !== url.href.replace(/\/$/, "")) {
    throw new Error("SMOKE_TEST_BASE_URL must be an origin without a path.");
  }
  return url;
}

const isMain =
  process.argv[1] === fileURLToPath(import.meta.url) ||
  process.argv[1]?.endsWith("/smoke-deployment.mjs");

if (isMain) {
  const baseUrl = parseBaseUrl(process.env.SMOKE_TEST_BASE_URL);
  const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

  const headers =
    bypassSecret && isTrustedVercelHost(baseUrl.hostname)
      ? {
          "x-vercel-protection-bypass": bypassSecret,
          "x-vercel-set-bypass-cookie": "true",
        }
      : undefined;

  if (bypassSecret && !isTrustedVercelHost(baseUrl.hostname)) {
    console.warn(
      `Warning: VERCEL_AUTOMATION_BYPASS_SECRET is set but ${baseUrl.hostname} is not a trusted Vercel host. ` +
        "The bypass secret will not be sent."
    );
  }

  const checks = [
    ["/", "text/html", "<main"],
    ["/menu", "text/html", "<main"],
    ["/gallery", "text/html", "<main"],
    ["/custom-orders", "text/html", "<main"],
    ["/order-information", "text/html", "<main"],
    ["/privacy", "text/html", "<main"],
    ["/robots.txt", "text/plain", "User-Agent"],
    ["/sitemap.xml", "application/xml", "<urlset"],
    ["/manifest.webmanifest", "application/manifest+json", "TakeASweet"],
  ];

  async function fetchWithTimeout(pathname) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    try {
      return await fetch(new URL(pathname, baseUrl), {
        headers,
        redirect: "error",
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }
  }

  const failures = [];

  for (const [pathname, contentType, marker] of checks) {
    try {
      const response = await fetchWithTimeout(pathname);
      const body = await response.text();
      if (!response.ok) failures.push(`${pathname}: HTTP ${response.status}.`);
      if (!response.headers.get("content-type")?.includes(contentType)) {
        failures.push(`${pathname}: expected ${contentType} content.`);
      }
      if (!body.includes(marker)) {
        failures.push(`${pathname}: response is missing ${marker}.`);
      }
    } catch (error) {
      failures.push(`${pathname}: ${error.message}`);
    }
  }

  try {
    const response = await fetchWithTimeout("/api/health");
    const body = await response.json();
    if (
      !response.ok ||
      body.status !== "ok" ||
      body.service !== "takeasweet-web"
    ) {
      failures.push("/api/health: invalid health response.");
    }
    if (!response.headers.get("cache-control")?.includes("no-store")) {
      failures.push("/api/health: response must not be cached.");
    }
  } catch (error) {
    failures.push(`/api/health: ${error.message}`);
  }

  if (failures.length > 0) {
    for (const failure of failures) console.error(`FAIL: ${failure}`);
    process.exitCode = 1;
  } else {
    console.log(`Deployment smoke test passed for ${baseUrl.origin}.`);
  }
}
