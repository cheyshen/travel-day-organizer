#!/usr/bin/env node
/* =============================================================================
 * capture-tap-flow.js — Detailed "full app tour + add event" interaction demo
 *
 * Flow (10 beats):
 *   Hero → scroll → Calendar → July 6 tooltip → Day timeline (Waimea day) →
 *   tap event → EventDetail → back → Status (tap checklist) → Day → + →
 *   EventEditor (Beach) → type title → Save → event in timeline
 *
 * Outputs:
 *   exports/flows/tap-flow.webm   transparent VP9 alpha (phone on clear bg; legacy)
 *   exports/flows/tap-flow.mp4    full-bleed OPAQUE 410×864 (round corners via CSS
 *                                 wrapper in the embed — smooth on every browser incl. iOS)
 *   exports/flows/tap-flow.gif    15fps GIF from the full-bleed mp4 (square-corner fallback)
 * ============================================================================ */
'use strict';
const fs   = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const puppeteer = require('puppeteer');

const HERE    = __dirname;
const OUT_DIR = path.join(HERE, 'exports', 'flows');
const APP_URL = 'http://192.168.1.198';
const CHROME  = process.env.PUPPETEER_EXECUTABLE_PATH;
const sleep   = ms => new Promise(r => setTimeout(r, ms));

function ff(args) {
  execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...args], { stdio: 'inherit' });
}

/* ── tap helpers ─────────────────────────────────────────────────────────── */
async function installHelpers(page) {
  await page.evaluate(() => {
    window.__ripple = (x, y) => {
      const d = document.createElement('div');
      d.style.cssText =
        `position:fixed;left:${x}px;top:${y}px;width:48px;height:48px;margin:-24px 0 0 -24px;` +
        'border-radius:50%;border:3px solid rgba(14,116,144,.9);background:rgba(14,116,144,.22);' +
        'pointer-events:none;z-index:99999;transform:scale(.35);opacity:1;' +
        'transition:transform .45s ease-out,opacity .45s ease-out;';
      document.body.appendChild(d);
      void d.offsetWidth;
      d.style.transform = 'scale(1.4)'; d.style.opacity = '0';
      setTimeout(() => d.remove(), 650);
    };
  });
}

