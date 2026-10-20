#!/usr/bin/env node
/* capture-screens.js — Re-capture app screens for hero variants.
 * Captures: day-kauai.png (Day timeline, July 4), event-detail.png (detail sheet open)
 */
const puppeteer = require('puppeteer');
const path = require('path');

const APP = 'http://192.168.1.198';
const SCREENS = path.join(__dirname, 'screens');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
  const opts = { headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] };
  if (process.env.PUPPETEER_EXECUTABLE_PATH) opts.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  const browser = await puppeteer.launch(opts);

  // ── Screen 1: Day timeline (July 4, Kauai) ──────────────────────────────
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.goto(APP, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(1200);

    // navigate to Calendar tab, then tap July 4 to jump to day view
    const tapped = await page.evaluate(() => {
      // try data-date attribute first
      const cell = document.querySelector('[data-date="2026-07-04"]');
      if (cell) { cell.click(); return 'data-date'; }
      // try role=tab — find Calendar tab by label
      const tabs = [...document.querySelectorAll('[role=tab]')];
      const cal = tabs.find(t => /calendar/i.test(t.textContent));
      if (cal) { cal.click(); return 'cal-tab'; }
      return 'none';
    });
    console.log('nav result:', tapped);
    await sleep(900);

    if (tapped !== 'data-date') {
      // now on calendar — click July 4 cell
      await page.evaluate(() => {
        const cell = document.querySelector('[data-date="2026-07-04"]');
        if (cell) cell.click();
      });
      await sleep(900);
    }

    await page.screenshot({ path: path.join(SCREENS, 'day-kauai.png') });
    console.log('  ✓ day-kauai.png');
    await page.close();
  }

  // ── Screen 2: Event detail sheet open ───────────────────────────────────
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.goto(APP, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(1200);

    // navigate to July 4 day view (same as above)
    await page.evaluate(() => {
      const cell = document.querySelector('[data-date="2026-07-04"]');
      if (cell) { cell.click(); return; }
      const tabs = [...document.querySelectorAll('[role=tab]')];
      const cal = tabs.find(t => /calendar/i.test(t.textContent));
      if (cal) cal.click();
    });
    await sleep(900);

    await page.evaluate(() => {
      const cell = document.querySelector('[data-date="2026-07-04"]');
      if (cell) cell.click();
    });
    await sleep(900);

    // tap the first event card to open event detail
    const eventTapped = await page.evaluate(() => {
      // look for event cards in the timeline — they usually have role=button or a tap handler
      const cards = [...document.querySelectorAll('[role=button], article, [data-event-id]')];
      const first = cards.find(c => c.offsetHeight > 40 && c.offsetWidth > 100);
      if (first) { first.click(); return true; }
      // fallback: click anything that looks like a TimeBlock card
      const timeblocks = [...document.querySelectorAll('.timeblock, [class*="event"], [class*="card"]')];
      if (timeblocks[0]) { timeblocks[0].click(); return true; }
      return false;
    });
    console.log('event tapped:', eventTapped);
    await sleep(1000); // wait for detail sheet animation

    await page.screenshot({ path: path.join(SCREENS, 'event-detail.png') });
    console.log('  ✓ event-detail.png');
    await page.close();
  }

  await browser.close();
}

main().catch(err => { console.error(err); process.exit(1); });
