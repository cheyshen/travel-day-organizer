#!/usr/bin/env node
/* capture-readme-screens.js — Re-capture the 4 README screenshots (.github/assets/*-view.png)
 * from the live app: full-page, 390px wide @2x, one per tab (Trip, Plan, Day, Status).
 * Clock pinned to Sat Jul 4 2026 09:30 (same as capture-flows.js) so the sample trip
 * keeps its real July dates and Day/Trip show a live "Now" / "Up next".
 *
 *   PUPPETEER_EXECUTABLE_PATH=... node capture-readme-screens.js
 */
const puppeteer = require('puppeteer');
const path = require('path');

const APP = process.env.APP_URL || 'http://192.168.1.198';
const OUT = path.join(__dirname, '..', '.github', 'assets');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const SHOTS = [
  { tab: 'Trip', file: 'hero-view.png' },
  { tab: 'Plan', file: 'calendar-view.png' },
  { tab: 'Day', file: 'day-view.png' },
  { tab: 'Status', file: 'status-view.png' },
];

async function main() {
  const opts = { headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] };
  if (process.env.PUPPETEER_EXECUTABLE_PATH) opts.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  const browser = await puppeteer.launch(opts);

  for (const { tab, file } of SHOTS) {
    const ctx = await browser.createBrowserContext(); // fresh localStorage per shot
    const page = await ctx.newPage();
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.evaluateOnNewDocument(() => {
      const RealDate = Date;
      const FAKE = new RealDate(2026, 6, 4, 9, 30, 0).getTime(); // local Jul 4 2026, 09:30
      class MockDate extends RealDate {
        constructor(...a) { super(...(a.length ? a : [FAKE])); }
        static now() { return FAKE; }
      }
      window.Date = MockDate;
    });
    await page.goto(APP, { waitUntil: 'networkidle2', timeout: 60000 });
    await page.waitForSelector('[role=tab]', { visible: true, timeout: 20000 });
    await sleep(1000);

    await page.evaluate((label) => {
      const t = [...document.querySelectorAll('[role=tab]')].find(el => el.textContent.trim() === label);
      if (!t) throw new Error(`tab not found: ${label}`);
      t.click();
    }, tab);
    await sleep(1500); // page transition + photos settle

    // Grow the viewport to the full page height (instead of fullPage stitching) so the
    // fixed bottom nav lands at the true bottom rather than mid-page.
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    await page.setViewport({ width: 390, height: h, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await sleep(800);
    await page.screenshot({ path: path.join(OUT, file) });
    console.log(`  ✓ .github/assets/${file}`);
    await ctx.close();
  }
  await browser.close();
}

main().catch(e => { console.error(e); process.exit(1); });
