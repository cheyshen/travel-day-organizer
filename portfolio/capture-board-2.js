#!/usr/bin/env node
/* capture-board-2.js — Mobile component board (portrait, 2-column).
 * Output: exports/component-board-2.png (1640×auto @2x)
 * Run:    PUPPETEER_EXECUTABLE_PATH=... node capture-board-2.js
 *         BOARD2_BG=#1F2937 node capture-board-2.js   (bake a panel color)
 */
const fs   = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const HERE    = __dirname;
const OUT_DIR = path.join(HERE, 'exports');
const BOARD_BG = process.env.BOARD2_BG || 'transparent';

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const launchOpts = { headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox', '--force-color-profile=srgb'] };
  if (process.env.PUPPETEER_EXECUTABLE_PATH) launchOpts.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  const browser = await puppeteer.launch(launchOpts);
  const page = await browser.newPage();
  try {
    // tall viewport so the panel never clips
    await page.setViewport({ width: 880, height: 2400, deviceScaleFactor: 2 });
    const url = 'file://' + path.join(HERE, 'component-board-2.html');
    if (BOARD_BG !== 'transparent') {
      await page.goto(url + `?bg=${encodeURIComponent(BOARD_BG)}`, { waitUntil: 'networkidle2', timeout: 60000 });
    } else {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    }
    await page.evaluate(() => window.__ready);

    if (BOARD_BG !== 'transparent') {
      await page.evaluate((bg) => document.getElementById('panel').style.background = bg, BOARD_BG);
    }

    const panel = await page.$('#panel');
    const out   = path.join(OUT_DIR, 'component-board-2.png');
    const omit  = BOARD_BG === 'transparent';
    await panel.screenshot({ path: out, omitBackground: omit });
    console.log(`  ✓ component-board-2.png → exports/`);
  } finally {
    await page.close();
    await browser.close();
  }
}

main().catch((err) => { console.error('\ncapture-board-2 failed:', err); process.exit(1); });
