// Site QA gate: every public page at desktop and phone width must load without
// page errors or horizontal scroll, have exactly one <h1>, give every image alt
// text, and have no serious or critical axe accessibility violations.
//
// Usage: QA_BASE=http://127.0.0.1:3000 node scripts/site-qa.mjs [extra routes...]
import { AxeBuilder } from '@axe-core/playwright';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');

const base = process.env.QA_BASE || 'http://127.0.0.1:3000';
const routes = [
  '/', '/shop', '/custom-orders', '/our-story', '/faq', '/contact', '/order-info',
  '/privacy', '/cart', '/order/canceled', '/this-page-does-not-exist',
  ...process.argv.slice(2),
];
const widths = [1440, 390];
const BLOCKING_IMPACTS = new Set(['serious', 'critical']);

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const failures = [];
let checked = 0;
try {
  for (const width of widths) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    for (const route of routes) {
      errors.length = 0;
      await page.goto(base + route, { waitUntil: 'networkidle' });
      const where = `${route} @${width}px`;
      const facts = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > window.innerWidth,
        h1: document.querySelectorAll('h1').length,
        missingAlt: [...document.images].filter(img => !img.hasAttribute('alt')).map(img => img.src),
      }));
      if (errors.length) failures.push(`${where}: page error — ${errors.join('; ')}`);
      if (facts.overflow) failures.push(`${where}: page scrolls horizontally`);
      if (facts.h1 !== 1) failures.push(`${where}: expected one <h1>, found ${facts.h1}`);
      for (const src of facts.missingAlt) failures.push(`${where}: image without alt — ${src}`);
      const { violations } = await new AxeBuilder({ page }).analyze();
      for (const v of violations.filter(v => BLOCKING_IMPACTS.has(v.impact))) {
        const targets = v.nodes.slice(0, 3).map(n => n.target.join(' ')).join(', ');
        failures.push(`${where}: [${v.impact}] ${v.id} — ${v.help} (${targets})`);
      }
      checked++;
    }
    await context.close();
  }
} finally {
  await browser.close();
}

if (failures.length) {
  console.error(`Site QA failed (${failures.length} issue${failures.length === 1 ? '' : 's'}):`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log(`Site QA passed: ${checked} page checks across ${widths.join('px and ')}px.`);
