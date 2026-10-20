#!/usr/bin/env node
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const HERE = __dirname;
const VARIANTS = [
  { screen: 'day-kauai',    out: 'hero-phone-1' },
  { screen: 'event-detail', out: 'hero-phone-2' },
];

async function main() {
  const opts = { headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox', '--force-color-profile=srgb'] };
  if (process.env.PUPPETEER_EXECUTABLE_PATH) opts.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  const browser = await puppeteer.launch(opts);

  const base = fs.readFileSync(path.join(HERE, 'hero-phone.html'), 'utf8');

  for (const { screen, out } of VARIANTS) {
    const html = base.replace(
      "url('screens/trip.png') center top / 390px 844px",
      `url('screens/${screen}.png') center top / 390px 844px`
    );
    const tmp = path.join(HERE, `_tmp_${out}.html`);
    fs.writeFileSync(tmp, html);

    const page = await browser.newPage();
    await page.setViewport({ width: 560, height: 960, deviceScaleFactor: 2 });
    await page.goto('file://' + tmp, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.evaluate(() => window.__ready);
    await new Promise(r => setTimeout(r, 600));

    const panel = await page.$('#panel');
    await panel.screenshot({ path: path.join(HERE, 'exports', `${out}.png`), omitBackground: true });
    await page.close();
    fs.unlinkSync(tmp);
    console.log(`  ✓ ${out}.png`);
  }

  await browser.close();
}

main().catch(err => { console.error(err); process.exit(1); });
