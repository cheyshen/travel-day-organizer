#!/usr/bin/env node
/* ============================================================================
 * capture-board.js — Card-level component board (portfolio shot, static).
 *
 * The unlabeled companion to the callouts panel: destination card, event card,
 * buffer card, day header, details card, checklist row in both states, stat
 * tiles, calendar day cells, checklist progress header — staggered columns on
 * the dark panel. Full-bleed (no rounded corners, per user).
 *
 * Output: ./exports/component-board.png  (1920×1080 @2x = 3840×2160)
 * Run:    PUPPETEER_EXECUTABLE_PATH=... node capture-board.js
 *         Default background is TRANSPARENT (page controls the panel color).
 *         BOARD_BG=#1F2937 node capture-board.js   (bake a panel color)
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
    const bg = process.env.BOARD_BG || 'transparent';
    const transparent = bg === 'transparent';
    await page.evaluate((b) => document.getElementById('panel').style.background = b, bg);
    await new Promise((r) => setTimeout(r, 300));
    const panel = await page.$('#panel');
    await panel.screenshot({ path: OUT, omitBackground: transparent });
    console.log(`✓ component-board.png (3840×2160, full-bleed, bg=${bg}) → ${OUT}`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => { console.error('\ncapture-board failed:', err); process.exit(1); });
