# Portfolio Export Catalog

The canonical reference for every portfolio artifact: what it shows, where it
comes from, and how to regenerate it after a design change. **Update this file
whenever an export is added or its composition changes.**

All exports are served for download at **http://192.168.1.122:8080/** (systemd
unit `portfolio-http.service`, docroot = this directory).

Regeneration always runs from this directory with:

```bash
cd ~/apps/travel/portfolio
export PUPPETEER_EXECUTABLE_PATH=~/.cache/puppeteer/chrome/linux-148.0.7778.97/chrome-linux64/chrome
```

---

## Component exports (dark-slate panels)

### 1. Component callouts — annotated atoms

The reference-style annotated strip: small components with thin leader lines up
to labels. **Two layouts**, both regenerated every run.

| | |
|---|---|
| Source | `component-callouts.html` (`?layout=wide` / `?layout=square`) |
| Regenerate | `node capture-callouts.js` (statics) + `node capture-callouts.js --anim` (videos) — append `wide` or `square` to do one layout |
| Static | `exports/component-callouts-wide.png` (3840×2000) · `exports/component-callouts-square.png` (2160×2160) — rounded 48px corners transparent, panel solid `#141C28` |
| Video (solid) | `exports/anim/component-callouts-{wide,square}.{mp4,gif,apng}` — full-bleed, panel baked solid `#141C28` |
| Video (translucent) | `node capture-callouts.js --anim --translucent` → `exports/anim/component-callouts-{wide,square}-translucent.{apng,webm}` — panel at the real nav glass `rgba(20,28,40,.88)`, **true alpha**. WebM = `<video>` (Chrome/Firefox, not Safari); APNG = `<img>` (all browsers) |

**Shows:** Event-type sticker (Sunrise), Island switcher (Kauai active), Live
"Now" marker, Add event button. Wide = one row of 4 (desktop); square = 2×2
grid with equal-width cells so columns align (mobile).

**Animation** (4.8s loop, deterministic `setAnimFrame(t)`): every component
takes a turn — sticker bob (t .04–.32) → island switch round-trip via sliding
highlight pill (.40–.68) → button press (.74–.87) — while the Now radar pulse
runs continuously (1200ms ping cadence). The live page autoplays the same loop.

### 2. Component board — card-level pieces

The unlabeled companion: bigger components arranged as three top-aligned
columns, items centered per column. Static only.

| | |
|---|---|
| Source | `component-board.html` |
| Regenerate | `node capture-board.js` |
| Static | `exports/component-board.png` (3840×2160) — **full-bleed, no rounded corners**; background is **transparent by default** (the page supplies the panel color) — bake one with `BOARD_BG=#1F2937` |

**Fidelity:** every component renders at its true product width (390 viewport
→ 358px content; document cards = 173px two-up grid) with values mirrored from
source tokens (spacing/radius/type ramp/cleanCard). When product styling
changes, update the matching builder.

**Shows** (no overlap with the callouts panel), four columns: destination card
(Kauai) · details card · stat tiles (9/38/2) · calendar day-cell strip
(non-trip / selected / Kauai / Maui variants) ‖ event card (Poipu Beach) ·
buffer card · trip highlight card (Haleakala Sunrise, Maui) ‖ day header on
Kauai tint · **full Weather Forecast section** (header, zip input + Get
Weather CTA, **9-day chip strip Jul 4–12** — clips at the row edge so the last
chip peeks, the "Swipe to browse" scroll affordance) · checklist row in both
states (unchecked / checked) ‖ **status & feedback:** Checklist header (title
24/700, Add pill, 5/8 progress bar) · document card pair (boarding pass +
hotel — UPPERCASE caption label on its own line, size + trash on a dedicated
bottom row for breathing room, matched pair via a 2-line label min-height) ·
uploader sheet fragment with its real inline error ("File too large (3.2 MB).
Maximum is 2 MB.") · inline delete confirmation (Cancel / Delete — sample
event title "Sunset Sail", swappable in `deleteConfirm()`).

### Conventions (decided 2026-07-05)

- **Panel color:** `#141C28` — the product bottom-nav base color (`glass.nav`
  is `rgba(20,28,40,0.88)`). Default exports bake it SOLID (the .88 alpha
  flattens lighter on the page grey); the `--translucent` variant keeps the
  real alpha. Override per run with `CALLOUT_BG=` / `BOARD_BG=`. The board
  default is fully transparent.
- **Videos are full-bleed** (no rounded corners); rounded+transparent corners
  are only on the callouts static PNGs. The board static is full-bleed too.
