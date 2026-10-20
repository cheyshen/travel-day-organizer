#!/usr/bin/env node
/* board-svg.js — Native (vector) build of the DESKTOP component board (board 1).
 * Output: exports/component-board.svg
 *
 * The desktop companion to board-2-svg.js: a hand-authored vector of the
 * 4-column desktop board in component-board.html. Every value mirrors the LIVE
 * product source + design tokens (colors.js / styles.js / TimeBlock.jsx / etc.)
 * — nothing is invented. The three photo cards (destination / event / highlight)
 * EMBED the real Unsplash photos as base64 <image> (user choice) with a brand
 * gradient underneath as the fetch-failure fallback.
 *
 * Run: PUPPETEER_EXECUTABLE_PATH is not needed (pure node fetch + string build).
 *      node board-svg.js
 */
const fs = require('fs');
const path = require('path');

/* ── design tokens (mirrored from src) ─────────────────────────────────────── */
const C = {
  surface: '#FFFFFF',
  ocean:   '#0E7490',
  textDark:'#1A1A1A',   // colors.textPrimary
  textMed: '#6B6B6B',   // colors.textSecondary
  textLight:'#9B9B9B',  // colors.textMuted
  sunset:  '#C05D10',   // WeatherIcon sunny
  amber:   '#B45309',   // WeatherIcon partly-cloudy
  info:    '#2B7A9E',   // WeatherIcon rain / colors.info
  danger:  '#C0392B',   // colors.danger
  dangerLight:'#FDECEA',// colors.dangerLight
  border:  '#E2E0DB',   // colors.border
  divider: '#F0EFEA',
  sand:    '#9E7C2E',
  sandLight:'#F5EDD8',
  infoLight:'#E0F1F8',
  kauaiTint:'#F9F0E6',  // sampleTrip Kauai accentLight
  mauiTint: '#E7F4F8',  // sampleTrip Maui accentLight
  kauaiDot:'#DB8F43',
  mauiDot: '#2AA5CB',
  warmSurf:'rgba(237,234,229,.5)',
  warmSurf40:'rgba(237,234,229,.4)',
  xBtnBg:  '#EDEAE5',
};
const FONT = "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

/* Unsplash photos — same URLs as component-board.html */
const PHOTOS = {
  dest:      'https://images.unsplash.com/photo-1505852679233-d9fd70aff56d?w=760&q=80&auto=format&fit=crop',
  event:     'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=760&h=300&fit=crop&auto=format',
  highlight: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=760&q=80',
};

/* lucide 24×24 path data — copied verbatim from component-board.html ICONS */
const ICONS = {
  beach:    '<path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>',
  clock:    '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  pencil:   '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>',
  trash:    '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  chev:     '<path d="m9 18 6-6-6-6"/>',
  check:    '<path d="M20 6 9 17l-5-5"/>',
  arrow:    '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  plus:     '<path d="M5 12h14"/><path d="M12 5v14"/>',
  upload:   '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>',
  plane:    '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
  building: '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>',
  x:        '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  sun:      '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  cloudsun: '<path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M15.947 12.65a4 4 0 0 0-5.925-4.128"/><path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z"/>',
  cloudrain:'<path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/>',
  mappin:   '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  sunrise:  '<path d="M12 2v8"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 18h2"/><path d="M20 18h2"/><path d="m19.07 10.93-1.41 1.41"/><path d="M22 22H2"/><path d="m8 6 4-4 4 4"/><path d="M16 18a4 4 0 0 0-8 0"/>',
};

/* ── SVG primitives ────────────────────────────────────────────────────────── */
const esc = (s) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
function rect(x, y, w, h, r, fill, extra = '') {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" ${extra}/>`;
}
/* baseline for a text line whose block top is `top`, given fontSize/lineHeight */
function baseAt(top, size, lh) { return top + (lh - size) / 2 + size * 0.74; }
function txt(x, baseline, size, weight, fill, str, extra = '') {
  return `<text x="${x}" y="${baseline}" font-size="${size}" font-weight="${weight}" fill="${fill}" ${extra}>${esc(str)}</text>`;
}
/* text vertically centered on the line `cy` — use whenever a label sits inline
   beside an icon so both share one optical middle (dominant-baseline central) */
