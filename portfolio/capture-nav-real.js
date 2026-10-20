#!/usr/bin/env node
/* capture-nav-real.js — Record the REAL product navigating its tabs.
 * Loads https://travel.cheyshen.com/, records the viewport with page.screencast,
 * and taps Trip → Plan → Day → Status → Trip so the real nav + real framer-motion
 * page transitions are captured (no recreation). Encodes to mp4 + gif.
 *
 * Output: exports/anim/nav-real.{webm,mp4,gif}
 */
const puppeteer = require('puppeteer');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const URL = 'https://travel.cheyshen.com/';
const OUT = path.join(__dirname, 'exports', 'anim');
const CHROME = process.env.PUPPETEER_EXECUTABLE_PATH ||
  '/home/ubuntu/.cache/puppeteer/chrome/linux-148.0.7778.97/chrome-linux64/chrome';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ff = (args) => execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...args], { stdio: 'inherit' });

async function tap(page, label) {
  const sel = `[role="tab"][aria-label="${label}"]`;
  await page.waitForSelector(sel, { timeout: 10000 });
  await page.click(sel);
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: CHROME,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--force-color-profile=srgb'],
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 393, height: 852, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });
    await sleep(3500); // let Unsplash photos + fonts settle on the Trip view

    const webm = path.join(OUT, 'nav-real.webm');
    const recorder = await page.screencast({ path: webm });

    // start on Trip (default), then cycle — dwell lets each page transition finish
    await sleep(1100);
    await tap(page, 'Plan');   await sleep(1300);
    await tap(page, 'Day');    await sleep(1300);
    await tap(page, 'Status'); await sleep(1300);
    await tap(page, 'Trip');   await sleep(1200); // return → loops back to the opening frame

    await recorder.stop();
    await browser.close();

    // ---- encode ----
    const mp4 = path.join(OUT, 'nav-real.mp4');
    ff(['-i', webm, '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2,format=yuv420p',
        '-c:v', 'libx264', '-crf', '18', '-movflags', '+faststart', mp4]);

    const gifW = 400;
    const pal = path.join(OUT, '_nav-real-pal.png');
    ff(['-i', webm, '-vf', `fps=24,scale=${gifW}:-1:flags=lanczos,palettegen=stats_mode=full`, pal]);
    const gif = path.join(OUT, 'nav-real.gif');
    ff(['-i', webm, '-i', pal, '-lavfi',
        `fps=24,scale=${gifW}:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=3`,
        '-loop', '0', gif]);
    fs.rmSync(pal, { force: true });

    console.log('Done → exports/anim/nav-real.{webm,mp4,gif}');
  } catch (e) {
    await browser.close();
    throw e;
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