- **Portfolio page background is `#F9F9F9`** — used as the corner-flatten color
  wherever an MP4/GIF needs one.
- **On-dark adaptations** (portfolio-only, product untouched): sticker gloss
  toned `.25 → .10`; Now-marker teal `#0E7490 → #22B8D4`; switcher track
  `rgba(255,255,255,.10)`; "NOW" label white.
- Components mirror product source (`ChecklistItemRow.jsx`, `DayCard.jsx`,
  `StatusView.jsx`, `DayTimelineView.jsx` day header, …) — when the product
  changes, update the builder in the HTML file, re-run, and note it here.
- Labels: DM Sans 600/16 (project font; within the 500/600/700 weight system).

### 3. Component board — mobile, native vector (SVG)

A **vector** build of the mobile 2-column board (not a puppeteer raster):
hand-authored `<rect>`/`<text>`/`<path>`. Now at **full component parity with the
desktop board** — same 14 cards (added details card, calendar strip, uploader)
and the three photo cards **embed the real Unsplash photos as base64 `<image>`**
(matching `board-svg.js`), with the brand gradient underneath as the fetch-failure
fallback.

| | |
|---|---|
| Source | `board-2-svg.js` (generator) |
| Regenerate | `node board-2-svg.js` (needs internet — fetches + base64-embeds the 3 photos each run) |
| Output | `exports/component-board-2.svg` (804×1415, transparent, ~360KB) |