function midtxt(x, cy, size, weight, fill, str, extra = '') {
  return `<text x="${x}" y="${cy}" font-size="${size}" font-weight="${weight}" fill="${fill}" dominant-baseline="central" ${extra}>${esc(str)}</text>`;
}
function ic(name, x, y, size, color, sw = 2) {
  return `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`;
}
/* object-fit:cover raster embed (base64 data-uri) */
function image(href, x, y, w, h) {
  return `<image href="${href}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice"/>`;
}
/* white card surface with the product shadow (0 6px 18px rgba(40,50,70,.08)) */
function surface(x, y, w, h, r, fill = '#FFFFFF', borderOpacity = 0.05) {
  const shadow  = `<rect x="${x}" y="${y + 6}" width="${w}" height="${h}" rx="${r}" fill="#283246" opacity="0.10" filter="url(#soft)"/>`;
  const stroke  = borderOpacity ? `stroke="#000000" stroke-opacity="${borderOpacity}" stroke-width="1"` : '';
  return shadow + rect(x, y, w, h, r, fill, stroke);
}

const W = 358;                    // product content width (390 viewport − 2×16)
const PAD = 40, COLGAP = 64, GAP = 32;   // desktop board spacing (component-board.html)
const COLX = i => PAD + i * (W + COLGAP);
const PANEL_W = 2 * PAD + 4 * W + 3 * COLGAP;   // 1704

/* ── column 1: plan the trip ───────────────────────────────────────────────── */

function destCard(x, y, photo) {
  const h = 144, r = 18;
  let s = `<clipPath id="cpDest"><rect x="${x}" y="${y}" width="${W}" height="${h}" rx="${r}"/></clipPath>`;
  s += `<rect x="${x}" y="${y+6}" width="${W}" height="${h}" rx="${r}" fill="#283246" opacity="0.10" filter="url(#soft)"/>`;
  s += `<g clip-path="url(#cpDest)">`;
  s += rect(x, y, W, h, r, 'url(#gDest)');
  if (photo) s += image(photo, x, y, W, h);
  s += rect(x, y, W, h, r, 'url(#scrimBottom)');
  s += `</g>`;
  // overlay bottom:14, flex-end (DestCard HeroView.jsx): title box 30/36, subtitle 15/20 (mt4)
  s += txt(x + 16, baseAt(y + h - 74, 30, 36), 30, 700, '#FFFFFF', 'Kauai', 'style="text-shadow:0 1px 10px rgba(0,0,0,.4)"');
  s += txt(x + 16, baseAt(y + h - 34, 15, 20), 15, 500, 'rgba(255,255,255,.92)', 'Jul 4 – Jul 8 · 4 days');
  s += ic('chev', x + W - 16 - 22, y + h - 14 - 22, 22, '#FFFFFF', 2);
  return { h, s };
}

/* EventDetailView DetailRow — helper/helper-600, divider lines, mono confirmation */
function detailsCard(x, y) {
  const r = 16, padH = 16, padV = 4;
  const rows = [['Time','6:50 AM',false],['Duration','5h 20m',false],['Place','Lihue (LIH)',false],['Confirmation','UA1947',true]];
  const parts = [];
  let cy = y + padV;
  rows.forEach(([k, v, mono], i) => {
    const base = baseAt(cy + 12, 15, 20);           // padding 12 top, line 20
    parts.push(txt(x + padH, base, 15, 500, C.textLight, k));
    parts.push(txt(x + W - padH, base, 15, 600, C.textDark, v,
      'text-anchor="end"' + (mono ? ` style="font-family:'SF Mono','Fira Code',monospace"` : '')));
    cy += 12 + 20 + 12;                              // row block = 44
    if (i < rows.length - 1)
      parts.push(`<line x1="${x + padH}" y1="${cy}" x2="${x + W - padH}" y2="${cy}" stroke="${C.divider}" stroke-width="1"/>`);
  });
  const h = (cy - y) + padV;
  return { h, s: surface(x, y, W, h, r) + parts.join('') };
}

function statTiles(x, y) {
  const h = 84, r = 16, gap = 12;
  const tw = (W - gap * 2) / 3;
  const data = [['9', 'Days'], ['38', 'Events'], ['2', 'Islands']];
  let s = '';
  data.forEach(([v, l], i) => {
    const tx = x + i * (tw + gap);
    s += surface(tx, y, tw, h, r);
    const cx = tx + tw / 2;
    s += txt(cx, baseAt(y + 16, 24, 30), 24, 700, C.textDark, v, 'text-anchor="middle"');
    s += txt(cx, baseAt(y + 16 + 30 + 2, 15, 20), 15, 500, C.textMed, l, 'text-anchor="middle"');
  });
  return { h, s };
}

