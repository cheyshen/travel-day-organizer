#!/usr/bin/env node
/* capture-hero-phone.js — Phone mockup hero with event stickers.
 * Output: exports/hero-phone.png (1120×1920 @2x)
 * Run:    PUPPETEER_EXECUTABLE_PATH=... node capture-hero-phone.js
 */
const fs   = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const HERE    = __dirname;
const OUT_DIR = path.join(HERE, 'exports');

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const launchOpts = { headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox', '--force-color-profile=srgb'] };
  if (process.env.PUPPETEER_EXECUTABLE_PATH) launchOpts.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  const browser = await puppeteer.launch(launchOpts);
  const page = await browser.newPage();
  try {
    await page.setViewport({ width: 560, height: 960, deviceScaleFactor: 2 });
    await page.goto('file://' + path.join(HERE, 'hero-phone.html'), { waitUntil: 'networkidle2', timeout: 60000 });
    await page.evaluate(() => window.__ready);
    await new Promise(r => setTimeout(r, 600));
    const panel = await page.$('#panel');
    const out = path.join(OUT_DIR, 'hero-phone.png');
    await panel.screenshot({ path: out, omitBackground: true });
    console.log('  ✓ hero-phone.png (1120×1920) → exports/');
  } finally {
    await page.close();
    await browser.close();
  }
}

main().catch(err => { console.error('\ncapture-hero-phone failed:', err); process.exit(1); });
