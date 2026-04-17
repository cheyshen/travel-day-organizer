# Travel Cali Fork Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up a second K3s-only instance of the Travel Day Organizer at `http://192.168.1.213`, pre-populated with the user's California Coast trip (May 5–10, 2026, Avila Beach home-base). The existing `travel` app stays untouched.

**Architecture:** Full source fork at `~/apps/travel-cali/` + independent GitOps manifest at `~/kube/manifests/travel-cali/` + independent ArgoCD Application. Design system, components, and PWA infrastructure are copied verbatim — only data and a handful of content-level references (app name, SW cache key, hero highlights, destination photos, theme accent for the single destination) are swapped.

**Tech Stack:** React 19, Vite 7, Tailwind v4, Framer Motion, date-fns, Lucide icons. Deployed via K3s + MetalLB + local Docker registry + ArgoCD. Built by Dockerfile (multi-stage vite→nginx).

**Reference spec:** `docs/superpowers/specs/2026-04-17-travel-cali-fork-design.md`

---

## File Structure

### New / copied source files at `~/apps/travel-cali/`
- **Copied verbatim** (no edits): `src/App.jsx`, `src/main.jsx`, `src/index.css`, `src/colors.js`, `src/styles.js`, `src/context/TripContext.jsx`, `src/context/tripShift.js`, `src/context/tripShift.test.mjs`, all of `src/components/`, all of `src/views/` **except** `HeroView.jsx`, `src/data/eventTypes.js`, `src/data/statusCategories.js`, `src/data/coverImages.js`, `src/utils/*`, `public/favicon.svg`, `public/apple-touch-icon*.png`, `public/pwa-icon-*.png`, `public/og-image.png`, `public/hero-bg.png`, `vite.config.js`, `eslint.config.js`, `Dockerfile`, `nginx.conf`, `README.md`
- **Copied + edited**: `package.json`, `index.html`, `public/manifest.json`, `public/sw.js`, `src/views/HeroView.jsx`, `src/data/sampleTrip.js`, `src/data/sampleChecklist.js`
- **Not copied**: `deploy-prod.sh`, `.env.prod`, `dist/`, `node_modules/`, `CLAUDE.md` (recreated fresh), `docs/` (not needed in fork)

### New manifest files at `~/kube/manifests/travel-cali/`
- `deployment.yaml` (Namespace + Deployment + Service with `loadBalancerIP: 192.168.1.213`)
- **No** `ingress.yaml` / `certificate.yaml` (K3s IP access only; no `travel-cali.lab` DNS)

### New ArgoCD Application at `~/kube/manifests/argocd-apps/travel-cali.yaml`

---

## Task Breakdown

### Task 1: Fork the source tree

**Files:**
- Create: `~/apps/travel-cali/` (full copy of `~/apps/travel/` minus excluded items)

- [ ] **Step 1: Copy the source tree**

```bash
cp -a /home/ubuntu/apps/travel /home/ubuntu/apps/travel-cali
```

- [ ] **Step 2: Strip files that must not be forked**

```bash
cd /home/ubuntu/apps/travel-cali
rm -rf node_modules dist docs deploy-prod.sh .env.prod
rm -f CLAUDE.md
```

- [ ] **Step 3: Verify the copy**

```bash
ls /home/ubuntu/apps/travel-cali
```

Expected output (approximate):
```
Dockerfile  README.md  eslint.config.js  index.html  nginx.conf
package.json  package-lock.json  public  src  vite.config.js
```

- [ ] **Step 4: Verify `src/` matches the source**

```bash
diff -r /home/ubuntu/apps/travel/src /home/ubuntu/apps/travel-cali/src
```

Expected: no output (identical at this stage).

- [ ] **Step 5: Commit — do NOT git-init a new repo; these files are *staged* in a local working directory and committed to GitOps via deploy.sh later. There is no per-app repo. Skip this step; there is nothing to commit yet.**

No action.

---

### Task 2: Update `package.json` name

**Files:**
- Modify: `~/apps/travel-cali/package.json`

- [ ] **Step 1: Change the package name from `travel` to `travel-cali`**

Open `~/apps/travel-cali/package.json`. Find the line:
```json
  "name": "travel",
```
Replace with:
```json
  "name": "travel-cali",
```

All other fields (version, scripts, dependencies) stay identical.

- [ ] **Step 2: Verify**

```bash
grep '"name"' /home/ubuntu/apps/travel-cali/package.json
```
Expected: `  "name": "travel-cali",`

---

### Task 3: Update `index.html` metadata

**Files:**
- Modify: `~/apps/travel-cali/index.html`

- [ ] **Step 1: Replace exactly these lines**

Find:
```html
    <meta name="apple-mobile-web-app-title" content="Travel" />
    <meta name="description" content="Plan and manage your multi-day Hawaii trip itinerary" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="Travel Day Organizer" />
    <meta property="og:description" content="Plan and manage your multi-day Hawaii trip itinerary" />
    <meta property="og:url" content="https://travel.cheyshen.com/" />
    <meta property="og:image" content="https://travel.cheyshen.com/og-image.png" />
```

Replace with:
```html
    <meta name="apple-mobile-web-app-title" content="Cali" />
    <meta name="description" content="Plan and manage your California Coast trip itinerary" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="California Coast" />
    <meta property="og:description" content="Plan and manage your California Coast trip itinerary" />
    <meta property="og:url" content="http://192.168.1.213/" />
    <meta property="og:image" content="http://192.168.1.213/og-image.png" />
```

And find:
```html
    <meta name="twitter:title" content="Travel Day Organizer" />
    <meta name="twitter:description" content="Plan and manage your multi-day Hawaii trip itinerary" />
    <meta name="twitter:image" content="https://travel.cheyshen.com/og-image.png" />
    <title>Travel Day Organizer</title>
```

Replace with:
```html
    <meta name="twitter:title" content="California Coast" />
    <meta name="twitter:description" content="Plan and manage your California Coast trip itinerary" />
    <meta name="twitter:image" content="http://192.168.1.213/og-image.png" />
    <title>California Coast</title>
```