/* CalendarView DayCard strip — non-trip / selected(Kauai) / Kauai / Maui×2 */
function calStrip(x, y) {
  const r = 20, pad = 12, gap = 4;
  const cw = (W - 2 * pad - 4 * gap) / 5;            // aspect 1:1 → cell height = cw
  const h = cw + 2 * pad;
  const CELLS = [
    { n:'3', bg:C.warmSurf40, w:500, color:C.textMed },
    { n:'4', bg:C.kauaiTint, w:700, color:C.textDark, border:C.ocean, dot:C.kauaiDot, round:true },
    { n:'5', bg:C.kauaiTint, w:700, color:C.textDark, dot:C.kauaiDot, round:true },
    { n:'8', bg:C.mauiTint,  w:700, color:C.textDark, dot:C.mauiDot,  round:false },
    { n:'9', bg:C.mauiTint,  w:700, color:C.textDark, dot:C.mauiDot,  round:false },
  ];
  let s = surface(x, y, W, h, r);
  const top = y + pad;
  CELLS.forEach((c, i) => {
    const cx = x + pad + i * (cw + gap);
    const bd = c.border ? `stroke="${c.border}" stroke-width="2.5"` : '';
    s += rect(cx, top, cw, cw, 8, c.bg, bd);
    s += txt(cx + cw / 2, baseAt(top + (cw - 20) / 2, 18, 20), 18, c.w, c.color, c.n, 'text-anchor="middle"');
    if (c.dot)
      s += rect(cx + cw - 3 - 5, top + cw - 3 - 5, 5, 5, c.round ? 2.5 : 1, c.dot, 'opacity="0.5"');
  });
  return { h, s };
}

/* ── column 2: the itinerary ───────────────────────────────────────────────── */

/* TimeBlock event card — radius.lg(16), image 125, badge bottom/left spacing.sm(8),
   content padding spacing.xl(24) + gap spacing.sm(8), Details helper(15)/600 */
function eventCard(x, y, photo) {
  const r = 16, photoH = 125, bodyPad = 24;
  const titleLH = 24, subLH = 22, textBlock = titleLH + 2 + subLH;   // 48
  const bodyH = bodyPad * 2 + textBlock;                              // 96
  const h = photoH + bodyH;
  let s = `<clipPath id="cpEvt"><rect x="${x}" y="${y}" width="${W}" height="${h}" rx="${r}"/></clipPath>`;
  s += surface(x, y, W, h, r, '#FFFFFF', 0);
  s += `<g clip-path="url(#cpEvt)">`;
  s += rect(x, y, W, photoH, 0, 'url(#gEvent)');
  if (photo) s += image(photo, x, y, W, photoH);
  s += `<rect x="${x}" y="${y + photoH - 60}" width="${W}" height="60" fill="url(#scrimEvent)"/>`;
  s += `</g>`;
  // type badge — bottom:8 left:8, dark glass pill, bare white icon
  const badgeH = 22, by = y + photoH - 8 - badgeH;
  s += rect(x + 8, by, 74, badgeH, 8, 'rgba(0,0,0,.6)');
  s += ic('beach', x + 8 + 10, by + (badgeH - 14) / 2, 14, '#FFFFFF', 2.5);
  s += midtxt(x + 8 + 10 + 14 + 6, by + badgeH / 2, 13, 600, '#FFFFFF', 'Beach', 'letter-spacing="0.01em"');
  // edit — top:8 right:8
  s += rect(x + W - 8 - 28, y + 8, 28, 28, 14, 'rgba(0,0,0,.35)');
  s += ic('pencil', x + W - 8 - 28 + 7.5, y + 8 + 7.5, 13, '#FFFFFF', 2);
  // content — text block + Details pill, both vertically centered (alignItems:center)
  const cTop = y + photoH + bodyPad;
  s += txt(x + bodyPad, baseAt(cTop, 18, titleLH), 18, 600, C.textDark, 'Poipu Beach');
  s += txt(x + bodyPad, baseAt(cTop + titleLH + 2, 16, subLH), 16, 500, C.textMed, 'Snorkel + sunbathe');
  const pillW = 102, pillH = 34, px = x + W - bodyPad - pillW, py = cTop + (textBlock - pillH) / 2;
  s += rect(px, py, pillW, pillH, 8, 'rgba(14,116,144,.12)');
  s += midtxt(px + 12, py + pillH / 2, 15, 600, C.ocean, 'Details');
  s += ic('chev', px + pillW - 10 - 16, py + (pillH - 16) / 2, 16, C.ocean, 2);
  return { h, s };
}

