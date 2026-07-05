# Task: Portfolio Asset Generator for the Travel Design System

## Goal
Render the design system's real tokens/components into fixed capture frames and
screenshot each to its own high-res PNG (plus the icon grid as SVG) for portfolio use.

## Steps
- [x] Read real tokens (colors.js, styles.js, eventTypes.js) and components
      (TimeBlock, NowIndicator, DestCard) + cover gradients
- [x] Extract exact Lucide SVG node data for all 14 event-type icons
- [x] Build portfolio-assets.html with 6 fixed-size frames, each a unique id:
      #frame-colors, #frame-icons, #frame-type-scale,
      #frame-timeline-card, #frame-destination-cards, #frame-now-marker
- [x] Write capture.js (Puppeteer, deviceScaleFactor:3, omitBackground:true,
      per-frame PNG to /exports, icon grid also exported as SVG)
- [x] Write package.json with pinned deps + exact run commands (README)
- [x] Verify: install puppeteer, run capture, confirm PNGs + SVG land in /exports
      → all 7 outputs generated; icons-grid.png confirmed RGBA (transparent),
        opaque frames RGB; SVG renders identical to PNG; no clipping warnings.

## Notes
- Self-contained: icon SVG paths inlined from lucide-react v0.468.0 (no CDN at capture time).
- Token values mirror source exactly (colors.js, styles.js). No hardcoded guesses.
- omitBackground:true is safe for all frames — opaque frames keep their bg,
  the icon frame (transparent bg) becomes a transparent PNG.
- The user's message was truncated at "Include the package.json and the exact" —
  interpreted as "exact deps + exact run commands"; documented in README.

## Task: Interaction flow videos (2026-07-04)

### Goal
Record 4 real-app interaction clips (add-event, calendar-day-jump, day-island-switch, checklist) → exports/flows/, and add an "In action" section to case-study.html.

### Steps
- [x] capture-flows.js harness + checklist flow
- [x] day-island-switch flow
- [x] calendar-day-jump flow
- [x] add-event flow
- [x] case-study.html "In action" section
- [x] Full re-run + review at http://192.168.1.122:8080/case-study.html
- [x] compose-triptych.js — calendar-day-jump + day-island-switch + checklist side by side in ONE video (in-action-triptych.mp4/gif); case-study #inaction now embeds it instead of the 4 separate phones

## Task: Annotated component callouts (2026-07-05)

### Goal
Reference-style annotated component strip (user picked option 1): dark slate panel, row of isolated components with thin leader lines up to labels.

### Steps
- [x] component-callouts.html — self-contained panel (sticker / island switcher / Now marker / Add event), strip scaled 1.5×, staggered line lengths
- [x] capture-callouts.js + npm run capture-callouts → exports/component-callouts.png (3840×2000, transparent rounded corners)
- [x] Review at http://192.168.1.122:8080/component-callouts.html

### Notes
- On-dark legibility adaptations: Now marker teal lightened #0E7490→#22B8D4, switcher track rgba(255,255,255,.10), NOW label white. Sticker = Sunrise orange for color spread.
- CALLOUT_BG env overrides panel color (e.g. #14181F near-black).
- [x] Animated variant (2026-07-05): `node capture-callouts.js --anim` → exports/anim/component-callouts.{mp4,gif,apng}. Only the LIVE components move (Now radar pulse @1200ms cadence + one sunrise sticker bob per 4.8s loop); switcher/button stay still. Live page autoplays the same loop; static PNG pinned to setAnimFrame(0) rest pose.