- [ ] **Step 2: Verify title changed**

```bash
grep "<title>" /home/ubuntu/apps/travel-cali/index.html
```
Expected: `    <title>California Coast</title>`

---

### Task 4: Update `public/manifest.json` (PWA)

**Files:**
- Modify: `~/apps/travel-cali/public/manifest.json`

- [ ] **Step 1: Replace the top three fields**

Find:
```json
  "name": "Travel Day Organizer",
  "short_name": "Travel",
  "description": "Plan and manage your multi-day trip itinerary",
```

Replace with:
```json
  "name": "California Coast",
  "short_name": "Cali",
  "description": "Plan and manage your California Coast trip itinerary",
```

All other fields (start_url, display, colors, icons) stay identical.

- [ ] **Step 2: Verify**

```bash
grep '"name"\|"short_name"' /home/ubuntu/apps/travel-cali/public/manifest.json
```
Expected:
```
  "name": "California Coast",
  "short_name": "Cali",
```

---

### Task 5: Update `public/sw.js` cache key

**Files:**
- Modify: `~/apps/travel-cali/public/sw.js`

- [ ] **Step 1: Change cache name**

Find the line:
```js
const CACHE_NAME = 'travel-v3';
```
Replace with:
```js
const CACHE_NAME = 'travel-cali-v1';
```

This prevents the Cali app's service worker from colliding with the existing `travel` app's cache if both are ever installed on the same device.

- [ ] **Step 2: Verify**

```bash
grep CACHE_NAME /home/ubuntu/apps/travel-cali/public/sw.js | head -1
```
Expected: `const CACHE_NAME = 'travel-cali-v1';`

---

### Task 6: Replace `src/data/sampleTrip.js` with California trip data

**Files:**
- Overwrite: `~/apps/travel-cali/src/data/sampleTrip.js`

- [ ] **Step 1: Overwrite the file with the California trip data**

Write the following exact content to `~/apps/travel-cali/src/data/sampleTrip.js`:

```js
// =============================================================================
// SAMPLE TRIP — California Coast, May 5–10, 2026 (Avila Beach home-base)
// =============================================================================

export const sampleTrip = {
  id: 'trip-cali-2026',
  name: 'California Coast',
  tagline: 'Central Coast Escape',
  startDate: '2026-05-05',
  endDate: '2026-05-10',
  homeTimezone: 'America/Chicago',
  status: 'upcoming',
  destinations: [
    {
      id: 'dest-avila',
      name: 'Avila Beach',
      island: 'Central Coast',
      startDate: '2026-05-05',
      endDate: '2026-05-10',
      color: '#2B7A9E',
      accentLight: '#E0F1F8',
      accommodation: {
        name: 'Avila Beach Airbnb',
        address: 'Avila Beach, CA',
        confirmationNumber: 'AIRBNB-36815131',
      },
    },
  ],
}

export const sampleDays = {
  // =========================================================================
  // DAY 1 — May 5: Minneapolis → San Luis Obispo (Travel + Settle in)
  // =========================================================================
  '2026-05-05': {
    date: '2026-05-05',
    destinationId: 'dest-avila',
    label: 'MSP to Avila Beach',
    notes: 'Travel day — early start, arrive SBP 1:31 PM PDT, Airbnb check-in 4 PM',
    events: [
      {
        id: 'e-0101',
        type: 'buffer',
        title: 'Wake up & prepare',
        subtitle: null,
        startTime: '2026-05-05T06:00:00-05:00',
        endTime: '2026-05-05T06:30:00-05:00',
        timezone: 'America/Chicago',
        location: null,
        confirmationNumber: null,
        notes: null,
        status: 'upcoming',
        sortOrder: 0,
        bufferMinutes: 30,
        bufferLabel: 'Morning prep time',
      },
      {
        id: 'e-0102',
        type: 'ground_transport',
        title: 'Uber to MSP',
        subtitle: 'UberX · ~45 min',
        startTime: '2026-05-05T06:30:00-05:00',
        endTime: '2026-05-05T07:15:00-05:00',
        timezone: 'America/Chicago',
        location: { origin: 'Home', destination: 'Minneapolis-St Paul (MSP)' },
        confirmationNumber: null,
        notes: null,
        status: 'upcoming',
        sortOrder: 1,
      },
      {
        id: 'e-0103',
        type: 'flight',
        title: 'UA 1891 MSP → DEN',
        subtitle: 'United · Boeing 737-900 · Economy',
        startTime: '2026-05-05T09:00:00-05:00',
        endTime: '2026-05-05T10:20:00-06:00',
        timezone: 'America/Chicago',
        location: { origin: 'MSP Minneapolis', destination: 'DEN Denver' },
        confirmationNumber: 'UA-1891',
        notes: 'Boeing 737-900 · 2h 20m · Snacks for purchase',
        status: 'upcoming',
        sortOrder: 2,
      },
      {
        id: 'e-0104',
        type: 'flight',
        title: 'UA 4765 DEN → SBP',
        subtitle: 'SkyWest / United Express · Embraer E175 · Economy',
        startTime: '2026-05-05T11:30:00-06:00',
        endTime: '2026-05-05T13:31:00-07:00',
        timezone: 'America/Denver',
        location: { origin: 'DEN Denver', destination: 'SBP San Luis Obispo' },
        confirmationNumber: 'UA-4765',
        notes: 'Embraer E175 · 3h 1m · Snacks for purchase',
        status: 'upcoming',
        sortOrder: 3,
      },
      {
        id: 'e-0105',
        type: 'ground_transport',
        title: 'Pick up rental car',
        subtitle: 'Enterprise · SBP Airport (in terminal)',
        startTime: '2026-05-05T13:45:00-07:00',
        endTime: '2026-05-05T14:15:00-07:00',
        timezone: 'America/Los_Angeles',
        location: { origin: 'SBP Terminal', destination: null },
        confirmationNumber: 'L5411331507',
        notes: 'Enterprise at SBP. Phone: 805-781-3383. Ref L5411331507. Booked pickup time is 1:00 PM but flight lands 1:31 PM — Enterprise will hold.',
        status: 'upcoming',
        sortOrder: 4,
      },
      {
        id: 'e-0106',
        type: 'ground_transport',
        title: 'Drive to Airbnb + grocery stop',
        subtitle: '~25 min drive + quick grocery run',
        startTime: '2026-05-05T14:30:00-07:00',
        endTime: '2026-05-05T16:00:00-07:00',
        timezone: 'America/Los_Angeles',
        location: { origin: 'SBP', destination: 'Avila Beach Airbnb' },
        confirmationNumber: null,
        notes: null,
        status: 'upcoming',
        sortOrder: 5,
      },
      {
        id: 'e-0107',
        type: 'hotel',
        title: 'Airbnb check-in',
        subtitle: 'Avila Beach Airbnb',
        startTime: '2026-05-05T16:00:00-07:00',
        endTime: '2026-05-05T16:30:00-07:00',
        timezone: 'America/Los_Angeles',
        location: { origin: null, destination: 'Avila Beach Airbnb' },
        confirmationNumber: 'AIRBNB-36815131',
        notes: 'Listing 36815131. Check-in 4:00 PM, check-out May 10 11:00 AM.',
        status: 'upcoming',
        sortOrder: 6,
      },
      {
        id: 'e-0108',
        type: 'dining',
        title: 'Dinner',
        subtitle: 'TBD — local Avila spot',
        startTime: '2026-05-05T18:30:00-07:00',
        endTime: '2026-05-05T20:00:00-07:00',
        timezone: 'America/Los_Angeles',
        location: null,
        confirmationNumber: null,
        notes: null,
        status: 'upcoming',
        sortOrder: 7,
      },
    ],
  },

  // =========================================================================
  // DAY 2 — May 6: Avila local (Lighthouse + Bob Jones Trail)
  // =========================================================================
  '2026-05-06': {
    date: '2026-05-06',
    destinationId: 'dest-avila',
    label: 'Avila Beach',
    notes: 'Hike the Pecho Coast Trail, then walk the Bob Jones Trail',
    events: [
      {
        id: 'e-0201',
        type: 'hiking',
        title: 'Point San Luis Lighthouse / Pecho Coast Trail',
        subtitle: '3.5 mi out-and-back · moderate',
        startTime: '2026-05-06T09:00:00-07:00',
        endTime: '2026-05-06T11:30:00-07:00',
        timezone: 'America/Los_Angeles',
        location: { origin: 'Avila Beach', destination: 'Point San Luis Lighthouse' },
        confirmationNumber: null,
        notes: 'Docent-led hikes run some days — check pointsanluislighthouse.org',
        status: 'upcoming',
        sortOrder: 0,
      },
      {
        id: 'e-0202',
        type: 'dining',
        title: 'Lunch',
        subtitle: 'TBD',
        startTime: '2026-05-06T12:30:00-07:00',
        endTime: '2026-05-06T13:30:00-07:00',
        timezone: 'America/Los_Angeles',
        location: null,
        confirmationNumber: null,
        notes: null,
        status: 'upcoming',
        sortOrder: 1,
      },
      {
        id: 'e-0203',
        type: 'activity',
        title: 'Bob Jones Trail',
        subtitle: 'Flat 3 mi bike/walk along San Luis Creek',
        startTime: '2026-05-06T14:00:00-07:00',
        endTime: '2026-05-06T16:30:00-07:00',
        timezone: 'America/Los_Angeles',
        location: { origin: 'Ontario Rd trailhead', destination: 'Avila Beach' },
        confirmationNumber: null,
        notes: 'Paved, easy. Good for bike rentals in downtown Avila.',
        status: 'upcoming',
        sortOrder: 2,
      },
      {
        id: 'e-0204',
        type: 'dining',
        title: 'Dinner',
        subtitle: 'TBD',
        startTime: '2026-05-06T18:30:00-07:00',
        endTime: '2026-05-06T20:00:00-07:00',
        timezone: 'America/Los_Angeles',
        location: null,
        confirmationNumber: null,
        notes: null,
        status: 'upcoming',
        sortOrder: 3,
      },
    ],
  },

  // =========================================================================
  // DAY 3 — May 7: BIG SUR day trip (only activity — long drive)
  // =========================================================================
  '2026-05-07': {
    date: '2026-05-07',
    destinationId: 'dest-avila',
    label: 'Big Sur Day Trip',
    notes: 'Long-drive day — Bixby Bridge, McWay Falls, Pfeiffer Beach. ~2.5 hr each way.',
    events: [
      {
        id: 'e-0301',
        type: 'ground_transport',
        title: 'Drive to Big Sur',
        subtitle: 'Highway 1 north · ~2.5 hr',
        startTime: '2026-05-07T07:00:00-07:00',
        endTime: '2026-05-07T09:30:00-07:00',
        timezone: 'America/Los_Angeles',
        location: { origin: 'Avila Beach', destination: 'Big Sur' },
        confirmationNumber: null,
        notes: 'Fuel up before leaving. Gas is scarce and expensive along Highway 1.',
        status: 'upcoming',
        sortOrder: 0,
      },
      {
        id: 'e-0302',
        type: 'sightseeing',
        title: 'Big Sur: Bixby Bridge → McWay Falls → Pfeiffer Beach',
        subtitle: 'Iconic coastal viewpoints',
        startTime: '2026-05-07T09:30:00-07:00',
        endTime: '2026-05-07T16:30:00-07:00',
        timezone: 'America/Los_Angeles',
        location: { origin: 'Big Sur', destination: null },
        confirmationNumber: null,
        notes: 'Pfeiffer Beach has purple sand. McWay Falls is a 10-min walk from the pull-off.',
        status: 'upcoming',
        sortOrder: 1,
      },
      {
        id: 'e-0303',
        type: 'ground_transport',
        title: 'Drive back to Avila',
        subtitle: 'Highway 1 south · ~2.5 hr',
        startTime: '2026-05-07T16:30:00-07:00',
        endTime: '2026-05-07T19:00:00-07:00',
        timezone: 'America/Los_Angeles',
        location: { origin: 'Big Sur', destination: 'Avila Beach' },
        confirmationNumber: null,
        notes: null,
        status: 'upcoming',
        sortOrder: 2,
      },
    ],
  },

  // =========================================================================
  // DAY 4 — May 8: Montaña de Oro + Morro Bay
  // =========================================================================
  '2026-05-08': {
    date: '2026-05-08',
    destinationId: 'dest-avila',
    label: 'Montaña de Oro + Morro Bay',
    notes: 'Hike Valencia Peak in the morning, Morro Bay in the afternoon',
    events: [
      {
        id: 'e-0401',
        type: 'hiking',
        title: 'Montaña de Oro SP',
        subtitle: 'Valencia Peak + Bluff Trail + Spooner\'s Cove',
        startTime: '2026-05-08T08:30:00-07:00',
        endTime: '2026-05-08T12:30:00-07:00',
        timezone: 'America/Los_Angeles',
        location: { origin: 'Avila Beach', destination: 'Montaña de Oro SP' },
        confirmationNumber: null,
        notes: 'Valencia Peak is 4.4 mi round-trip, 1,300 ft gain. Bluff Trail is flat and gorgeous.',
        status: 'upcoming',
        sortOrder: 0,
      },
      {
        id: 'e-0402',
        type: 'dining',
        title: 'Lunch in Morro Bay',
        subtitle: 'TBD',
        startTime: '2026-05-08T13:00:00-07:00',
        endTime: '2026-05-08T14:30:00-07:00',
        timezone: 'America/Los_Angeles',
        location: { origin: null, destination: 'Morro Bay' },
        confirmationNumber: null,
        notes: null,
        status: 'upcoming',
        sortOrder: 1,
      },
      {
        id: 'e-0403',
        type: 'sightseeing',
        title: 'Morro Bay + Morro Rock',
        subtitle: 'Harbor walk + Morro Rock viewpoint',
        startTime: '2026-05-08T14:30:00-07:00',
        endTime: '2026-05-08T17:00:00-07:00',
        timezone: 'America/Los_Angeles',
        location: { origin: null, destination: 'Morro Bay' },
        confirmationNumber: null,
        notes: 'Otters + pelicans in the harbor. Morro Rock is a peregrine falcon sanctuary.',
        status: 'upcoming',
        sortOrder: 2,
      },
      {
        id: 'e-0404',
        type: 'dining',
        title: 'Dinner',
        subtitle: 'TBD',
        startTime: '2026-05-08T19:00:00-07:00',
        endTime: '2026-05-08T20:30:00-07:00',
        timezone: 'America/Los_Angeles',
        location: null,
        confirmationNumber: null,
        notes: null,
        status: 'upcoming',
        sortOrder: 3,
      },
    ],
  },

  // =========================================================================
  // DAY 5 — May 9: Hearst Castle + Pismo + Hot Springs
  // =========================================================================
  '2026-05-09': {
    date: '2026-05-09',
    destinationId: 'dest-avila',
    label: 'Hearst + Pismo',
    notes: 'Hearst Castle tour in the morning, Pismo afternoon, hot springs evening',
    events: [
      {
        id: 'e-0501',
        type: 'ground_transport',
        title: 'Drive to San Simeon',
        subtitle: '~45 min north on Highway 1',
        startTime: '2026-05-09T09:00:00-07:00',
        endTime: '2026-05-09T09:45:00-07:00',
        timezone: 'America/Los_Angeles',
        location: { origin: 'Avila Beach', destination: 'San Simeon' },
        confirmationNumber: null,
        notes: null,
        status: 'upcoming',
        sortOrder: 0,
      },
      {
        id: 'e-0502',
        type: 'sightseeing',
        title: 'Hearst Castle tour',
        subtitle: 'Grand Rooms tour · ~2 hr',
        startTime: '2026-05-09T10:00:00-07:00',
        endTime: '2026-05-09T13:00:00-07:00',
        timezone: 'America/Los_Angeles',
        location: { origin: null, destination: 'Hearst Castle, San Simeon' },
        confirmationNumber: null,
        notes: 'Book tour in advance at hearstcastle.org. Shuttle from visitor center up the hill.',
        status: 'upcoming',
        sortOrder: 1,
      },
      {
        id: 'e-0503',
        type: 'beach',
        title: 'Pismo Beach boardwalk',
        subtitle: 'Pier + boardwalk + tide pools',
        startTime: '2026-05-09T14:00:00-07:00',
        endTime: '2026-05-09T16:00:00-07:00',
        timezone: 'America/Los_Angeles',
        location: { origin: null, destination: 'Pismo Beach' },
        confirmationNumber: null,
        notes: 'Monarch butterfly grove is seasonal — likely gone by May.',
        status: 'upcoming',
        sortOrder: 2,
      },
      {
        id: 'e-0504',
        type: 'dining',
        title: 'Dinner',
        subtitle: 'TBD',
        startTime: '2026-05-09T18:00:00-07:00',
        endTime: '2026-05-09T19:30:00-07:00',
        timezone: 'America/Los_Angeles',
        location: null,
        confirmationNumber: null,
        notes: null,
        status: 'upcoming',
        sortOrder: 3,
      },
      {
        id: 'e-0505',
        type: 'activity',
        title: 'Sycamore Mineral Springs',
        subtitle: 'Private hillside hot tub',
        startTime: '2026-05-09T20:00:00-07:00',
        endTime: '2026-05-09T21:30:00-07:00',
        timezone: 'America/Los_Angeles',
        location: { origin: null, destination: 'Sycamore Mineral Springs, Avila Beach' },
        confirmationNumber: null,
        notes: 'Book private tub in advance. ~$30-45/person.',
        status: 'upcoming',
        sortOrder: 4,
      },
    ],
  },

  // =========================================================================
  // DAY 6 — May 10: Travel home (SBP → SFO → MSP)
  // =========================================================================
  '2026-05-10': {
    date: '2026-05-10',
    destinationId: 'dest-avila',
    label: 'Avila to MSP',
    notes: 'Very early flight — 8 AM departure. Check out Airbnb at 6:30 AM.',
    events: [
      {
        id: 'e-0601',
        type: 'buffer',
        title: 'Wake up & pack',
        subtitle: null,
        startTime: '2026-05-10T05:30:00-07:00',
        endTime: '2026-05-10T06:15:00-07:00',
        timezone: 'America/Los_Angeles',
        location: null,
        confirmationNumber: null,
        notes: null,
        status: 'upcoming',
        sortOrder: 0,
        bufferMinutes: 45,
        bufferLabel: 'Morning pack time',
      },
      {
        id: 'e-0602',
        type: 'hotel',
        title: 'Airbnb check-out',
        subtitle: 'Early checkout — official is 11 AM',
        startTime: '2026-05-10T06:15:00-07:00',
        endTime: '2026-05-10T06:30:00-07:00',
        timezone: 'America/Los_Angeles',
        location: { origin: 'Avila Beach Airbnb', destination: null },
        confirmationNumber: 'AIRBNB-36815131',
        notes: null,
        status: 'upcoming',
        sortOrder: 1,
      },
      {
        id: 'e-0603',
        type: 'ground_transport',
        title: 'Drive to SBP',
        subtitle: '~20 min',
        startTime: '2026-05-10T06:30:00-07:00',
        endTime: '2026-05-10T07:00:00-07:00',
        timezone: 'America/Los_Angeles',
        location: { origin: 'Avila Beach', destination: 'SBP Airport' },
        confirmationNumber: null,
        notes: null,
        status: 'upcoming',
        sortOrder: 2,
      },
      {
        id: 'e-0604',
        type: 'ground_transport',
        title: 'Drop off rental car',
        subtitle: 'Enterprise · SBP in terminal',
        startTime: '2026-05-10T07:00:00-07:00',
        endTime: '2026-05-10T07:15:00-07:00',
        timezone: 'America/Los_Angeles',
        location: { origin: 'SBP Enterprise', destination: null },
        confirmationNumber: 'L5411331507',
        notes: 'Booked dropoff time 8:00 AM matches flight departure — return earlier in practice.',
        status: 'upcoming',
        sortOrder: 3,
      },
      {
        id: 'e-0605',
        type: 'flight',
        title: 'UA 6035 SBP → SFO',
        subtitle: 'SkyWest / United Express · Bombardier CRJ700 · Economy',
        startTime: '2026-05-10T08:00:00-07:00',
        endTime: '2026-05-10T09:12:00-07:00',
        timezone: 'America/Los_Angeles',
        location: { origin: 'SBP San Luis Obispo', destination: 'SFO San Francisco' },
        confirmationNumber: 'UA-6035',
        notes: 'Bombardier CRJ700 · 1h 12m · No meal service',
        status: 'upcoming',
        sortOrder: 4,
      },
      {
        id: 'e-0606',
        type: 'flight',
        title: 'UA 2272 SFO → MSP',
        subtitle: 'United · Boeing 737-800 · Economy',
        startTime: '2026-05-10T10:09:00-07:00',
        endTime: '2026-05-10T15:53:00-05:00',
        timezone: 'America/Los_Angeles',
        location: { origin: 'SFO San Francisco', destination: 'MSP Minneapolis' },
        confirmationNumber: 'UA-2272',
        notes: 'Boeing 737-800 · 3h 44m · Meals for purchase',
        status: 'upcoming',
        sortOrder: 5,
      },
      {
        id: 'e-0607',
        type: 'ground_transport',
        title: 'Uber home from MSP',
        subtitle: 'UberX · ~45 min',
        startTime: '2026-05-10T16:00:00-05:00',
        endTime: '2026-05-10T16:45:00-05:00',
        timezone: 'America/Chicago',
        location: { origin: 'MSP Minneapolis', destination: 'Home' },
        confirmationNumber: null,
        notes: null,
        status: 'upcoming',
        sortOrder: 6,
      },
    ],
  },
}
```

