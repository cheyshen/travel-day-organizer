#!/usr/bin/env node
/* ============================================================================
 * compose-screens-wall.js — Static "screens wall" portfolio image.
 *
 * Captures real app states off the live Travel app, then lays them out as
 * staggered columns of bare rounded screens (bleeding off the canvas top and
 * bottom) on the brand ocean background — the classic app-collage shot.
 *
 * Output: ./exports/wall/screens/<state>.png   (raw 780×1688 captures)
 *         ./exports/wall/screens-wall.png       (1920×1080 @2x = 3840×2160)
 * Run:    PUPPETEER_EXECUTABLE_PATH=... node compose-screens-wall.js
 * ========================================================================== */
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { openApp, tapSelector, tapByText, tapDayCell, sleep } = require('./capture-flows');

const HERE = __dirname;
const WALL_DIR = path.join(HERE, 'exports', 'wall');
const SHOTS_DIR = path.join(WALL_DIR, 'screens');
const BG = process.env.WALL_BG || '#E0F1F8'; // colors.js infoLight (user's pick 2026-07-04)
const OUT_NAME = process.env.WALL_OUT || 'screens-wall.png';

/* app states to capture — each starts from a fresh context on the Trip tab */
const STATES = [
  { name: 'trip-hero', go: async () => {} },
  {
    name: 'plan',
    go: async (p) => {
      await tapSelector(p, 'button[aria-label="Plan"]', { settle: 1200 });
      await tapByText(p, 'Kauai', { settle: 900 }); // island filter segment selected
    },
  },
  {
    name: 'plan-popup',
    go: async (p) => {
      await tapSelector(p, 'button[aria-label="Plan"]', { settle: 1200 });
      await tapDayCell(p, 9, { settle: 1400 });
    },
  },
  { name: 'day-kauai', go: async (p) => { await tapSelector(p, 'button[aria-label="Day"]', { settle: 1400 }); } },
  {
    name: 'day-maui',
    go: async (p) => {
      await tapSelector(p, 'button[aria-label="Day"]', { settle: 1200 });
      await tapSelector(p, 'button[aria-label="Go to Maui"]', { settle: 1600 });
      // scroll so the wall's visible fragment lands on later, more photogenic cards
      await p.evaluate(() => window.__smoothScroll(520, 600));
      await sleep(700);
    },
  },
  {
    name: 'event-editor',
    go: async (p) => {
      await tapSelector(p, 'button[aria-label="Day"]', { settle: 1200 });
      await tapSelector(p, 'button[aria-label="Add event"]', { settle: 1200 });
      await tapByText(p, 'Fun', { settle: 1400 }); // selected sticker + cover photo
    },
  },
  {
    name: 'event-detail',
    go: async (p) => {
      await tapSelector(p, 'button[aria-label="Day"]', { settle: 1200 });
      await tapByText(p, 'Details', { settle: 1400 });
    },
  },
  { name: 'status', go: async (p) => { await tapSelector(p, 'button[aria-label="Status"]', { settle: 1200 }); } },
];

/* wall layout — 4 staggered columns × 2 screens, cropped by the canvas */
/* deep offsets crop the TOP tile hard and feature the bottom tile (and vice
 * versa) — so crop-tolerant timelines take the fragments, and screens whose
 * signature is their top (hero masthead, detail photo) sit where tops show */
const COLUMNS = [
  { screens: ['day-kauai', 'trip-hero'], offset: -520 },
  { screens: ['plan-popup', 'event-editor'], offset: -140 },
  { screens: ['day-maui', 'status'], offset: -420 },
  { screens: ['event-detail', 'plan'], offset: -240 },
];

const PAGE = () => `<!doctype html><html><head><style>
  html, body { margin: 0; }
  body { width: 1920px; height: 1080px; background: ${BG}; overflow: hidden;
         display: flex; gap: 60px; justify-content: center; }
  .col { display: flex; flex-direction: column; gap: 60px; flex-shrink: 0; }
  img { width: 380px; display: block; border-radius: 28px;
        box-shadow: 0 20px 50px rgba(0,0,0,0.28); }
</style></head><body>
${COLUMNS.map((c) => `  <div class="col" style="transform:translateY(${c.offset}px)">
${c.screens.map((s) => `    <img src="screens/${s}.png">`).join('\n')}
  </div>`).join('\n')}
</body></html>`;

async function main() {
  fs.mkdirSync(SHOTS_DIR, { recursive: true });

  const launchOpts = { headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox', '--force-color-profile=srgb'] };
  if (process.env.PUPPETEER_EXECUTABLE_PATH) launchOpts.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  const browser = await puppeteer.launch(launchOpts);
  const layoutOnly = process.argv.includes('--layout-only'); // reuse existing screen PNGs
  const only = process.argv.slice(2).filter((a) => !a.startsWith('--')); // re-capture just these states
  const states = layoutOnly ? [] : (only.length ? STATES.filter((s) => only.includes(s.name)) : STATES);
  try {
    for (const state of states) {
      const { ctx, page } = await openApp(browser);
      await state.go(page);
      await sleep(400); // let ripples fade fully
      await page.screenshot({ path: path.join(SHOTS_DIR, `${state.name}.png`) });
      await ctx.close();
      console.log(`  ✓ screen: ${state.name}`);
    }

    const tmpHtml = path.join(WALL_DIR, '_wall.html');
    fs.writeFileSync(tmpHtml, PAGE());
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });
    await page.goto('file://' + tmpHtml, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(300);
    await page.screenshot({ path: path.join(WALL_DIR, OUT_NAME) });
    fs.rmSync(tmpHtml);
    console.log(`✓ ${OUT_NAME} (3840×2160, bg ${BG}) → ${WALL_DIR}`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => { console.error('\ncompose-screens-wall failed:', err); process.exit(1); });
