#!/usr/bin/env node
/* ============================================================================
 * compose-solo.js — One flow recording as a hero shot: single phone bezel
 * centered on the brand-teal square. The depth companion to the triptych
 * (same bezel + background treatment, 1 phone instead of 3).
 *
 * Input:  ./exports/flows/<clip>.mp4   (default: add-event)
 * Output: ./exports/flows/<clip>-solo.{mp4,gif}   (1080×1080)
 * Run:    PUPPETEER_EXECUTABLE_PATH=... node compose-solo.js [clip]
 * ========================================================================== */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const puppeteer = require('puppeteer');

const HERE = __dirname;
const FLOWS_DIR = path.join(HERE, 'exports', 'flows');
const CLIP = process.argv[2] || 'add-event';
const SIZE = 1080;
const GIF_W = 480;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function ff(args) { execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...args], { stdio: 'inherit' }); }

const PAGE = (src) => `<!doctype html><html><head><style>
  html, body { margin: 0; }
  body { width: ${SIZE}px; height: ${SIZE}px; background: #0E7490; overflow: hidden;
         display: flex; align-items: center; justify-content: center; }
  .phone { border-radius: 44px; background: #14181F; padding: 10px;
           box-shadow: 0 24px 60px rgba(20,28,40,0.22); }
  video { width: 390px; height: 844px; display: block; border-radius: 34px; background: #14181F; }
</style></head><body>
  <div class="phone"><video src="${src}" muted playsinline preload="auto"></video></div>
</body></html>`;

async function main() {
  const input = path.join(FLOWS_DIR, `${CLIP}.mp4`);
  if (!fs.existsSync(input)) { console.error(`missing input: ${input} — run capture-flows.js first`); process.exit(1); }

  const launchOpts = { headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox', '--force-color-profile=srgb'] };
  if (process.env.PUPPETEER_EXECUTABLE_PATH) launchOpts.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  const browser = await puppeteer.launch(launchOpts);
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: SIZE, height: SIZE, deviceScaleFactor: 1 });
    // page must itself be a file:// document — chrome's URL safety check blocks
    // file:// video subresources from about:blank (page.setContent) documents
    const tmpHtml = path.join(HERE, `_${CLIP}-solo.html`);
    fs.writeFileSync(tmpHtml, PAGE(`exports/flows/${CLIP}.mp4`));
    await page.goto('file://' + tmpHtml, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForFunction(() => document.querySelector('video').readyState === 4, { timeout: 30000 });

    const webm = path.join(FLOWS_DIR, `_${CLIP}-solo.webm`);
    const recorder = await page.screencast({ path: webm });
    await sleep(500);  // head padding — still of the start frame
    await page.evaluate(() => document.querySelector('video').play());
    await page.waitForFunction(() => document.querySelector('video').ended, { timeout: 60000, polling: 200 });
    await sleep(900);  // tail padding — hold the end state
    await recorder.stop();

    const mp4 = path.join(FLOWS_DIR, `${CLIP}-solo.mp4`);
    ff(['-i', webm, '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2,format=yuv420p',
      '-c:v', 'libx264', '-crf', '18', '-movflags', '+faststart', mp4]);
    const pal = path.join(FLOWS_DIR, `_${CLIP}-solo_pal.png`);
    ff(['-i', mp4, '-vf', `fps=15,scale=${GIF_W}:-1:flags=lanczos,palettegen=stats_mode=full`, pal]);
    const gif = path.join(FLOWS_DIR, `${CLIP}-solo.gif`);
    ff(['-i', mp4, '-i', pal,
      '-lavfi', `fps=15,scale=${GIF_W}:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=3`,
      '-loop', '0', gif]);
    fs.rmSync(pal); fs.rmSync(webm); fs.rmSync(tmpHtml);
    console.log(`✓ ${CLIP}-solo.mp4 + .gif (${SIZE}×${SIZE}) → ${FLOWS_DIR}`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => { console.error('\ncompose-solo failed:', err); process.exit(1); });