- [ ] **Step 2: Verify the file parses**

```bash
cd /home/ubuntu/apps/travel-cali && node --check src/data/sampleTrip.js
```

Expected: no output (syntactically valid). If there is output (a SyntaxError), re-check the file.

Note: `node --check` won't verify ES module imports, but it will catch syntax errors. The `build` step later catches structural errors.

- [ ] **Step 3: Verify all 6 days are present**

```bash
grep -c "^  '2026-05-" /home/ubuntu/apps/travel-cali/src/data/sampleTrip.js
```

Expected: `6`

---

### Task 7: Replace `src/data/sampleChecklist.js` with California items

**Files:**
- Overwrite: `~/apps/travel-cali/src/data/sampleChecklist.js`

- [ ] **Step 1: Overwrite the file**

Write the following exact content to `~/apps/travel-cali/src/data/sampleChecklist.js`:

```js
// =============================================================================
// SAMPLE CHECKLIST — Default prep items for California Coast trip
// =============================================================================

export const sampleChecklist = [
  {
    id: 'chk-001',
    title: 'Book airport parking or schedule Uber to MSP',
    category: 'transport',
    completed: false,
    completedAt: null,
    createdAt: '2026-04-01T10:00:00-05:00',
    sortOrder: 0,
  },
  {
    id: 'chk-002',
    title: 'Print boarding passes',
    category: 'documents',
    completed: false,
    completedAt: null,
    createdAt: '2026-04-01T10:01:00-05:00',
    sortOrder: 1,
  },
  {
    id: 'chk-003',
    title: 'Pack hiking shoes and daypack',
    category: 'packing',
    completed: false,
    completedAt: null,
    createdAt: '2026-04-01T10:02:00-05:00',
    sortOrder: 2,
  },
  {
    id: 'chk-004',
    title: 'Pack layers — coastal mornings are cool',
    category: 'packing',
    completed: false,
    completedAt: null,
    createdAt: '2026-04-01T10:03:00-05:00',
    sortOrder: 3,
  },
  {
    id: 'chk-005',
    title: 'Pack sunscreen and sunglasses',
    category: 'packing',
    completed: false,
    completedAt: null,
    createdAt: '2026-04-01T10:04:00-05:00',
    sortOrder: 4,
  },
  {
    id: 'chk-006',
    title: 'Confirm Airbnb reservation (listing 36815131)',
    category: 'booking',
    completed: false,
    completedAt: null,
    createdAt: '2026-04-01T10:05:00-05:00',
    sortOrder: 5,
  },
  {
    id: 'chk-007',
    title: 'Confirm Enterprise rental (ref L5411331507)',
    category: 'booking',
    completed: false,
    completedAt: null,
    createdAt: '2026-04-01T10:06:00-05:00',
    sortOrder: 6,
  },
  {
    id: 'chk-008',
    title: 'Book Hearst Castle tour at hearstcastle.org',
    category: 'booking',
    completed: false,
    completedAt: null,
    createdAt: '2026-04-01T10:07:00-05:00',
    sortOrder: 7,
  },
  {
    id: 'chk-009',
    title: 'Book Sycamore Mineral Springs private tub for May 9',
    category: 'booking',
    completed: false,
    completedAt: null,
    createdAt: '2026-04-01T10:08:00-05:00',
    sortOrder: 8,
  },
  {
    id: 'chk-010',
    title: 'Driver\'s license (required for rental pickup)',
    category: 'documents',
    completed: false,
    completedAt: null,
    createdAt: '2026-04-01T10:09:00-05:00',
    sortOrder: 9,
  },
  {
    id: 'chk-011',
    title: 'Download offline maps for Central Coast',
    category: 'transport',
    completed: false,
    completedAt: null,
    createdAt: '2026-04-01T10:10:00-05:00',
    sortOrder: 10,
  },
  {
    id: 'chk-012',
    title: 'Pack medications and first-aid kit',
    category: 'health',
    completed: false,
    completedAt: null,
    createdAt: '2026-04-01T10:11:00-05:00',
    sortOrder: 11,
  },
  {
    id: 'chk-013',
    title: 'Set up out-of-office email reply',
    category: 'other',
    completed: false,
    completedAt: null,
    createdAt: '2026-04-01T10:12:00-05:00',
    sortOrder: 12,
  },
]
```

