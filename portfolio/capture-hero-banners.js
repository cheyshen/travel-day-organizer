#!/usr/bin/env node
/* capture-hero-banners.js — Wide landscape hero banners B and D.
 * Output: exports/hero-banner-b.png (2880×1280)
 *         exports/hero-banner-d.png (2880×1280)
 */
const fs   = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const HERE    = __dirname;
const OUT_DIR = path.join(HERE, 'exports');
const BANNERS = ['hero-banner-b', 'hero-banner-d'];

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const opts = { headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox', '--force-color-profile=srgb'] };
  if (process.env.PUPPETEER_EXECUTABLE_PATH) opts.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  const browser = await puppeteer.launch(opts);

  for (const name of BANNERS) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 640, deviceScaleFactor: 2 });
    await page.goto('file://' + path.join(HERE, `${name}.html`), { waitUntil: 'networkidle2', timeout: 60000 });
    await page.evaluate(() => window.__ready);
    await new Promise(r => setTimeout(r, 800));
    const panel = await page.$('#panel');
    await panel.screenshot({ path: path.join(OUT_DIR, `${name}.png`) });
    await page.close();
    console.log(`  ✓ ${name}.png (2880×1280)`);
  }

  await browser.close();
}

main().catch(err => { console.error(err); process.exit(1); });