function bufferCard(x, y) {
  const r = 12, pad = 24;
  let cy = y + pad;
  const parts = [];
  parts.push(txt(x + pad, baseAt(cy, 15, 20), 15, 600, C.textMed, '11:15 AM – 12:00 PM'));
  cy += 20 + 6;
  parts.push(ic('clock', x + pad, cy + 2, 18, C.textMed, 2.5));
  parts.push(midtxt(x + pad + 18 + 8, cy + 11, 16, 600, C.textDark, '~45 min buffer'));
  cy += 22 + 6;
  parts.push(txt(x + pad, baseAt(cy, 16, 22), 16, 500, C.textMed, 'Deplane + baggage + rental car'));
  cy += 22;
  const h = (cy - y) + pad;
  return { h, s: rect(x, y, W, h, r, '#F6F8FC', 'stroke="#B6C2D1" stroke-width="1.5" stroke-dasharray="7 5"') + parts.join('') };
}

function highlightCard(x, y, photo) {
  const r = 16, imgH = 130, pad = 24;
  const parts = [];
  const bx = x + pad;
  let cy = y + imgH + pad;
  parts.push(txt(bx, baseAt(cy, 18, 24), 18, 600, C.textDark, 'Haleakala Sunrise'));
  cy += 24 + 8;
  const metaMid = cy + 1 + 6.5;                    // icon (13) center
  parts.push(ic('mappin', bx, cy + 1, 13, C.textMed, 2));
  let mx = bx + 13 + 6;
  parts.push(midtxt(mx, metaMid, 15, 500, C.textMed, 'Maui'));
  mx += 34;
  parts.push(midtxt(mx, metaMid, 15, 500, C.textLight, '·'));
  mx += 10;
  parts.push(ic('clock', mx, cy + 1, 13, C.textMed, 2));
  mx += 13 + 6;
  parts.push(midtxt(mx, metaMid, 15, 500, C.textMed, '5:30 AM – 7:30 AM'));
  cy += 18 + 8;
  parts.push(txt(bx, baseAt(cy, 16, 22), 16, 500, C.textMed, 'Watch the sunrise from 10,023 feet'));
  cy += 22;
  parts.push(txt(bx, baseAt(cy, 16, 22), 16, 500, C.textMed, "above Maui's dormant volcano crater."));
  cy += 22;
  const h = (cy - y) + pad;
  let out = surface(x, y, W, h, r, '#FFFFFF', 0);
  out += `<clipPath id="cpHlTop"><path d="M${x+r},${y} h${W-2*r} a${r},${r} 0 0 1 ${r},${r} v${imgH-r} h${-W} v${-(imgH-r)} a${r},${r} 0 0 1 ${r},${-r} z"/></clipPath>`;
  out += `<g clip-path="url(#cpHlTop)">`;
  out += rect(x, y, W, imgH, 0, 'url(#gHighlight)');
  if (photo) out += image(photo, x, y, W, imgH);
  out += rect(x, y, W, imgH, 0, 'url(#scrimHighlight)');
  out += `</g>`;
  const pillH = 24, pillBot = y + imgH - 10, epy = pillBot - pillH;
  const eLabelW = 60, ePillW = 10 + 14 + 6 + eLabelW + 10;
  out += rect(x + 12, epy, ePillW, pillH, 8, 'rgba(0,0,0,.6)');
  out += ic('sunrise', x + 12 + 10, epy + (pillH - 14) / 2, 14, '#FFFFFF', 2);
  out += midtxt(x + 12 + 10 + 14 + 6, epy + pillH / 2, 13, 600, '#FFFFFF', 'Highlight');
  const dLabelW = 40, dPillW = 8 + 11 + 4 + dLabelW + 8, dpx = x + W - 12 - dPillW;
  out += rect(dpx, epy, dPillW, pillH, 12, 'rgba(255,255,255,.2)', 'stroke="rgba(255,255,255,.3)" stroke-width="1"');
  out += ic('clock', dpx + 8, epy + (pillH - 11) / 2, 11, '#FFFFFF', 2);
  out += midtxt(dpx + 8 + 11 + 4, epy + pillH / 2, 13, 500, '#FFFFFF', 'Day 8');
  out += parts.join('');
  return { h, s: out };
}

/* ── column 3: the day ─────────────────────────────────────────────────────── */

