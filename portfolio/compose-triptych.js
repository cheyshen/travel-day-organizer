#!/usr/bin/env node
/* ============================================================================
 * compose-triptych.js — Combine three flow recordings into ONE wide video.
 *
 * Renders calendar-day-jump + day-island-switch + checklist side by side in
 * phone bezels on the product grey, plays them in sync (shorter clips freeze
 * on their last frame), records with page.screencast(), encodes MP4 + GIF.
 *
 * Input:  ./exports/flows/{calendar-day-jump,day-island-switch,checklist}.mp4
 * Output: ./exports/flows/in-action-triptych.{mp4,gif}
 * Run:    PUPPETEER_EXECUTABLE_PATH=... node compose-triptych.js
 * ========================================================================== */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const puppeteer = require('puppeteer');

const HERE = __dirname;
const FLOWS_DIR = path.join(HERE, 'exports', 'flows');
const CLIPS = ['calendar-day-jump', 'day-island-switch', 'checklist']; // left → right
const NAME = 'in-action-triptych';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function ff(args) { execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...args], { stdio: 'inherit' }); }

const PAGE = (srcs) => `<!doctype html><html><head><style>
  html, body { margin: 0; }
  body {
    width: 1366px; height: 944px; background: #F2F3F5; overflow: hidden;
    display: flex; gap: 28px; align-items: center; justify-content: center;
  }
  .phone { border-radius: 44px; background: #14181F; padding: 10px;
           box-shadow: 0 24px 60px rgba(20,28,40,0.22); }
  video { width: 390px; height: 844px; display: block; border-radius: 34px; background: #14181F; }
</style></head><body>
${srcs.map((s) => `  <div class="phone"><video src="${s}" muted playsinline preload="auto"></video></div>`).join('\n')}
</body></html>`;

async function main() {
  for (const c of CLIPS) {
    const f = path.join(FLOWS_DIR, `${c}.mp4`);
    if (!fs.existsSync(f)) { console.error(`missing input: ${f} — run capture-flows.js first`); process.exit(1); }
  }

  const launchOpts = { headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox', '--force-color-profile=srgb'] };
  if (process.env.PUPPETEER_EXECUTABLE_PATH) launchOpts.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  const browser = await puppeteer.launch(launchOpts);
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 944, deviceScaleFactor: 1 });
    // page must itself be a file:// document — chrome's URL safety check blocks
    // file:// video subresources from about:blank (page.setContent) documents
    const srcs = CLIPS.map((c) => `exports/flows/${c}.mp4`);
    const tmpHtml = path.join(HERE, `_${NAME}.html`);
    fs.writeFileSync(tmpHtml, PAGE(srcs));
    await page.goto('file://' + tmpHtml, { waitUntil: 'networkidle2', timeout: 30000 });

    // all three fully buffered so playback starts in sync and never stalls
    await page.waitForFunction(
      () => [...document.querySelectorAll('video')].every((v) => v.readyState === 4), { timeout: 30000 });

    const webm = path.join(FLOWS_DIR, `_${NAME}.webm`);
    const recorder = await page.screencast({ path: webm });
    await sleep(500); // head padding — still of the three start frames
    await page.evaluate(() => Promise.all([...document.querySelectorAll('video')].map((v) => v.play())));
    // no loop attribute → each video freezes on its last frame when it ends
    await page.waitForFunction(
      () => [...document.querySelectorAll('video')].every((v) => v.ended), { timeout: 30000, polling: 200 });
    await sleep(900); // tail padding — hold the three end states
    await recorder.stop();

    const mp4 = path.join(FLOWS_DIR, `${NAME}.mp4`);
    ff(['-i', webm, '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2,format=yuv420p',
      '-c:v', 'libx264', '-crf', '18', '-movflags', '+faststart', mp4]);
    const pal = path.join(FLOWS_DIR, `_${NAME}_pal.png`);
    ff(['-i', mp4, '-vf', 'fps=15,scale=720:-1:flags=lanczos,palettegen=stats_mode=full', pal]);
    const gif = path.join(FLOWS_DIR, `${NAME}.gif`);
    ff(['-i', mp4, '-i', pal,
      '-lavfi', 'fps=15,scale=720:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=3',
      '-loop', '0', gif]);
    fs.rmSync(pal);
    fs.rmSync(webm);
    fs.rmSync(tmpHtml);
    console.log(`✓ ${NAME}.mp4 + .gif → ${FLOWS_DIR}`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => { console.error('\ncompose-triptych failed:', err); process.exit(1); });
