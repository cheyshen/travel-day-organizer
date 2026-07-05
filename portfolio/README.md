# Travel Design System — Portfolio Asset Generator

Renders the app's **real** design-system artifacts into fixed capture frames and
screenshots each to its own high-resolution PNG (plus the icon grid as SVG), and
exports the motion system as looping MP4 / GIF / APNG.

Every value is mirrored verbatim from the app source — no approximations:

| Artifact                | Source of truth                              |
|-------------------------|----------------------------------------------|
| Color palette (43 tokens) | `src/colors.js`                            |
| Color poster (brand stack) | `src/colors.js` (Ocean / Coral / Sand + neutral ramp) |
| Type scale (7 styles)   | `src/styles.js` → `typography`               |
| 14 event-type icons     | `src/data/eventTypes.js` + `lucide-react@0.468.0` icon paths |
| Timeline card           | `src/components/TimeBlock.jsx`               |
| Destination cards       | `src/views/HeroView.jsx` → `DestCard`        |
| "Now" marker            | `src/components/NowIndicator.jsx`            |
| Motion (3 animations)   | design-system motion: now-dot pulse, `whileTap` 0.98, `pageVariants` |

## Files

- `portfolio-assets.html` — one `<section class="frame" id="…">` per still asset;
  each is a fixed-size capture target rendered from the embedded tokens.
- `animations.html` — three animation stages; each motion is a pure function of
  progress `t∈[0,1]` via `window.setAnimFrame(name, t)` (deterministic, no CSS keyframes).
- `capture.js` — Puppeteer: one PNG per frame + the icon grid as SVG.
- `capture-anim.js` — Puppeteer: steps each animation `t = 0…1`, screenshots every
  frame, then ffmpeg-encodes to MP4 + GIF (+ APNG for transparent stages).
- `package.json` — pinned dependency (`puppeteer 23.11.1`) and the capture scripts.
- `exports/` (stills + `icons-grid.svg`) and `exports/anim/` (motion) — overwritten each run.

## Run (exact commands)

```bash
cd ~/apps/travel/portfolio
npm install            # installs puppeteer 23.11.1 (downloads a bundled Chromium)

npm run capture        # stills  → ./exports          (PNGs + SVG)
npm run capture-anim   # motion  → ./exports/anim      (MP4 + GIF + APNG) — needs ffmpeg
npm run capture:all    # both, in sequence
```

Stills land in `exports/`:

```
exports/colors.png             1200×3060 css  → 3600×9180 px
exports/color-poster.png       1000×1300 css  → 3000×3900 px
exports/icons-grid.png         1400×680  css  → 4200×2040 px   (transparent)
exports/icons-grid.svg         vector, transparent
exports/type-scale.png         1200×1500 css  → 3600×4500 px
exports/timeline-card.png      900×1100  css  → 2700×3300 px
exports/destination-cards.png  1200×760  css  → 3600×2280 px
exports/now-marker.png         1200×460  css  → 3600×1380 px
```

Motion lands in `exports/anim/` (each loops cleanly):

```
exports/anim/now-marker.{mp4,gif,apng}   pulsing live indicator  (apng = transparent)
exports/anim/card-press.{mp4,gif}        whileTap 0.98 press feedback
exports/anim/page-transition.{mp4,gif}   pageVariants fade + slide
```

### Capture settings
- Stills: `deviceScaleFactor: 3` — retina-grade; PNG pixel size = frame CSS size × 3.
- Stills: `omitBackground: true` on every frame — opaque frames keep their clean
  background; the icon frame (transparent) exports with a transparent background.
- Motion: `deviceScaleFactor: 2`, 30 fps. Frames are stepped deterministically
  (`t = i/total`) so the last frame meets the first — every loop is seamless.
  Transparent frames are flattened onto the warm bg for MP4/GIF; the **APNG keeps
  full alpha** so the now-marker drops onto any background.

### Requirements
- `capture` needs only Node + Puppeteer.
- `capture-anim` additionally needs **ffmpeg + ffprobe** on `PATH` (encoding).

### Using a system Chrome instead of the bundled Chromium

If `npm install` can't download Chromium (offline node), point Puppeteer at an
installed browser:

```bash
export PUPPETEER_SKIP_DOWNLOAD=1
npm install
PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome npm run capture
# (or /usr/bin/chromium-browser)
```

## Notes
- The page is fully self-contained and works offline. Cover photos load from
  Unsplash when online; if a photo fails, the card falls back to its type gradient —
  exactly mirroring the real `TimeBlock` / `DestCard` behavior.
- Inter loads from Google Fonts with a system-font fallback in the `font-family` stack.
- To add/resize a still frame: edit the `<section class="frame" id="…">` in
  `portfolio-assets.html` and add its `{ id, file }` to the `FRAMES` array in
  `capture.js`. The script warns if a frame's fixed height clips its content.
- To add an animation: add a stage + an `ANIM['name'] = (t) => {…}` setter in
  `animations.html`, then add its `{ id, name, durMs, fps, transparent, gifW }`
  entry to the `ANIMS` array in `capture-anim.js`.