function dayHeader(x, y) {
  const r = 16, pad = 16;
  const cx = x + W / 2;
  let cy = y + pad;
  const parts = [];
  parts.push(txt(cx, baseAt(cy, 13, 16), 13, 600, C.textMed, 'DAY 1 OF 9', 'text-anchor="middle" letter-spacing="0.05em"'));
  cy += 16 + 4;
  parts.push(txt(cx, baseAt(cy, 24, 30), 24, 700, C.textDark, 'Saturday, July 4', 'text-anchor="middle"'));
  cy += 30 + 4;
  parts.push(midtxt(cx - 12, cy + 10, 15, 500, C.textMed, 'Chicago', 'text-anchor="end"'));
  parts.push(ic('arrow', cx - 7, cy + (20 - 14) / 2, 14, C.textLight, 2.2));
  parts.push(midtxt(cx + 12, cy + 10, 15, 500, C.textMed, 'Kauai'));
  cy += 20;
  const h = (cy - y) + pad;
  return { h, s: surface(x, y, W, h, r, C.kauaiTint) + parts.join('') };
}

function weatherCard(x, y) {
  const r = 16, pad = 24;
  const parts = [];
  let cy = y + pad;
  parts.push(txt(x + pad, baseAt(cy, 18, 24), 18, 600, C.textDark, 'Weather Forecast'));
  parts.push(txt(x + W - pad, baseAt(cy, 15, 20), 15, 500, C.textLight, 'Swipe to browse', 'text-anchor="end"'));
  cy += 24 + 12;
  const inputH = 40, btnW = 118;
  const inW = W - 2 * pad - 8 - btnW;
  parts.push(rect(x + pad, cy, inW, inputH, 10, 'rgba(0,0,0,0.04)', 'stroke="#000000" stroke-opacity="0.14" stroke-width="1"'));
  parts.push(txt(x + pad + 12, baseAt(cy, 16, inputH) + 2, 16, 500, C.textLight, 'Zip code for weather'));
  const btnX = x + W - pad - btnW;
  parts.push(rect(btnX, cy, btnW, inputH, 10, C.ocean));
  parts.push(txt(btnX + btnW / 2, baseAt(cy, 15, inputH) + 2, 15, 600, '#FFFFFF', 'Get Weather', 'text-anchor="middle"'));
  cy += inputH + 14;
  /* one chip per trip day (9, Jul 4–12); the strip clips so the last chip peeks */
  const DAYS = [
    ['SAT', '4', 'sun', C.sunset, '82°'], ['SUN', '5', 'cloudsun', C.amber, '79°'],
    ['MON', '6', 'sun', C.sunset, '81°'], ['TUE', '7', 'cloudrain', C.info, '77°'],
    ['WED', '8', 'sun', C.sunset, '80°'], ['THU', '9', 'cloudsun', C.amber, '78°'],
    ['FRI', '10', 'sun', C.sunset, '83°'], ['SAT', '11', 'cloudsun', C.amber, '81°'],
    ['SUN', '12', 'sun', C.sunset, '82°'],
  ];
  /* chip vertical rhythm mirrors the LIVE product chip (measured off .198):
     10 top pad · DOW box 19.5 + 3 · NUM box 24 + 5 · icon 20 + 4 · TEMP box 24 · 8 bottom pad = 117.5.
     TEMP sits in a 24px line box (not 16) so it clears the icon with the same
     gap the product shows — a tight 16px box was pinning it to the icon. */
  const chipW = 56, chipGap = 10, chipH = 118, stripW = W - 2 * pad;
  const chips = [];
  let chx = x + pad;
  for (const [dow, num, icon, color, temp] of DAYS) {
    let chy = cy + 10;
    chips.push(rect(chx, cy, chipW, chipH, 14, 'rgba(0,0,0,0.03)'));
    const ccx = chx + chipW / 2;
    chips.push(txt(ccx, baseAt(chy, 13, 19.5), 13, 600, C.textMed, dow, 'text-anchor="middle" letter-spacing="0.06em"'));
    chy += 19.5 + 3;
    chips.push(txt(ccx, baseAt(chy, 18, 24), 18, 700, C.textDark, num, 'text-anchor="middle"'));
    chy += 24 + 5;
    chips.push(ic(icon, ccx - 10, chy, 20, color, 1.5));
    chy += 20 + 4;
    chips.push(txt(ccx, baseAt(chy, 16, 24), 16, 600, C.textDark, temp, 'text-anchor="middle"'));
    chx += chipW + chipGap;
  }
  parts.push(`<clipPath id="cpWx"><rect x="${x + pad}" y="${cy}" width="${stripW}" height="${chipH}"/></clipPath>`);
  parts.push(`<g clip-path="url(#cpWx)">${chips.join('')}</g>`);
  cy += chipH + 4;
  const h = (cy - y) + pad;
  return { h, s: surface(x, y, W, h, r) + parts.join('') };
}