- [ ] **Step 2: Verify**

```bash
cd /home/ubuntu/apps/travel-cali && node --check src/data/sampleChecklist.js
grep -c "^  {$" /home/ubuntu/apps/travel-cali/src/data/sampleChecklist.js
```

Expected from second command: `13`

---

### Task 8: Patch `HeroView.jsx` — destination photos, HIGHLIGHTS, accent

**Files:**
- Modify: `~/apps/travel-cali/src/views/HeroView.jsx`

`HeroView.jsx` has three hardcoded Hawaii references that must be adapted. The rest of the file (≈1100 lines) stays untouched.

- [ ] **Step 1: Replace destination photo constants**

Find lines 17–18:
```jsx
const KAUAI_PHOTO = 'https://images.unsplash.com/photo-1505852679233-d9fd70aff56d?auto=format&fit=crop&w=600&q=80'
const MAUI_PHOTO = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80'
```

Replace with:
```jsx
const AVILA_PHOTO = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80'
const AVILA_PHOTO_SECONDARY = AVILA_PHOTO
// Legacy aliases — rendering code at line ~670 references these by name;
// a single-destination trip only ever uses the first one.
const KAUAI_PHOTO = AVILA_PHOTO
const MAUI_PHOTO = AVILA_PHOTO_SECONDARY
```

