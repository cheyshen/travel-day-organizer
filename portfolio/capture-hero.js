#!/usr/bin/env node
/* capture-hero.js — Portfolio cover/hero image.
 * Output: exports/hero.png (2880×1620 @2x)
 * Run:    PUPPETEER_EXECUTABLE_PATH=... node capture-hero.js
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
    await page.setViewport({ width: 1440, height: 810, deviceScaleFactor: 2 });
    await page.goto('file://' + path.join(HERE, 'hero.html'), { waitUntil: 'networkidle2', timeout: 60000 });
    await page.evaluate(() => window.__ready);
    // let images settle
    await new Promise(r => setTimeout(r, 800));
    const panel = await page.$('#panel');
    const out = path.join(OUT_DIR, 'hero.png');
    await panel.screenshot({ path: out });
    console.log('  ✓ hero.png (2880×1620) → exports/');
  } finally {
    await page.close();
    await browser.close();
  }
}

main().catch(err => { console.error('\ncapture-hero failed:', err); process.exit(1); });