function checklistRow(x, y, done, id) {
  const r = 12, h = 40 + 12 * 2;
  const parts = [];
  const cyc = y + h / 2;
  const box = 22, boxX = x + 16, boxY = cyc - box / 2;
  if (done) {
    parts.push(rect(boxX, boxY, box, box, 6, C.ocean));
    parts.push(ic('check', boxX + (box - 13) / 2, boxY + (box - 13) / 2, 13, '#FFFFFF', 3));
  } else {
    parts.push(rect(boxX, boxY, box, box, 6, 'none', 'stroke="#0E7490" stroke-opacity="0.25" stroke-width="3"'));
  }
  const tcol = done ? C.textLight : C.textDark;
  parts.push(midtxt(boxX + box + 12, cyc, 16, 500, tcol,
    'Pack sunscreen', done ? 'text-decoration="line-through"' : ''));
  const aw = 40, e2x = x + W - 16 - aw, e1x = e2x - 4 - aw, ay = cyc - aw / 2;
  parts.push(rect(e1x, ay, aw, aw, 10, 'rgba(255,255,255,.5)'));
  parts.push(ic('pencil', e1x + (aw - 14) / 2, ay + (aw - 14) / 2, 14, C.textLight, 2));
  parts.push(rect(e2x, ay, aw, aw, 10, C.dangerLight));
  parts.push(ic('trash', e2x + (aw - 14) / 2, ay + (aw - 14) / 2, 14, C.danger, 2));
  return { h, s: surface(x, y, W, h, r) + parts.join('') };
}

/* ── column 4: status & feedback ───────────────────────────────────────────── */

function progressCard(x, y) {
  const r = 16, pad = 16;
  const parts = [];
  let cy = y + pad;
  parts.push(txt(x + pad, baseAt(cy, 24, 30), 24, 700, C.textDark, 'Checklist'));
  const pillW = 74, pillH = 36, ppx = x + W - pad - pillW;
  parts.push(rect(ppx, cy - 3, pillW, pillH, 18, C.ocean));
  parts.push(ic('plus', ppx + 16, cy - 3 + (pillH - 14) / 2, 14, '#FFFFFF', 2.5));
  parts.push(midtxt(ppx + 16 + 14 + 4, cy - 3 + pillH / 2, 15, 600, '#FFFFFF', 'Add'));
  cy += 30 + 8;
  const barW = W - 2 * pad - 40, barY = cy + 6;
  parts.push(rect(x + pad, barY, barW, 6, 3, 'rgba(14,116,144,.12)'));
  parts.push(rect(x + pad, barY, barW * 0.625, 6, 3, C.ocean));
  parts.push(txt(x + W - pad, baseAt(cy, 13, 16), 13, 600, C.textMed, '5/8', 'text-anchor="end" letter-spacing="0.05em"'));
  cy += 16;
  const h = (cy - y) + pad;
  return { h, s: surface(x, y, W, h, r) + parts.join('') };
}

