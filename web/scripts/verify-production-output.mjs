import { readFile, readdir, stat } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import path from "node:path";

const buildRoot = path.resolve(".next");
const serverAppRoot = path.join(buildRoot, "server", "app");
const staticRoot = path.join(buildRoot, "static");
const maximumRouteJavaScriptGzipBytes = 150 * 1024;
const maximumCssGzipBytes = 30 * 1024;
const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

async function collectFiles(directory, suffix, files = []) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const pathname = path.join(directory, entry.name);
    if (entry.isDirectory()) await collectFiles(pathname, suffix, files);
    else if (entry.name.endsWith(suffix)) files.push(pathname);
  }
  return files;
}

async function auditHtml() {
  const htmlFiles = await collectFiles(serverAppRoot, ".html");
  check(htmlFiles.length > 0, "No prerendered HTML files were found.");

  for (const pathname of htmlFiles) {
    const html = await readFile(pathname, "utf8");
    const label = path.relative(serverAppRoot, pathname);
    const mainCount = (html.match(/<main(?:\s|>)/g) ?? []).length;
    const h1Count = (html.match(/<h1(?:\s|>)/g) ?? []).length;

    check(
      html.includes('<html lang="en-US">'),
      `${label}: missing en-US language.`
    );
    check(
      html.includes('href="#main-content"'),
      `${label}: missing keyboard skip link.`
    );
    check(
      html.includes('id="main-content"'),
      `${label}: missing skip-link target.`
    );
    check(
      mainCount === 1,
      `${label}: expected one main landmark; found ${mainCount}.`
    );
    check(h1Count === 1, `${label}: expected one h1; found ${h1Count}.`);

    for (const image of html.match(/<img\b[^>]*>/g) ?? []) {
      check(
        /\salt=(?:"[^"]*"|'[^']*')/.test(image),
        `${label}: image is missing alt text.`
      );
    }
  }
}

async function auditMetadataOutputs() {
  const robots = await readFile(
    path.join(serverAppRoot, "robots.txt.body"),
    "utf8"
  );
  const sitemap = await readFile(
    path.join(serverAppRoot, "sitemap.xml.body"),
    "utf8"
  );

  if (process.env.SEARCH_INDEXING_ENABLED === "true") {
    check(
      robots.includes("Allow: /"),
      "Production robots.txt does not allow crawling."
    );
  } else {
    check(
      robots.includes("Disallow: /"),
      "Default robots.txt does not deny crawling."
    );
  }

  check(
    !/\/cart|\/order\/success|\/api\//.test(sitemap),
    "Sitemap contains a private or transactional route."
  );
}

async function auditSocialImages() {
  for (const filename of ["opengraph-image.body", "twitter-image.body"]) {
    const image = await readFile(path.join(serverAppRoot, filename));
    const isPng = image.subarray(1, 4).toString("ascii") === "PNG";
    check(isPng, `${filename}: expected PNG output.`);
    check(image.readUInt32BE(16) === 1200, `${filename}: expected width 1200.`);
    check(image.readUInt32BE(20) === 630, `${filename}: expected height 630.`);
  }
}

async function auditAssetBudgets() {
  const manifest = JSON.parse(
    await readFile(path.join(buildRoot, "app-build-manifest.json"), "utf8")
  );
  const layoutAssets = manifest.pages["/layout"] ?? [];
  let largestRoute = { route: "", gzipBytes: 0 };

  for (const [route, routeAssets] of Object.entries(manifest.pages)) {
    if (!route.endsWith("/page") && route !== "/page") continue;
    const assets = [...new Set([...layoutAssets, ...routeAssets])].filter(
      (asset) => asset.endsWith(".js")
    );
    let gzipBytes = 0;

    for (const asset of assets) {
      gzipBytes += gzipSync(
        await readFile(path.join(buildRoot, asset))
      ).byteLength;
    }

    if (gzipBytes > largestRoute.gzipBytes) largestRoute = { route, gzipBytes };
    check(
      gzipBytes <= maximumRouteJavaScriptGzipBytes,
      `${route}: ${gzipBytes} gzip bytes of JavaScript exceeds ${maximumRouteJavaScriptGzipBytes}.`
    );
  }

  const cssDirectory = path.join(staticRoot, "css");
  for (const pathname of await collectFiles(cssDirectory, ".css")) {
    const gzipBytes = gzipSync(await readFile(pathname)).byteLength;
    check(
      gzipBytes <= maximumCssGzipBytes,
      `${path.basename(pathname)}: ${gzipBytes} gzip bytes exceeds ${maximumCssGzipBytes}.`
    );
  }

  return largestRoute;
}

await stat(buildRoot).catch(() => {
  throw new Error("Run `npm run build` before the production quality audit.");
});

await auditHtml();
await auditMetadataOutputs();
await auditSocialImages();
const largestRoute = await auditAssetBudgets();

if (failures.length > 0) {
  for (const failure of failures) console.error(`FAIL: ${failure}`);
  process.exitCode = 1;
} else {
  console.log(
    `Production quality audit passed. Largest route JavaScript: ${largestRoute.route} (${largestRoute.gzipBytes} gzip bytes).`
  );
}
