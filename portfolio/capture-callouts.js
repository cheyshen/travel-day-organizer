#!/usr/bin/env node
/* ============================================================================
 * capture-callouts.js — Annotated component-callout panel (portfolio shot).
 *
 * Screenshots the rounded dark panel in component-callouts.html with
 * omitBackground so the corners export transparent — the panel drops onto
 * any case-study background as-is.
 *
 * Output: ./exports/component-callouts.png  (1920×1000 @2x = 3840×2000)
 * Run:    PUPPETEER_EXECUTABLE_PATH=... node capture-callouts.js
 *         CALLOUT_BG=#14181F node capture-callouts.js   (panel color override)
 * ========================================================================== */
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const HERE = __dirname;
const OUT = path.join(HERE, 'exports', 'component-callouts.png');

async function main() {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  const launchOpts = { headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox', '--force-color-profile=srgb'] };
  if (process.env.PUPPETEER_EXECUTABLE_PATH) launchOpts.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  const browser = await puppeteer.launch(launchOpts);
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1960, height: 1040, deviceScaleFactor: 2 });
    await page.goto('file://' + path.join(HERE, 'component-callouts.html'), { waitUntil: 'networkidle2', timeout: 60000 });
    await page.evaluate(() => window.__ready); // fonts loaded
    if (process.env.CALLOUT_BG) {
      await page.evaluate((bg) => document.getElementById('panel').style.background = bg, process.env.CALLOUT_BG);
    }
    await new Promise((r) => setTimeout(r, 300));
    const panel = await page.$('#panel');
    await panel.screenshot({ path: OUT, omitBackground: true });
    console.log(`✓ component-callouts.png (3840×2000, transparent corners) → ${OUT}`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => { console.error('\ncapture-callouts failed:', err); process.exit(1); });