Rationale: keep the existing `KAUAI_PHOTO` / `MAUI_PHOTO` references in the rendering code (line ~670) working without a deeper refactor. Only the first destination exists for Cali, so only `KAUAI_PHOTO` is actually used.

- [ ] **Step 2: Replace the HIGHLIGHTS array (lines 20–76)**

Find the `const HIGHLIGHTS = [ ... ]` block (starts at line 20, ends at line 76 with `]`). Replace the entire block with:

```jsx
const HIGHLIGHTS = [
  {
    title: 'Big Sur Coastal Drive',
    description: 'Highway 1 north through Bixby Bridge, McWay Falls, and Pfeiffer Beach — purple sand and sea cliffs.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    day: 3,
    date: '2026-05-07',
    destination: 'Avila Beach',
    time: '7:00 AM – 7:00 PM',
    icon: Mountain,
    eventId: 'e-0302',
  },
  {
    title: 'Point San Luis Lighthouse',
    description: 'Pecho Coast Trail — 3.5 mi out-and-back to a working 1890s lighthouse above the Pacific.',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80',
    day: 2,
    date: '2026-05-06',
    destination: 'Avila Beach',
    time: '9:00 AM – 11:30 AM',
    icon: Mountain,
    eventId: 'e-0201',
  },
  {
    title: 'Montaña de Oro SP',
    description: 'Valencia Peak summit + Bluff Trail — wildflowers, cliffs, and Spooner\'s Cove.',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80',
    day: 4,
    date: '2026-05-08',
    destination: 'Avila Beach',
    time: '8:30 AM – 12:30 PM',
    icon: Mountain,
    eventId: 'e-0401',
  },
  {
    title: 'Hearst Castle',
    description: 'Grand Rooms tour through William Randolph Hearst\'s clifftop Gilded Age estate.',
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&q=80',
    day: 5,
    date: '2026-05-09',
    destination: 'Avila Beach',
    time: '10:00 AM – 1:00 PM',
    icon: Camera,
    eventId: 'e-0502',
  },
  {
    title: 'Sycamore Mineral Springs',
    description: 'Private hillside hot tub under the oak trees — the Central Coast wind-down.',
    image: 'https://images.unsplash.com/photo-1616193653378-a9414ff47462?auto=format&fit=crop&w=600&q=80',
    day: 5,
    date: '2026-05-09',
    destination: 'Avila Beach',
    time: '8:00 PM – 9:30 PM',
    icon: Waves,
    eventId: 'e-0505',
  },
]
```

