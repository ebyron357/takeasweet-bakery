import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.SCROLL_BASE || 'http://127.0.0.1:3111';
const route = '/order-info';
const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || undefined});
let passed = 0;
try {
  await mkdir('qa-evidence', {recursive:true});
  for (const width of [1440,390]) {
    for (const mode of ['normal','reduced','no-observer']) {
      const context = await browser.newContext({viewport:{width,height:240},reducedMotion:mode === 'reduced'?'reduce':'no-preference',javaScriptEnabled:mode !== 'no-js'});
      if(mode === 'no-observer') await context.addInitScript(()=>{delete window.IntersectionObserver;});
      const page = await context.newPage();
      const errors=[]; page.on('pageerror',e=>errors.push(e.message));
      await page.goto(base+route,{waitUntil:'networkidle'});
      const entries=page.locator('[data-sc-entry]');
      assert.equal(await entries.count(),5);
      const last=entries.last(), rule=last.locator('[data-sc-rule]');
      if(mode==='normal') {
        await page.waitForFunction(()=>document.querySelector('[data-sc-motion="on"]'));
        assert.equal(await last.getAttribute('data-sc-entered'),null,'offscreen entry must wait');
        assert.equal(await rule.evaluate(e=>getComputedStyle(e).transform),'matrix(0.12, 0, 0, 1, 0, 0)');
        assert.equal(await rule.evaluate(e=>getComputedStyle(e).transitionDuration),'0s');
        await last.scrollIntoViewIfNeeded();
        await page.waitForFunction(()=>document.querySelector('[data-sc-entry]:last-child')?.hasAttribute('data-sc-entered'));
        await page.waitForTimeout(500);
        assert.equal(await rule.evaluate(e=>getComputedStyle(e).transform),'matrix(1, 0, 0, 1, 0, 0)');
        await page.emulateMedia({reducedMotion:'reduce'});
        await page.waitForFunction(()=>document.querySelector('[data-sc-motion="off"]'));
        assert.equal(await rule.evaluate(e=>getComputedStyle(e).transitionDuration),'0s');
        await page.emulateMedia({reducedMotion:'no-preference'});
        assert.equal(await last.getAttribute('data-sc-entered'),'');
      } else {
        const transform=await rule.evaluate(e=>getComputedStyle(e).transform);
        assert.ok(['none','matrix(1, 0, 0, 1, 0, 0)'].includes(transform), transform);
      }
      await page.setViewportSize({width,height:900});
      await last.scrollIntoViewIfNeeded();
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'horizontal overflow');
      assert.equal(await last.evaluate(e=>getComputedStyle(e).opacity),'1');
      if(mode==='normal') {
        await page.screenshot({path:`qa-evidence/scroll-${width}.png`});
        await page.locator('a[href="/custom-orders"]:visible').first().focus();
        await page.keyboard.press('Enter');
        await page.waitForURL('**/custom-orders');
        await page.goBack({waitUntil:'networkidle'});
        assert.equal(await page.locator('[data-sc-entry]').count(),5);
      }
      assert.deepEqual(errors,[]);
      console.log(`PASS ${width} ${mode}`);passed++;
      await context.close();
    }
  }
} finally {await browser.close();}
console.log(`${passed} passed, 0 failed, 0 skipped`);
