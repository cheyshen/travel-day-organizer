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
