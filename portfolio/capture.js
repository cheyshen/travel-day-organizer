#!/usr/bin/env node
/* ============================================================================
 * capture.js — Portfolio asset generator for the Travel design system.
 *
 * Loads portfolio-assets.html and screenshots each fixed capture frame to its
 * own PNG at deviceScaleFactor: 3 (retina-grade), with omitBackground: true so
 * the transparent frames (the icon grid) export with a transparent background.
 * The icon grid is additionally serialized to a standalone SVG.
 *
 * Output: ./exports/<frame>.png  +  ./exports/icons-grid.svg
 *
 * Run:   npm install   then   npm run capture
 * Override the browser with a system Chrome via PUPPETEER_EXECUTABLE_PATH.
 * ========================================================================== */
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const DEVICE_SCALE_FACTOR = 3;
const HERE = __dirname;
const PAGE_URL = 'file://' + path.join(HERE, 'portfolio-assets.html');
const OUT_DIR = path.join(HERE, 'exports');

// Each capture frame -> its own PNG. The id must exist in portfolio-assets.html.
const FRAMES = [
  { id: 'frame-colors',            file: 'colors.png' },
  { id: 'frame-color-poster',      file: 'color-poster.png' },
  { id: 'frame-icons',             file: 'icons-grid.png' },
  { id: 'frame-type-scale',        file: 'type-scale.png' },
  { id: 'frame-timeline-card',     file: 'timeline-card.png' },
  { id: 'frame-destination-cards', file: 'destination-cards.png' },
  { id: 'frame-now-marker',        file: 'now-marker.png' },
];

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const launchOpts = {
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--force-color-profile=srgb'],
  };
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    launchOpts.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  const browser = await puppeteer.launch(launchOpts);
  try {
    const page = await browser.newPage();
    // High DPR so the PNGs are crisp at large sizes (frame px * 3).
    await page.setViewport({ width: 1560, height: 1200, deviceScaleFactor: DEVICE_SCALE_FACTOR });

    // networkidle2 lets the (optional) cover photos load; gradients are the fallback.
    await page.goto(PAGE_URL, { waitUntil: 'networkidle2', timeout: 60000 });
    await page.evaluate(() => window.__assetsReady);          // frames built + fonts ready
    await new Promise((r) => setTimeout(r, 400));               // final paint settle

    // ---- PNG per frame ----
    for (const frame of FRAMES) {
      const el = await page.$('#' + frame.id);
      if (!el) {
        console.error(`  ✗ missing #${frame.id} — skipped`);
        continue;
      }
      // Clipping guard: warn if fixed-height content overflows the frame.
      const box = await el.evaluate((node) => ({
        w: node.clientWidth, h: node.clientHeight, sh: node.scrollHeight, sw: node.scrollWidth,
      }));
      if (box.sh > box.h + 1 || box.sw > box.w + 1) {
        console.warn(`  ! #${frame.id} content (${box.sw}x${box.sh}) exceeds frame (${box.w}x${box.h}) — raise the frame size`);
      }
      const outPath = path.join(OUT_DIR, frame.file);
      await el.screenshot({ path: outPath, omitBackground: true });
      console.log(`  ✓ ${frame.file}  (${box.w}x${box.h} css → ${box.w * DEVICE_SCALE_FACTOR}x${box.h * DEVICE_SCALE_FACTOR}px)`);
    }

    // ---- SVG export of the icon grid (vector, same token data) ----
    const svg = await page.evaluate(() => window.buildIconGridSVG());
    const svgPath = path.join(OUT_DIR, 'icons-grid.svg');
    fs.writeFileSync(svgPath, svg, 'utf8');
    console.log(`  ✓ icons-grid.svg  (${svg.length} bytes, vector)`);

    console.log(`\nDone → ${OUT_DIR}`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error('\ncapture failed:', err);
  process.exit(1);
});
