#!/usr/bin/env node
/* capture-phone-screens.js
 * Re-captures screens from the live app with reliable navigation.
 * Outputs: screens/day-kauai.png  (July 4 Day timeline)
 *          exports/phone-only.png  (transparent phone PNG, no bg)
 */
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const APP    = 'http://192.168.1.198';
const SCREENS = path.join(__dirname, 'screens');
const OUT     = path.join(__dirname, 'exports');
const CHROME  = process.env.PUPPETEER_EXECUTABLE_PATH;
const sleep   = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  fs.mkdirSync(SCREENS, { recursive: true });
  fs.mkdirSync(OUT,     { recursive: true });

  const opts = {
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--force-color-profile=srgb'],
  };
  if (CHROME) opts.executablePath = CHROME;

  const browser = await puppeteer.launch(opts);

  // ── Step 1: capture July 4 Day timeline ────────────────────────────────────
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.goto(APP, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(1400);

    // Click "Day" tab — the app starts on Hero, Day tab goes to today (July 5)
    const dayTabClicked = await page.evaluate(() => {
      const tab = document.querySelector('[role=tab][aria-label="Day"]');
      if (tab) { tab.click(); return true; }
      return false;
    });
    console.log('  Day tab clicked:', dayTabClicked);
    await sleep(900);

    // Click the "previous day" (ChevronLeft) button to go from July 5 → July 4
    const prevClicked = await page.evaluate(() => {
      // header buttons: first button in the sticky header area is ChevronLeft
      const btns = [...document.querySelectorAll('button')];
      // find by looking for the one that's not disabled and contains an svg
      const prev = btns.find(b => {
        const svg = b.querySelector('svg');
        if (!svg) return false;
        const r = b.getBoundingClientRect();
        return r.top < 120 && r.left < 200; // left side of the header
      });
      if (prev) { prev.click(); return true; }
      return false;
    });
    console.log('  Prev day clicked:', prevClicked);
    await sleep(700);

    await page.screenshot({ path: path.join(SCREENS, 'day-kauai.png') });
    console.log('  ✓ screens/day-kauai.png');
    await page.close();
  }

  // ── Step 2: build + capture transparent phone PNG ─────────────────────────
  // Write a minimal phone-only HTML referencing the freshly captured screen
  const phoneHtml = `<!doctype html>
<html><head><meta charset="utf-8"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: transparent; }
  #panel {
    position: relative;
    width: 410px; height: 864px;
    background: transparent;
  }
  .phone-bezel {
    position: absolute;
    left: 0; top: 0;
    width: 410px; height: 864px;
    border-radius: 44px; background: #14181F; padding: 10px;
    box-shadow: inset 0 0 0 1px rgba(255,255,255,.06);
  }
  .phone-screen {
    width: 390px; height: 844px; border-radius: 34px; overflow: hidden;
    background: url('${path.join(SCREENS, 'trip.png').replace(/\\/g,'/')}') center top / 390px 844px no-repeat, #14181F;
  }
</style></head>
<body>
<div id="panel">
  <div class="phone-bezel"><div class="phone-screen"></div></div>
</div>
<script>window.__ready = Promise.resolve();</script>
</body></html>`;

  const tmpPath = path.join(__dirname, '_tmp_phone_only.html');
  fs.writeFileSync(tmpPath, phoneHtml);

  {
    const page = await browser.newPage();
    await page.setViewport({ width: 410, height: 864, deviceScaleFactor: 2 });
    await page.goto('file://' + tmpPath, { waitUntil: 'networkidle2', timeout: 20000 });
    await sleep(600);

    const panel = await page.$('#panel');
    await panel.screenshot({
      path: path.join(OUT, 'phone-only.png'),
      omitBackground: true,
    });
    console.log('  ✓ exports/phone-only.png (transparent)');
    await page.close();
  }

  fs.unlinkSync(tmpPath);
  await browser.close();
}

main().catch(err => { console.error(err); process.exit(1); });
