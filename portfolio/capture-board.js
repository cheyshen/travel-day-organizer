#!/usr/bin/env node
/* ============================================================================
 * capture-board.js — Card-level component board (portfolio shot, static).
 *
 * The unlabeled companion to the callouts panel: destination card, event card,
 * buffer card, day header, details card, checklist row in both states,
 * arranged as staggered columns on the dark panel. Rounded corners export
 * transparent (omitBackground).
 *
 * Output: ./exports/component-board.png  (1920×1080 @2x = 3840×2160)
 * Run:    PUPPETEER_EXECUTABLE_PATH=... node capture-board.js
 *         BOARD_BG=#14181F node capture-board.js   (panel color override)
 * ========================================================================== */
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const HERE = __dirname;
const OUT = path.join(HERE, 'exports', 'component-board.png');

async function main() {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  const launchOpts = { headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox', '--force-color-profile=srgb'] };
  if (process.env.PUPPETEER_EXECUTABLE_PATH) launchOpts.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  const browser = await puppeteer.launch(launchOpts);
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1960, height: 1120, deviceScaleFactor: 2 });
    await page.goto('file://' + path.join(HERE, 'component-board.html'), { waitUntil: 'networkidle2', timeout: 60000 });
    await page.evaluate(() => window.__ready); // fonts loaded (photos via networkidle2)
    if (process.env.BOARD_BG) {
      await page.evaluate((bg) => document.getElementById('panel').style.background = bg, process.env.BOARD_BG);
    }
    await new Promise((r) => setTimeout(r, 300));
    const panel = await page.$('#panel');
    await panel.screenshot({ path: OUT, omitBackground: true });
    console.log(`✓ component-board.png (3840×2160, transparent corners) → ${OUT}`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => { console.error('\ncapture-board failed:', err); process.exit(1); });