function docPair(x, y) {
  const gap = 12, cw = (W - gap) / 2, prevH = 100, r = 12, bodyPad = 24;
  const lineH = 16, labelSlotH = lineH * 2, sizeH = 28;
  const DOCS = [
    ['plane',    C.info, C.infoLight, 'HA 17 Boarding.pdf', ['BOARDING PASS'],          '1.2 MB'],
    ['building', C.sand, C.sandLight, 'Andaz Maui.pdf',     ['HOTEL', 'CONFIRMATION'],  '0.8 MB'],
  ];
  const innerW    = cw - 2 * bodyPad;
  const nameTop0  = prevH + bodyPad;
  const labelTop0 = nameTop0 + 22 + 4;
  const sizeTop0  = labelTop0 + labelSlotH + 4;
  const ch = sizeTop0 + sizeH + bodyPad;
  let h = ch, s = '';
  DOCS.forEach(([icon, color, bg, name, labelLines, size], i) => {
    const cx = x + i * (cw + gap);
    const nameTop = y + nameTop0, labelTop = y + labelTop0, sizeTop = y + sizeTop0;
    s += surface(cx, y, cw, ch, r, '#FFFFFF', 0);
    s += `<clipPath id="cpDoc${i}"><path d="M${cx+r},${y} h${cw-2*r} a${r},${r} 0 0 1 ${r},${r} v${prevH-r} h${-cw} v${-(prevH-r)} a${r},${r} 0 0 1 ${r},${-r} z"/></clipPath>`;
    s += `<g clip-path="url(#cpDoc${i})">${rect(cx, y, cw, prevH, 0, bg)}</g>`;
    s += ic(icon, cx + cw / 2 - 16, y + (prevH - 32) / 2, 32, color, 1.5);
    s += `<clipPath id="cpN${i}"><rect x="${cx + bodyPad}" y="${nameTop}" width="${innerW}" height="22"/></clipPath>`;
    s += `<g clip-path="url(#cpN${i})">${txt(cx + bodyPad, baseAt(nameTop, 16, 22), 16, 500, C.textDark, name)}</g>`;
    labelLines.forEach((ln, k) => {
      s += txt(cx + bodyPad, baseAt(labelTop + k * lineH, 13, lineH), 13, 600, C.textLight, ln, 'letter-spacing="0.05em"');
    });
    const delSz = 28, delX = cx + cw - bodyPad - delSz, delY = sizeTop;
    s += midtxt(cx + bodyPad, sizeTop + sizeH / 2, 13, 600, C.textLight, '· ' + size, 'letter-spacing="0.05em"');
    s += rect(delX, delY, delSz, delSz, 6, C.dangerLight);
    s += ic('trash', delX + 8, delY + 8, 12, C.danger, 2);
  });
  return { h, s };
}

/* DocumentUploader sheet fragment — header + dashed dropzone + real inline error */
function uploaderCard(x, y) {
  const r = 16, sidePad = 16;
  const parts = [];
  // header — content height 36 (X button), pad 8 top / 12 bottom
  const headTop = y + 8, headH = 36, headMid = headTop + headH / 2;
  parts.push(midtxt(x + sidePad, headMid, 18, 600, C.textDark, 'Upload Document'));
  const xb = 36, xbx = x + W - sidePad - xb;
  parts.push(rect(xbx, headTop, xb, xb, 18, C.xBtnBg));
  parts.push(ic('x', xbx + (xb - 18) / 2, headTop + (xb - 18) / 2, 18, C.textMed, 2));
  let cy = headTop + headH + 12;
  parts.push(`<line x1="${x}" y1="${cy}" x2="${x + W}" y2="${cy}" stroke="${C.border}" stroke-width="1"/>`);
  cy += 16;                                          // body padding
  // dropzone — padding 24, dashed border, centered upload icon + two lines
  const dzX = x + sidePad, dzW = W - 2 * sidePad, dzPad = 24;
  const dzH = dzPad + 32 + 8 + 22 + 4 + 16 + dzPad;  // icon 32 / line 22 / caption 16
  parts.push(rect(dzX, cy, dzW, dzH, 12, C.warmSurf, `stroke="${C.border}" stroke-width="2" stroke-dasharray="6 4"`));
  const mid = x + W / 2;
  let ty = cy + dzPad;
  parts.push(ic('upload', mid - 16, ty, 32, C.textLight, 1.5));
  ty += 32 + 8;
  parts.push(txt(mid, baseAt(ty, 16, 22), 16, 500, C.textMed, 'Tap to select file', 'text-anchor="middle"'));
  ty += 22 + 4;
  parts.push(txt(mid, baseAt(ty, 13, 16), 13, 600, C.textLight, 'IMAGES OR PDF · MAX 2 MB', 'text-anchor="middle" letter-spacing="0.05em"'));
  cy += dzH + 16;
  // inline error box
  const errH = 8 + 20 + 8;
  parts.push(rect(dzX, cy, dzW, errH, 8, C.dangerLight));
  parts.push(txt(dzX + 12, baseAt(cy + 8, 15, 20), 15, 500, C.danger, 'File too large (3.2 MB). Maximum is 2 MB.'));
  cy += errH + 16;
  const h = cy - y;
  return { h, s: surface(x, y, W, h, r) + parts.join('') };
}

