# Travel Cali — California Coast Fork Design

**Date:** 2026-04-17
**Status:** Approved (pending live-draft review)
**Owner:** User (solo trip)

## Goal

Ship a dedicated, K3s-only instance of the Travel Day Organizer app pre-populated with the user's real California Coast trip (May 5–10, 2026, based out of Avila Beach). The existing `travel` app (Hawaii, March 2026) stays untouched; `travel-cali` is an independent fork with its own deploy pipeline, IP, and ArgoCD application. No Hostinger/prod deploy.

## Scope

### In scope
- Fork the entire `~/apps/travel/` codebase to `~/apps/travel-cali/`
- Replace `src/data/sampleTrip.js` with California trip data (trip meta, destination, day-by-day events)
- Replace `src/data/sampleChecklist.js` with a California-adapted packing checklist
- Update app name, package name, manifest, ArgoCD Application, and favicon accent color where appropriate
- New K3s deployment at `192.168.1.213` (next free LoadBalancer IP)
- Deploy via `deploy.sh travel-cali "..."` (standard pipeline)

### Out of scope
- Prod/Hostinger deployment (`deploy-prod.sh` not ported)
- Trip-switching UI inside a single app (rejected in brainstorming — fork is cleaner)
- New components, event types, or design system changes (design parity with `travel`)
- Documents pre-seeding — user will upload PDFs in-app
- Any changes to the existing `travel` app

## Architecture

### Directory layout (new)
```
~/apps/travel-cali/             # Full source fork
  src/
    data/
      sampleTrip.js             # CHANGED — California trip data
      sampleChecklist.js        # CHANGED — California checklist
      eventTypes.js             # unchanged
      statusCategories.js       # unchanged
      coverImages.js            # unchanged
  package.json                  # name: travel-cali
  Dockerfile                    # unchanged (multi-stage vite+nginx)
  nginx.conf                    # unchanged
  deploy-prod.sh                # DELETED (no prod deploy)
  ...

~/kube/manifests/travel-cali/   # New ArgoCD-watched manifest
  namespace.yaml
  deployment.yaml
  service.yaml                  # LoadBalancer, IP 192.168.1.213
  argocd-app.yaml               # registers with ArgoCD
```

### State-shape compatibility
`travel-cali` uses the same `TripContext` reducer, same `DATA_VERSION` bump mechanism, same trip-reset shift logic (`src/context/tripShift.js`). No structural changes to state shape — only the seed data changes. This means the regression test at `src/context/tripShift.test.mjs` continues to guard the shift logic in the fork (copied as-is).

### Deploy pipeline
`deploy.sh travel-cali "msg"` reads the image tag from `~/kube/manifests/travel-cali/deployment.yaml`, auto-increments the patch version, builds + pushes to the local registry (`192.168.1.122:5000/travel-cali:vX.Y.Z`), updates the manifest, git-pushes, and waits for ArgoCD to reconcile. Standard pipeline — no modifications.

## Data Model

### Trip metadata (`sampleTrip`)
```js
{
  id: 'trip-cali-2026',
  name: 'California Coast',
  tagline: 'Central Coast Escape',
  startDate: '2026-05-05',
  endDate: '2026-05-10',
  homeTimezone: 'America/Chicago',   // MSP is Central
  status: 'upcoming',
  destinations: [
    {
      id: 'dest-avila',
      name: 'Avila Beach',
      island: 'Central Coast',        // reused field, not actually an island
      startDate: '2026-05-05',
      endDate: '2026-05-10',
      color: '#2B7A9E',               // coastal blue (colors.info family)
      accentLight: '#E0F1F8',
      accommodation: {
        name: 'Avila Beach Airbnb',
        address: 'Avila Beach, CA',   // TODO: pull exact address from listing 36815131 in-app after deploy
        confirmationNumber: 'AIRBNB-36815131',
      },
    },
  ],
}
```

### Day-by-day events (`sampleDays`)

