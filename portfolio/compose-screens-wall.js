#!/usr/bin/env node
/* ============================================================================
 * compose-screens-wall.js — Static "screens wall" portfolio image.
 *
 * Captures real app states off the live Travel app, then lays them out as
 * staggered columns of bare rounded screens (bleeding off the canvas top and
 * bottom) on the neutral portfolio background — the classic app-collage shot.
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
const BG = process.env.WALL_BG || '#F9F9F9'; // portfolio page neutral (see EXPORTS.md conventions; was infoLight until 2026-07-05)
const TRANSPARENT = BG === 'transparent'; // WALL_BG=transparent → alpha PNG (screens + their shadows only)
const OUT_NAME = process.env.WALL_OUT || 'screens-wall.png';
const SVG_OUT = process.env.WALL_SVG_OUT || OUT_NAME.replace(/\.png$/i, '.svg');

/* shared layout constants — the SVG builder reproduces the CSS collage exactly */
const CANVAS_W = 1920, CANVAS_H = 1080;
const COL_W = 380;   // img width
const COL_GAP = 60;  // gap between columns AND between the two stacked screens
const RADIUS = 28;   // screen corner radius (matches CSS border-radius)

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
  body { width: ${CANVAS_W}px; height: ${CANVAS_H}px; background: ${BG}; overflow: hidden;
         display: flex; gap: ${COL_GAP}px; justify-content: center; }
  .col { display: flex; flex-direction: column; gap: ${COL_GAP}px; flex-shrink: 0; }
  img { width: ${COL_W}px; display: block; border-radius: ${RADIUS}px;
        box-shadow: 0 20px 50px rgba(0,0,0,0.28); }
</style></head><body>
${COLUMNS.map((c) => `  <div class="col" style="transform:translateY(${c.offset}px)">
${c.screens.map((s) => `    <img src="screens/${s}.png">`).join('\n')}
  </div>`).join('\n')}
</body></html>`;

/* -- SVG twin of the CSS collage -----------------------------------------
 * Same 1920×1080 canvas, same columns/offsets/radius/shadow, but resolution
 * independent. Each screen is the REAL capture embedded as a base64 <image>
 * (nothing redrawn), rounded via clipPath, with its own drop-shadow. Screens
 * bleed past the viewBox exactly like the CSS `overflow:hidden` body. */
function pngDims(file) { const b = fs.readFileSync(file); return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) }; }

function buildSVG() {
  const first = path.join(SHOTS_DIR, `${COLUMNS[0].screens[0]}.png`);
  const { w: natW, h: natH } = pngDims(first);
  const imgH = +(COL_W * natH / natW).toFixed(3);       // display height at 380px wide
  const totalW = COLUMNS.length * COL_W + (COLUMNS.length - 1) * COL_GAP;
  const startX = (CANVAS_W - totalW) / 2;

  const clips = [], groups = [];
  COLUMNS.forEach((col, ci) => {
    const x = startX + ci * (COL_W + COL_GAP);
    col.screens.forEach((name, si) => {
      const y = +(col.offset + si * (imgH + COL_GAP)).toFixed(3);
      const b64 = fs.readFileSync(path.join(SHOTS_DIR, `${name}.png`)).toString('base64');
      const id = `clip_${ci}_${si}`;
      clips.push(`<clipPath id="${id}"><rect x="${x}" y="${y}" width="${COL_W}" height="${imgH}" rx="${RADIUS}" ry="${RADIUS}"/></clipPath>`);
      groups.push(
        `<g filter="url(#screenShadow)"><image x="${x}" y="${y}" width="${COL_W}" height="${imgH}" ` +
        `preserveAspectRatio="none" clip-path="url(#${id})" xlink:href="data:image/png;base64,${b64}"/></g>`);
    });
  });

  const bg = TRANSPARENT ? '' : `\n  <rect width="${CANVAS_W}" height="${CANVAS_H}" fill="${BG}"/>`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${CANVAS_W}" height="${CANVAS_H}" viewBox="0 0 ${CANVAS_W} ${CANVAS_H}">
  <defs>
    <filter id="screenShadow" x="-25%" y="-20%" width="150%" height="150%" color-interpolation-filters="sRGB">
      <feDropShadow dx="0" dy="20" stdDeviation="25" flood-color="#000000" flood-opacity="0.28"/>
    </filter>
    ${clips.join('\n    ')}
  </defs>${bg}
  ${groups.join('\n  ')}
</svg>
`;
}

async function main() {
  fs.mkdirSync(SHOTS_DIR, { recursive: true });

  const launchOpts = { headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox', '--force-color-profile=srgb'] };
  if (process.env.PUPPETEER_EXECUTABLE_PATH) launchOpts.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  const wantSVG = process.argv.includes('--svg') || process.argv.includes('--svg-only');
  const svgOnly = process.argv.includes('--svg-only'); // build SVG from existing screens, no browser render
  const layoutOnly = process.argv.includes('--layout-only') || svgOnly; // reuse existing screen PNGs
  const only = process.argv.slice(2).filter((a) => !a.startsWith('--')); // re-capture just these states
  const states = layoutOnly ? [] : (only.length ? STATES.filter((s) => only.includes(s.name)) : STATES);

  if (svgOnly) { // no captures, no raster — just (re)build the SVG from screens on disk
    fs.writeFileSync(path.join(WALL_DIR, SVG_OUT), buildSVG());
    console.log(`✓ ${SVG_OUT} (SVG, ${CANVAS_W}×${CANVAS_H}, bg ${BG}) → ${WALL_DIR}`);
    return;
  }

  const browser = await puppeteer.launch(launchOpts);
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
    await page.screenshot({ path: path.join(WALL_DIR, OUT_NAME), omitBackground: TRANSPARENT });
    fs.rmSync(tmpHtml);
    console.log(`✓ ${OUT_NAME} (3840×2160, bg ${BG}) → ${WALL_DIR}`);

    if (wantSVG) {
      fs.writeFileSync(path.join(WALL_DIR, SVG_OUT), buildSVG());
      console.log(`✓ ${SVG_OUT} (SVG, ${CANVAS_W}×${CANVAS_H}, bg ${BG}) → ${WALL_DIR}`);
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => { console.error('\ncompose-screens-wall failed:', err); process.exit(1); });