function deleteConfirm(x, y) {
  const r = 12, pad = 16;
  const parts = [];
  const cx = x + W / 2;
  let cy = y + pad;
  parts.push(txt(cx, baseAt(cy, 16, 22), 16, 500, C.danger, 'Delete "Sunset Sail"?', 'text-anchor="middle"'));
  cy += 22 + 12;
  const btnH = 44, gap = 12, bw = (W - 2 * pad - gap) / 2;
  const b1x = x + pad, b2x = b1x + bw + gap;
  parts.push(rect(b1x, cy, bw, btnH, 8, '#FFFFFF', `stroke="${C.border}" stroke-width="1"`));
  parts.push(txt(b1x + bw / 2, baseAt(cy, 15, btnH), 15, 500, C.textMed, 'Cancel', 'text-anchor="middle"'));
  parts.push(rect(b2x, cy, bw, btnH, 8, C.danger));
  parts.push(txt(b2x + bw / 2, baseAt(cy, 15, btnH), 15, 600, '#FFFFFF', 'Delete', 'text-anchor="middle"'));
  cy += btnH;
  const h = (cy - y) + pad;
  const shadow = `<rect x="${x}" y="${y + 6}" width="${W}" height="${h}" rx="${r}" fill="#283246" opacity="0.10" filter="url(#soft)"/>`;
  return { h, s: shadow + rect(x, y, W, h, r, C.dangerLight) + parts.join('') };
}

/* ── fetch photos, then assemble 4 top-aligned columns ─────────────────────── */
async function fetchDataUri(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const buf = Buffer.from(await res.arrayBuffer());
    const type = res.headers.get('content-type') || 'image/jpeg';
    return `data:${type};base64,${buf.toString('base64')}`;
  } catch (e) {
    console.warn(`  ! photo fetch failed (${url.slice(0, 46)}…): ${e.message} — gradient fallback`);
    return null;
  }
}

function column(makers, x) {
  let y = PAD, body = '';
  for (const make of makers) { const { h, s } = make(x, y); body += s; y += h + GAP; }
  return { body, bottom: y - GAP };
}

async function main() {
  const [pDest, pEvent, pHigh] = await Promise.all([
    fetchDataUri(PHOTOS.dest), fetchDataUri(PHOTOS.event), fetchDataUri(PHOTOS.highlight),
  ]);

  const COLS = [
    [(x, y) => destCard(x, y, pDest), detailsCard, statTiles, calStrip],
    [(x, y) => eventCard(x, y, pEvent), bufferCard, (x, y) => highlightCard(x, y, pHigh)],
    [dayHeader, weatherCard, (x, y) => checklistRow(x, y, false), (x, y) => checklistRow(x, y, true)],
    [progressCard, docPair, uploaderCard, deleteConfirm],
  ];
  const cols = COLS.map((makers, i) => column(makers, COLX(i)));
  const PANEL_H = Math.max(...cols.map(c => c.bottom)) + PAD;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${PANEL_W}" height="${PANEL_H}" viewBox="0 0 ${PANEL_W} ${PANEL_H}">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@500;600;700&amp;display=swap');
      text { font-family: ${FONT}; }
    </style>
    <filter id="soft" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="7"/></filter>
    <linearGradient id="gDest" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0A8F8F"/><stop offset="1" stop-color="#064E4E"/></linearGradient>
    <linearGradient id="gEvent" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0891B2"/><stop offset="1" stop-color="#67E8F9"/></linearGradient>
    <linearGradient id="gHighlight" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F0A868"/><stop offset="1" stop-color="#8A3D0A"/></linearGradient>
    <linearGradient id="scrimBottom" x1="0" y1="0" x2="0" y2="1"><stop offset="0.38" stop-color="#000000" stop-opacity="0"/><stop offset="1" stop-color="#000000" stop-opacity="0.62"/></linearGradient>
    <linearGradient id="scrimEvent" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000000" stop-opacity="0"/><stop offset="1" stop-color="#000000" stop-opacity="0.5"/></linearGradient>
    <linearGradient id="scrimHighlight" x1="0" y1="0" x2="0" y2="1"><stop offset="0.3" stop-color="#1C1917" stop-opacity="0"/><stop offset="1" stop-color="#1C1917" stop-opacity="0.75"/></linearGradient>
  </defs>
  ${cols.map(c => c.body).join('\n  ')}
</svg>
`;

  const OUT = path.join(__dirname, 'exports', 'component-board.svg');
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, svg);
  const kb = (Buffer.byteLength(svg) / 1024).toFixed(0);
  console.log(`  ✓ component-board.svg → exports/  (${PANEL_W}×${PANEL_H}, ${kb}KB)`);
}

main().catch((err) => { console.error('\nboard-svg failed:', err); process.exit(1); });
