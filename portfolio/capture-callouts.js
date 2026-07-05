#!/usr/bin/env node
/* ============================================================================
 * capture-callouts.js — Annotated component-callout panel (portfolio shot).
 *
 * Static (default): screenshots the rounded dark panel in
 * component-callouts.html with omitBackground so the corners export
 * transparent — the panel drops onto any case-study background as-is.
 *
 * --anim: steps the panel's deterministic loop (setAnimFrame(t), t = 0…1 —
 * only the live components move: Now-marker radar pulse + sticker bob) one
 * screenshot per frame, then encodes MP4 + GIF (flattened onto the case-study
 * grey) and APNG (true alpha, rounded corners preserved).
 *
 * Output: ./exports/component-callouts.png                    (2160×2160)
 *         ./exports/anim/component-callouts.{mp4,gif,apng}    (--anim, square)
 * Run:    PUPPETEER_EXECUTABLE_PATH=... node capture-callouts.js [--anim]
 *         CALLOUT_BG=#14181F node capture-callouts.js   (panel color override)
 * ========================================================================== */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const puppeteer = require('puppeteer');

const HERE = __dirname;
const OUT_PNG = path.join(HERE, 'exports', 'component-callouts.png');
const ANIM_DIR = path.join(HERE, 'exports', 'anim');
const FPS = 30;
const GIF_W = 960;
const PAGE_GREY = '0xF9F9F9'; // user's portfolio page bg — flatten target for MP4/GIF corners

function ff(args) { execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...args], { stdio: 'inherit' }); }
function probeSize(file) {
  const out = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height', '-of', 'csv=p=0:s=x', file]).toString().trim();
  const [w, h] = out.split('x').map(Number);
  return { w, h };
}

async function main() {
  const anim = process.argv.includes('--anim');
  fs.mkdirSync(anim ? ANIM_DIR : path.dirname(OUT_PNG), { recursive: true });

  const launchOpts = { headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox', '--force-color-profile=srgb'] };
  if (process.env.PUPPETEER_EXECUTABLE_PATH) launchOpts.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  const browser = await puppeteer.launch(launchOpts);
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1120, height: 1120, deviceScaleFactor: 2 });
    await page.goto('file://' + path.join(HERE, 'component-callouts.html'), { waitUntil: 'networkidle2', timeout: 60000 });
    await page.evaluate(() => window.__ready); // fonts loaded
    await page.evaluate(() => window.__stopAutoplay()); // freeze live loop → deterministic capture
    if (process.env.CALLOUT_BG) {
      await page.evaluate((bg) => document.getElementById('panel').style.background = bg, process.env.CALLOUT_BG);
    }
    await new Promise((r) => setTimeout(r, 300));
    const panel = await page.$('#panel');

    if (!anim) {
      await page.evaluate(() => window.setAnimFrame(0)); // rest pose
      await panel.screenshot({ path: OUT_PNG, omitBackground: true });
      console.log(`✓ component-callouts.png (2160×2160, transparent corners) → ${OUT_PNG}`);
      return;
    }

    // ---- deterministic frame capture: t = i/frames so frame[frames] === frame[0] (clean loop) ----
    const loopMs = await page.evaluate(() => window.LOOP_MS);
    const frames = Math.round((loopMs / 1000) * FPS);
    const fdir = path.join(ANIM_DIR, '_frames_component-callouts');
    fs.rmSync(fdir, { recursive: true, force: true });
    fs.mkdirSync(fdir, { recursive: true });
    for (let i = 0; i < frames; i++) {
      await page.evaluate((t) => window.setAnimFrame(t), i / frames);
      await panel.screenshot({ path: path.join(fdir, `f_${String(i).padStart(4, '0')}.png`), omitBackground: true });
    }

    const rawGlob = path.join(fdir, 'f_%04d.png');
    const { w, h } = probeSize(path.join(fdir, 'f_0000.png'));

    // flatten transparent corners onto the case-study grey for MP4/GIF (APNG keeps alpha)
    const flatGlob = path.join(fdir, 'flat_%04d.png');
    ff(['-i', rawGlob, '-f', 'lavfi', '-i', `color=c=${PAGE_GREY}:s=${w}x${h}`,
        '-filter_complex', '[1:v][0:v]overlay=shortest=1[v]', '-map', '[v]', flatGlob]);

    const mp4 = path.join(ANIM_DIR, 'component-callouts.mp4');
    ff(['-framerate', String(FPS), '-i', flatGlob, '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2,format=yuv420p',
        '-c:v', 'libx264', '-crf', '18', '-movflags', '+faststart', mp4]);

    const pal = path.join(fdir, 'palette.png');
    ff(['-i', flatGlob, '-vf', `scale=${GIF_W}:-1:flags=lanczos,palettegen=stats_mode=full`, pal]);
    const gif = path.join(ANIM_DIR, 'component-callouts.gif');
    ff(['-framerate', String(FPS), '-i', flatGlob, '-i', pal,
        '-lavfi', `scale=${GIF_W}:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=3`,
        '-loop', '0', gif]);

    const apng = path.join(ANIM_DIR, 'component-callouts.apng');
    ff(['-framerate', String(FPS), '-i', rawGlob, '-plays', '0', '-f', 'apng', apng]);

    fs.rmSync(fdir, { recursive: true, force: true });
    console.log(`✓ component-callouts anim (${frames} frames @ ${FPS}fps, ${w}x${h}) → mp4, gif, apng in ${ANIM_DIR}`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => { console.error('\ncapture-callouts failed:', err); process.exit(1); });
