#!/usr/bin/env node
/* ============================================================================
 * compose-triptych-up.js — Crisp, frame-filling, TRANSPARENT in-action triptych.
 *
 * Two layouts:
 *   • row      → phones side by side (desktop)  → in-action-triptych-up.webp
 *   • stacked  → phones in a column  (mobile)   → in-action-triptych-up-stacked.webp
 *
 * Key techniques (see memory portfolio-triptych-crisp):
 *   • CRISP EDGES — bezel + silhouette drawn on a 2× canvas, downscaled once
 *     (clean anti-aliased corners). No gblur feather.
 *   • FILLS THE SHAPE — tight GAP + slim MARGIN; screens render at NATIVE 390px.
 *   • NO SHADOW — a semi-transparent shadow shimmers/crawls in an animated webp;
 *     phones are flat like the original ?v=2.
 *   • TRANSPARENT — ffmpeg `overlay` flattens the base to opaque, so we composite
 *     RGB opaque then re-apply alpha via alphamerge with a silhouette mask. And
 *     ffmpeg 4.4.2 libwebp_anim can't do lossy+alpha, so we export RGBA frames and
 *     assemble with libwebp's `img2webp` (lossy+alpha) → transparent AND small.
 *   • ALL THREE ANIMATE — clips are -stream_loop -1 so shorter ones replay to fill
 *     maxDur instead of freezing.
 *
 * Input:  ./exports/flows/{calendar-browse,day-island-switch,checklist}.mp4  (390×844)
 * Run:    PUPPETEER_EXECUTABLE_PATH=... node compose-triptych-up.js [row|stacked|both]
 *         (default: row)
 * ============================================================================ */
'use strict';
const fs   = require('fs');
const path = require('path');
const { execFileSync, execSync } = require('child_process');
const puppeteer = require('puppeteer');

const HERE      = __dirname;
const FLOWS_DIR = path.join(HERE, 'exports', 'flows');
const CLIPS     = ['calendar-browse', 'day-island-switch', 'checklist'];

// ── geometry (final/1× px) ─────────────────────────────────────────────────
const SW = 390, SH = 844;      // screen inner = native source video size
const PAD = 10;                 // bezel thickness around the screen
const PW = SW + PAD * 2;        // 410  phone outer width
const PH = SH + PAD * 2;        // 864  phone outer height
const R_OUT = 46, R_IN = 34;    // bezel outer / screen-cutout corner radius
const GAP = 64;                 // space between phones
const MARGIN = 32;              // slim uniform margin
const SS = 2;                   // supersample factor for the 2× bezel/silhouette render

const FPS = 12;
const BG  = '0xF5EEE6';         // warm cream for the solid mp4 fallback

const LAYOUTS = {
  row:     { name: 'in-action-triptych-up',         dir: 'row' },
  stacked: { name: 'in-action-triptych-up-stacked', dir: 'column' },
};

