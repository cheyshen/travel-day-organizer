#!/usr/bin/env node
/* ============================================================================
 * capture-flows.js — Real-app interaction recordings for the portfolio.
 *
 * Drives the live Travel app with scripted taps/scrolls (visible tap ripples)
 * at a phone viewport, records each flow with page.screencast(), and encodes
 * MP4 + GIF per flow. Each flow runs in a fresh browser context, so the
 * sample-trip state is pristine and clips are order-independent.
 *
 * Output: ./exports/flows/<name>.{mp4,gif}
 * Run:    PUPPETEER_EXECUTABLE_PATH=/home/ubuntu/.cache/puppeteer/chrome/linux-148.0.7778.97/chrome-linux64/chrome \
 *           node capture-flows.js [flowName ...]
 * Requires: ffmpeg + ffprobe on PATH (this box has 4.4.2).
 * ========================================================================== */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const puppeteer = require('puppeteer');

const HERE = __dirname;
const OUT_DIR = path.join(HERE, 'exports', 'flows');
const APP_URL = process.env.FLOW_URL || 'http://192.168.1.198';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function ff(args) { execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...args], { stdio: 'inherit' }); }
function haveFfmpeg() {
  try { execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' }); execFileSync('ffprobe', ['-version'], { stdio: 'ignore' }); return true; }
  catch { return false; }
}

/* ---- injected page helpers: tap ripple + eased scroll ---- */
async function installHelpers(page) {
  await page.evaluate(() => {
    window.__ripple = (x, y) => {
      const d = document.createElement('div');
      d.style.cssText =
        `position:fixed;left:${x}px;top:${y}px;width:44px;height:44px;margin:-22px 0 0 -22px;` +
        'border-radius:50%;border:3px solid rgba(14,116,144,.9);background:rgba(14,116,144,.22);' +
        'pointer-events:none;z-index:99999;transform:scale(.4);opacity:1;' +
        'transition:transform .45s ease-out,opacity .45s ease-out;';
      document.body.appendChild(d);
      void d.offsetWidth; // force reflow so the transition animates from the initial styles
      d.style.transform = 'scale(1.3)';
      d.style.opacity = '0';
      setTimeout(() => d.remove(), 600);
    };
    window.__smoothScroll = (toY, ms) => new Promise((res) => {
      const from = window.scrollY;
      const delta = toY - from;
      const t0 = performance.now();
      const ease = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
      const step = (now) => {
        const u = Math.min(1, (now - t0) / ms);
        window.scrollTo(0, from + delta * ease(u));
        if (u < 1) requestAnimationFrame(step); else res();
      };
      requestAnimationFrame(step);
    });
  });
}

/* ---- tap an element handle: scroll into view if needed, ripple, touch tap ---- */
async function tapElement(page, el, { settle = 700 } = {}) {
  const needsScroll = await el.evaluate((e) => {
    const r = e.getBoundingClientRect();
    // only scroll when the element is actually clipped — fixed bottom-nav /
    // action-bar buttons sit near the viewport edge but are fully visible
    if (r.top < 0 || r.bottom > innerHeight) {
      e.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return true;
    }
    return false;
  });
  if (needsScroll) await sleep(700);
  const box = await el.boundingBox();
  if (!box) throw new Error('tapElement: element has no bounding box');
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.evaluate((xx, yy) => window.__ripple(xx, yy), x, y);
  await sleep(140);
  await page.touchscreen.tap(x, y);
  await sleep(settle);
}

async function tapSelector(page, selector, opts) {
  const el = await page.waitForSelector(selector, { visible: true, timeout: 10000 });
  await tapElement(page, el, opts);
}

/* Deepest LAST element whose exact trimmed text matches. "Last in DOM order"
 * matters: the EventEditor overlay mounts after the main view, so its labels
 * win over identical text behind the sheet. */
async function tapByText(page, text, opts) {
  const h = await page.evaluateHandle((t) => {
    const els = [...document.querySelectorAll('button, span, div')];
    const hits = els.filter((e) => e.textContent.trim() === t);
    return hits[hits.length - 1] || null;
  }, text);
  const el = h.asElement();
  if (!el) throw new Error(`tapByText: "${text}" not found`);
  await tapElement(page, el, opts);
}

/* Calendar day cell = the button whose only text is the day number
 * (unique in the July 2026 grid; stat tiles with numbers are divs). */
async function tapDayCell(page, dayNum, opts) {
  const h = await page.evaluateHandle((n) => {
    const btns = [...document.querySelectorAll('button')];
    return btns.find((b) => b.textContent.trim() === String(n)) || null;
  }, dayNum);
  const el = h.asElement();
  if (!el) throw new Error(`tapDayCell: day ${dayNum} not found`);
  await tapElement(page, el, opts);
}

/* ---- flows ----
 * `setup` runs BEFORE recording starts (navigate to the flow's surface),
 * `run` is what gets recorded — each clip opens directly on its own screen. */
const FLOWS = [
  {
    name: 'checklist',
    setup: async (page) => {
      await tapSelector(page, 'button[aria-label="Status"]', { settle: 1000 });
    },
    run: async (page) => {
      for (let i = 0; i < 4; i++) {
        // re-query each time: the first "Mark complete" is always the top-most unchecked item
        await tapSelector(page, 'button[aria-label="Mark complete"]', { settle: 650 });
      }
    },
  },
  {
    name: 'day-island-switch',
    setup: async (page) => {
      await tapSelector(page, 'button[aria-label="Day"]', { settle: 1100 }); // Day 1 (today) — live Now marker
    },
    run: async (page) => {
      await page.evaluate(() => window.__smoothScroll(
        Math.min(900, document.documentElement.scrollHeight - innerHeight), 1800));
      await sleep(700);
      await page.evaluate(() => window.__smoothScroll(0, 900));
      await sleep(500);
      await tapSelector(page, 'button[aria-label="Go to Maui"]', { settle: 1600 }); // warm → cool tint flip
      await page.waitForFunction(
        () => document.body.innerText.includes('July 8'), { timeout: 5000 }); // first Maui day rendered
    },
  },
  {
    name: 'calendar-day-jump',
    setup: async (page) => {
      await tapSelector(page, 'button[aria-label="Plan"]', { settle: 1100 });
    },
    run: async (page) => {
      await tapDayCell(page, 9, { settle: 1000 });         // July 9 — Maui day with events
      await tapByText(page, 'View Day', { settle: 1600 }); // tooltip CTA → day timeline
      await page.waitForFunction(
        () => /day 6 of 9/i.test(document.body.innerText), { timeout: 5000 }); // Jul 9 = Day 6
    },
  },
  {
    // stays inside the calendar (no View Day jump) — made for the triptych,
    // where the middle phone already shows the Day timeline
    name: 'calendar-browse',
    setup: async (page) => {
      await tapSelector(page, 'button[aria-label="Plan"]', { settle: 1100 });
    },
    run: async (page) => {
      await tapDayCell(page, 5, { settle: 1300 });                            // Kauai day → popup
      await tapSelector(page, 'button[aria-label="Close tooltip"]', { settle: 700 });
      await tapDayCell(page, 9, { settle: 1300 });                            // Maui day → popup, hold
      await page.waitForFunction(
        () => document.body.innerText.includes('July 9'), { timeout: 5000 });
    },
  },
  {
    name: 'add-event',
    setup: async (page) => {
      await tapSelector(page, 'button[aria-label="Day"]', { settle: 900 });        // today's timeline
    },
    run: async (page) => {
      await tapSelector(page, 'button[aria-label="Add event"]', { settle: 1000 }); // sheet springs up
      await tapByText(page, 'Beach', { settle: 850 });  // sticker tilt-pop + confetti
      await tapByText(page, 'Fun', { settle: 850 });
      await tapSelector(page, 'input[placeholder="Event title"]', { settle: 300 });
      await page.keyboard.type('Sunset Sail', { delay: 65 });
      await sleep(400);
      await tapByText(page, 'Add Event', { settle: 1200 }); // save → sheet closes
      await page.waitForFunction(
        () => document.body.innerText.includes('Sunset Sail'), { timeout: 5000 }); // event in timeline
    },
  },
];

/* ---- capture + encode ---- */
async function openApp(browser) {
  const ctx = await browser.createBrowserContext(); // fresh localStorage every flow
  const page = await ctx.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto(APP_URL, { waitUntil: 'networkidle2', timeout: 60000 });
  await page.waitForSelector('button[aria-label="Add event"]', { visible: true, timeout: 20000 });
  await installHelpers(page);
  await sleep(1000); // fonts/photos settle
  return { ctx, page };
}

function encode(name) {
  const webm = path.join(OUT_DIR, `_${name}.webm`);
  const mp4 = path.join(OUT_DIR, `${name}.mp4`);
  ff(['-i', webm, '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2,format=yuv420p',
    '-c:v', 'libx264', '-crf', '18', '-movflags', '+faststart', mp4]);
  const pal = path.join(OUT_DIR, `_${name}_pal.png`);
  ff(['-i', mp4, '-vf', 'fps=15,scale=390:-1:flags=lanczos,palettegen=stats_mode=full', pal]);
  const gif = path.join(OUT_DIR, `${name}.gif`);
  ff(['-i', mp4, '-i', pal,
    '-lavfi', 'fps=15,scale=390:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=3',
    '-loop', '0', gif]);
  fs.rmSync(pal);
  fs.rmSync(webm);
}

async function main() {
  if (!haveFfmpeg()) { console.error('ffmpeg/ffprobe not found on PATH.'); process.exit(1); }
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const only = process.argv.slice(2);
  const flows = only.length ? FLOWS.filter((f) => only.includes(f.name)) : FLOWS;
  if (!flows.length) {
    console.error(`No matching flows. Available: ${FLOWS.map((f) => f.name).join(', ')}`);
    process.exit(1);
  }

  const launchOpts = { headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox', '--force-color-profile=srgb'] };
  if (process.env.PUPPETEER_EXECUTABLE_PATH) launchOpts.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  const browser = await puppeteer.launch(launchOpts);
  try {
    for (const flow of flows) {
      console.log(`▶ ${flow.name}`);
      const { ctx, page } = await openApp(browser);
      if (flow.setup) { await flow.setup(page); await sleep(500); } // navigate off-camera
      const recorder = await page.screencast({ path: path.join(OUT_DIR, `_${flow.name}.webm`) });
      await sleep(600);  // head padding — reads as a still before the first tap
      await flow.run(page);
      await sleep(800);  // tail padding
      await recorder.stop();
      await ctx.close();
      encode(flow.name);
      console.log(`  ✓ ${flow.name}.mp4 + .gif`);
    }
    console.log(`\nDone → ${OUT_DIR}`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => { console.error('\ncapture-flows failed:', err); process.exit(1); });