Note: `Camera` is already imported in `HeroView.jsx` via the Lucide imports — no new import needed. `Mountain`, `Waves`, `Sunrise`, `Ship` are likewise already imported from when the Hawaii highlights used them.

- [ ] **Step 3: Update the `isKauai` destination-accent check**

Find line 1544:
```jsx
  const isKauai = destination.id === 'dest-kauai'
  const accentColor = isKauai ? palette.accent : colors.sand
```

Replace with:
```jsx
  const isPrimary = destination.id === 'dest-avila' || destination.id === 'dest-kauai'
  const accentColor = isPrimary ? palette.accent : colors.sand
```

Find line 1615:
```jsx
            background: isKauai
              ? 'linear-gradient(135deg, #0A8F8F22, #0A8F8F44)'
              : `linear-gradient(135deg, ${colors.sand}22, ${colors.sand}44)`,
```

Replace with:
```jsx
            background: isPrimary
              ? 'linear-gradient(135deg, #2B7A9E22, #2B7A9E44)'
              : `linear-gradient(135deg, ${colors.sand}22, ${colors.sand}44)`,
```

Rationale: the Cali destination (`dest-avila`) gets the coastal-blue placeholder gradient matching `sampleTrip.destinations[0].color`.

- [ ] **Step 4: Verify the patch applied cleanly**

```bash
grep -n "KAUAI_PHOTO\|AVILA_PHOTO" /home/ubuntu/apps/travel-cali/src/views/HeroView.jsx
grep -n "dest-avila" /home/ubuntu/apps/travel-cali/src/views/HeroView.jsx
grep -c "e-0302\|e-0201\|e-0401\|e-0502\|e-0505" /home/ubuntu/apps/travel-cali/src/views/HeroView.jsx
```

Expected:
- First grep: finds both `AVILA_PHOTO` and the legacy `KAUAI_PHOTO` alias
- Second grep: finds `isPrimary = destination.id === 'dest-avila' || …`
- Third grep: `5`

---

### Task 9: Install deps and run the fork's test + build

**Files:**
- None (CI-style check)

- [ ] **Step 1: Install dependencies**

```bash
cd /home/ubuntu/apps/travel-cali && npm install
```

Expected: dependencies install. `node_modules/` created. Takes ~60–120s.

- [ ] **Step 2: Run the trip-shift regression test**

```bash
cd /home/ubuntu/apps/travel-cali && npm test
```

Expected: all 15 assertions pass. Output ends with `All tests passed` (or equivalent). If any fail, the copied `tripShift.test.mjs` asserts against state shape — a Cali data problem would surface here.

- [ ] **Step 3: Run the production build**

```bash
cd /home/ubuntu/apps/travel-cali && npm run build
```

Expected: ESLint passes (zero errors), tests pass, Vite build succeeds with `dist/` created. Takes ~15–30s.

If ESLint reports unused variables (e.g., `Ship`, `Sunrise`, `Palmtree` may now be imported but unused after HIGHLIGHTS swap), fix them: remove the unused imports from the top of `HeroView.jsx`. Re-run the build.

- [ ] **Step 4: Sanity-check the build output**

```bash
ls /home/ubuntu/apps/travel-cali/dist/ && grep -c "California Coast" /home/ubuntu/apps/travel-cali/dist/index.html
```

Expected: `dist/` contains `index.html`, `manifest.json`, `sw.js`, `assets/`. `grep` returns at least `1`.

---

### Task 10: Create Kubernetes manifest for `travel-cali`

**Files:**
- Create: `~/kube/manifests/travel-cali/deployment.yaml`

- [ ] **Step 1: Create the manifest directory**

```bash
mkdir -p /home/ubuntu/kube/manifests/travel-cali
```

- [ ] **Step 2: Write the deployment manifest**

Write the following content to `~/kube/manifests/travel-cali/deployment.yaml`:

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: travel-cali
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: travel-cali
  namespace: travel-cali
  labels:
    app: travel-cali
spec:
  replicas: 1
  selector:
    matchLabels:
      app: travel-cali
  template:
    metadata:
      labels:
        app: travel-cali
    spec:
      containers:
      - name: travel-cali
        image: 192.168.1.122:5000/travel-cali:v0.0.0
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "64Mi"
            cpu: "50m"
          limits:
            memory: "128Mi"
            cpu: "200m"
        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 3
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: travel-cali
  namespace: travel-cali
spec:
  type: LoadBalancer
  loadBalancerIP: 192.168.1.213
  selector:
    app: travel-cali
  ports:
  - port: 80
    targetPort: 80
    protocol: TCP
```

Rationale on `v0.0.0`: `deploy.sh` reads the current tag and auto-increments the patch. Setting `v0.0.0` makes the first deploy produce `v0.0.1`, matching the starting version in `package.json`.

No `ingress.yaml` and no `certificate.yaml` because the user asked for **K3s-only, IP access**.

- [ ] **Step 3: Verify**

```bash
grep "loadBalancerIP" /home/ubuntu/kube/manifests/travel-cali/deployment.yaml
```

Expected: `  loadBalancerIP: 192.168.1.213`

---

### Task 11: Create ArgoCD Application for `travel-cali`

**Files:**
- Create: `~/kube/manifests/argocd-apps/travel-cali.yaml`

- [ ] **Step 1: Write the Application manifest**

Write the following content to `~/kube/manifests/argocd-apps/travel-cali.yaml`:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: travel-cali
  namespace: argocd
  finalizers:
    - resources-finalizer.argocd.argoproj.io
spec:
  project: default
  source:
    repoURL: git@github.com:kernelpanic09/homelab.git
    targetRevision: main
    path: travel-cali
  destination:
    server: https://kubernetes.default.svc
    namespace: travel-cali
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
```