function ff(args) {
  execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...args], { stdio: 'inherit' });
}
function probeDur(file) {
  return parseFloat(execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${file}"`).toString().trim());
}

/* ── layout geometry: canvas size + per-phone top-left positions ────────────── */
function geom(dir) {
  if (dir === 'row') {
    const W = PW * 3 + GAP * 2 + MARGIN * 2;
    const H = PH + MARGIN * 2;
    return { W, H, pos: CLIPS.map((_, i) => ({ x: MARGIN + i * (PW + GAP), y: MARGIN })) };
  }
  const W = PW + MARGIN * 2;
  const H = PH * 3 + GAP * 2 + MARGIN * 2;
  return { W, H, pos: CLIPS.map((_, i) => ({ x: MARGIN, y: MARGIN + i * (PH + GAP) })) };
}

const RR = `function rr(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}`;

/* ── Render a canvas PNG at 2× then downscale to W×H (crisp AA). ────────────── */
async function renderCanvas(browser, W, H, body, outPath, { transparent }) {
  const big = outPath.replace(/\.png$/, '_2x.png');
  const page = await browser.newPage();
  await page.setViewport({ width: W * SS, height: H * SS, deviceScaleFactor: 1 });
  const html = `<!doctype html><html><head><style>*{margin:0;padding:0}body{background:transparent}</style></head>
<body><canvas id="c" width="${W * SS}" height="${H * SS}"></canvas>
<script>const c=document.getElementById('c'),ctx=c.getContext('2d');${RR}
${body}
window.__done=true;</script></body></html>`;
  const tmp = outPath.replace(/\.png$/, '.html');
  fs.writeFileSync(tmp, html);
  await page.goto('file://' + tmp, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__done);
  await (await page.$('canvas')).screenshot({ path: big, omitBackground: !!transparent });
  fs.unlinkSync(tmp);
  await page.close();
  ff(['-i', big, '-vf', `scale=${W}:${H}:flags=lanczos`, outPath]);
  fs.rmSync(big);
  return outPath;
}

/* Silhouette alpha mask: filled phone bodies (R_OUT), white on black. */
async function genSilhouette(browser, W, H, pos) {
  const draw = `ctx.fillStyle='#000';ctx.fillRect(0,0,${W * SS},${H * SS});`
    + pos.map(({ x, y }) => `ctx.fillStyle='#fff';rr(${x * SS},${y * SS},${PW * SS},${PH * SS},${R_OUT * SS});ctx.fill();`).join('');
  const out = await renderCanvas(browser, W, H, draw, path.join(HERE, '_up_sil.png'), { transparent: false });
  console.log('  ✓ silhouette alpha mask');
  return out;
}

/* Bezel: opaque dark bodies + faint edge highlight + transparent screen holes. */
async function genBezel(browser, W, H, pos) {
  const draw = pos.map(({ x, y }) => `
    ctx.fillStyle='#14181F'; rr(${x * SS},${y * SS},${PW * SS},${PH * SS},${R_OUT * SS}); ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,0.07)'; ctx.lineWidth=${1.5 * SS};
    rr(${x * SS + 0.75 * SS},${y * SS + 0.75 * SS},${PW * SS - 1.5 * SS},${PH * SS - 1.5 * SS},${(R_OUT - 0.75) * SS}); ctx.stroke();
    ctx.globalCompositeOperation='destination-out'; ctx.fillStyle='#000';
    rr(${(x + PAD) * SS},${(y + PAD) * SS},${SW * SS},${SH * SS},${R_IN * SS}); ctx.fill();
    ctx.globalCompositeOperation='source-over';
  `).join('');
  const out = await renderCanvas(browser, W, H, draw, path.join(HERE, '_up_bezel.png'), { transparent: true });
  console.log('  ✓ bezel (2×-SS → downscaled)');
  return out;
}

/* ── Compose one layout end to end. ────────────────────────────────────────── */
async function composeLayout(browser, L, inputs, durs, maxDur) {
  const { W, H, pos } = geom(L.dir);
  console.log(`\n▶ ${L.name} (${W}×${H}, ${L.dir})`);

  const bezelPath = await genBezel(browser, W, H, pos);
  const silPath   = await genSilhouette(browser, W, H, pos);

  // [0]=base, [1]=bezel, [2]=silhouette, [3..5]=clips (each -stream_loop -1).
  const buildCore = () => {
    const parts = ['[0:v]format=yuva420p[cf]'];
    CLIPS.forEach((_, i) => parts.push(`[${3 + i}:v]format=yuva420p[p${i}]`));
    let cur = 'cf';
    CLIPS.forEach((_, i) => {
      const out = `o${i}`;
      parts.push(`[${cur}][p${i}]overlay=${pos[i].x + PAD}:${pos[i].y + PAD}[${out}]`);
      cur = out;
    });
    parts.push(`[${cur}][1:v]overlay=0:0[rgb]`);   // bezel on top (opaque RGB)
    parts.push(`[2:v]format=gray[sil]`);           // silhouette → alpha plane
    parts.push(`[rgb][sil]alphamerge[comp]`);      // re-apply true alpha
    return parts.join(';');
  };

  const base = [
    '-f', 'lavfi', '-i', `color=c=black@0:size=${W}x${H}:rate=30:duration=${maxDur}`,
    '-loop', '1', '-i', bezelPath,
    '-loop', '1', '-i', silPath,
    ...inputs.flatMap((f) => ['-stream_loop', '-1', '-i', f]),
  ];

  // ── transparent animated WebP via exported frames + img2webp (lossy+alpha) ──
  const webpOut   = path.join(FLOWS_DIR, `${L.name}.webp`);
  const framesDir = path.join(FLOWS_DIR, `_frames_${L.dir}`);
  fs.rmSync(framesDir, { recursive: true, force: true });
  fs.mkdirSync(framesDir);
  console.log('  exporting transparent frames…');
  ff([...base, '-filter_complex', buildCore() + `;[comp]fps=${FPS},format=rgba[vout]`,
    '-map', '[vout]', '-t', String(maxDur), path.join(framesDir, 'f%04d.png')]);
  const frameFiles = fs.readdirSync(framesDir).filter((f) => f.endsWith('.png')).sort()
    .map((f) => path.join(framesDir, f));
  console.log(`  assembling webp via img2webp (${frameFiles.length} frames, lossy+alpha)…`);
  execFileSync('img2webp',
    ['-loop', '0', '-lossy', '-q', '80', '-m', '6', '-d', String(Math.round(1000 / FPS)),
      ...frameFiles, '-o', webpOut], { stdio: 'inherit' });
  fs.rmSync(framesDir, { recursive: true, force: true });

  // ── solid warm-bg mp4 fallback ──────────────────────────────────────────────
  const mp4Out = path.join(FLOWS_DIR, `${L.name}.mp4`);
  const filterMp4 = buildCore()
    + `;color=c=${BG}:size=${W}x${H}:r=30[bg];[bg][comp]overlay=0:0,format=yuv420p,scale=trunc(iw/2)*2:trunc(ih/2)*2[vout]`;
  console.log('  encoding solid mp4…');
  ff([...base, '-filter_complex', filterMp4, '-map', '[vout]', '-t', String(maxDur),
    '-c:v', 'libx264', '-crf', '18', '-movflags', '+faststart', mp4Out]);

  try { fs.rmSync(bezelPath); fs.rmSync(silPath); } catch {}

  const kb = (f) => Math.round(fs.statSync(f).size / 1024);
  console.log(`  ✓ ${L.name}.webp  ${W}×${H}  ${maxDur.toFixed(1)}s  ${FPS}fps  ${kb(webpOut)} KB  (transparent)`);
  console.log(`  ✓ ${L.name}.mp4   ${W}×${H}  ${kb(mp4Out)} KB  (solid fallback)`);
}

async function main() {
  for (const c of CLIPS) {
    const f = path.join(FLOWS_DIR, `${c}.mp4`);
    if (!fs.existsSync(f)) { console.error(`missing: ${f} — run capture-flows.js first`); process.exit(1); }
  }

  const req = process.argv.slice(2);
  const keys = req.includes('both') ? ['row', 'stacked']
    : req.filter((a) => LAYOUTS[a]);
  const layouts = (keys.length ? keys : ['row']).map((k) => LAYOUTS[k]);

  const inputs = CLIPS.map((c) => path.join(FLOWS_DIR, `${c}.mp4`));
  const durs   = inputs.map(probeDur);
  const maxDur = Math.max(...durs);
  console.log(`durations: ${durs.map((d, i) => `${CLIPS[i]}=${d.toFixed(2)}s`).join(', ')} → max=${maxDur.toFixed(2)}s`);

  const launchOpts = { headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox', '--force-color-profile=srgb'] };
  if (process.env.PUPPETEER_EXECUTABLE_PATH) launchOpts.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  const browser = await puppeteer.launch(launchOpts);
  try {
    for (const L of layouts) await composeLayout(browser, L, inputs, durs, maxDur);
  } finally {
    await browser.close();
  }
}

main().catch((err) => { console.error('\ncompose-triptych-up failed:', err); process.exit(1); });
