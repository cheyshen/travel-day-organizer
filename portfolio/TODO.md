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

## Task: Redo the in-action triptych — crisp edges + fill the shape (2026-08-15)

### Goal
Rebuild the 3-phone "in action" triptych transparent WebP so the phone edges are
crisp (not fuzzy) and the phones fill the frame (no dead margin). Keep frame A
(dark bezel) + add a subtle drop shadow. Output = in-action-triptych-up.webp for
re-upload to WP (?v=3).

### Root causes (diagnosed)
- Fuzzy edges: gblur sigma=1.3 alpha feather (compose-triptych.js:240) + 1× render
  downscaled + q85 webp.
- Dead space: 1920×1080 canvas, phones only ~1630×864 → big margins; screens shown
  at ~292px (390px source downscaled).

### Steps
- [x] compose-triptych-up.js (isolated; native-res screens, 2×-SS bezel+shadow,
      no gblur, high-q webp)
- [x] Tight layout GAP64 MARGIN56 → 1470×976, phones fill the frame
- [x] Encode transparent webp (q90, 12fps, 2.4MB) + solid mp4 fallback
- [x] Verify corner crispness in a browser over colored bg (PIL, NOT ffmpeg 4.4.2)
- [x] FIX: screen video square corners poked past the outer bezel curve → round each
      screen's corners (r=32 alpha mask, alphamerge) so they nest inside the frame
- [x] LOOP FIX: shorter clips froze on last frame (tpad clone) → `-stream_loop -1` per
      clip + `-t maxDur` so all 3 phones keep animating; longest (day) plays once =
      seamless composite loop. Verified per-phone tail motion > 0.
- [x] TRANSPARENCY FIX (was rendering a solid BLACK box): (1) ffmpeg `overlay`
      flattens the transparent base → re-apply alpha via `alphamerge` w/ a silhouette
      mask (genSilhouette); (2) ffmpeg 4.4.2 libwebp_anim lossy flattens alpha & lossless
      is ~15MB → export RGBA frames + assemble with `img2webp -lossy -q 80` (installed
      `webp` pkg) → transparent + 2.0MB.
- [ ] Show result; on approval upload as in-action-triptych-up.webp?v=3

### Notes (fix)
- The poke was hidden in the OLD live webp by the gblur feather; crisp render exposed it.
- Root cause: R_OUT(46) > PAD(10), so the outer corner curves in past the screen's
  square corner. Fix = round the screen to R_SCR=32 (≤ R_IN=34) so it fills the cutout
  yet stays inside the outer silhouette.

### Notes
- Source flow videos are 390×844 (screencast = CSS px); native-390 display is the
  crispest this source allows. True 2× app text needs re-capture (separate step).