**Fidelity is derived straight from live `src/`, not the HTML builder** (which
had drifted): tokens from `colors.js`/`styles.js`; the **Weather Forecast** card
mirrors `HeroView.jsx` (815–982) incl. the real `WeatherIcon` token colors
(sunny=`sunset` #C05D10, partly-cloudy=`amber` #B45309, rain=`info` #2B7A9E).
The chip strip renders **one chip per trip day** (9, Jul 4–12 — the product maps
`tripDates`) and clips at the card edge so the last chip peeks, like the
product's `overflowX` scroll ("Swipe to browse"). **Document cards** use the live
`DocumentCard` padding `spacing.xl`(24); the caption is **UPPERCASE** (product
`typography.caption` is `textTransform:uppercase`) and, since "HOTEL
CONFIRMATION" (178px) is wider than the 173px card, the label **wraps to ≤2
lines** (a matched 2-line slot keeps the pair aligned) with the size + trash on a
dedicated bottom row — a showcase cleanup of the product's genuinely cramped
`space-between` wrap where line 1 butts against the trash. **Highlight** eyebrow
is the real dark blur pill with sentence-case "Highlight" (13/600) + `body`(16)
description. When product styling changes, update the matching card fn in
`board-2-svg.js` and re-run.

**Verify:** load the `.svg` in Chrome and screenshot (no CLI rasterizer on the
box) — `PUPPETEER_EXECUTABLE_PATH=… node -e` a `page.goto('file://…svg')`.

### 4. Component board — desktop, native vector (SVG)

The **vector** build of the DESKTOP 4-column board (companion to `board-2-svg.js`)
— the SVG twin of `component-board.png`. Unlike the mobile SVG, the three photo
cards **embed the real Unsplash photos as base64 `<image>`** (user choice, chosen
over gradient fallbacks) with the brand gradient underneath as the fetch-failure
fallback.

| | |
|---|---|
| Source | `board-svg.js` (generator) |
| Regenerate | `node board-svg.js` (needs internet — fetches + base64-embeds the 3 photos each run; no puppeteer) |
| Output | `exports/component-board.svg` (1704×880, transparent, ~360KB) |

**Fidelity** is derived from live `src/` + the desktop layout in
`component-board.html` (4 cols, col gap 64, item gap 32). Cards mirror the same
builders/tokens as the mobile SVG, PLUS three desktop-only cards: **details card**
(EventDetailView DetailRow — label/value rows + `#F0EFEA` dividers, monospace
confirmation via inline `style` so the CSS `text{}` rule can't override it),
**calendar strip** (DayCard cells — non-trip muted / selected Kauai w/ 2.5px ocean
border / Kauai+Maui tints w/ round vs square shape dots), **uploader sheet**
(header + X, dashed dropzone, real inline "File too large" error). Event card uses
the corrected `TimeBlock.jsx` spacing (padding `spacing.xl`24, gap `spacing.sm`8,
Details `helper`15, badge `bottom/left`8). Weather = 9-day peek strip; doc cards =
UPPERCASE label + size/trash bottom row (same as the mobile SVG). When product
styling changes, update the matching card fn in `board-svg.js` and re-run.

### Shared SVG conventions (`board-svg.js` + `board-2-svg.js`)

- **Icon + label centering:** any label that sits inline beside an icon is placed
  with the `midtxt(x, cy, …)` helper (`dominant-baseline="central"` on the icon's
  vertical midline) so the two share one optical middle — mirrors the product's
  flex `align-items:center`. `baseAt(...)` alone left text ~1.5–2px high. Applies to
  the type badge, Details/Add pills, buffer clock, highlight eyebrow/Day-8/meta,
  day-header route arrow, checklist checkbox, doc size↔trash.
- **DestCard bottom spacing:** overlay is `bottom:14` / `align-items:flex-end`
  (DestCard `HeroView.jsx`) — measured against the raster: title box 30/36, subtitle
  15/20 with `mt4`, subtitle line-box bottom 14px above the card bottom. In SVG:
  title baseline `baseAt(y+h-74,30,36)`, subtitle `baseAt(y+h-34,15,20)`, chevron
  bottom-aligned at `y+h-14-22`. (Don't eyeball card spacing — measure the raster.)

---

## Other artifacts (earlier work)

| Artifact | Source | Regenerate | Output |
|---|---|---|---|
| Design-system stills (colors, type ramp, icon grid…) | `portfolio-assets.html` | `node capture.js` | `exports/*.png` + `icons-grid.svg` |
| Motion clips (now-marker, card-press, page-transition, icon-cascade, icon-select) | `animations.html` | `node capture-anim.js` | `exports/anim/*.{mp4,gif,apng}` |
| Interaction flow videos (4 real-app flows) | `capture-flows.js` (records live app at 192.168.1.198) | `node capture-flows.js [name]` | `exports/flows/*.{mp4,gif}` |
| In-action triptych (3 flows side by side, ocean bg) | `compose-triptych.js` | `node compose-triptych.js` | `exports/flows/in-action-triptych.{mp4,gif}` |
| Solo hero flow (1 phone on ocean square, 1080×1080 — depth companion to the triptych) | `compose-solo.js` | `node compose-solo.js [clip]` (default `add-event`) | `exports/flows/add-event-solo.{mp4,gif}` |
| Screens wall (8-state collage, neutral `#F9F9F9` bg — was infoLight until 2026-07-05) | `compose-screens-wall.js` | `node compose-screens-wall.js [--layout-only] [--svg] [state…]` | `exports/wall/screens-wall.png` (`--svg` also emits `.svg`) |
| Screens wall, transparent (alpha PNG: screens + shadows only, supply your own bg) | `compose-screens-wall.js` | `WALL_BG=transparent WALL_OUT=screens-wall-transparent.png node compose-screens-wall.js --layout-only [--svg]` | `exports/wall/screens-wall-transparent.png` (`--svg` → `.svg`) |
| Screens wall as **SVG** (resolution-independent; real captures embedded as base64 `<image>`, rounded via clipPath, per-screen drop-shadow — nothing redrawn) | `compose-screens-wall.js` | `--svg` alongside a capture run, or `--svg-only` to rebuild from screens already on disk (no browser). `WALL_SVG_OUT` overrides the filename. | `exports/wall/screens-wall.svg` + `screens-wall-transparent.svg` |
| Pulled-apart component gallery (light theme) | `components.html` | view in browser | — |
| Case study page | `case-study.html` | view in browser | — |
| **Behance case-study cover** (two floating real event cards — Hiking Na Pali + Chicago→Kauai — same size/height, gentle opposite tilts, centered on the `oceanLight` gradient panel; sticker icons + real July-4 trip data, self-contained CSS, no external assets) | `cover-gen.html` | `PUPPETEER_EXECUTABLE_PATH=… node cover-capture.js` → renders `?mode=clean`, `?mode=titled`, `?bg=transparent` at 1400×800 **@3x** | `exports/cover-{clean,titled,transparent}.png` (**4200×2400**; transparent is RGBA, alpha via `omitBackground`). **Chosen = `clean`** (copied to `exports/case-study-cover.png`). `titled` bakes a "UX/UI CASE STUDY / Travel Day Organizer" lockup for reuse outside Behance; `transparent` drops the panel (cards + shadows on alpha — washes out on white bg). |

> Flow/triptych/wall captures record the **live app** — deploy the app change
> first (`deploy.sh travel "…"`), then re-capture. The panel exports above are
> self-contained HTML and don't need a deploy.
