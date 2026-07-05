#!/usr/bin/env node
/* ============================================================================
 * capture-callouts.js — Annotated component-callout panel (portfolio shot).
 *
 * Two layouts, both exported: "wide" (1920×1000, all 4 components in one row —
 * desktop) and "square" (1080×1080, 2×2 grid — mobile).
 *
 * Static (default): screenshots the rounded dark panel with omitBackground so
 * the corners export transparent — drops onto any case-study background.
 *
 * --anim: steps the panel's deterministic loop (setAnimFrame(t), t = 0…1 —
 * each component takes a turn; radar pulse continuous), one screenshot per
 * frame, then encodes MP4 + GIF + APNG. Videos are FULL-BLEED (border-radius
 * stripped) per user preference — only the static PNGs keep rounded corners.
 *
 * Output: ./exports/component-callouts-{wide,square}.png
 *         ./exports/anim/component-callouts-{wide,square}.{mp4,gif,apng}
 * Run:    PUPPETEER_EXECUTABLE_PATH=... node capture-callouts.js [--anim] [wide|square]
 *         CALLOUT_BG=#14181F node capture-callouts.js   (panel color override)
 * ========================================================================== */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const puppeteer = require('puppeteer');

const HERE = __dirname;
const OUT_DIR = path.join(HERE, 'exports');
const ANIM_DIR = path.join(OUT_DIR, 'anim');
const LAYOUTS = ['wide', 'square'];
const FPS = 30;
const GIF_W = 960;

function ff(args) { execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...args], { stdio: 'inherit' }); }

async function captureLayout(browser, layout, anim) {
  const name = `component-callouts-${layout}`;
  const page = await browser.newPage();
  try {
    await page.setViewport({ width: 1960, height: 1200, deviceScaleFactor: 2 });
    await page.goto('file://' + path.join(HERE, 'component-callouts.html') + `?layout=${layout}`,
      { waitUntil: 'networkidle2', timeout: 60000 });
    await page.evaluate(() => window.__ready); // fonts loaded + seg measured
    await page.evaluate(() => window.__stopAutoplay()); // freeze live loop → deterministic capture
    if (process.env.CALLOUT_BG) {
      await page.evaluate((bg) => document.getElementById('panel').style.background = bg, process.env.CALLOUT_BG);
    }
    await new Promise((r) => setTimeout(r, 300));
    const panel = await page.$('#panel');

    if (!anim) {
      await page.evaluate(() => window.setAnimFrame(0)); // rest pose
      const out = path.join(OUT_DIR, `${name}.png`);
      await panel.screenshot({ path: out, omitBackground: true });
      console.log(`  ✓ ${name}.png (transparent rounded corners) → exports/`);
      return;
    }

    // video is full-bleed: no rounded corners (those stay on the static PNG)
    await page.evaluate(() => document.getElementById('panel').style.borderRadius = '0');

    // ---- deterministic frame capture: t = i/frames so frame[frames] === frame[0] (clean loop) ----
    const loopMs = await page.evaluate(() => window.LOOP_MS);
    const frames = Math.round((loopMs / 1000) * FPS);
    const fdir = path.join(ANIM_DIR, `_frames_${name}`);
    fs.rmSync(fdir, { recursive: true, force: true });
    fs.mkdirSync(fdir, { recursive: true });
    for (let i = 0; i < frames; i++) {
      await page.evaluate((t) => window.setAnimFrame(t), i / frames);
      await panel.screenshot({ path: path.join(fdir, `f_${String(i).padStart(4, '0')}.png`) });
    }
    const glob = path.join(fdir, 'f_%04d.png');

    const mp4 = path.join(ANIM_DIR, `${name}.mp4`);
    ff(['-framerate', String(FPS), '-i', glob, '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2,format=yuv420p',
        '-c:v', 'libx264', '-crf', '18', '-movflags', '+faststart', mp4]);

    const pal = path.join(fdir, 'palette.png');
    ff(['-i', glob, '-vf', `scale=${GIF_W}:-1:flags=lanczos,palettegen=stats_mode=full`, pal]);
    const gif = path.join(ANIM_DIR, `${name}.gif`);
    ff(['-framerate', String(FPS), '-i', glob, '-i', pal,
        '-lavfi', `scale=${GIF_W}:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=3`,
        '-loop', '0', gif]);

    const apng = path.join(ANIM_DIR, `${name}.apng`);
    ff(['-framerate', String(FPS), '-i', glob, '-plays', '0', '-f', 'apng', apng]);

    fs.rmSync(fdir, { recursive: true, force: true });
    console.log(`  ✓ ${name} (${frames} frames @ ${FPS}fps, full-bleed) → mp4, gif, apng in exports/anim/`);
  } finally {
    await page.close();
  }
}

async function main() {
  const anim = process.argv.includes('--anim');
  const only = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  const layouts = only.length ? LAYOUTS.filter((l) => only.includes(l)) : LAYOUTS;
  fs.mkdirSync(anim ? ANIM_DIR : OUT_DIR, { recursive: true });

  const launchOpts = { headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox', '--force-color-profile=srgb'] };
  if (process.env.PUPPETEER_EXECUTABLE_PATH) launchOpts.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  const browser = await puppeteer.launch(launchOpts);
  try {
    for (const layout of layouts) await captureLayout(browser, layout, anim);
  } finally {
    await browser.close();
  }
}

main().catch((err) => { console.error('\ncapture-callouts failed:', err); process.exit(1); });
