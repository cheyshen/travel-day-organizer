#!/usr/bin/env node
/* ============================================================================
 * compose-triptych.js — Combine three flow recordings into ONE transparent video.
 *
 * Pure ffmpeg compositing (no browser screencast) — transparent VP9 webm output.
 * Shorter clips freeze on their last frame until the longest clip ends.
 * Bezels are canvas-drawn PNGs (same technique as capture-tap-flow.js).
 *
 * Two layouts: "wide" (1920×1080, three phones in a row — desktop) and
 * "stacked" (640×3312, vertical column — mobile).
 *
 * Input:  ./exports/flows/{calendar-browse,day-island-switch,checklist}.mp4
 * Output: ./exports/flows/in-action-triptych.{webm,mp4,gif}  (wide)
 *         ./exports/flows/in-action-stacked.{webm,mp4,gif}   (stacked)
 *         webm = transparent VP9 alpha; mp4 = solid warm-bg fallback
 *
 * Run:    PUPPETEER_EXECUTABLE_PATH=... node compose-triptych.js [wide|stacked]
 * ============================================================================ */
'use strict';
const fs   = require('fs');
const path = require('path');
const { execFileSync, execSync } = require('child_process');
const puppeteer = require('puppeteer');

const HERE      = __dirname;
const FLOWS_DIR = path.join(HERE, 'exports', 'flows');
const CLIPS     = ['calendar-browse', 'day-island-switch', 'checklist'];

// phone dimensions
const PW = 410, PH = 864;   // bezel outer
const SW = 390, SH = 844;   // screen inner (10px padding each side)
const GAP = 200;             // space between phones (both axes)

const LAYOUTS = {
  wide:    { name: 'in-action-triptych', W: 1920, H: 1080, dir: 'row',    gifW: 1440 },
  stacked: { name: 'in-action-stacked',  W: 640,  H: 3312, dir: 'column', gifW: 360  },
};

function ff(args) {
  execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...args], { stdio: 'inherit' });
}

function probeDur(file) {
  return parseFloat(
    execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${file}"`).toString().trim()
  );
}

/* ── Generate combined bezel + mask PNGs for all N phones ──────────────────── */
async function genFrames(browser, positions, canvasW, canvasH) {
  const bezelPath = path.join(HERE, '_tri_bezel.png');
  const maskPath  = path.join(HERE, '_tri_mask.png');

  const page = await browser.newPage();
  await page.setViewport({ width: canvasW, height: canvasH, deviceScaleFactor: 1 });

  // Build JS that draws all phone bezels at the given positions
  const drawBezels = positions.map(({ x, y }) => `
    ctx.fillStyle='#14181F';
    ctx.beginPath(); ctx.roundRect(${x},${y},${PW},${PH},44); ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,0.07)'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.roundRect(${x+0.75},${y+0.75},${PW-1.5},${PH-1.5},43.25); ctx.stroke();
    ctx.globalCompositeOperation='destination-out';
    ctx.fillStyle='rgba(255,255,255,1)';
    ctx.beginPath(); ctx.roundRect(${x+10},${y+10},${SW},${SH},34); ctx.fill();
    ctx.globalCompositeOperation='source-over';
  `).join('');

  const drawMasks = positions.map(({ x, y }) => `
    ctx.fillStyle='white';
    ctx.beginPath(); ctx.roundRect(${x},${y},${PW},${PH},44); ctx.fill();
  `).join('');

  for (const [drawCode, outPath, label] of [
    [drawBezels, bezelPath, 'triptych bezel'],
    [drawMasks,  maskPath,  'triptych mask'],
  ]) {
    const html = `<!doctype html><html><head>
<style>*{margin:0;padding:0;}body{background:transparent;}</style>
</head><body><canvas id="c" width="${canvasW}" height="${canvasH}"></canvas>
<script>
const c=document.getElementById('c'),ctx=c.getContext('2d');
${drawCode}
window.__done=true;
</script></body></html>`;
    const tmp = path.join(HERE, '_tmp_tri.html');
    fs.writeFileSync(tmp, html);
    await page.goto('file://' + tmp, { waitUntil: 'load' });
    await page.waitForFunction(() => window.__done);
    const canvas = await page.$('canvas');
    await canvas.screenshot({ path: outPath, omitBackground: true });
    fs.unlinkSync(tmp);
    console.log(`  ✓ ${label}`);
  }

  await page.close();
  return { bezelPath, maskPath };
}

