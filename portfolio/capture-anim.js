#!/usr/bin/env node
/* ============================================================================
 * capture-anim.js — Animated portfolio exports for the Travel design system.
 *
 * Loads animations.html and steps each motion deterministically via
 * window.setAnimFrame(name, t) for t = 0 … 1, screenshotting one PNG per frame.
 * Frames are then encoded with ffmpeg to MP4 + GIF (and APNG for transparent
 * stages, which preserves the alpha channel).
 *
 * Output: ./exports/anim/<name>.{mp4,gif,apng}
 *
 * Requires: ffmpeg + ffprobe on PATH (this box has 4.4.2).
 * Run:  npm run capture-anim
 * ========================================================================== */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const puppeteer = require('puppeteer');

const DSF = 2;                                   // 2× is plenty for video and keeps GIF/MP4 sizes sane
const HERE = __dirname;
const PAGE_URL = 'file://' + path.join(HERE, 'animations.html');
const OUT_DIR = path.join(HERE, 'exports', 'anim');
const GLOSSY = '0xF0EDE8';                        // flatten transparent frames onto this for MP4/GIF

const ANIMS = [
  { id: 'anim-now-marker',      name: 'now-marker',      durMs: 2400, fps: 30, transparent: true,  gifW: 720 },
  { id: 'anim-card-press',      name: 'card-press',      durMs: 2000, fps: 30, transparent: false, gifW: 560 },
  { id: 'anim-page-transition', name: 'page-transition', durMs: 2600, fps: 30, transparent: false, gifW: 560 },
  { id: 'anim-icon-cascade',    name: 'icon-cascade',    durMs: 3000, fps: 30, transparent: true,  gifW: 720 },
  { id: 'anim-icon-select',     name: 'icon-select',     durMs: 2400, fps: 30, transparent: false, gifW: 640 },
  { id: 'anim-nav-cycle',       name: 'nav-cycle',       durMs: 3600, fps: 30, transparent: false, gifW: 600 },
];

function ff(args) { execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...args], { stdio: 'inherit' }); }
function probeSize(file) {
  const out = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height', '-of', 'csv=p=0:s=x', file]).toString().trim();
  const [w, h] = out.split('x').map(Number);
  return { w, h };
}
function haveFfmpeg() {
  try { execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' }); execFileSync('ffprobe', ['-version'], { stdio: 'ignore' }); return true; }
  catch { return false; }
}

async function main() {
  if (!haveFfmpeg()) {
    console.error('ffmpeg/ffprobe not found on PATH. Install ffmpeg, then re-run `npm run capture-anim`.');
    process.exit(1);
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const launchOpts = { headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox', '--force-color-profile=srgb'] };
  if (process.env.PUPPETEER_EXECUTABLE_PATH) launchOpts.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;

  const browser = await puppeteer.launch(launchOpts);
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1100, height: 760, deviceScaleFactor: DSF });
    await page.goto(PAGE_URL, { waitUntil: 'networkidle2', timeout: 60000 });
    await page.evaluate(() => window.__animReady);
    await page.evaluate(() => window.__stopAutoplay && window.__stopAutoplay()); // freeze live loop → deterministic capture

    // optional CLI filter: `node capture-anim.js nav-cycle` renders just that clip
    const only = process.argv[2];
    const list = only ? ANIMS.filter(a => a.name === only) : ANIMS;
    if (only && list.length === 0) { console.error(`no anim named "${only}"`); process.exit(1); }

    for (const a of list) {
      const el = await page.$('#' + a.id);
      if (!el) { console.error(`  ✗ missing #${a.id} — skipped`); continue; }

      const frames = Math.round((a.durMs / 1000) * a.fps);
      const fdir = path.join(OUT_DIR, `_frames_${a.name}`);
      fs.rmSync(fdir, { recursive: true, force: true });
      fs.mkdirSync(fdir, { recursive: true });

      // ---- deterministic frame capture: t = i/frames so frame[frames] === frame[0] (clean loop) ----
      for (let i = 0; i < frames; i++) {
        const t = i / frames;
        await page.evaluate((name, tt) => window.setAnimFrame(name, tt), a.name, t);
        await el.screenshot({ path: path.join(fdir, `f_${String(i).padStart(4, '0')}.png`), omitBackground: a.transparent });
      }

      const rawGlob = path.join(fdir, 'f_%04d.png');
      const { w, h } = probeSize(path.join(fdir, 'f_0000.png'));

      // ---- flatten transparent frames onto the warm bg for MP4/GIF (APNG keeps the alpha) ----
      let colorGlob = rawGlob;
      if (a.transparent) {
        const flatPng = path.join(fdir, 'flat_%04d.png');
        ff(['-i', rawGlob, '-f', 'lavfi', '-i', `color=c=${GLOSSY}:s=${w}x${h}`,
            '-filter_complex', '[1:v][0:v]overlay=shortest=1[v]', '-map', '[v]', flatPng]);
        colorGlob = flatPng;
      }

      const even = 'scale=trunc(iw/2)*2:trunc(ih/2)*2';

      // ---- MP4 (H.264, loop-friendly) ----
      const mp4 = path.join(OUT_DIR, `${a.name}.mp4`);
      ff(['-framerate', String(a.fps), '-i', colorGlob, '-vf', `${even},format=yuv420p`,
          '-c:v', 'libx264', '-crf', '18', '-movflags', '+faststart', mp4]);

      // ---- GIF (two-pass palette for quality, scaled to gifW) ----
      const pal = path.join(fdir, 'palette.png');
      ff(['-i', colorGlob, '-vf', `scale=${a.gifW}:-1:flags=lanczos,palettegen=stats_mode=full`, pal]);
      const gif = path.join(OUT_DIR, `${a.name}.gif`);
      ff(['-framerate', String(a.fps), '-i', colorGlob, '-i', pal,
          '-lavfi', `scale=${a.gifW}:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=3`,
          '-loop', '0', gif]);

      const outs = ['mp4', 'gif'];

      // ---- APNG (transparent only — true alpha) ----
      if (a.transparent) {
        const apng = path.join(OUT_DIR, `${a.name}.apng`);
        ff(['-framerate', String(a.fps), '-i', rawGlob, '-plays', '0', '-f', 'apng', apng]);
        outs.push('apng');
      }

      fs.rmSync(fdir, { recursive: true, force: true });
      console.log(`  ✓ ${a.name}  (${frames} frames @ ${a.fps}fps, ${w}x${h}) → ${outs.join(', ')}`);
    }

    console.log(`\nDone → ${OUT_DIR}`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => { console.error('\ncapture-anim failed:', err); process.exit(1); });