async function tapEl(page, el, settle = 700) {
  await el.evaluate(e => {
    const r = e.getBoundingClientRect();
    if (r.top < 0 || r.bottom > window.innerHeight)
      e.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  await sleep(200);
  const box = await el.boundingBox();
  if (!box) throw new Error('tapEl: no bounding box');
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.evaluate((x, y) => window.__ripple(x, y), x, y);
  await sleep(130);
  await page.touchscreen.tap(x, y);
  await sleep(settle);
}

async function tapSel(page, sel, settle = 700) {
  const el = await page.waitForSelector(sel, { visible: true, timeout: 10000 });
  await tapEl(page, el, settle);
}

async function tapText(page, text, settle = 700) {
  const h = await page.evaluateHandle(t => {
    const els = [...document.querySelectorAll('button,span,div,label')];
    const hits = els.filter(e => e.textContent.trim() === t && e.offsetParent !== null);
    return hits[hits.length - 1] || null;
  }, text);
  const el = h.asElement();
  if (!el) throw new Error(`tapText: "${text}" not found`);
  await tapEl(page, el, settle);
}

async function tapDay(page, num, settle = 700) {
  const h = await page.evaluateHandle(n => {
    const btns = [...document.querySelectorAll('button')];
    return btns.find(b => b.textContent.trim() === String(n) && b.offsetParent !== null) || null;
  }, num);
  const el = h.asElement();
  if (!el) throw new Error(`tapDay: day ${num} not found`);
  await tapEl(page, el, settle);
}

/* Click via JS — bypasses Framer Motion drag sheet touch interception */
async function jsClick(page, selectorFn, settle = 800) {
  const pt = await page.evaluate(selectorFn);
  if (!pt) { console.log('  warn: jsClick target not found'); return; }
  await page.evaluate((x, y) => window.__ripple(x, y), pt.x, pt.y);
  await sleep(120);
  await page.evaluate(new Function('const fn = ' + selectorFn.toString() + '; const r = fn(); if (r && r.el) r.el.click();'));
  await sleep(settle);
}

/* ── 1. Generate bezel + mask PNGs ─────────────────────────────────────── */
async function genFrames(browser) {
  const bezelPath = path.join(HERE, '_bezel_frame.png');
  const maskPath  = path.join(HERE, '_phone_mask.png');

  const page = await browser.newPage();
  await page.setViewport({ width: 410, height: 864, deviceScaleFactor: 1 });

  // bezel: dark phone body + transparent screen hole + transparent outside corners
  const bezelHtml = `<!doctype html><html><head>
<style>*{margin:0;padding:0;}body{background:transparent;}</style>
</head><body><canvas id="c" width="410" height="864"></canvas>
<script>
const c=document.getElementById('c'), ctx=c.getContext('2d');
ctx.fillStyle='#14181F';
ctx.beginPath(); ctx.roundRect(0,0,410,864,44); ctx.fill();
ctx.strokeStyle='rgba(255,255,255,0.07)'; ctx.lineWidth=1.5;
ctx.beginPath(); ctx.roundRect(0.75,0.75,408.5,862.5,43.25); ctx.stroke();
ctx.globalCompositeOperation='destination-out';
ctx.fillStyle='rgba(255,255,255,1)';
ctx.beginPath(); ctx.roundRect(10,10,390,844,34); ctx.fill();
window.__done=true;
</script></body></html>`;

  // mask: white inside phone outer shape (44px radius) — used for alphamerge
  // so that screen video doesn't bleed through transparent bezel corners
  const maskHtml = `<!doctype html><html><head>
<style>*{margin:0;padding:0;}body{background:transparent;}</style>
</head><body><canvas id="c" width="410" height="864"></canvas>
<script>
const c=document.getElementById('c'), ctx=c.getContext('2d');
ctx.fillStyle='white';
ctx.beginPath(); ctx.roundRect(0,0,410,864,44); ctx.fill();
window.__done=true;
</script></body></html>`;

  for (const [html, outPath, label] of [
    [bezelHtml, bezelPath, 'bezel frame'],
    [maskHtml,  maskPath,  'phone mask'],
  ]) {
    const tmp = path.join(HERE, '_tmp_frame.html');
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

/* ── 2. Record the flow ─────────────────────────────────────────────────── */
async function recordFlow(browser) {
  const webmPath = path.join(OUT_DIR, '_tap-flow.webm');

  const ctx  = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto(APP_URL, { waitUntil: 'networkidle2', timeout: 60000 });
  await page.waitForSelector('button[aria-label="Add event"]', { visible: true, timeout: 20000 });
  await installHelpers(page);

  // No padding injection — content fills edge-to-edge like a real phone.
  // Just set html/body background to match the app base so headless Chrome's
  // transparent default doesn't bleed through at the edges.
  await page.evaluate(() => {
    document.documentElement.style.background = '#F0EDE8';
    document.body.style.background = '#F0EDE8';
  });

  await sleep(800);
  console.log('  starting screencast…');
  const recorder = await page.screencast({ path: webmPath });

  try {
    // beat 1: Hero — trip overview
    console.log('  beat 1: Hero');
    await sleep(1800);
    await page.evaluate(() => window.scrollBy({ top: 200, behavior: 'smooth' }));
    await sleep(1100); // show destination cards

    // beat 2: Calendar tab
    console.log('  beat 2: Calendar');
    await tapSel(page, 'button[aria-label="Plan"]', 1400);

    // beat 3: July 6 → tooltip (Waimea Canyon day)
    console.log('  beat 3: July 6 cell');
    await tapDay(page, 6, 1200);

    // beat 4: View Day → Day 3 timeline
    console.log('  beat 4: View Day');
    await tapText(page, 'View Day', 1400);
    await page.waitForFunction(
      () => /DAY \d+ OF/i.test(document.body.innerText), { timeout: 6000 }
    ).catch(() => {});

    // beat 5: tap Waimea Canyon Trail Details button → EventDetailView
    // IMPORTANT: use the "Details" button (onDetail → EventDetailView) NOT the card body
    // Card body calls onTap → handleEventTap → edit EventEditor (breaks later beats).
    // Must scroll the button into viewport first — tapEl uses boundingBox() for position
    // and events scrolled below viewport have y > viewportHeight → tap lands off-screen.
    console.log('  beat 5: event detail');
    const detailBtn = await page.waitForSelector(
      'button[aria-label="View details for Waimea Canyon Trail"]',
      { visible: true, timeout: 5000 }
    ).catch(() => null);
    // Tap the first Details button that's within the viewport — guarantees the ripple is visible.
    // hit.click() fires a native DOM click within React's event delegation chain (high-priority).
    // The EventDetailView back button is icon-only (<ArrowLeft>), no "Back to timeline" text —
    // detect navigation by looking for "Description" which is unique to EventDetailView.
    await page.evaluate(() => {
      const els = [...document.querySelectorAll('button')];
      const hit = els.find(e => {
        if (e.textContent.trim() !== 'Details') return false;
        if (e.offsetParent === null) return false;
        const r = e.getBoundingClientRect();
        return r.top >= 0 && r.top <= 844; // within viewport
      });
      if (!hit) return;
      const r = hit.getBoundingClientRect();
      window.__ripple(r.left + r.width / 2, r.top + r.height / 2);
      setTimeout(() => hit.click(), 130);
    });
    const detailOpened = await page.waitForFunction(
      () => document.body.innerText.includes('Description'), { timeout: 2500 }
    ).then(() => true).catch(() => false);
    console.log('  event detail opened:', detailOpened);
    if (detailOpened) await sleep(1200);

    // beat 6: back to timeline (Back button is icon-only, aria-label="Back")
    console.log('  beat 6: back to timeline');
    if (detailOpened) {
      await page.evaluate(() => {
        const btn = document.querySelector('button[aria-label="Back"]');
        if (btn) btn.click();
      });
      await sleep(700);
    }

    // beat 7: Status tab — checklist
    console.log('  beat 7: Status tab');
    await tapSel(page, 'button[aria-label="Status"]', 1400);

    // beat 8: tap a checklist item (complete or incomplete — always show interaction)
    console.log('  beat 8: tap checklist item');
    const checked = await page.evaluate(() => {
      // prefer incomplete → complete; fall back to already-done → toggle back
      const incomplete = [...document.querySelectorAll('button[aria-label="Mark complete"]')].find(b => b.offsetParent !== null);
      const complete   = [...document.querySelectorAll('button[aria-label="Mark incomplete"]')].find(b => b.offsetParent !== null);
      const first = incomplete || complete;
      if (!first) return false;
      const r = first.getBoundingClientRect();
      window.__ripple(r.left + r.width / 2, r.top + r.height / 2);
      setTimeout(() => first.click(), 130);
      return true;
    });
    await sleep(900);
    if (!checked) console.log('  warn: no checklist item found');

    // beat 9: back to Day tab
    console.log('  beat 9: Day tab');
    await tapSel(page, 'button[aria-label="Day"]', 1000);

    // beat 10: + → EventEditor (new event)
    console.log('  beat 10: Add event');
    await tapSel(page, 'button[aria-label="Add event"]', 1200);

    // beat 11: Beach type — target the EventEditor picker specifically, not the timeline
    // tapText('Beach') can hit a "Salt Pond Beach" badge in the timeline which calls handleEventTap
    // (edit mode) instead of setting the type on the new event. Use the picker button directly.
    console.log('  beat 11: Beach type');
    await page.evaluate(() => {
      // The type picker items each contain a short label as the ONLY text (no grandchildren text).
      // Find the one whose trimmed direct-text is "Beach" inside a grid of small tiles.
      const allEls = [...document.querySelectorAll('*')];
      // Look for elements with textContent === 'Beach' that are inside the new-event editor.
      // The new-event editor is the LAST overlay EventEditor in the DOM (rendered after DayTimeline).
      // Its type-picker options are motion.divs with a short label. We match by checking that the
      // element has no block-level child elements (just text + icon = leaf-ish node).
      const beachEls = allEls.filter(e => {
        if (e.textContent.trim() !== 'Beach') return false;
        if (e.offsetParent === null) return false;
        // Exclude elements where a child also has textContent 'Beach' (i.e. not the innermost match)
        const hasBeachChild = [...e.children].some(c => c.textContent.trim() === 'Beach');
        return !hasBeachChild;
      });
      const target = beachEls[beachEls.length - 1]; // last = in the EventEditor overlay
      if (!target) return;
      const r = target.getBoundingClientRect();
      window.__ripple(r.left + r.width / 2, r.top + r.height / 2);
      setTimeout(() => target.click(), 130);
    });
    await sleep(700);

    // beat 12: type title
    console.log('  beat 12: type title');
    await page.waitForSelector('input[placeholder="Event title"]', { visible: true, timeout: 5000 });
    await page.type('input[placeholder="Event title"]', 'Sunset Beach Walk', { delay: 55 });
    await sleep(300);

    // beat 13: Save
    console.log('  beat 13: Save');
    const saved = await page.evaluate(() => {
      const save = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Add Event');
      if (!save || save.disabled) {
        const dbg = [...document.querySelectorAll('button')].map(b => b.textContent.trim()).filter(t => t);
        console.warn('Add Event btn not found/disabled. Buttons:', JSON.stringify(dbg.slice(0,10)));
        return false;
      }
      const r = save.getBoundingClientRect();
      window.__ripple(r.left + r.width / 2, r.top + r.height / 2);
      setTimeout(() => save.click(), 130);
      return true;
    });
    console.log('  save clicked:', saved);
    await sleep(600);

    const appeared = await page.waitForFunction(
      () => document.body.innerText.includes('Sunset Beach Walk'), { timeout: 3000 }
    ).then(() => true).catch(() => false);
    console.log('  event appeared:', appeared);

    await sleep(2000); // hold — the payoff
  } catch (err) {
    console.error('  flow error:', err.message);
  }

  await recorder.stop();
  await ctx.close();
  console.log(`  webm size: ${(fs.statSync(webmPath).size / 1024).toFixed(0)} KB`);
  return webmPath;
}

/* ── 3. Composite + encode ─────────────────────────────────────────────── */
function composite(webmPath, bezelPath, maskPath) {
  const mp4Tmp  = path.join(OUT_DIR, '_tap-flow-1x.mp4');
  const webmOut = path.join(OUT_DIR, 'tap-flow.webm');  // transparent VP9
  const mp4Out  = path.join(OUT_DIR, 'tap-flow.mp4');   // solid bg fallback

  // step 1: webm → 1x mp4 (390×844) with regenerated timestamps
  ff(['-fflags', '+genpts', '-i', webmPath,
    '-vf', 'scale=390:844:flags=lanczos,format=yuv420p',
    '-c:v', 'libx264', '-crf', '18', '-movflags', '+faststart', mp4Tmp]);

  // step 2: probe duration from the fixed mp4
  let dur = parseFloat(
    execFileSync('ffprobe', ['-v','error','-show_entries','format=duration',
      '-of','default=noprint_wrappers=1:nokey=1', mp4Tmp]).toString().trim()
  );
  if (isNaN(dur) || dur < 1) {
    const frames = parseInt(execFileSync('ffprobe', ['-v','error','-select_streams','v:0',
      '-count_packets','-show_entries','stream=nb_read_packets',
      '-of','default=noprint_wrappers=1:nokey=1', mp4Tmp]).toString().trim(), 10);
    dur = frames / 30;
  }
  console.log(`  screen duration: ${dur.toFixed(1)}s`);

  // step 3a: transparent WebM (410×864, VP9 alpha)
  //   Layout: transparent 410×864 base → screen video at (10,10) → bezel on top →
  //           alphamerge with phone-shape mask (clips corners clean)
  console.log('  encoding transparent webm…');
  ff([
    '-f', 'lavfi', '-i',
      `color=c=black@0:size=410x864:rate=30:duration=${dur}`,  // [0] transparent base
    '-loop', '1', '-i', bezelPath,   // [1] bezel PNG (dark body + transparent holes)
    '-i', mp4Tmp,                    // [2] screen video (390×844)
    '-loop', '1', '-i', maskPath,   // [3] phone shape mask (white inside 44px rounded rect)
    '-filter_complex',
      '[0:v]format=yuva420p[bg];' +
      '[bg][2:v]overlay=10:10[m];' +       // place screen at (10,10) on transparent base
      '[m][1:v]overlay=0:0[c];' +          // bezel on top (its alpha clips the phone shape)
      '[c][3:v]alphamerge[out]',           // mask clips stray corner pixels clean
    '-map', '[out]',
    '-t', String(dur),
    '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p',
    '-auto-alt-ref', '0',
    '-crf', '18', '-b:v', '0',
    webmOut,
  ]);

  // step 3b: full-bleed OPAQUE MP4 (410×864, no alpha) for the case-study embed.
  //   The dark phone body (#14181F) fills the whole frame INCLUDING the corners,
  //   so the video has square outer corners. The embed rounds them with a CSS
  //   wrapper (border-radius + overflow:hidden), which the browser re-antialiases
  //   every frame → glass-smooth corners with no VP9-alpha edge staircase, and it
  //   plays on Safari/iOS (h264, no transparency). The page shows through the CSS cut.
  //   Layout: #14181F base → screen at (10,10) → bezel PNG on top (its transparent
  //   corners reveal the same #14181F base → seamless square rectangle).
  console.log('  encoding full-bleed opaque mp4 (CSS-rounded embed)…');
  ff([
    '-f', 'lavfi', '-i',
      `color=c=0x14181F:size=410x864:rate=30:duration=${dur}`,  // [0] dark body fills corners
    '-i', mp4Tmp,                    // [1] screen video (390×844)
    '-loop', '1', '-i', bezelPath,   // [2] bezel PNG (dark body + transparent screen hole/corners)
    '-filter_complex',
      '[0:v][1:v]overlay=10:10[m];[m][2:v]overlay=0:0[out]',
    '-map', '[out]',
    '-t', String(dur),
    '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    mp4Out,
  ]);

  // step 4: GIF from the full-bleed mp4 (15fps, native 410px wide — square corners,
  //   GIF can't carry the CSS rounding so it's a plain fallback/preview)
  const pal = path.join(OUT_DIR, '_tap-flow_pal.png');
  ff(['-i', mp4Out, '-vf', 'fps=15,scale=410:-1:flags=lanczos,palettegen=stats_mode=full', pal]);
  ff(['-i', mp4Out, '-i', pal,
    '-lavfi', 'fps=15,scale=410:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=3',
    '-loop', '0', path.join(OUT_DIR, 'tap-flow.gif')]);

  [pal, mp4Tmp, webmPath, bezelPath, maskPath].forEach(f => { try { fs.rmSync(f); } catch {} });
}

/* ── main ───────────────────────────────────────────────────────────────── */
async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const launchOpts = {
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--force-color-profile=srgb'],
  };
  if (CHROME) launchOpts.executablePath = CHROME;

  const browser = await puppeteer.launch(launchOpts);
  try {
    console.log('▶ tap-flow (detailed)');
    const { bezelPath, maskPath } = await genFrames(browser);
    const webmPath = await recordFlow(browser);

    const dur = execFileSync('ffprobe', ['-v','error','-show_entries','format=duration',
      '-of','default=noprint_wrappers=1:nokey=1', webmPath]).toString().trim();
    console.log(`  webm duration: ${parseFloat(dur).toFixed(1)}s`);

    console.log('  compositing…');
    composite(webmPath, bezelPath, maskPath);

    const webmStat = fs.statSync(path.join(OUT_DIR, 'tap-flow.webm'));
    const mp4Stat  = fs.statSync(path.join(OUT_DIR, 'tap-flow.mp4'));
    const dur2 = execFileSync('ffprobe', ['-v','error','-show_entries','format=duration',
      '-of','default=noprint_wrappers=1:nokey=1',
      path.join(OUT_DIR, 'tap-flow.mp4')]).toString().trim();
    console.log(`  ✓ tap-flow.webm  ${parseFloat(dur2).toFixed(1)}s  ${(webmStat.size/1024).toFixed(0)} KB  (transparent VP9, legacy)`);
    console.log(`  ✓ tap-flow.mp4   ${parseFloat(dur2).toFixed(1)}s  ${(mp4Stat.size/1024).toFixed(0)} KB  (full-bleed opaque, CSS-rounded embed)`);
    console.log(`  ✓ tap-flow.gif`);
  } finally {
    await browser.close();
  }
}

main().catch(err => { console.error('\nfailed:', err); process.exit(1); });
