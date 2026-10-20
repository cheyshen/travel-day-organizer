#!/usr/bin/env node
'use strict';
// capture-triptych-final.js
// Records the lumakey canvas player as a standard MP4.
// Usage: node capture-triptych-final.js [bg-color]
//   bg-color: CSS hex like #FFFFFF (default) or 'transparent' (→ black bg in recording)
// Output: exports/flows/in-action-triptych-final.mp4

const puppeteer = require('puppeteer');
const { execFileSync } = require('child_process');
const path = require('path');
const fs   = require('fs');

const CHROME   = process.env.PUPPETEER_EXECUTABLE_PATH;
const HERE     = __dirname;
const FLOWS    = path.join(HERE, 'exports', 'flows');
const PLAYER   = 'http://192.168.1.122:8080/exports/flows/triptych-player.html';
const DURATION = 8.5;   // seconds — slightly longer than max clip (8.32s)

const bgArg = process.argv[2] || '#FFFFFF';

async function main() {
  console.log(`background: ${bgArg}  →  recording ${DURATION}s`);

  const opts = {
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--force-color-profile=srgb'],
  };
  if (CHROME) opts.executablePath = CHROME;

  const browser = await puppeteer.launch(opts);
  const page    = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  // Inject background colour via CSS before navigation
  await page.evaluateOnNewDocument((bg) => {
    document.addEventListener('DOMContentLoaded', () => {
      document.documentElement.style.background = bg;
      document.body.style.background = bg;
    });
  }, bgArg === 'transparent' ? 'transparent' : bgArg);

  await page.goto(PLAYER, { waitUntil: 'domcontentloaded', timeout: 30000 });

  // Wait until canvas has composited at least one frame
  await page.waitForFunction(
    () => {
      const v = document.getElementById('tv');
      return v && !v.paused && v.currentTime > 0.1;
    },
    { timeout: 15000 }
  );
  console.log('  video playing, starting screencast…');

  const webmPath = path.join(FLOWS, '_triptych_final_raw.webm');
  const recorder = await page.screencast({ path: webmPath });

  await new Promise(r => setTimeout(r, DURATION * 1000));
  await recorder.stop();
  await browser.close();

  console.log('  screencast done, encoding mp4…');

  const mp4Path = path.join(FLOWS, 'in-action-triptych-final.mp4');
  execFileSync('ffmpeg', [
    '-y', '-hide_banner', '-loglevel', 'error',
    '-i', webmPath,
    '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    mp4Path,
  ]);
  fs.rmSync(webmPath);

  const kb = Math.round(fs.statSync(mp4Path).size / 1024);
  console.log(`  ✓ in-action-triptych-final.mp4  ${kb} KB  (bg: ${bgArg})`);
  console.log(`    http://192.168.1.122:8080/exports/flows/in-action-triptych-final.mp4`);
}

main().catch(e => { console.error(e.message); process.exit(1); });