All times are ISO-8601 with explicit timezone offsets. Events are keyed by local date of event start. Home-leg events (May 5 morning, May 10 afternoon) use `-05:00` (CDT); California events use `-07:00` (PDT). Flight events spanning timezones are recorded with the origin timezone on `startTime` and the destination timezone on `endTime`.

**Day 1 — Tue May 5 (Travel + Settle in)**
| Time (local) | Type | Title | Notes |
|---|---|---|---|
| 6:00–6:30 AM CDT | buffer | Wake up & prepare | 30 min morning prep |
| 6:30–7:15 AM CDT | ground_transport | Uber to MSP | UberX ~45 min |
| 9:00–10:20 AM | flight | UA 1891 MSP → DEN | 737-900, United Economy, 2h 20m |
| 11:30 AM MDT–1:31 PM PDT | flight | UA 4765 DEN → SBP | E175 SkyWest/United Express, 3h 1m |
| 1:45–2:15 PM PDT | ground_transport | Pick up rental car | Enterprise SBP, ref L5411331507, phone 805-781-3383 |
| 2:30–4:00 PM PDT | ground_transport | Drive to Airbnb + grocery stop | ~25 min drive + stop |
| 4:00 PM PDT | hotel | Airbnb check-in | Listing 36815131, check-in 4 PM |
| 6:30–8:00 PM PDT | dining | Dinner | TBD — local Avila restaurant |

**Day 2 — Wed May 6 (Avila local)**
| Time | Type | Title |
|---|---|---|
| 9:00–11:30 AM PDT | hiking | Point San Luis Lighthouse / Pecho Coast Trail |
| 12:30–1:30 PM PDT | dining | Lunch (TBD) |
| 2:00–4:30 PM PDT | activity | Bob Jones Trail (bike/walk to Avila Beach) |
| 6:30–8:00 PM PDT | dining | Dinner (TBD) |

**Day 3 — Thu May 7 (Big Sur — only activity, long drive)**
| Time | Type | Title |
|---|---|---|
| 7:00–9:30 AM PDT | ground_transport | Drive to Big Sur (~2.5 hr) |
| 9:30 AM–4:30 PM PDT | sightseeing | Big Sur: Bixby Bridge → McWay Falls → Pfeiffer Beach |
| 4:30–7:00 PM PDT | ground_transport | Drive back to Avila (~2.5 hr) |

**Day 4 — Fri May 8 (Montaña de Oro + Morro Bay)**
| Time | Type | Title |
|---|---|---|
| 8:30 AM–12:30 PM PDT | hiking | Montaña de Oro SP: Valencia Peak + Bluff Trail + Spooner's Cove |
| 1:00–2:30 PM PDT | dining | Lunch in Morro Bay |
| 2:30–5:00 PM PDT | sightseeing | Morro Bay + Morro Rock |
| 7:00–8:30 PM PDT | dining | Dinner (TBD) |

**Day 5 — Sat May 9 (Hearst + Pismo + Hot Springs)**
| Time | Type | Title |
|---|---|---|
| 9:00–9:45 AM PDT | ground_transport | Drive to San Simeon (~45 min) |
| 10:00 AM–1:00 PM PDT | sightseeing | Hearst Castle tour |
| 2:00–4:00 PM PDT | beach | Pismo Beach boardwalk |
| 6:00–7:30 PM PDT | dining | Dinner (TBD) |
| 8:00–9:30 PM PDT | activity | Sycamore Mineral Springs (private hot tub) |

**Day 6 — Sun May 10 (Travel home)**
| Time | Type | Title |
|---|---|---|
| 5:30–6:15 AM PDT | buffer | Wake up & pack |
| 6:15–6:30 AM PDT | hotel | Airbnb check-out (early; official 11 AM) |
| 6:30–7:00 AM PDT | ground_transport | Drive to SBP |
| 7:00–7:15 AM PDT | ground_transport | Drop off rental car, Enterprise SBP |
| 8:00–9:12 AM PDT | flight | UA 6035 SBP → SFO (CRJ700 SkyWest, 1h 12m) |
| 10:09 AM PDT–3:53 PM CDT | flight | UA 2272 SFO → MSP (737-800, 3h 44m) |
| 4:00–4:45 PM CDT | ground_transport | Uber home from MSP |