/* ── Compute phone positions for a given layout ────────────────────────────── */
function phonePositions(L) {
  if (L.dir === 'row') {
    // phones side by side, centered vertically
    const totalW = CLIPS.length * PW + (CLIPS.length - 1) * GAP;
    const lx = Math.round((L.W - totalW) / 2);
    const ty = Math.round((L.H - PH) / 2);
    return CLIPS.map((_, i) => ({ x: lx + i * (PW + GAP), y: ty }));
  } else {
    // phones stacked, centered horizontally
    const totalH = CLIPS.length * PH + (CLIPS.length - 1) * GAP;
    const lx = Math.round((L.W - PW) / 2);
    const ty = Math.round((L.H - totalH) / 2);
    return CLIPS.map((_, i) => ({ x: lx, y: ty + i * (PH + GAP) }));
  }
}

/* ── Compose one layout ────────────────────────────────────────────────────── */
async function composeLayout(browser, L) {
  console.log(`\n▶ ${L.name} (${L.W}×${L.H})`);

  const inputs  = CLIPS.map((c) => path.join(FLOWS_DIR, `${c}.mp4`));
  const durs    = inputs.map(probeDur);
  const maxDur  = Math.max(...durs);
  const pos     = phonePositions(L);

  console.log(`  durations: ${durs.map((d, i) => `${CLIPS[i]}=${d.toFixed(2)}s`).join(', ')} → max=${maxDur.toFixed(2)}s`);

  const { bezelPath, maskPath } = await genFrames(browser, pos, L.W, L.H);

  // ── ffmpeg ────────────────────────────────────────────────────────────────
  // Inputs:
  //   [0] lavfi transparent canvas (L.W × L.H)
  //   [1] bezel PNG  (L.W × L.H, looped)
  //   [2] mask PNG   (L.W × L.H, looped)
  //   [3..5] three flow videos (390×844 each)
  //
  // Filter:
  //   • Pad shorter videos so all run to maxDur (freeze last frame)
  //   • Overlay screens onto transparent canvas at screen positions
  //   • Overlay combined bezel on top
  //   • alphamerge with combined mask to clip corners clean

  const filterParts = [];
  // transparent base → yuva420p
  filterParts.push(`[0:v]format=yuva420p[cf]`);

  // pad each video to maxDur
  const vLabels = [];
  CLIPS.forEach((_, i) => {
    const pad = maxDur - durs[i];
    const lbl = `v${i}`;
    vLabels.push(lbl);
    if (pad > 0.05) {
      filterParts.push(`[${3 + i}:v]tpad=stop_mode=clone:stop_duration=${pad.toFixed(3)}[${lbl}]`);
    } else {
      filterParts.push(`[${3 + i}:v]copy[${lbl}]`);
    }
  });

  // overlay each screen video at its position (screen = phone + 10px padding)
  let cur = 'cf';
  vLabels.forEach((lbl, i) => {
    const sx = pos[i].x + 10;
    const sy = pos[i].y + 10;
    const out = i < vLabels.length - 1 ? `o${i}` : 'oScreens';
    filterParts.push(`[${cur}][${lbl}]overlay=${sx}:${sy}[${out}]`);
    cur = out;
  });

  // overlay combined bezel, then alphamerge with mask
  filterParts.push(`[oScreens][1:v]overlay=0:0[oBezel]`);
  filterParts.push(`[oBezel][2:v]alphamerge[out]`);

  const webmOut     = path.join(FLOWS_DIR, `${L.name}.webm`);
  const mp4Out      = path.join(FLOWS_DIR, `${L.name}.mp4`);
  const webpOut     = path.join(FLOWS_DIR, `${L.name}.webp`);
  const apngOut     = path.join(FLOWS_DIR, `${L.name}.apng`);
  const lumakeyOut  = path.join(FLOWS_DIR, `${L.name}-lumakey.mp4`);

  // Common ffmpeg args: inputs + filter graph
  const ffBase = [
    '-f', 'lavfi', '-i', `color=c=black@0:size=${L.W}x${L.H}:rate=30:duration=${maxDur}`,
    '-loop', '1', '-i', bezelPath,
    '-loop', '1', '-i', maskPath,
    ...inputs.flatMap((f) => ['-i', f]),
    '-filter_complex', filterParts.join(';'),
    '-map', '[out]',
    '-t', String(maxDur),
  ];

  // Build two filter graphs — one for MP4 (yuv420p, warm-cream bg), one for APNG (rgba, transparent)
  // MP4: composite transparent phones over warm cream background before dropping alpha.
  // APNG: output rgba so transparent areas remain transparent.
  const filterMp4 = filterParts.join(';')
    + `;color=c=0xF5EEE6:size=${L.W}x${L.H}:r=30[bg]`
    + `;[bg][out]overlay=0:0,format=yuv420p,scale=trunc(iw/2)*2:trunc(ih/2)*2[vout]`;
  const filterApng = filterParts.join(';') + `;[out]fps=12,scale=${L.gifW}:-1:flags=lanczos,format=rgba[vout]`;

  // WebM (VP9, warm-bg, high quality — matches tap-flow.webm convention)
  // Note: transparent WebM (VP9 alpha) is broken on ffmpeg 4.4.2/libvpx 1.11.0 on this host;
  // use the .apng for true transparency.
  const filterWebm = filterParts.join(';')
    + `;color=c=0xF5EEE6:size=${L.W}x${L.H}:r=30[bg]`
    + `;[bg][out]overlay=0:0,format=yuv420p[vout]`;
  console.log('  encoding webm…');
  ff([
    '-f', 'lavfi', '-i', `color=c=black@0:size=${L.W}x${L.H}:rate=30:duration=${maxDur}`,
    '-loop', '1', '-i', bezelPath,
    '-loop', '1', '-i', maskPath,
    ...inputs.flatMap((f) => ['-i', f]),
    '-filter_complex', filterWebm,
    '-map', '[vout]',
    '-t', String(maxDur),
    '-c:v', 'libvpx-vp9', '-crf', '18', '-b:v', '0',
    webmOut,
  ]);

  // Solid warm-bg MP4 (full resolution, 30fps — for Elementor 16:9 containers)
  console.log('  encoding solid mp4…');
  ff([
    '-f', 'lavfi', '-i', `color=c=black@0:size=${L.W}x${L.H}:rate=30:duration=${maxDur}`,
    '-loop', '1', '-i', bezelPath,
    '-loop', '1', '-i', maskPath,
    ...inputs.flatMap((f) => ['-i', f]),
    '-filter_complex', filterMp4,
    '-map', '[vout]',
    '-t', String(maxDur),
    '-c:v', 'libx264', '-crf', '18', '-movflags', '+faststart',
    mp4Out,
  ]);

  // Animated WebP (transparent, 12fps). The alphamerge edge is only ~1px wide and
  // the canvas bezel is barely anti-aliased, so the rounded phone corners staircase
  // ("jagged / missing pixels" outline) — a lanczos downscale alone is NOT enough.
  // Fix: downscale to gifW (1440 for wide, = the embed's max-width) THEN feather the
  // ALPHA CHANNEL ONLY (alphaextract → gblur → alphamerge) into a smooth ~3px ramp,
  // leaving RGB crisp. sigma 1.3 reads smooth without looking soft.
  const filterWebp = filterParts.join(';')
    + `;[out]fps=12,scale=${L.gifW}:-1:flags=lanczos,format=rgba,split[wa][wb]`
    + `;[wa]alphaextract,gblur=sigma=1.3[wal];[wb][wal]alphamerge[vout]`;
  console.log('  encoding transparent webp…');
  ff([
    '-f', 'lavfi', '-i', `color=c=black@0:size=${L.W}x${L.H}:rate=30:duration=${maxDur}`,
    '-loop', '1', '-i', bezelPath,
    '-loop', '1', '-i', maskPath,
    ...inputs.flatMap((f) => ['-i', f]),
    '-filter_complex', filterWebp,
    '-map', '[vout]',
    '-t', String(maxDur),
    '-vcodec', 'libwebp_anim', '-lossless', '0', '-q:v', '85', '-compression_level', '6', '-loop', '0',
    webpOut,
  ]);

  // APNG (transparent — phones on clear background, gifW px wide, 12fps)
  // VP9 alpha is broken on ffmpeg 4.4.2/libvpx 1.11.0; APNG preserves alpha correctly.
  // 12fps × maxDur ≈ 100 frames at gifW px → ~8-15 MB — reasonable web asset size.
  console.log('  encoding transparent apng…');
  ff([
    '-f', 'lavfi', '-i', `color=c=black@0:size=${L.W}x${L.H}:rate=30:duration=${maxDur}`,
    '-loop', '1', '-i', bezelPath,
    '-loop', '1', '-i', maskPath,
    ...inputs.flatMap((f) => ['-i', f]),
    '-filter_complex', filterApng,
    '-map', '[vout]',
    '-t', String(maxDur),
    '-pix_fmt', 'rgba', '-f', 'apng', '-plays', '0',
    apngOut,
  ]);

  // Luma-key MP4: color (top half) + grayscale alpha mask (bottom half) stacked vertically.
  // A small canvas player composites them at display time → true transparency on any background.
  // Avoids the ffmpeg VP9 alpha encoding bug entirely.
  const filterLumakey = filterParts.join(';')
    // color track: phones on black (transparent areas → black, no cream bg)
    + `;color=c=black:size=${L.W}x${L.H}:r=30:d=${maxDur}[blk]`
    + `;[blk][out]overlay=0:0,format=yuv420p[colorTrack]`
    // mask track: white phone shapes on black background (maskPath = [2:v])
    + `;color=c=black:size=${L.W}x${L.H}:r=30:d=${maxDur}[blkBg]`
    + `;[blkBg][2:v]overlay=0:0,format=yuv420p[maskTrack]`
    // stack vertically → W × 2H
    + `;[colorTrack][maskTrack]vstack[vout]`;
  console.log('  encoding lumakey mp4…');
  ff([
    '-f', 'lavfi', '-i', `color=c=black@0:size=${L.W}x${L.H}:rate=30:duration=${maxDur}`,
    '-loop', '1', '-i', bezelPath,
    '-loop', '1', '-i', maskPath,
    ...inputs.flatMap((f) => ['-i', f]),
    '-filter_complex', filterLumakey,
    '-map', '[vout]',
    '-t', String(maxDur),
    '-c:v', 'libx264', '-crf', '18', '-movflags', '+faststart',
    lumakeyOut,
  ]);

  // GIF from solid mp4
  const pal = path.join(FLOWS_DIR, `_${L.name}_pal.png`);
  ff(['-i', mp4Out, '-vf', `fps=15,scale=${L.gifW}:-1:flags=lanczos,palettegen=stats_mode=full`, pal]);
  ff(['-i', mp4Out, '-i', pal,
    '-lavfi', `fps=15,scale=${L.gifW}:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=3`,
    '-loop', '0', path.join(FLOWS_DIR, `${L.name}.gif`)]);

  [pal, bezelPath, maskPath].forEach((f) => { try { fs.rmSync(f); } catch {} });

  const webmKB     = Math.round(fs.statSync(webmOut).size / 1024);
  const mp4KB      = Math.round(fs.statSync(mp4Out).size / 1024);
  const webpKB     = Math.round(fs.statSync(webpOut).size / 1024);
  const apngKB     = Math.round(fs.statSync(apngOut).size / 1024);
  const lumakeyKB  = Math.round(fs.statSync(lumakeyOut).size / 1024);
  console.log(`  ✓ ${L.name}.webm           ${maxDur.toFixed(1)}s  ${webmKB} KB  (VP9, warm-bg)`);
  console.log(`  ✓ ${L.name}.mp4            ${maxDur.toFixed(1)}s  ${mp4KB} KB  (H.264, warm-bg)`);
  console.log(`  ✓ ${L.name}.webp           ${maxDur.toFixed(1)}s  ${webpKB} KB  (transparent animated WebP, ${L.gifW}px)`);
  console.log(`  ✓ ${L.name}-lumakey.mp4   ${maxDur.toFixed(1)}s  ${lumakeyKB} KB  (transparent via canvas player)`);
  console.log(`  ✓ ${L.name}.apng           ${maxDur.toFixed(1)}s  ${apngKB} KB  (transparent APNG, ${L.gifW}px, 12fps)`);
  console.log(`  ✓ ${L.name}.gif`);
}

/* ── main ───────────────────────────────────────────────────────────────── */
async function main() {
  for (const c of CLIPS) {
    const f = path.join(FLOWS_DIR, `${c}.mp4`);
    if (!fs.existsSync(f)) { console.error(`missing: ${f} — run capture-flows.js first`); process.exit(1); }
  }

  const only    = process.argv.slice(2).filter((a) => LAYOUTS[a]);
  const layouts = only.length ? only.map((k) => LAYOUTS[k]) : Object.values(LAYOUTS);

  const launchOpts = {
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--force-color-profile=srgb'],
  };
  if (process.env.PUPPETEER_EXECUTABLE_PATH) launchOpts.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;

  const browser = await puppeteer.launch(launchOpts);
  try {
    for (const L of layouts) await composeLayout(browser, L);
  } finally {
    await browser.close();
  }
}

main().catch((err) => { console.error('\ncompose-triptych failed:', err); process.exit(1); });