- [ ] **Step 2: Verify**

```bash
grep "name\|path" /home/ubuntu/kube/manifests/argocd-apps/travel-cali.yaml
```

Expected output contains `name: travel-cali` and `path: travel-cali`.

---

### Task 12: Commit manifests to GitOps repo and register ArgoCD app

**Files:** none (git + kubectl operations)

- [ ] **Step 1: Commit the new manifests to the GitOps repo**

```bash
cd /home/ubuntu/kube/manifests
git add travel-cali/ argocd-apps/travel-cali.yaml
git status
```

Expected: two new files staged (`travel-cali/deployment.yaml`, `argocd-apps/travel-cali.yaml`).

```bash
cd /home/ubuntu/kube/manifests && git commit -m "Add travel-cali: California Coast trip fork at 192.168.1.213"
git push
```

Expected: commit pushes cleanly.

- [ ] **Step 2: Apply the ArgoCD Application to the cluster**

```bash
export KUBECONFIG=/home/ubuntu/.kube/k3s-config
kubectl apply -f /home/ubuntu/kube/manifests/argocd-apps/travel-cali.yaml
```

Expected: `application.argoproj.io/travel-cali created`.

- [ ] **Step 3: Confirm ArgoCD picks it up**

```bash
kubectl get application travel-cali -n argocd
```

Expected: the application exists. Sync status will be `OutOfSync` or the pod will be `ImagePullBackOff` because `v0.0.0` doesn't exist in the registry yet. That's fine — the next task fixes it.

---

### Task 13: First deploy via `deploy.sh`

**Files:** none (build + registry push + manifest bump, all automated)

- [ ] **Step 1: Run the standard deploy pipeline**

```bash
deploy.sh travel-cali "Initial California Coast trip"
```

Expected pipeline (~2–4 min total):
1. Auto-bumps version: `v0.0.0 → v0.0.1`
2. Builds Docker image at `192.168.1.122:5000/travel-cali:v0.0.1`
3. Pushes to local registry
4. Updates `~/kube/manifests/travel-cali/deployment.yaml` tag to `v0.0.1`
5. Git-commits the manifest change and pushes
6. ArgoCD detects the change, syncs, starts the pod
7. Pod reaches Ready

- [ ] **Step 2: Verify the pod is healthy**

```bash
kubectl get pods -n travel-cali
```

Expected: one pod with `STATUS: Running` and `READY: 1/1`.

- [ ] **Step 3: Verify the LoadBalancer has the correct IP**

```bash
kubectl get svc -n travel-cali
```

Expected: `travel-cali` service with `TYPE: LoadBalancer` and `EXTERNAL-IP: 192.168.1.213`.

---

### Task 14: Smoke-test the running site

**Files:** none (live verification)

- [ ] **Step 1: Verify HTTP 200**

```bash
curl -sI http://192.168.1.213 | head -1
```

Expected: `HTTP/1.1 200 OK` (or HTTP/2 200).

- [ ] **Step 2: Verify the app title served from nginx**

```bash
curl -s http://192.168.1.213 | grep -o "<title>[^<]*</title>"
```

Expected: `<title>California Coast</title>`

- [ ] **Step 3: Verify the PWA manifest**

```bash
curl -s http://192.168.1.213/manifest.json | grep '"name"'
```

Expected: `"name": "California Coast",`

- [ ] **Step 4: Verify the service worker cache name**

```bash
curl -s http://192.168.1.213/sw.js | grep CACHE_NAME
```

Expected includes: `const CACHE_NAME = 'travel-cali-v1';`

- [ ] **Step 5: Inform the user**

Report to the user:
- The app is live at **http://192.168.1.213**.
- Pod is Running, manifest version is `v0.0.1`, SW cache is `travel-cali-v1`.
- Known caveats (from spec): Airbnb address placeholder, meal titles marked "TBD", rental times adjusted for real-world scheduling.
- To iterate: run `deploy.sh travel-cali "message"` after any future edits to `~/apps/travel-cali/`.

---

## Self-Review

### Spec coverage
- ✅ Fork `~/apps/travel/` → `~/apps/travel-cali/` — Task 1
- ✅ `sampleTrip.js` California data — Task 6
- ✅ `sampleChecklist.js` California items — Task 7
- ✅ App name / PWA / title updates — Tasks 2, 3, 4, 5
- ✅ HeroView HIGHLIGHTS + destination photos + accent — Task 8 (discovered during planning; not in spec's "In scope" but implicitly required for the fork to be coherent)
- ✅ K8s manifest at `~/kube/manifests/travel-cali/` — Task 10
- ✅ ArgoCD Application — Task 11
- ✅ MetalLB IP 192.168.1.213 — Tasks 10, 14
- ✅ No prod/Hostinger deploy — `deploy-prod.sh` removed in Task 1 Step 2
- ✅ `deploy.sh travel-cali` standard pipeline — Task 13
- ✅ Tests: `tripShift.test.mjs` runs via `npm test` / `npm run build` — Task 9

### Placeholder scan
- All code blocks contain full content — no TBD/TODO/fill-in-later anywhere in implementation steps.
- Caveats in the trip *data* (Airbnb address = "Avila Beach, CA", some dinner titles = "TBD") are intentional and user-editable in-app; they are not plan failures.

### Type / name consistency
- Service name, Deployment name, Namespace, app label, ArgoCD Application name, GitOps path, Docker image all consistently use `travel-cali`.
- Destination ID `dest-avila` used consistently across `sampleTrip.js` (Task 6), `HeroView.jsx` `isPrimary` check (Task 8).
- Event IDs referenced in HIGHLIGHTS (`e-0302`, `e-0201`, `e-0401`, `e-0502`, `e-0505`) all exist in `sampleTrip.js` Task 6.
- `KAUAI_PHOTO` alias preserved to avoid refactoring the rendering code at line ~670 — justified inline in Task 8.

### Scope
- Single plan, single deployable outcome. Good size for one implementation session (~45–90 min).