### Checklist (`sampleChecklist`)
California-adapted packing checklist, seeded from Hawaii template but swapped for cooler coastal weather and hiking focus:
- **Travel docs:** Driver's license (required for rental), passport (optional), boarding passes, rental confirmation
- **Clothing:** Layers (coastal mornings are cool), light jacket, hiking pants, swimsuit, casual dinner clothes
- **Hiking gear:** Hiking shoes, daypack, water bottle, trail snacks
- **Essentials:** Sunscreen, sunglasses, phone charger, reusable bag
- **Tech:** Phone, laptop (optional), camera

Exact items and categories will be adapted from the existing Hawaii checklist structure in `src/data/sampleChecklist.js` — same category taxonomy, California-specific items.

## Deployment

### New files
```
~/apps/travel-cali/                   # full fork (new)
~/kube/manifests/travel-cali/
  namespace.yaml                      # Namespace: travel-cali
  deployment.yaml                     # image: 192.168.1.122:5000/travel-cali:v0.0.1
  service.yaml                        # LoadBalancer, loadBalancerIP: 192.168.1.213
  argocd-app.yaml                     # ArgoCD Application pointing at manifests/travel-cali
```

### Manifest diff vs. `travel`
- `namespace`: `travel` → `travel-cali`
- `app.kubernetes.io/name` label: `travel` → `travel-cali`
- image: `travel` → `travel-cali`
- `loadBalancerIP`: `192.168.1.198` → `192.168.1.213`
- ArgoCD Application name + path pointer: `travel` → `travel-cali`

### Deploy command
```bash
deploy.sh travel-cali "Initial California Coast trip"
```

### Access
- **Local URL:** http://192.168.1.213
- **Prod URL:** none

## Testing & Verification

1. Local `npm run build` succeeds (runs `eslint src/ && vite build`)
2. Existing `src/context/tripShift.test.mjs` passes in the fork (guards trip-reset logic)
3. After `deploy.sh travel-cali`, pod healthy in `travel-cali` namespace
4. http://192.168.1.213 loads, shows "California Coast" trip, Avila Beach destination, and all 6 days populate
5. Flight cards render with correct times and timezones
6. Checklist renders with California-adapted items
7. LocalStorage persistence works (refresh keeps state)
8. Trip-reset logic works: when `today > 2026-05-10`, dates auto-shift forward (proven by existing regression test)

## Rollback

- Delete ArgoCD Application: `argocd app delete travel-cali`
- Delete manifest directory: `rm -rf ~/kube/manifests/travel-cali/`
- Delete source: `rm -rf ~/apps/travel-cali/`
- Git-revert the manifest + source commits
- MetalLB IP 192.168.1.213 returns to the free pool automatically

## Known Issues / Caveats

1. **Rental car booking time mismatch (non-blocking):** Enterprise booking says 1:00 PM pickup May 5 and 8:00 AM dropoff May 10. The app schedules these at 1:45 PM and 7:00 AM respectively to match reality (flight lands 1:31 PM; flight departs 8:00 AM). User does not need to contact Enterprise.
2. **Airbnb address:** The listing URL (36815131) is known but the exact street address is not in the spec. Initial seed uses `"Avila Beach, CA"` as a placeholder; user updates the hotel card in-app after deploy, OR we pull the address from the listing page before seeding (decided during implementation plan).
3. **Meal events are mostly TBD:** Dining slots are pre-scheduled but titles say "TBD" — user fills in specific restaurants in-app.

## Decisions Made During Brainstorming

- **Home-base model** (1 destination, Big Sur as day-trip event) over multi-destination (matches reality: one Airbnb).
- **Fork** over env-var parameterization of a single codebase (YAGNI — simpler to reason about, no cross-trip bugs).
- **K3s only**, no Hostinger prod (user request — private trip, no public URL needed).
- **Big Sur is the only activity on Day 3** (user explicit — 5 hr round-trip drive dominates the day).
