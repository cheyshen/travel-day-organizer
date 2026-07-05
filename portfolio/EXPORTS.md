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
| Static | `exports/component-callouts-wide.png` (3840×2000) · `exports/component-callouts-square.png` (2160×2160) — rounded 48px corners, transparent |
| Video | `exports/anim/component-callouts-{wide,square}.{mp4,gif,apng}` — **full-bleed, no rounded corners** |

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
| Static | `exports/component-board.png` (3840×2160) — **full-bleed, no rounded corners** |

**Shows** (no overlap with the callouts panel): destination card (Kauai),
details card, stat tiles (9/38/2) · event card (Poipu Beach), calendar day-cell
strip (non-trip / selected / Kauai / Maui variants), buffer card · day header
on Kauai tint, checklist progress header (+ Add pill, 5/8 bar), checklist row
in both states (unchecked / checked).

### Conventions (decided 2026-07-05)

- **Panel color:** `#1F2937` — the app's bottom-nav dark slate. Override per
  run with `CALLOUT_BG=` / `BOARD_BG=`.
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

---

## Other artifacts (earlier work)

| Artifact | Source | Regenerate | Output |
|---|---|---|---|
| Design-system stills (colors, type ramp, icon grid…) | `portfolio-assets.html` | `node capture.js` | `exports/*.png` + `icons-grid.svg` |
| Motion clips (now-marker, card-press, page-transition, icon-cascade, icon-select) | `animations.html` | `node capture-anim.js` | `exports/anim/*.{mp4,gif,apng}` |
| Interaction flow videos (4 real-app flows) | `capture-flows.js` (records live app at 192.168.1.198) | `node capture-flows.js [name]` | `exports/flows/*.{mp4,gif}` |
| In-action triptych (3 flows side by side, ocean bg) | `compose-triptych.js` | `node compose-triptych.js` | `exports/flows/in-action-triptych.{mp4,gif}` |
| Solo hero flow (1 phone on ocean square, 1080×1080 — depth companion to the triptych) | `compose-solo.js` | `node compose-solo.js [clip]` (default `add-event`) | `exports/flows/add-event-solo.{mp4,gif}` |
| Screens wall (8-state collage, infoLight bg) | `compose-screens-wall.js` | `node compose-screens-wall.js [--layout-only] [state…]` | `exports/wall/screens-wall.png` |
| Pulled-apart component gallery (light theme) | `components.html` | view in browser | — |
| Case study page | `case-study.html` | view in browser | — |

> Flow/triptych/wall captures record the **live app** — deploy the app change
> first (`deploy.sh travel "…"`), then re-capture. The panel exports above are
> self-contained HTML and don't need a deploy.
