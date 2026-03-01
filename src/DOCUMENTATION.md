# Travel Day Organizer — UX Documentation

> A portfolio-quality Hawaii trip planner built with React 19, Framer Motion, and a tropical design system. This document serves as the complete UX reference for the Travel module.

**Live URL:** `http://192.168.1.198`
**Deployment:** Standalone K8s namespace `travel`
**Current Version:** v0.0.128

---

## Table of Contents

1. [Project Overview & Product Brief](#1-project-overview--product-brief)
2. [Information Architecture](#2-information-architecture)
3. [Design System](#3-design-system)
4. [Component Library](#4-component-library)
5. [User Flows & Interactions](#5-user-flows--interactions)
6. [Accessibility & NN/g Compliance](#6-accessibility--nng-compliance)
7. [Data Architecture & State Management](#7-data-architecture--state-management)
8. [Visual Design & Layout Patterns](#8-visual-design--layout-patterns)
9. [Animation & Motion Design](#9-animation--motion-design)
10. [Technical Implementation & File Structure](#10-technical-implementation--file-structure)

---

# 1. Project Overview & Product Brief

## Product Vision and Purpose

The Travel App is a **portfolio-quality Hawaii trip planner** designed to showcase modern UX patterns and premium design execution. It's a fully-functional vacation organizer that demonstrates how cutting-edge UI libraries (React 19, Framer Motion, date-fns) can create compelling experiences for travel planning. The app elevates the mundane task of itinerary management into an elegant, vacation-magazine aesthetic that makes planning enjoyable and memorable.

## Design Philosophy

The app was built as a **viewer/organizer** for a pre-planned trip, not a trip builder. Going to full editing is a significant architectural shift — the day structure, calendar, timeline all derive from the fixed start/end dates and destination assignments. Users plan trips externally (Google Docs, TripIt, spreadsheets), then this app presents the itinerary beautifully for on-the-go use. Light editing (renaming events, updating notes, swapping photos) is supported, but the core trip structure remains fixed.

## Target Audience and Use Case

**Primary Users:** Travelers and vacationers planning multi-destination trips who want an intuitive, beautiful way to organize their experiences.

**Key Use Cases:**
- Planning and visualizing multi-day, multi-destination vacations
- Organizing transportation, accommodation, dining, and activity bookings
- Managing complex travel logistics across multiple islands/locations with timezone awareness
- Creating detailed day-by-day timelines with hour-level granularity
- Reviewing, editing, and updating events in real-time during a trip

## Key Features

- **Multi-Day, Multi-Destination Support:** Plan across multiple islands or regions with dedicated destination tracking (Kauai & Maui in the demo)
- **9-Day Hawaii Itinerary:** Pre-loaded sample trip: **March 14–22, 2026** — a realistic Kauai & Maui vacation
- **Five Primary Views:**
  - **Hero View:** Trip overview with key details and call-to-action navigation
  - **Calendar View:** Month-at-a-glance visualization showing trip dates and destinations
  - **Day Timeline View:** Hour-by-hour itinerary with image card schedule blocks and full CRUD capabilities
  - **Event Detail View:** Full event information page with location, confirmation, notes, status, and edit access
  - **Status View:** Trip preparation checklist with add/edit/delete/toggle, categorized by type, plus document upload (base64 in localStorage, 2MB limit) with full-screen preview
- **Event Management:** Create, read, update, delete (CRUD) operations for all event types
- **Rich Event Types:** 14 specialized event categories including flights, hotels, dining, activities, ground transport, boat tours, hiking, sunrise viewing, and more
- **LocalStorage Persistence:** All changes automatically save to browser storage, enabling offline access and data retention across sessions
- **Timezone Awareness:** Handles multiple timezones (Chicago Central / Hawaii-Aleutian) with proper time conversion
- **Confirmation Numbers & Details:** Track booking references, locations, special notes, and status for each event
- **Accommodation Tracking:** Full hotel details including addresses and confirmation numbers

## Design Philosophy

The Travel App embraces a **tropical, premium, vacation magazine aesthetic** that evokes the feeling of luxury travel planning:

- **Color Language:** Warm tropical tones (teal-blue #0E7490 for actions, destination teals #0A8F8F, warm golds #C4A265, light accents) that reflect Hawaiian islands and beaches
- **Visual Hierarchy:** Clear distinction between destinations through color coding, making multi-location trips easy to follow
- **Premium Typography:** Elegant Inter font with generous whitespace, reflecting high-end travel publications
- **Smooth Animations:** Framer Motion transitions between views create a refined, orchestrated feel
- **Contextual Design:** Event cards, timeline indicators, and destination headers are purposefully styled to communicate travel information intuitively
- **Responsive Interaction:** Hover states, smooth page transitions, and interactive elements feel high-touch and polished

## Project Goals

1. **Test Advanced UI Patterns:** Demonstrate proficiency with complex state management (React Context), animations (Framer Motion), and responsive design
2. **Showcase Design Skills:** Create a portfolio piece that proves ability to design cohesive, beautiful interfaces with attention to detail
3. **Explore Real-World Complexity:** Handle intricate data structures (multi-day events, timezones, nested data), validating ability to solve complex UX problems
4. **Demonstrate Full-Stack Thinking:** From conceptual design through implementation, localStorage persistence, and user workflows
5. **Serve as Reference:** Provide a complete example of modern React patterns for future projects in the UI Test sandbox

## App Summary Statistics

**Project Scale:**
- **Total Components:** 33 (1 main entry point, 5 views, 15 components + 3 calendar sub-components, 1 context provider, 9 supporting files)
- **Number of Views:** 5 (Hero, Calendar, Day Timeline, Event Detail, Status)
- **Event Types:** 14 (flight, hotel, dining, beach, sightseeing, shopping, hiking, boat, ground_transport, activity, buffer, entertainment, sunrise, custom)
- **Checklist Categories:** 6 (packing, booking, documents, health, transport, other)
- **Document Categories:** 6 (passport, boarding_pass, hotel_confirmation, insurance, rental_car, other)
- **Total Mock Events:** 63 events distributed across 9 days
- **Route:** `/travel` in the UI Test app router

**Data Architecture:**
- 2 primary destinations (Kauai: Mar 14–18, Maui: Mar 18–22)
- 9 daily itineraries with granular hour-level scheduling
- Accommodation details for 2 luxury resorts
- Rich metadata: confirmation numbers, locations, notes, timezone information

**Technical Implementation:**
- **Architecture:** Component-based with Context API state management (TripProvider, useTripContext)
- **Storage:** LocalStorage for data persistence and offline access
- **Animation Framework:** Framer Motion for page transitions and interactive elements
- **Data Management:** React hooks (useState, useCallback) for state and event handling
- **Styling Approach:** Inline styles with color tokens, self-contained component design following UI Test patterns

---

# 2. Information Architecture

## Overview

The Travel app is a single-trip itinerary planner with a focus on multi-destination experiences. It uses a **three-view model** with a persistent bottom navigation system to move between a trip overview, month-long calendar, and day-by-day timeline. All state is managed centrally through React Context, ensuring data consistency across navigation patterns.

## App Structure & View Hierarchy

```
Travel App (Entry Point)
│
├─ TripProvider (Context)
│  └─ TravelInner
│     ├─ HeroView (active view = 'hero')
│     ├─ CalendarView (active view = 'calendar')
│     ├─ DayTimelineView (active view = 'day')
│     ├─ EventDetailView (active view = 'eventDetail')
│     ├─ StatusView (active view = 'status')
│     └─ Navigation (persistent bottom nav)
```

**Key Facts:**
- Views are rendered exclusively (one at a time via `AnimatePresence`)
- Each view receives `onNavigate(view, optionalDate)` callback (except StatusView which is self-contained)
- View transitions use Framer Motion with staggered opacity/scale animations (250ms enter, 150ms exit)
- Switching tabs calls `window.scrollTo(0, 0)` to reset scroll position (except returning to Hero, which restores saved scroll position)
- Hero scroll position is saved to a ref when leaving and restored via a `useEffect` that watches `activeView`. When the view returns to `'hero'`, a 450ms `setTimeout` (exit 150ms + enter 250ms + buffer) fires `window.scrollTo` to the saved Y position. This ensures returning from highlight cards (EventDetailView → Hero) restores to the exact scroll position. Note: Framer Motion 11 with inline animation objects passes definition objects (not strings) to `onAnimationComplete`, making `def === 'animate'` checks unreliable — hence the `useEffect` approach
- All views inherit theme colors from a centralized `colors` object and spacing tokens
- The app enforces a max-width of 480px for mobile-first design
- EventDetailView is a sub-view accessed from DayTimelineView via TimeBlock chevron arrows or from HeroView highlight cards

### Central State Management

The `TripContext` stores:
- `trip` — metadata (title, date range, destinations array)
- `days` — keyed by date, containing events, destination assignment, and day labels
- `activeView` — which view to render ('hero', 'calendar', 'day', 'eventDetail', or 'status')
- `selectedDate` — the currently focused date (when viewing day timeline)
- `selectedEventId` — the event ID for EventDetailView (set when navigating to event detail)
- `checklistItems` — array of preparation checklist items with category, completion state, timestamps
- `documents` — array of uploaded documents stored as base64 data URLs with metadata
- `heroImage` — custom hero photo data URL (compressed JPEG via canvas upload, or null for default)

## Navigation Model

### Bottom Tab Navigation (persistent, always visible)

| Item | ID | Icon | Purpose | Behavior |
|------|-----|------|---------|----------|
| Trip | `hero` | Palmtree | Trip overview, stats, quick-access chips | Navigates to Hero View |
| Plan | `calendar` | CalendarDays | Full month grid view of all days | Navigates to Calendar View |
| Add | `add` | Plus (in teal circle) | Create new event | Opens EventEditor modal overlay |
| Day | `day` | Clock | Timeline for selected date | Navigates to Day View with current/selected date |
| Status | `status` | CheckCircle2 | Preparation checklist + documents | Navigates to Status View |

### Navigation Interaction Model

```
Hero View ──────┬─→ Calendar View
     ↑          │        ↓
     │          └─→ Day Timeline View ←─┐
     │                    ↑              │
     └─────────────────────┴──────────────┘
```

**Key Navigation Behaviors:**

1. **Tab Switching** — Users click tab icon → `onNavigate(viewId)` updates `activeView` state
2. **Date Preservation** — When switching to Day View, maintains the last-selected date (or today if first visit)
3. **Add Button** — Increments `addTrigger` counter, DayTimelineView watches this and opens EventEditor when triggered
4. **Navigation Accessibility**:
   - WCAG 2.5.5 AAA compliant touch targets (54px tall, 48px minimum recommended)
   - `role="tablist"` + `role="tab"` + `aria-selected` for screen readers
   - Inactive tab text: #9B9B9B on #1F2937 (uses `colors.textMuted`)
   - Active tab text: #FFFFFF on #1F2937 (13.5:1 contrast, WCAG AAA)
   - Flex layout prevents width shift when active state changes

## Screen-by-Screen Breakdown

### HERO VIEW — Trip Landing Page

**Purpose:** Show trip-at-a-glance, surface key metrics, enable quick access to specific days. Provides temporal orientation through live countdowns, flight tracking, and weather context.

**Content Zones (top to bottom):**

1. **Hero Image** — Full-bleed photo (210px) with gradient overlay, single frosted glass pill badge ("X days · Xd away" with dot separator, unified 12px font). Default image is `/hero-bg.png` (sunset beach). Users can upload a custom photo via the camera button (frosted glass circle, top-right of hero). Uploaded images are compressed via canvas (1200px max width, JPEG 0.7 quality) and stored as data URL in state (`heroImage`). Custom photo persists across sessions via localStorage and is shared with TripHeader on the calendar page.
2. **Content Panel** — Warm gray surface overlapping hero by -28px with 24px top radius
3. **Next Up Card** — Shows next upcoming event with icon + title on the same horizontal row (matching Flight/Countdown card layout), time (`body` 15px), location (`body` 15px, MapPin 13px). No header label or day counter. Taps navigate to event detail.
4. **Flight Status Card** — Shows next upcoming flight with route visualization (ORD ——✈—— LIH), status badge (On Time / Delayed, 12px), and **simulated milestone log** — a mini vertical timeline of 6 milestones (check-in, gate, boarding, doors, departed/in-flight, landed) with sliding window showing 3 at a time. Milestones: green filled dot (done), teal pulsing dot with glow (current), hollow circle (upcoming). Vertical connector lines between dots. Relative timestamps update every 60s. Skipped if flight is same as Next Up event. Title uses full `sectionHeader` (18px), date/time use `body` (15px).
5. **Trip Countdown Card** — Pre-trip card showing days until departure with location route (Kauai → Maui). Uses same milestone log visual pattern with 6 countdown milestones (trip booked, 30 days out, 3 weeks out, 2 weeks out, 1 week out, trip begins). Sliding window of 3 centered on current. Hidden once trip has started. Title uses full `sectionHeader` (18px), date range uses `body` (15px), badge 12px, location uses `body` (15px).
6. **Destination Cards** — Compact photo cards (50px photo height) per destination with name, date range, day count, and arrow CTA. Tap jumps to first day at that destination.
7. **Daily Overview** — Horizontal scroll of day chips using `glass.card` (white cards) with `touchAction: 'pan-x'` for reliable horizontal scrolling. Shows: day-of-week abbreviation, date number, **weather icon** (sun/cloud-sun/cloud/rain), and **temperature**. Weather data comes from **Open-Meteo API** when a zip code is entered (real forecast for dates within 16-day window), falling back to **deterministic simulation** (75–85°F, Hawaii-realistic) for dates beyond forecast range. Includes a zip code input field with info message indicating forecast availability. Tapping a chip navigates to that day's timeline.
8. **Featured Highlights** — 5 editorial cards (Na Pali Coast Boat Tour, Haleakala Sunrise, Waimea Canyon Drive, Poipu Beach Snorkeling, Road to Hana) with cover photo, title (`sectionHeader` 18px), meta info (13px), description (`body` 15px), destination badge, and "View Day X" CTA (15px). Card content area padded at 14px 16px. Card gap 16px. Tapping navigates to EventDetailView for that event. Defined in the `HIGHLIGHTS` array at the top of HeroView with `eventId`, `date`, `day`, and `time` fields that must match the actual sampleTrip data. Each highlight's curated photo URL is also set as `coverImage` on the corresponding event in `sampleTrip.js`, ensuring visual continuity across highlight card → timeline card → event detail page.

**Sub-Components:**
- `DestCard` — Photo + info card with image preloading, destination color accent
- `FlightMilestoneRow` — Reusable timeline row with dot indicator (done/current/upcoming), label, detail text, and relative timestamp. Used by both flight status and trip countdown cards.
- `WeatherIcon` — Maps weather conditions to Lucide icons (Sun, CloudSun, Cloud, CloudRain)

**Helper Functions (module-level):**
- `seededGate(eventId)` — Deterministic airport gate from event ID hash (e.g. "B12")
- `computeRemaining(endMs, nowMs)` — "2h 15m remaining" for in-flight state
- `formatRelativeTime(timestampMs, nowMs)` — "in 35m", "2h ago", "Now", or short date for >24h
- `formatCountdownTime(triggerMs, nowMs)` — Day-level precision: "in 21d", "7d ago", "Now"
- `getFlightMilestones(flight, nowMs)` — Builds 6 flight milestones with status assignment
- `getTripCountdownMilestones(startDate, nowMs)` — Builds 6 trip countdown milestones
- `getVisibleMilestones(milestones)` — Sliding window of 3 centered on current milestone
- `getSimulatedWeather(dateStr, destId)` — Deterministic weather from date+destination hash (Hawaii-realistic, fallback when real data unavailable)
- `mapWeatherCode(code)` — Maps WMO weather codes to condition strings (0-1→sunny, 2-3→partly-cloudy, 45-67→cloudy, 71+→rain)
- `fetchWeatherForZip(zipCode, tripStart, tripEnd)` — Geocodes zip via Open-Meteo, fetches 16-day forecast, returns only dates overlapping with trip range

### CALENDAR VIEW — Full Trip Overview

**Purpose:** Show the entire trip month in a calendar grid with month navigation, allowing users to scan days by event density and destination, tap for day summaries, and filter by destination.

**Content Zones (top to bottom):**

1. **Compact Header** — Smaller hero image, no title
2. **Month Navigation** — Prev/next chevron buttons (44x44px) flanking the month title + "Activity days" subtitle (`typography.body` 15px, `warmPalette.textMedium` color). Swipe gesture via Framer Motion `drag="x"` with 80px threshold. Slide + fade animation (250ms enter, 150ms exit) on month change.
3. **Calendar Grid** — 7-column grid with color-coded DayCard cells. Selected date gets accent ring (2.5px solid #0E7490), today gets subtle textLight border, event density shown via horizontal bars instead of dots, destination shape indicators (circle=Kauai, square=Maui).
4. **CalendarTooltip** — On day tap, a positioned popover shows day label, destination with color dot, event breakdown grouped by type (icon + label + count), and "View Day" navigation button. Responsive width (75% of container, 260–340px). Dismissed via backdrop tap, 36x36 circular close button (`warmPalette.warmGray` background, matching EventEditor style), or Escape key.
5. **CalendarLegend** — Interactive destination pill buttons with larger padding (`md`/`xl` = 12px/24px), 12px shape indicators, 16px name text, and 15px count text. Tapping a pill filters/highlights those days on the grid (non-matching days dim to 0.3 opacity). Tapping again deselects.

### DAY TIMELINE VIEW — Single Day Deep Dive

**Purpose:** Show all events on a specific day as visual image cards in chronological order, with ability to edit, add, or mark complete.

**Content Zones (top to bottom):**

1. **Sticky Header** — Glassmorphic blur; prev/next day buttons (44x44px glass pills), day counter (12px, `textMedium`), date title (`sectionHeader`). Day info centered between equal-width arrow buttons via `flex: 1`.
2. **Destination Strip** — Centered layout with current island emphasized and other islands as subtle navigation links. Current destination: MapPin icon (14px, strokeWidth 2.5, destination color), bold name (15px, weight 700, `textDark`), optional day label (`body` 15px, `textMedium`). Other destinations: link button (15px, weight 500, `textMedium`) with MapPin (13px) and ChevronRight arrow (12px), gap 5px — tapping jumps to first day at that destination. Background: `#BAE5E0` (Kauai) or `#EDDBAF` (Maui), centered with `justifyContent: 'center'`. Separated by dot dividers.
3. **Timeline** — 20px top padding before first card. Image card schedule with TimeBlocks (cover photo cards), buffer blocks (compact solid `#FFFFFF` cards with `1px solid rgba(0,0,0,0.04)` border), NowIndicator, inline Add button. Left hour labels (12px, `textMedium`) group events by time. View scrolls to top on load and date change.
4. **Empty State** — "No events planned" with CTA (if no events)
5. **Complete State** — "All done for today!" (if all events done)
6. **Bottom Padding** — 80px to prevent content hidden behind nav

**TimeBlock Image Card Layout:**
- **Image area** (125px): Cover photo from Unsplash (type-based), gradient fallback on error. Dark gradient overlay at bottom for badge readability.
- **Time + type badge** (bottom-left of image): Frosted dark pill with icon + time + event type label
- **Edit icon overlay** (top-right of image): Frosted circle (28px, `rgba(0,0,0,0.35)` + backdrop blur) with Pencil icon (13px white)
- **Content area** (glass.card, below image): Title (`sectionHeader` 18px), subtitle/location (`body` 15px), and "Details" button
- **Buffer events** render as compact cards (solid `#FFFFFF` bg, `1px solid rgba(0,0,0,0.04)` border) with time range header (13px), Clock icon (18px), and bold `~X min buffer` title (`sectionHeader` 15px) showing the computed duration. The descriptive label (e.g. "Morning prep time", "Airport security + boarding") appears below as body text. No cover image. **Tight buffers** (≤20 min): warning orange background, dashed left border, orange text/icon, and uppercase "TIGHT" badge
- **Done state** on event cards: `opacity: 0.45`, `filter: 'grayscale(0.6)'`. Shows inline green "Done" badge (CheckCircle2 icon + "Done" text on `rgba(39,129,91,0.12)` background) in the content area

### EVENT DETAIL VIEW — Full Event Information

**Purpose:** Display complete event information including time, location, confirmation number, notes, timezone, and status. Accessible via chevron arrow on TimeBlock cards or HeroView highlight cards.

**Content Zones (top to bottom):**

1. **Sticky Header** — Back arrow (returns to previous view: hero or day), "Event Details" label, event title, Edit button (opens EventEditor)
2. **Location Photo** — 80px banner using the same cover image source as TimeBlock cards (`event.coverImage` → `getCoverImage(type, id)` → gradient fallback). Ensures visual continuity between timeline card and detail page.
3. **Hero Card** — Event type icon (52px, heavy stroke) + type label + title + subtitle on tinted background
3. **Info Rows** — White cards with icon + label + value for: Time (range + duration), Location (origin → destination), Confirmation number (monospace), Timezone
4. **Notes Section** — Pre-wrapped text block
5. **Status Section** — Status badge with toggle button (tap to mark done/upcoming)

**Navigation Flow:**
- TimeBlock chevron → dispatches `SET_SELECTED_EVENT` with event ID → navigates to 'eventDetail'
- HeroView highlight card → dispatches `SET_SELECTED_EVENT` + navigates to 'eventDetail' (previousView = 'hero')
- Back button → navigates to `previousView` ('hero' or 'day'), with scroll restoration for hero
- Edit button → opens EventEditor bottom sheet
- Delete in editor → removes event and returns to day timeline

### STATUS VIEW — Preparation Checklist & Documents

**Purpose:** Manage trip preparation with a categorized checklist and document uploads for travel paperwork.

**Content Zones (top to bottom):**

1. **Sticky Header** — "Checklist" title with animated progress bar (X/Y completed). Progress bar track uses `accentSoft` teal tint for visibility at 0% progress.
2. **Preparation Section** — Checklist items grouped by category (packing, booking, documents, health, transport, other), each with checkbox toggle, edit, and delete actions. "Add" button opens ChecklistEditor bottom sheet.
3. **Documents Section** — 2-column grid of uploaded document cards with thumbnail preview. Document names use `bodyMedium` (15px), category labels use `caption` (11px). "Upload" button opens DocumentUploader bottom sheet (images/PDF, max 2MB, stored as base64 in localStorage). Tapping a document opens DocumentViewer full-screen overlay.
4. **Empty States** — Documents empty state uses `accentSoft` teal-tinted background with centered teal folder icon above text. Checklist empty state uses `warmGray` background.

**Checklist Categories (6):**

| Category | Icon | Color | Purpose |
|----------|------|-------|---------|
| Packing | Shirt | Ocean teal | Items to pack |
| Booking | Ticket | Coral | Reservation confirmations |
| Documents | FileText | Sand | Paperwork to prepare |
| Health | Heart | Palm green | Medical/health prep |
| Transport | Car | Violet | Transportation logistics |
| Other | MoreHorizontal | Gray | Miscellaneous |

**Document Categories (6):**

| Category | Icon | Color | Purpose |
|----------|------|-------|---------|
| Passport | Key | Ocean teal | Passport scans |
| Boarding Pass | Plane | Info blue | Flight boarding passes |
| Hotel Confirmation | Building2 | Sand | Hotel booking docs |
| Insurance | Shield | Palm green | Travel insurance |
| Rental Car | Car | Coral | Car rental agreements |
| Other | FileText | Gray | Miscellaneous documents |

**Checklist Item Data Shape:**
```javascript
{
  id: string,           // 'evt-1234567890-abc12'
  title: string,        // 'Pack sunscreen'
  category: string,     // 'packing'
  completed: boolean,
  completedAt: string | null,  // ISO timestamp
  createdAt: string,    // ISO timestamp
  sortOrder: number
}
```

**Document Data Shape:**
```javascript
{
  id: string,
  name: string,         // 'Passport — John'
  category: string,     // 'passport'
  mimeType: string,     // 'image/jpeg'
  dataUrl: string,      // base64 data URL
  fileSize: number,     // bytes
  createdAt: string,
  notes: string | null
}
```

## Navigation Flows

### Primary Flow: Trip Exploration

```
Start → Hero View → "View Calendar" → Calendar View → Tap day → Tooltip → "View Day" → Day Timeline View → Tap chevron → Event Detail View
```

### Shortcut Flows

1. **Destination Card Tap (Hero)** → Day Timeline View (first day at that destination)
2. **Day Chip Tap (Hero)** → Day Timeline View (specific date)
3. **Calendar Day Cell Tap** → CalendarTooltip (day summary) → "View Day" → Day Timeline View
4. **Calendar Legend Tap** → Filter grid to show only that destination's days
5. **Add via Nav Button** → Day Timeline View + EventEditor modal
6. **TimeBlock Chevron Tap** → Event Detail View (full event info)
7. **TimeBlock Body Tap** → EventEditor modal (quick edit)

## View Comparison

| Aspect | Hero View | Calendar View | Day Timeline View | Event Detail View | Status View |
|--------|-----------|---------------|-------------------|-------------------|-------------|
| **Primary Purpose** | Trip overview & stats | Month-at-a-glance | Single-day schedule | Full event info | Preparation management |
| **Content Focus** | Trip title, dates, destinations | All days in month grid | Image card events | Event details, location, notes | Checklist + documents |
| **Navigation To** | Calendar, Day (via chip or card) | Day (via tooltip) | Event Detail (via chevron), Next/prev day | Back to Day | Self-contained |
| **Modal Content** | None | CalendarTooltip (popover), EventEditor | EventEditor | EventEditor | ChecklistEditor, DocumentUploader, DocumentViewer |
| **Now Indicator?** | No | No | Yes (if today) | No | No |

---

# 3. Design System

## Overview

The Travel app uses a tropical, premium vacation magazine aesthetic inspired by Hawaii and island destinations. The design system emphasizes warm, inviting colors reminiscent of oceans, sunsets, and sandy beaches, paired with elegant typography and generous spacing to create a luxury travel experience.

## Color Palette

### Primary Palette

| Token | Hex | Purpose |
|-------|-----|---------|
| `surface` | `#FFFFFF` | Primary card and container backgrounds |

### Tropical Accent Colors

| Token | Hex | Light Variant | Dark Variant | Purpose |
|-------|-----|---|---|---------|
| `ocean` | `#0E7490` | `#E0F7FA` | — | Primary teal-blue; CTA buttons, actions |
| `coral` | `#C74534` | `#FDE8E3` | — | Warm accent; tropical warmth |
| `sand` | `#9E7C2E` | `#F5EDD8` | — | Beach sand; warm beige |
| `sunset` | `#C05D10` | `#FDE8D3` | — | Golden hour accent; warmth |
| `palm` | `#2D7D46` | `#E0F2E5` | — | Palm foliage; nature element |
| `amber` | `#B45309` | `#FFFBEB` | — | Sightseeing event type |
| `aqua` | `#0891B2` | `#CFFAFE` | — | Beach event type |
| `emerald` | `#059669` | `#D1FAE5` | — | Hiking event type |
| `rose` | `#DB2777` | `#FCE7F3` | — | Shopping event type |
| `purple` | `#9333EA` | `#F3E8FF` | — | Fun (entertainment) event type |
| `violet` | `#6D28D9` | `#EDE9FE` | — | Transport event type (darker purple) |
| `tan` | `#7B5B3A` | `#F7EDE2` | — | Buffer event type (chocolate brown) |
| `navy` | `#1E40AF` | `#DBEAFE` | — | Boat event type |

### Destination-Specific Colors

| Location | Primary | Light | Background | Purpose |
|----------|---------|-------|-----------|---------|
| Kauai | `#0A8F8F` | `#D6F0EE` | `#F0FAF9` | Island-specific branding |
| Maui | `#C4A265` | `#F5EDD8` | `#FBF7EF` | Island-specific branding |

### Text Colors

| Token | Hex | Purpose |
|-------|-----|---------|
| `textPrimary` | `#1A1A1A` | Body text, main content |
| `textSecondary` | `#6B6B6B` | Secondary information, subheadings |
| `textMuted` | `#9B9B9B` | Tertiary text, captions, disabled state |
| `textOnAccent` | `#FFFFFF` | Text on colored action buttons |
| `textOnDark` | `#FFFFFF` | Text on dark scrims, overlays, nav bar |

### Semantic Colors

| State | Primary | Light Variant | Purpose |
|-------|---------|---|---------|
| **Success** | `#27815B` | `#E8F5E9` | Positive confirmation, completed |
| **Warning** | `#D97B2B` | `#FFF3E0` | Caution, attention needed |
| **Danger** | `#C0392B` | `#FDECEA` | Error, destructive action |
| **Info** | `#2B7A9E` | `#E0F1F8` | Informational message |

### Structural Colors

| Token | Hex | Purpose |
|-------|-----|---------|
| `border` | `#E2E0DB` | Primary borders, dividers |
| `borderLight` | `#F0EFEA` | Subtle borders, low-contrast dividers |
| `dragHandle` | `#D6D3CE` | Drag handles, pull indicators, hover borders |

## Typography

### Font Stack

```
'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
```

### Typography Scale

| Style | Font Size | Weight | Line Height | Letter Spacing | Use Case |
|-------|-----------|--------|-------------|---|----------|
| `title` | 28px | 700 | 34px | — | Section titles |
| `sectionHeader` | 18px | 600 | 24px | — | Card headers, subsections |
| `body` | 15px | 400 | 22px | — | Body text, standard content |
| `bodyMedium` | 15px | 500 | 22px | — | Emphasis within body text |
| `helper` | 13px | 400 | 18px | — | Helper text, secondary info |
| `caption` | 11px | 500 | 14px | 0.05em | Labels, tags, metadata (uppercase) |

## Spacing Scale

| Token | Pixels | Common Uses |
|-------|--------|-------------|
| `xs` | 4px | Minimal spacing, icon padding |
| `sm` | 8px | Component internal padding |
| `md` | 12px | Medium spacing, list gaps |
| `lg` | 16px | Standard section spacing |
| `xl` | 24px | Large gaps, section separation |
| `xxl` | 32px | Major spacing, layout separation |
| `xxxl` | 48px | Full-screen section gaps |

## Border Radius Scale

| Token | Pixels | Usage |
|-------|--------|-------|
| `sm` | 8px | Badges, small components |
| `iconSquare` | 10px | Icon containers (32×32 event type icons) |
| `md` | 12px | Buttons, input fields |
| `lg` | 16px | Cards, panels (default) |
| `xl` | 20px | Large containers, modals |
| `pill` | 9999px | Fully rounded elements (badges, pills) |

## Shadow System

Clean drop shadows only — no neumorphism (dual-tone embossed/debossed shadows were removed in v0.0.5).

| Token | Definition | Usage |
|-------|-----------|-------|
| `sm` | `0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)` | Day chips, nav buttons, calendar cells, checklist rows, buffer blocks |
| `md` | `0 4px 12px rgba(0,0,0,0.08)` | Destination cards, featured highlight, "next up" event cards |
| `glass` | `0 2px 8px rgba(0,0,0,0.06)` | Glass card box shadow |
| `accentGlow` | `0 2px 8px rgba(14,116,144,0.25)` | Ocean-teal glow on CTA buttons |
| `accentGlowStrong` | `0 4px 16px rgba(14,116,144,0.4)` | Strong teal glow on nav Add button |
| **Navigation** | `0 8px 32px rgba(0,0,0,0.25)` | Bottom nav bar (via `glass.nav`, highest z-index) |

### Shadow Usage by Component

| Component | Shadow Token | Notes |
|-----------|-------------|-------|
| TimeBlock | `glass.card` (via glass token) | Image card schedule blocks |
| DestCard (HeroView) | `shadows.md` | Elevated photo cards |
| Day chips (HeroView) | `shadows.sm` | Horizontal scroll chips |
| Featured highlight | `shadows.md` | Editorial card with photo |
| DayCard (Calendar) | `shadows.sm` | Trip days only, non-trip = none |
| ChecklistItemRow | `shadows.sm` | With 4px left category border |
| DocumentCard | `shadows.sm` | 2-column grid cards |
| EmptyState (complete) | `shadows.sm` | Success circle icon |
| EmptyState (empty) | none | Uses `border: 1px solid rgba(0,0,0,0.06)` instead |
| Nav buttons (prev/next) | `shadows.sm` | Disabled = no shadow |
| Calendar grid container | none | Uses `border: 1px solid rgba(0,0,0,0.06)` |
| Destination legend | `shadows.sm` | Calendar footer |
| Progress bar | none | Track uses `accentSoft` teal tint background |
| Status empty states | none | Uses `border: 1px solid rgba(0,0,0,0.06)` |

### Inset Replacement Pattern

Previously, `neumorphShadow.inset` was used for recessed/container surfaces. These now use a subtle border instead:
```
border: 1px solid rgba(0,0,0,0.06)
```
Used on: calendar grid, progress bar track, empty states (checklist, documents, day timeline).

## Glassmorphism System (Liquid Glass)

All elevated surfaces use frosted glass tokens from `styles.js`. The system creates a 3-tier depth hierarchy against the flat warm page background (`glossyBg: #F0EDE8`).

### Glass Token Reference

| Token | Background | Blur | Border | Shadow | Use Case |
|-------|-----------|------|--------|--------|----------|
| `glass.frosted` | `rgba(255,255,255,0.2)` | 24px | white 0.3 | — | Hero badges, photo overlays |
| `glass.frostedLight` | `rgba(240,237,232,0.85)` | 20px | black 0.08 | — | Sticky headers |
| `glass.card` | `rgba(255,255,255,0.82)` | 20px | black 0.06 | `0 2px 8px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)` | Event cards, info rows, destination cards |
| `glass.sheet` | `rgba(255,255,255,0.92)` | 24px | black 0.08 | `0 2px 8px rgba(0,0,0,0.06)` | Bottom sheets (EventEditor, ChecklistEditor) |
| `glass.nav` | `rgba(20,28,40,0.88)` | 20px | white 0.08 | `0 8px 32px rgba(0,0,0,0.25)` | Bottom navigation bar |
| `glass.input` | `rgba(237,234,229,0.5)` | 8px | black 0.1 | — | Form fields inside sheets |
| `glass.subtle` | `rgba(237,234,229,0.65)` | 12px | black 0.05 | `0 1px 4px rgba(0,0,0,0.04)` | Empty states |
| `glass.badge` | `rgba(255,255,255,0.60)` | 8px | black 0.06 | — | Legend pills, small glass badges |

### Visual Hierarchy (2-tier depth)

```
Page background (#F0EDE8, flat glossyBg)
  └─ glass.card (82% white) — event cards, info rows, destinations
       └─ glass.sheet (92% white) — bottom sheets, modals (highest readability)
```

### Glass Usage by Component

| Component | Token | Parent Surface |
|-----------|-------|---------------|
| TimeBlock, ChecklistItemRow, DocumentCard | `glass.card` | Page bg or panel |
| InfoRow (EventDetail) | `glass.card` | Page bg |
| HeroView content panel, CalendarView content area | flat `glossyBg` | Page bg |
| EventEditor, ChecklistEditor, DocumentUploader | `glass.sheet` | Overlay |
| DayTimelineView sticky header, StatusView header | `glass.frostedLight` | Page bg |
| EventDetailView header | `glass.frostedLight` | Page bg |
| Bottom navigation bar | `glass.nav` | Page bg |
| CalendarTooltip | `glass.sheet` | Calendar grid |
| CalendarLegend inactive pills | `glass.badge` | Page bg |
| EmptyState | `glass.subtle` | Page bg |
| Daily overview day chips | `glass.card` | Page bg |
| Form inputs inside sheets | `glass.input` | Sheet |
| Hero photo badges | `glass.frosted` | Photo |
| DestCard island badge | `glass.frosted` | Photo |

### Scrim Gradient Token

A shared `scrimGradient` export provides the dark overlay for text readability over hero/header images. Used by TripHeader and HeroView:

```
linear-gradient(180deg, rgba(28,25,23,0.3) 0%, rgba(28,25,23,0.2) 30%,
  rgba(28,25,23,0.25) 50%, rgba(28,25,23,0.6) 80%, rgba(28,25,23,0.9) 100%)
```

### Glass Implementation Rules
- Always spread as full style objects: `...glass.card`
- Always include `WebkitBackdropFilter` alongside `backdropFilter` (Safari)
- Borders use dark alpha (`rgba(0,0,0,...)`) for visible separation against warm bg
- No blur on DayCard grid cells (42 simultaneous blur layers hurts scroll performance)
- StatusBadge stays solid — semantic status colors must be instantly recognizable

## Warm Palette Tokens

Extended color tokens for the warm, luxury aesthetic (exported from `styles.js`):

| Token | Value | Usage |
|-------|-------|-------|
| `warmGray` | `#EDEAE5` | Page-level backgrounds (all views), content panels |
| `textDark` | `colors.textPrimary` (#1A1A1A) | Primary text on warm surfaces |
| `textMedium` | `colors.textSecondary` (#6B6B6B) | Secondary text, labels |
| `textLight` | `colors.textMuted` (#9B9B9B) | Tertiary text, disabled, placeholder |
| `accent` | `colors.ocean` (#0E7490) | Primary action color (teal-blue), CTA buttons, links |
| `accentSoft` | `rgba(14,116,144,0.12)` | Accent background tint |
| `goldSoft` | `rgba(184,150,62,0.12)` | Gold background tint |

### Card Background Convention (v0.0.47+)
All elevated surfaces use glass tokens (translucent with backdrop blur). Page backgrounds use flat `glossyBg` (#F0EDE8). Content panels (HeroView, CalendarView) use flat `glossyBg` directly. Cards use `glass.card` (82% white), sheets use `glass.sheet` (92% white). Buffer blocks use solid `colors.surface` (#FFFFFF); tight buffers (≤20 min) use `colors.warningLight` (#FFF3E0). Empty states use `glass.subtle`.

## Layout Tokens

| Token | Value | Purpose |
|-------|-------|---------|
| `cardBorder` | `1px solid #E2E0DB` | Divider and border standard |

## Design Rationale

The palette draws from natural island landscapes — ocean teals, coral warmth, sandy beiges, and sunset golds. Light variants create breathable, airy interfaces typical of premium travel publications. Large title text (28px) paired with warm cream backgrounds creates an editorial, magazine-like experience. Generous spacing avoids density, mirroring high-end travel design where white space equals luxury.

**Styling approach:** Liquid glass (glassmorphism). All elevated surfaces use translucent backgrounds with backdrop blur, creating a layered depth hierarchy. The flat warm page background (#F0EDE8) bleeds subtly through cards. Borders use dark alpha values for visible separation. Shadows are soft and diffuse. The 2-tier system (page → card → sheet) ensures clear visual hierarchy. No solid white cards — everything is glass.

---

# 4. Component Library

## 1. Navigation

**Purpose:** Fixed bottom navigation bar for switching between Trip, Calendar, and Day views, plus a primary action button to add new events.

**Props:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `activeView` | string | Yes | Current active view ('hero', 'calendar', or 'day') |
| `onNavigate` | function | Yes | Callback fired when user taps a tab (receives view id) |
| `onAdd` | function | Yes | Callback fired when user taps the Add button |

**Visual Description:**
Dark gray (#1F2937) navigation bar anchored to the bottom with max-width 480px. Contains 5 tabs (Trip, Plan, Add, Day, Status) with teal-blue (#0E7490) Add button. Active tab displays a small teal-blue indicator bar below the icon and white text; inactive tabs show gray text (`colors.textMuted` #9B9B9B). Each tab has a 54px minimum height.

**Key Design Decisions:**
- Touch targets 48x54px (exceeds WCAG AAA 44px minimum)
- Icon + label always visible (NN/g: "icon-only navigation is problematic")
- `flex: 1` on all tabs prevents layout shifts
- `role="tablist"` + `role="tab"` + `aria-selected` for screen readers

---

## 2. TripHeader

**Purpose:** Hero header with tropical beach photo, centered title, and dark overlay. Reads custom hero photo from TripContext state if available.

**Props:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `title` | string | No | Main heading text (centered over the photo) |
| `subtitle` | string | No | Secondary text below title (only shown in full mode) |
| `compact` | boolean | No | If true, height is 100px; else 240px |

**Visual Description:**
Full-width hero with sunset beach background image (`/hero-bg.png` default, or custom uploaded photo from `state.heroImage`). Warm brown gradient overlay matching HeroView (`rgba(28,25,23)` at 30%→20%→25%→60%→90%`). White text with drop shadow. Compact mode: 100px height, no subtitle.

---

## 3. DayCard

**Purpose:** Calendar grid cell representing a single day, with visual indicators for trip days, event density bars, destination shape encoding, selected state, and filter dimming.

**Props:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `dateInfo` | object | Yes | Date info: `{ date, isCurrentMonth }` |
| `trip` | object | Yes | Trip data: `{ startDate, endDate }` |
| `days` | object | Yes | Map of day data by date |
| `destinations` | array | Yes | Array of destination objects |
| `selectedDate` | string | No | Currently selected date (gets accent ring) |
| `activeFilter` | string | No | Active destination filter ID (dims non-matching) |
| `onTap` | function | Yes | Callback `(date, cellRect)` when a trip day is tapped |

**Key Design Decisions:**
- Square 1:1 aspect ratio for uniform calendar appearance
- Destination color coding via light background
- **Shape encoding** in bottom-right: 5x5px circle for Kauai, square for Maui at 50% opacity (color isn't sole differentiator)
- **Selected date:** Strong accent ring (2.5px solid #0E7490) + elevated shadow — distinct from "has events"
- **Today:** Subtle textLight border (no longer confused with selection)
- **Day number font:** 18px, line height 20px
- **Text weight:** Bold (700) for days with events, medium (500) for trip days without, regular (400) for non-trip
- **Filter dimming:** Non-matching destinations go to 0.3 opacity when filter is active
- Trip days get `shadows.sm`, selected gets `shadows.md`, non-trip = no shadow
- Tap handler passes `(date, cellRect)` to parent for tooltip positioning

---

## 4. NowIndicator

**Purpose:** Timeline marker showing the current time with glowing dot + horizontal line.

**Props:** None. Stateless component.

**Visual Description:**
Glowing teal circle (10x10px with shadow), horizontal teal line, "Now" text label. Uses ocean teal color (#0E7490).

---

## 5. EventEditor

**Purpose:** Full-screen bottom sheet modal for adding or editing trip events.

**Props:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `event` | object | No | Existing event to edit (null if creating new) |
| `isNew` | boolean | Yes | If true, shows "New Event" header |
| `date` | string | Yes | ISO date string |
| `onSave` | function | Yes | Callback when user saves |
| `onDelete` | function | No | Callback to delete existing event |
| `onClose` | function | Yes | Callback to close modal |
| `onStatusToggle` | function | No | Callback to toggle event status (removed from UI in v0.0.70) |

**Key Design Decisions:**
- Bottom sheet pattern (standard mobile editing)
- Grid-based type picker with color-coded buttons and 1.1 line-height labels
- Sticky header with close button (Mark Done removed in v0.0.69)
- Save button disabled until title is filled in
- Delete with confirmation dialog
- Time editing preserves original timezone offset (extracted from ISO string, not hardcoded)
- **Body scroll lock:** Uses `position: fixed` with saved `scrollY` offset on mount, restores position + scroll on unmount. Prevents background scrolling AND horizontal wobble (no scrollbar disappearance shift). Sets `left: 0; right: 0; overflowX: hidden` to clamp horizontal movement

---

## 6. StatusBadge

**Purpose:** Reusable small pill displaying event status with semantic coloring.

**Props:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `status` | string | Yes | Status value ('upcoming' or 'done') |
| `size` | string | No | 'sm' (default) or 'lg' |

---

## 7. EmptyState

**Purpose:** Placeholder for when a day has no events or when all events are done.

**Props:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `type` | string | No | 'empty' (default) or 'complete' |
| `onAddEvent` | function | No | Callback for Add Event button (empty state only) |

## 8. ChecklistItemRow

**Purpose:** Single checklist item with checkbox toggle, category indicator, edit and delete buttons.

**Props:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `item` | object | Yes | Checklist item data |
| `onToggle` | function | Yes | Callback to toggle completion |
| `onEdit` | function | Yes | Callback to open editor |
| `onDelete` | function | Yes | Callback to delete item |

**Key Design Decisions:**
- Background: glass.card with glassmorphic styling
- 4px left border in category color for grouping identification
- Checkbox: 22x22, rounded 6px, success green fill + white checkmark when complete
- Title gets line-through + muted color when completed
- Category label removed (v0.0.69) — left border color provides sufficient category indication
- Action buttons: edit (40x40, light bg) + delete (40x40, danger light)
- Animated layout with Framer Motion exit transitions (x: -20 on exit)

---

## 9. ChecklistEditor

**Purpose:** Bottom sheet for adding or editing checklist items with title input and category picker. Locks body scroll on mount.

**Props:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `item` | object | No | Existing item to edit (null for new) |
| `onSave` | function | Yes | Callback with item data or { id, updates } |
| `onClose` | function | Yes | Callback to close sheet |

---

## 10. DocumentCard

**Purpose:** Thumbnail card in 2-column grid showing uploaded document with image preview or icon fallback.

**Props:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `doc` | object | Yes | Document data with dataUrl, name, category, fileSize |
| `onPreview` | function | Yes | Callback to open full-screen viewer |
| `onDelete` | function | Yes | Callback to delete document |

---

## 11. DocumentUploader

**Purpose:** Bottom sheet with file picker, category selector, name input, and 2MB size enforcement. Locks body scroll on mount.

**Props:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `onSave` | function | Yes | Callback with complete document data |
| `onClose` | function | Yes | Callback to close sheet |

**Key Design Decisions:**
- Dashed border drop zone with tap-to-select
- Image preview shown after selection, PDF shows icon
- Error message for files exceeding 2MB
- File name auto-populated from filename

---

## 12. DocumentViewer

**Purpose:** Full-screen dark overlay for viewing uploaded documents at full size. Locks body scroll on mount.

**Props:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `doc` | object | Yes | Document data |
| `onClose` | function | Yes | Callback to close viewer |

**Key Design Decisions:**
- Dark (90% opacity) backdrop for focus
- Images displayed with `object-fit: contain`
- PDFs show download link
- Header shows document name + category

---

## 13. CalendarTooltip

**Purpose:** Lightweight popover shown on calendar day tap, displaying a day summary with event breakdown by type and a "View Day" navigation button.

**Props:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `date` | string | Yes | ISO date string |
| `anchorRect` | DOMRect | Yes | Bounding rect of tapped cell for positioning |
| `containerRef` | ref | Yes | Ref to grid container for position clamping |
| `day` | object | Yes | Day data with events array |
| `destination` | object | No | Destination object for color/name display |
| `onViewDay` | function | Yes | Callback to navigate to day timeline |
| `onClose` | function | Yes | Callback to dismiss tooltip |

**Key Design Decisions:**
- Responsive width: 75% of container, clamped 260–340px
- Positioned relative to tapped cell (above or below depending on available space)
- Clamped to container edges to avoid overflow
- Dismiss: backdrop tap, 36x36 circular close button (`warmPalette.warmGray` background, matching EventEditor style), Escape key
- Animation: scale + opacity spring (stiffness 400, damping 28)
- Event breakdown grouped by type with icon + label + count
- Destination shown with shape indicator (circle/square) + color
- "View Day" button at bottom with chevron

---

## 14. CalendarLegend

**Purpose:** Interactive destination filter pills below the calendar grid. Tapping highlights matching days.

**Props:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `destinations` | array | Yes | Array of destination objects |
| `days` | object | Yes | Map of day data by date |
| `activeFilter` | string | No | Currently active destination filter ID |
| `onFilter` | function | Yes | Callback with destination ID or null |

**Key Design Decisions:**
- Pill buttons with shape indicator (circle=Kauai, square=Maui) + name + day count
- Active pill gets destination accentLight background + 2px color border + elevated shadow
- Tapping active pill deselects (shows all days)
- Tap animation: scale 0.95

---

## 15. TimeBlock

**Purpose:** Image card schedule block for the day timeline. Displays a cover photo with time/type badge overlay, title, subtitle, and chevron arrow for detail navigation. Buffer events render as compact text-only rows.

**Props:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `event` | object | Yes | Event data with id, type, title, subtitle, startTime, location, coverImage |
| `isNext` | boolean | Yes | Currently unused (Next Up badge removed in v0.0.70) |
| `onTap` | function | Yes | Callback when card body is tapped (opens editor) |
| `onDetail` | function | No | Callback when Details button is tapped (navigates to detail) |

**Key Design Decisions:**
- **Image area** (125px): Cover photo from `event.coverImage` (explicit) or `getCoverImage(type, id)` (type-based fallback) with gradient fallback per event type on error. `loading="lazy"` for performance.
- **Dark gradient overlay**: Bottom 60px of image has `rgba(0,0,0,0.5)` gradient for badge readability
- **Time + type badge**: Frosted dark pill (`rgba(0,0,0,0.6)` + backdrop blur) at bottom-left with event icon (strokeWidth 2.5) + time + type label
- **Edit icon overlay**: Frosted circle (28px, `rgba(0,0,0,0.35)` + backdrop blur) at top-right with Pencil icon (13px white)
- **Content area**: glass.card bg with title (`sectionHeader` 18px), subtitle/location (`body` 15px), and "Details" button (`warmGray` bg)
- **Buffer events**: Compact card (solid `#FFFFFF` bg, `1px solid rgba(0,0,0,0.04)` border) with time range (`helper` 13px), type icon (18px), and title (`sectionHeader` 15px). No image, no left accent border.
- **Done state**: Event cards get `opacity: 0.45`, `filter: 'grayscale(0.6)'`. Inline green "Done" badge (CheckCircle2 icon + "Done" text on `rgba(39,129,91,0.12)` background) appears in the content area.
- **Cover image sources**: Events with explicit `coverImage` field use that URL directly. Otherwise, `coverImages.js` maps event types to Unsplash URLs with consistent hash-based selection per event ID. Gradient fallback on image load error. Events with explicit cover images: 3 flights (e-0104, e-0505, e-0905) and all 5 Trip Highlight events (e-0205 Poipu Beach, e-0303 Waimea Canyon, e-0403 Na Pali Coast, e-0602 Road to Hana, e-0802 Haleakala Sunrise) — ensuring the same photo appears on the highlight card, timeline card, and event detail page.
- **Card shadow**: glass.card shadow with `border: 1px solid rgba(0,0,0,0.06)`
- **Tap interaction**: Body tap → `onTap` (editor), Details button tap → `onDetail` (detail page) with `stopPropagation`
- **Font compliance**: All text sizes use design system tokens — no overrides below minimum (11px). Title uses `sectionHeader`, subtitle uses `body`, buffer title uses `sectionHeader` at 15px.

---

## 16. EventDetailView

**Purpose:** Full-screen event information page showing all event details. Accessed via TimeBlock chevron arrow.

**Key Design Decisions:**
- **Sticky header**: Back arrow + "Event Details" caption + event title + Edit button (accent soft bg)
- **Hero card**: Tinted background (`bgColor + AA` opacity) with 5px left accent border, 52px icon container, type label + title + subtitle
- **Info rows** (InfoRow sub-component): White cards with 32px icon circle + caption label + value text. Supports monospace for confirmation numbers.
- **Sections shown**: Time (range + duration), Location (origin → destination), Confirmation number, Timezone, Notes (pre-wrapped), Status (toggle button)
- **Edit flow**: Edit button opens EventEditor bottom sheet; save dispatches `UPDATE_EVENT`
- **Delete flow**: Delete in EventEditor dispatches `DELETE_EVENT` and navigates back to day timeline
- **Status toggle**: Tap status badge to toggle between 'done' and 'upcoming'
- **Navigation**: Back arrow dispatches `SET_ACTIVE_VIEW: 'day'`

---

## Component Hierarchy

```
Travel Layout
├── TripHeader (hero section)
├── [View-specific content]
│   ├── Trip View → DestCard (inline, horizontal list)
│   ├── Calendar View → DayCard (grid) + CalendarTooltip + CalendarLegend + EventEditor
│   ├── Day View → TimeBlock (image cards), NowIndicator, EmptyState, EventEditor
│   ├── Event Detail → EventDetailView (info rows, status toggle, EventEditor)
│   └── Status View → ChecklistItemRow (grouped), DocumentCard (grid)
├── Navigation (bottom fixed)
├── EventEditor (nav Add overlay)
├── ChecklistEditor (modal, bottom sheet)
├── DocumentUploader (modal, bottom sheet)
└── DocumentViewer (modal, full-screen overlay)
```

---

# 5. User Flows & Interactions

## 1. First-Time User Journey

1. User launches the Travel app and lands on **HeroView**
2. Hero page displays TripHeader, stats row, DestCards, "View Calendar" CTA, Quick Access day chips
3. **Option A:** Tap "View Calendar" → CalendarView
4. **Option B:** Tap destination card → DayTimelineView for first day of that destination
5. **Option C:** Tap quick-access day chip → DayTimelineView for that date
6. Page transitions with fade/slide animation (opacity 0→1, y: 12→0)

## 2. Adding a New Event — Inline Timeline Button

1. User scrolls to bottom of timeline
2. Taps dashed "Add event" button (positioned after last event, aligned with timeline)
3. Same flow as header Add button

## 3. Adding a New Event — Bottom Navigation Button

1. User is on any view
2. Taps teal "Add" button in bottom nav
3. `handleNavAdd()`: dispatches `SET_ACTIVE_VIEW: 'day'`, increments `addTrigger`
4. DayTimelineView detects `addTrigger` change via `useEffect`
5. EventEditor automatically opens

## 4. Editing an Existing Event

1. User taps TimeBlock in timeline
2. `handleEventTap(event)` → sets `editingEvent`, opens EventEditor
3. Form pre-populated with event data
4. User modifies fields, taps "Save Changes"
5. `UPDATE_EVENT` dispatched, editor closes

## 5. Deleting an Event

1. User is editing an event (EventEditor open)
2. Taps red trash icon
3. Confirmation dialog slides in: 'Delete "[Title]"?'
4. Taps "Delete" → `DELETE_EVENT` dispatched
5. Editor closes, timeline re-renders

## 6. Navigating Between Days

- **Chevron arrows:** Prev/next day buttons in sticky header
- **Calendar tap:** Day cell → DayTimelineView
- **Day chip tap:** Quick access in HeroView
- **Destination card tap:** First day of that destination

## 7. Toggling Event Status

1. In EventEditor, tap status toggle button
2. Toggles between 'done' and 'upcoming'
3. `SET_EVENT_STATUS` dispatched
4. If all events done, EmptyState "complete" appears

## 8. Adding a Checklist Item

1. User is on StatusView
2. Taps "Add" pill button next to Preparation section header
3. ChecklistEditor bottom sheet slides up
4. User enters title, selects category from chip picker
5. Taps "Add Item"
6. `ADD_CHECKLIST_ITEM` dispatched, editor closes, item appears under its category group

## 9. Toggling/Editing/Deleting Checklist Items

- **Toggle:** Tap checkbox → `TOGGLE_CHECKLIST_ITEM` → sets `completed` + `completedAt`; progress bar animates
- **Edit:** Tap pencil icon → ChecklistEditor opens pre-populated → save dispatches `UPDATE_CHECKLIST_ITEM`
- **Delete:** Tap trash icon → `DELETE_CHECKLIST_ITEM` dispatched, item animates out

## 10. Uploading a Document

1. User taps "Upload" pill button next to Documents section header
2. DocumentUploader bottom sheet slides up
3. User taps dashed drop zone → file picker opens (images + PDF)
4. File validated (max 2MB) → read as base64 data URL
5. User sets name (auto-populated from filename), category, optional notes
6. Taps "Upload Document" → `ADD_DOCUMENT` dispatched, card appears in grid

## 11. Viewing/Deleting a Document

- **Preview:** Tap document card → DocumentViewer full-screen overlay with dark backdrop
- **Delete:** Tap small trash icon on card → `DELETE_DOCUMENT` dispatched

## Entry Points Summary

| Action | Entry Point | Components |
|--------|-------------|-----------|
| Add Event | Inline button | DayTimelineView + EventEditor |
| Add Event | Nav button | Navigation + EventEditor |
| Add Event | Empty state | EmptyState + EventEditor |
| Edit Event | Event tap | TimeBlock + EventEditor |
| Delete Event | Delete button | EventEditor |
| View Event Detail | Chevron arrow | TimeBlock + EventDetailView |
| Navigate Day | Chevron | DayTimelineView |
| Navigate Day | Calendar cell | CalendarView + DayCard |
| Navigate Day | Day chip | HeroView |
| Switch View | Nav tab | Navigation |
| Add Checklist Item | "Add" button | StatusView + ChecklistEditor |
| Edit Checklist Item | Pencil icon | ChecklistItemRow + ChecklistEditor |
| Toggle Checklist | Checkbox | ChecklistItemRow |
| Delete Checklist | Trash icon | ChecklistItemRow |
| Upload Document | "Upload" button | StatusView + DocumentUploader |
| Preview Document | Card tap | DocumentCard + DocumentViewer |
| Delete Document | Trash icon | DocumentCard |

---

# 6. Accessibility & NN/g Compliance

## WCAG Compliance Measures

### Color Contrast Ratios

| Element | Foreground | Background | Ratio | Level |
|---------|-----------|-----------|-------|--------|
| Primary text | #1A1A1A | #FFFFFF | 15:1 | AAA |
| Secondary text | #6B6B6B | #FFFFFF | 8.3:1 | AA |
| Muted text | #9B9B9B | #FFFFFF | 6.2:1 | AA |
| Inactive nav | #9B9B9B | #1F2937 | 4.5:1 | AA |
| Active nav | #FFFFFF | #1F2937 | 13.5:1 | AAA |
| CTA button text | #FFFFFF | #0E7490 | 5.35:1 | AA |
| Success text | #27815B | #E8F5E9 | 7.1:1 | AA |
| Danger text | #C0392B | #FDECEA | 6.8:1 | AA |

### Touch Target Sizing

- **Navigation tabs:** 48px wide x 54px tall (exceeds WCAG 2.5.5 AAA 44px minimum)
- **Event cards:** Full card clickable, minimum 48px height
- **Buttons:** All action buttons maintain 44px+ height
- **Spacing between targets:** 8-12px prevents accidental mis-touches

### Semantic HTML & ARIA

- Navigation: `role="tablist"`, `role="tab"`, `aria-selected`, `aria-label`
- Roving tabindex: only active tab in document tab order
- Event cards: `role="button"`, `tabIndex={0}`
- Icons: `aria-hidden="true"` (text labels provide meaning)
- Form inputs: associated `<label>` elements via FieldGroup component

## NN/g Principles Applied

### Principle 1: Proximity

Inline "Add Event" button placed directly after the last event, near the content it affects. Avoids the FAB pattern which hides timeline content.

### Principle 2: FAB Removal

Instead of a floating button, two redundant entry points:
1. Navigation bottom bar (always visible)
2. Inline add button (context-aware, after last event in timeline)

### Principle 3: Bottom Navigation Best Practices

- **Icon + Label always visible** (never icon-only)
- **5 items** (Trip, Plan, Add, Day, Status — at NN/g maximum)
- **Persistent and always visible** (fixed bottom, no scroll-to-hide)
- **Visual stability** (flex: 1, constant fontWeight, CSS transitions not layoutId)
- **Primary action differentiated** (teal background on Add button)

### Principle 4: Touch Targets (44px Minimum)

Navigation tabs are 54px tall (23% above minimum). All buttons maintain 44px+ height (day nav buttons 44x44px, Add button 44px tall). 8px spacing between targets prevents accidental activation. Checklist edit/delete buttons use 36x36px visual with adequate spacing. StatusBadge minimum font size is 11px (Apple HIG minimum).

### Principle 5: Layout Stability (No Wobble)

Four wobble causes were identified and fixed:
1. Removed Framer Motion `layoutId` (caused shared layout animation)
2. Removed `whileTap={{ scale }}` on flex items (caused space redistribution)
3. Set constant `fontWeight: 600` on all tabs (prevents text-width shift)
4. **Body scroll lock on overlays:** All modal overlays (EventEditor, ChecklistEditor, DocumentUploader, DocumentViewer) use `position: fixed` with saved `scrollY` offset on `document.body`. This freezes the background without removing the scrollbar, preventing horizontal layout shift. On unmount, position is cleared and `window.scrollTo` restores the original scroll position.

### Principle 6: Redundant Encoding

Status uses color + text + position (not color alone). TimeBlock type color + StatusBadge text + shadow elevation = three-part encoding for maximum accessibility.

---

# 7. Data Architecture & State Management

## Data Models

### Trip Shape
```javascript
{
  id: string,                    // 'trip-hawaii-2026'
  name: string,                  // 'Hawaii Vacation'
  tagline: string,               // 'Kauai & Maui'
  startDate: string (ISO 8601),  // '2026-03-14'
  endDate: string (ISO 8601),    // '2026-03-22'
  homeTimezone: string,          // 'America/Chicago'
  status: string,                // 'upcoming', 'done'
  destinations: Destination[]
}
```

### Destination Shape
```javascript
{
  id: string,                    // 'dest-kauai'
  name: string,                  // 'Kauai'
  startDate: string,
  endDate: string,
  color: string (hex),           // '#0A8F8F'
  accentLight: string (hex),     // '#D6F0EE'
  accommodation: { name, address, confirmationNumber }
}
```

### TripDay Shape
```javascript
{
  date: string (ISO 8601),
  destinationId: string,
  label: string,                 // 'Chicago to Kauai'
  notes: string,
  events: Event[]
}
```

### Event Shape
```javascript
{
  id: string,                      // 'e-0101'
  type: string,                    // See Event Types catalog
  title: string,
  subtitle: string | null,
  startTime: string (ISO 8601),    // With timezone offset
  endTime: string (ISO 8601),
  timezone: string (IANA),
  location: { origin?, destination? } | null,
  confirmationNumber: string | null,
  notes: string | null,
  status: string,                  // 'upcoming' or 'done'
  sortOrder: number,
  bufferMinutes?: number,          // Buffer-specific
  bufferLabel?: string
}
```

## Event Types Catalog (14 types)

Each event type has a unique icon color + background color pairing for maximum visual variety. No two types share the same bg color.

| Type | Icon | Icon Color | Bg Color | Use Case |
|------|------|-----------|----------|----------|
| `flight` | Plane | `info` (#2B7A9E) | `infoLight` (#E0F1F8) | Air travel |
| `ground_transport` | Car | `violet` (#6D28D9) | `violetLight` (#EDE9FE) | Taxi, rental car, Uber |
| `hotel` | Building2 | `sand` (#9E7C2E) | `sandLight` (#F5EDD8) | Check-in, checkout |
| `activity` | Palmtree | `palm` (#2D7D46) | `palmLight` (#E0F2E5) | Tours, excursions |
| `dining` | UtensilsCrossed | `coral` (#C74534) | `coralLight` (#FDE8E3) | Restaurant, meals |
| `buffer` | Clock | `tan` (#7B5B3A) | `tanLight` (#F7EDE2) | Prep time, transitions |
| `boat` | Ship | `navy` (#1E40AF) | `navyLight` (#DBEAFE) | Boat tours, ferry |
| `sunrise` | Sunrise | `sunset` (#C05D10) | `sunsetLight` (#FDE8D3) | Sunrise/sunset viewing |
| `sightseeing` | Camera | `amber` (#B45309) | `amberLight` (#FFFBEB) | Lookouts, photo stops |
| `beach` | Waves | `aqua` (#0891B2) | `aquaLight` (#CFFAFE) | Swimming, sunbathing |
| `hiking` | Mountain | `emerald` (#059669) | `emeraldLight` (#D1FAE5) | Trails, trekking |
| `shopping` | ShoppingBag | `rose` (#DB2777) | `roseLight` (#FCE7F3) | Markets, retail |
| `entertainment` | PartyPopper | `purple` (#9333EA) | `purpleLight` (#F3E8FF) | Shows, luaus |
| `custom` | Circle | `textSecondary` (#6B6B6B) | `borderLight` (#F0EFEA) | User-defined |

## State Management Pattern

### Context + Reducer Architecture

```
TripProvider (root wrapper)
  useReducer(tripReducer, initialState)
  localStorage persistence (debounced 500ms)
  TripContext.Provider wraps app
```

### Root State Shape

```javascript
{
  trip: { id, name, startDate, endDate, destinations[] },
  days: { '2026-03-14': TripDay, '2026-03-15': TripDay, ... },
  selectedDate: string,
  activeView: 'hero' | 'calendar' | 'day' | 'eventDetail' | 'status',
  selectedEventId: string | null,
  checklistItems: ChecklistItem[],
  documents: Document[],
  heroImage: string | null,  // Custom hero photo data URL (JPEG, canvas-compressed)
  destImages: {},            // { 'dest-kauai': dataURL, ... } per-destination cover photos
  weatherZipCode: string,    // User-entered zip code for weather lookup
  weatherData: {},           // { '2026-03-14': { high, low, code, condition }, ... }
}
```

### Reducer Actions (22 types)

| Action | Payload | Purpose |
|--------|---------|---------|
| `SET_SELECTED_DATE` | ISO date string | Change viewed day |
| `SET_ACTIVE_VIEW` | 'hero' / 'calendar' / 'day' / 'eventDetail' / 'status' | Switch views |
| `SET_SELECTED_EVENT` | event ID string | Set event for detail view |
| `ADD_EVENT` | `{ date, event }` | Insert new event |
| `UPDATE_EVENT` | `{ date, eventId, updates }` | Modify event |
| `DELETE_EVENT` | `{ date, eventId }` | Remove event |
| `SET_EVENT_STATUS` | `{ date, eventId, status }` | Change status |
| `REORDER_EVENTS` | `{ date, events[] }` | Drag-reorder |
| `UPDATE_DAY` | `{ date, updates }` | Modify day metadata |
| `ADD_CHECKLIST_ITEM` | ChecklistItem | Add preparation item |
| `UPDATE_CHECKLIST_ITEM` | `{ id, updates }` | Edit checklist item |
| `DELETE_CHECKLIST_ITEM` | item id string | Remove checklist item |
| `TOGGLE_CHECKLIST_ITEM` | item id string | Toggle completion + set completedAt |
| `ADD_DOCUMENT` | Document | Upload document |
| `UPDATE_DOCUMENT` | `{ id, updates }` | Edit document metadata |
| `DELETE_DOCUMENT` | doc id string | Remove document |
| `UPDATE_TRIP` | `{ updates }` | Modify trip metadata (name, tagline) |
| `SET_HERO_IMAGE` | data URL string | Set custom hero photo |
| `SET_DEST_IMAGE` | `{ destId, dataUrl }` | Set per-destination cover photo |
| `SET_WEATHER_ZIP` | zip code string | Save weather zip code |
| `SET_WEATHER_DATA` | `{ date: { high, low, code, condition } }` | Store fetched weather forecast |
| `RESET` | none | Revert to sample data |

### localStorage Persistence

- **Key:** `travel-trip-state`
- **Debounced 500ms** after every state change
- **Validation:** Trip ID + `DATA_VERSION` check on load prevents data pollution
- **Data versioning:** A `DATA_VERSION` constant (currently 5) is saved alongside state as `_dataVersion`. When sample data changes (new fields, updated URLs), bump this to invalidate stale cached data.
- **Graceful fallback:** Falls back to sampleTrip if corrupted or version mismatch

### Hydration Strategy

1. Build defaults object with all fields (including `checklistItems` and `documents`)
2. Read from localStorage
3. Validate trip ID matches sample trip AND `_dataVersion` matches current `DATA_VERSION`
4. Merge `{ ...defaults, ...parsed }` to backfill any new fields missing from old localStorage data
5. Fall back to full defaults if empty/invalid/version mismatch

## Sample Data Overview

| Day | Date | Destination | Label | Events |
|-----|------|-------------|-------|--------|
| 1 | Mar 14 | Kauai | Chicago to Kauai | 9 |
| 2 | Mar 15 | Kauai | Beach & Explore | 6 |
| 3 | Mar 16 | Kauai | Waimea Canyon | 7 |
| 4 | Mar 17 | Kauai | Na Pali Coast | 6 |
| 5 | Mar 18 | Maui | Kauai to Maui | 8 |
| 6 | Mar 19 | Maui | Road to Hana | 8 |
| 7 | Mar 20 | Maui | Whale Watching | 6 |
| 8 | Mar 21 | Maui | Haleakala Sunrise | 6 |
| 9 | Mar 22 | Maui | Travel Home | 7 |

## Data Flow

```
User Interaction → Component → dispatch(action) → tripReducer → New State
                                                                    ↓
                                                            localStorage (500ms)
                                                                    ↓
                                                        Component re-renders
```

---

# 8. Visual Design & Layout Patterns

## Overall Visual Language

The Travel app embodies a **premium vacation magazine aesthetic** with tropical design language.

**Design Principles:**
- Warm, inviting palette — foundation of beige backgrounds (#F0EDE8), white surfaces, tropical accents
- Luxury through simplicity — clean layouts with generous whitespace
- Nature-inspired interactions — smooth animations and pull gestures
- Color as storytelling — each destination has distinct color identity
- Magazine editorial quality — typography hierarchy inspired by high-end travel publications

## Key Layout Patterns

### 1. Card Overlap Pattern

Hero image section (240px/100px) with rounded content card overlapping via `marginTop: -28px`. Creates sophisticated "peek-a-boo" visual transition. Both HeroView and CalendarView use this pattern.

### 2. Pull Handle Indicator

36px wide x 4px tall, centered horizontally. Color: `#D6D3CE` (colors.dragHandle). Borrowed from iOS design language to signal scrollability.

### 3. Sticky Header with Glass Blur

- Position: `sticky`, top: 0, z-index: 50
- Uses `glass.frostedLight`: `rgba(240,237,232,0.85)` with `backdrop-filter: blur(20px)` + `WebkitBackdropFilter: blur(20px)`
- Border bottom: `1px solid rgba(255, 255, 255, 0.4)`
- DayTimelineView: two sections — day navigation controls + destination strip (current island emphasized, other islands as subtle links)
- StatusView: title + progress bar

### 4. Image Card Timeline with Left Hour Labels

- No track line — replaced with image card layout
- TimeBlock image cards: rounded corners, cover photo, white content area
- Buffer events: compact text-only rows between image cards
- Left hour labels (44px column, 12px font, `textMedium`): deduplicated by comparing with previous event's hour
- 8px gap between cards creates vertical rhythm
- NowIndicator positioned at `getNowPosition(events)` index

### 5. Grid Layout (7-Column Calendar)

- `display: grid`, `gridTemplateColumns: repeat(7, 1fr)`
- 4px gap between cells
- Weekday headers: 11px uppercase caption style

### 6. Horizontal Scroll (Day Chips)

- `display: flex`, `overflowX: auto`
- Individual chips: 56px min-width, flex-shrink: 0
- Destination color bottom border (3px)
- Momentum scrolling on iOS

## Hero Image Treatment

- Default: sunset beach photograph (`/hero-bg.png`) at full coverage
- **Custom photo upload:** Camera button (frosted glass circle, 32x32, top-right) opens file picker. Selected image compressed via canvas API (1200px max width, JPEG quality 0.7), stored as data URL in `heroImage` state. Shared between HeroView and TripHeader (calendar page).
- Dark gradient overlay: `scrimGradient` token — warm brown (`rgba(28,25,23)`) from 30% → 20% → 25% → 60% → 90%
- Progressive darkening ensures text readability
- Text shadow: `0 2px 16px rgba(0,0,0,0.35)` on titles

## Destination Color Coding

Each destination cascades its color throughout the entire app:

- **DestCard (HeroView):** 4px left border
- **Calendar grid:** Day cells with colored bottom border
- **Destination strip:** Background uses brightened tints (#BAE5E0 Kauai, #EDDBAF Maui), centered layout with current island bold + other as subtle link
- **Quick access chips:** Bottom border in destination color
- **Badge backgrounds:** accentLight with color text

## Card Design Language

- **Background:** `glass.card` (82% white with backdrop blur) for event, document, checklist, destination cards. Sheets use `glass.sheet` (92% white). Buffer events use solid `colors.surface` (#FFFFFF); tight buffers use `colors.warningLight` (#FFF3E0).
- **Border radius:** 8px (badges) → 12px (buttons) → 16px (cards) → 20px (modals/sheets)
- **Shadows:** Clean drop shadows from `shadows` object — `sm` for resting, `md` for elevated/highlighted
- **Borders:** 1px solid rgba(0,0,0,0.06) for recessed containers; 4px colored left accent for categorization
- **Interactive states:** Tap scale 0.93-0.98 (no hover effects)
- **No neumorphism:** Dual-tone embossed shadows (`#D4D0CA` / `#FFFFFF` pairs) were removed in v0.0.5

## Status Visual System

- Left border color for instant recognition
- StatusBadge pill with semantic text
- Event type icons with colored backgrounds

---

# 9. Animation & Motion Design

## Animation Library: Framer Motion

Declarative animation framework chosen for GPU acceleration, built-in orchestration (AnimatePresence), spring physics, and minimal syntax overhead.

## Page Transition Pattern

```jsx
const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.15 } },
}
```

- `mode="wait"` ensures exit completes before enter begins
- 250ms enter, 150ms exit (prioritizes responsiveness)
- Subtle "elevator" effect: slides up on entry, up on exit

## Staggered Content Reveals

HeroView uses sequential reveal with increasing delays:
- Camera button: delay 0.3s
- Next Up card: delay 0.55s
- Flight status card: delay 0.65s
- Destination cards container: delay 0.7s (individual cards: 0.75 + 0.1×i)
- Trip countdown card: delay 0.75s
- Quick access chips: delay 1.05 + 0.04×i
- Highlights section: delay 1.25 + 0.08×i

Guides user's eye downward through natural reading flow.

## Micro-Interactions

### Pressure Feedback (whileTap)
- Calendar cells: 0.93 (7% reduction, high confidence)
- Day chips: 0.95 (5% reduction)
- Event cards: 0.98 (2% reduction, subtle)
- Inline add button: 0.97 (3% reduction)

## Modal Animations

EventEditor uses backdrop fade + bottom sheet with spring physics:
- `initial: { y: '100%' }` → `animate: { y: 0 }`
- Spring: `damping: 28, stiffness: 300`
- Delete confirmation: inline opacity + y reveal

## CSS Transitions (Supplementary)

- Navigation tab highlighting: `transition: background-color 0.2s ease`
- Add button hover: `transition: border-color 0.2s, color 0.2s`
- Lower overhead than Framer Motion for simple color swaps

## Performance: Layout-Safe Animations

**GPU-Accelerated (used):** opacity, transform (translateY, scale)
**Avoided (layout thrashing):** width/height, top/bottom, padding/margin

`layout` prop used on ChecklistItemRow and DocumentCard for animated reordering. Fixed viewport at 480px prevents cascading reflows.

## Animation Timing Summary

| Interaction | Duration | Context |
|-----------|----------|---------|
| Page enter | 250ms | Navigation transition |
| Page exit | 150ms | Faster exit than enter |
| Stagger | 100ms intervals | Hero content reveal |
| Button press | instant | whileTap feedback |
| Modal slide | 300-400ms (spring) | Bottom sheet |
| Color transition | 200ms | Navigation text/border |

---

# 10. Technical Implementation & File Structure

## Complete File Tree

```
travel/
├── src/
│   ├── main.jsx                     React entry point
│   ├── App.jsx                      Root component (TripProvider + view router)
│   ├── index.css                    Tailwind imports
│   ├── colors.js               (59 lines)    Color palette (no gradients)
│   ├── styles.js               (129 lines)   Typography, spacing, shadows, glass tokens, scrimGradient
│   │
│   ├── context/
│   │   └── TripContext.jsx     (~254 lines)   Reducer (22 actions) + localStorage
│   │
│   ├── views/                  (5 files)
│   │   ├── HeroView.jsx        (~1678 lines)  Trip landing page + DestCard component
│   │   ├── CalendarView.jsx    (~352 lines)   Monthly calendar with nav, tooltip, legend
│   │   ├── DayTimelineView.jsx (~390 lines)   Image card schedule timeline
│   │   ├── EventDetailView.jsx (~439 lines)   Full event information page
│   │   └── StatusView.jsx      (~349 lines)   Checklist + document management
│   │
│   ├── components/             (15 files)
│   │   ├── Navigation.jsx      (~168 lines)   Bottom tab navigation (5 items)
│   │   ├── TripHeader.jsx      (~82 lines)    Hero header with photo
│   │   ├── DayCard.jsx         (~114 lines)   Calendar grid day cell (redesigned)
│   │   ├── CalendarTooltip.jsx (~228 lines)   Day summary popover on cell tap
│   │   ├── CalendarLegend.jsx  (~76 lines)    Interactive destination filter pills
│   │   ├── TimeBlock.jsx       (~280 lines)   Image card schedule block (cover photo + badges + inline buffer)
│   │   ├── EventEditor.jsx     (~606 lines)   Bottom sheet for event CRUD
│   │   ├── EmptyState.jsx      (~112 lines)   Empty + complete states
│   │   ├── StatusBadge.jsx     (~29 lines)    Status indicator badge
│   │   ├── NowIndicator.jsx    (~40 lines)    "Now" timeline marker
│   │   ├── ChecklistItemRow.jsx(~113 lines)   Checkbox row with edit/delete
│   │   ├── ChecklistEditor.jsx (~234 lines)   Bottom sheet for checklist CRUD
│   │   ├── DocumentCard.jsx    (~112 lines)   Document thumbnail card
│   │   ├── DocumentUploader.jsx(~327 lines)   Bottom sheet with file upload
│   │   └── DocumentViewer.jsx  (~155 lines)   Full-screen document preview
│   │
│   ├── data/
│   │   ├── sampleTrip.js       (1,024 lines)  Hawaii vacation mock data
│   │   ├── eventTypes.js       (120 lines)    Event type definitions
│   │   ├── coverImages.js      (~93 lines)    Type-based cover photo URLs + gradient fallbacks
│   │   ├── statusCategories.js (~107 lines)   Checklist + document categories
│   │   └── sampleChecklist.js  (~78 lines)    8 sample preparation items
│   │
│   └── utils/
│       ├── dateUtils.js        (~105 lines)   Date formatting, calendar grid, month nav
│       └── timeUtils.js        (77 lines)     Time formatting, event colors
│
├── public/
│   └── hero-bg.png                 Default hero background image
├── package.json
├── vite.config.js
├── Dockerfile
├── nginx.conf
└── index.html
```

## Tech Stack

- **React 19** — Latest React with hooks
- **Vite 7** — ES module bundler + dev server (HMR)
- **Tailwind CSS v4** — Via @tailwindcss/vite plugin
- **Framer Motion** — Declarative animations, spring physics
- **Lucide React** — SVG icons (40+ used)
- **date-fns** — Immutable date utilities

## Design Pattern: Standalone App

The Travel app is a **standalone deployment** with its own Dockerfile and K8s namespace. All styling is inline via JavaScript objects importing from `colors.js` and `styles.js`. This provides:

- **Portability:** Self-contained project directory
- **No CSS conflicts:** Isolated from other apps
- **Dynamic theming:** Colors and tokens computed at runtime
- **Clear intent:** Every style explicit, visible in DevTools
- **Tailwind for utilities:** Base reset + any utility classes via `index.css`

## Deployment Pipeline

```bash
deploy.sh travel "Description of changes"
```

Pipeline: Version bump → Docker build (multi-stage: Node builder → Nginx) → Push to 192.168.1.122:5000 → Update manifest → Git push → ArgoCD sync → Verify pod

## Kubernetes Deployment

- **Namespace:** travel
- **Service:** LoadBalancer at 192.168.1.198:80
- **Image:** 192.168.1.122:5000/travel:v0.0.31
- **Manifests:** ~/kube/manifests/travel/

## Component Hierarchy

```
Travel (wrapper)
└── TripProvider (context)
    └── TravelInner
        ├── AnimatePresence
        │   ├── HeroView
        │   │   ├── TripHeader + DestCard (inline) + DayCard chips
        │   ├── CalendarView
        │   │   ├── TripHeader (compact) + DayCard grid + CalendarTooltip
        │   │   ├── CalendarLegend (interactive filter)
        │   │   └── EventEditor (modal, from Add button)
        │   ├── DayTimelineView
        │   │   ├── TimeBlock (image cards) + NowIndicator + EmptyState
        │   │   └── EventEditor (modal)
        │   ├── EventDetailView
        │   │   ├── InfoRow sections (time, location, confirmation, notes)
        │   │   └── EventEditor (modal, from Edit button)
        │   └── StatusView
        │       ├── ChecklistItemRow (grouped by category)
        │       ├── DocumentCard (2-column grid)
        │       ├── ChecklistEditor (bottom sheet)
        │       ├── DocumentUploader (bottom sheet)
        │       └── DocumentViewer (full-screen overlay)
        ├── Navigation (fixed bottom with gradient fade)
        └── EventEditor (nav Add overlay)
```

## Key Utility Functions

### Date Utilities

| Function | Purpose |
|----------|---------|
| `formatTripDate(dateStr)` | Full day display ("Saturday, March 14") |
| `getDayIndex(start, date)` | Which day of trip (1-indexed) |
| `getAdjacentDates(date, start, end)` | Prev/next trip dates |
| `getCalendarGrid(year, month)` | 7x6 calendar grid |
| `getAdjacentMonth(year, month, dir)` | Prev/next month `{year, month}` |
| `formatMonthYearFromParts(year, month)` | "March 2026" from numeric parts |
| `isTodayDate(dateStr)` | Is today? |

### Time Utilities

| Function | Purpose |
|----------|---------|
| `formatTime(isoString)` | 12-hour display ("6:50 AM") |
| `formatTimeRange(start, end)` | Duration span |
| `formatDuration(minutes)` | Human-friendly ("2h 25m") |
| `getStatusColor(status)` | Color for status badge |
| `getEventIcon(typeId)` | Icon component for event type |
| `getNowPosition(events)` | Where "now" falls in timeline |
| `generateId()` | Unique event ID |

## Development Workflow

```bash
cd /home/ubuntu/apps/travel
npm install
npm run dev          # http://localhost:5173
npm run build        # Production bundle
deploy.sh travel "commit message"  # Deploy to cluster
```

---

*Updated February 2026 (v0.0.114). Standalone deployment. This document covers the complete Travel app architecture, design system (glassmorphism + clean shadows, no neumorphism), component library, interaction patterns, accessibility compliance, and technical implementation — including custom hero photo upload, body scroll lock on overlays, redesigned destination strip navigation, the Status tab with checklist management and document uploads, the redesigned Calendar view with month navigation, tooltip, and interactive legend, the image card timeline with cover photos, the event detail view, design system font compliance, real weather API via Open-Meteo, buffer card duration titles, highlight scroll restoration, the design system token cleanup (v0.0.106–v0.0.114), and the warm-white/pure-white card convention.*

## Changelog

### v0.0.120 — Upload Zone Consistency

Normalized cover photo zone (EventEditor) to match document upload zone (DocumentUploader) pattern:
- Changed from `glass.subtle` bg + undefined dashed border → `glass.input.background` + `2px dashed colors.border`
- Changed from fixed `height: 120` → `padding: spacing.xl` (natural height)
- Icon size: 24px → 32px (matches Upload icon)
- Added caption: "Images only · Max 5 MB"
- Text "Tap to add a cover photo" was already 15px (normalized in v0.0.119)

### v0.0.119 — Cover Photo Text Normalization

Normalized cover photo placeholder text from 13px (`typography.helper.fontSize`) to 15px (`typography.body.fontSize`) for consistency with DocumentUploader's "Tap to select file" text.

### v0.0.118 — Upload Icon Centering

Fixed Upload icon in DocumentUploader not centering: added `display: 'block'` and `margin: '0 auto'`.

### v0.0.115 — Design System V2 Responsive + Font Cleanup

Updated TravelDesignSystemV2 page (ui-test v0.0.204):
- Removed monospace font (`SF Mono`) from all design system page text — all text now uses Inter via `fontStack`
- Added responsive layout: sidebar collapses to overlay on tablet (<1024px) and mobile (<768px), backdrop overlay, auto-close on nav click
- Responsive section cards: reduced padding on mobile, scaled-down headings
- Responsive grids: primary brand/surfaces and empty states switch to single column on mobile
- Main content padding adapts to viewport size (desktop: 48/40px, tablet: 32/24px, mobile: 24/16px)
- Added destination colors section (6 colors from sampleTrip.js)
- Status colors reduced to 2 (upcoming + done), warning/danger removed from display
- Typography inline overrides subsection added (12/14/15/16/22px)

---

### v0.0.114 — Color Token Audit (surfaceMuted Removal)

Removed `colors.surfaceMuted` (#EFEEE9) — token was not visibly distinguishable in the app. Replaced all 10 references across 7 files with `colors.borderLight`. Updated design system page (ui-test) to remove surfaceMuted and update badge count (44→43 colors).

---

### v0.0.113 — Hardcoded Color Fix (#C4A265 → colors.sand)

Fixed 4 hardcoded `#C4A265` values that should use the `colors.sand` design token:
- HeroView DestCard arrow accent color (was `palette.gold`, broken after v0.0.110 removal)
- HeroView CalendarDays icon color
- HeroView DestCard gradient fallback
- coverImages.js hotel gradient

---

### v0.0.112 — Maui Arrow Button Fix

Fixed missing Maui arrow button on DestCard — `palette.gold` (removed in v0.0.110) left no accent color. Now uses `colors.sand` via destination color lookup.

---

### v0.0.111 — Design System V2 Page Updates

Updated TravelDesignSystemV2 page (ui-test) to reflect v0.0.110 token removals: removed dead tokens from local copies (typography.hero, spacing.xxs, shadows.card/cardHover, glass.frostedMedium, warmPalette.warmWhite/gold, 5 composite tokens), updated section descriptions and badge counts.

---

### v0.0.110 — Dead Code Removal + Token Cleanup

Comprehensive dead code audit removing unused components, tokens, imports, and exports:

**Deleted components (4 files):**
- `AlertCard.jsx` — never imported by any view
- `BufferBlock.jsx` — never imported; TimeBlock handles buffer rendering inline
- `EventCard.jsx` — never imported; TimeBlock replaced it
- `DestinationCard.jsx` — never imported; HeroView uses inline DestCard sub-component

**Removed tokens from styles.js:**
- `typography.hero` (42px) — unused after HeroView redesign
- `spacing.xxs` (2px) — no remaining usages
- `shadows.card` and `shadows.cardHover` — card/cardHover only referenced by dead components
- `glass.frostedMedium` — zero usages
- `warmPalette.warmWhite` and `warmPalette.gold` — replaced by colors.js tokens
- `tokens.cardRadius`, `tokens.buttonRadius`, `tokens.badgeRadius`, `tokens.cardShadow`, `tokens.maxWidth` — all unused; only `tokens.cardBorder` retained

**Removed exports:**
- `export default colors` from colors.js (only named export used)
- `getTotalEventCount()` from sampleTrip.js
- `getEventStatus()` from eventTypes.js

**Cleaned imports:** 19 unused imports removed across 11 files, 3 unused variables removed.

**Documentation:** Updated DOCUMENTATION.md — removed deleted component sections, renumbered components (19→15), updated file tree, fixed all stale component references in architecture/flow diagrams, updated token tables.

---

### v0.0.109 — CLAUDE.md Design System Audit

Removed 29 unimplemented features from CLAUDE.md (skeleton screens, parallax, easing curves, focus traps, aria-live, role=dialog, etc.). Fixed 10+ incorrect values (backdrop opacity, drag handle color, button colors, nav colors, background hex, shadow table, checkbox size). 704→596 lines.

---

### v0.0.108 — Documentation Audit

Fixed 26 stale/incorrect references in DOCUMENTATION.md (removed dead tokens, fixed hex values, added missing tokens, removed MonthSummary references, fixed nav label Calendar→Plan, updated component counts).

---

### v0.0.107 — Design System Cleanup + Documentation Audit

7-phase cleanup establishing single source of truth for all design tokens, plus comprehensive documentation audit (26 fixes):

**Token files (colors.js + styles.js):**
- Removed 10 unused color tokens (`background`, `kauai/kauaiLight/kauaiBg`, `maui/mauiLight/mauiBg`, `stone/stoneLight`, `shadow`)
- Removed unused `gradients` export (6 gradients, zero usage)
- Added `colors.dragHandle` (#D6D3CE) and `colors.textOnDark` (#FFFFFF)
- Added `radius.iconSquare` (10) for 32×32 icon containers
- Added `shadows.accentGlow` / `shadows.accentGlowStrong` for ocean-teal button glows
- Added `scrimGradient` export — shared dark overlay for hero/header images
- Derived `warmPalette.textDark/textMedium/textLight/accent` from `colors.*` (single source of truth)
- Consolidated `shadows.card` = `shadows.sm` (same value), removed unused `glassHover`/`lg`/`xl`
- Removed unused glass variants: `frostedDark`, `tooltip`

**Hardcoded value replacements (25+ component/view files):**
- `#D6D3CE` → `colors.dragHandle` (6 files)
- `#EDEAE5` → `warmPalette.warmGray` (6 files)
- `#F0EFEA` → `colors.borderLight` (HeroView dividers)
- `#FFFFFF/#FFF` → semantic tokens: `colors.textOnAccent` (buttons), `colors.textOnDark` (scrims/overlays), `colors.surface` (backgrounds) — 13+ instances across 10 files
- `borderRadius: 10` → `radius.iconSquare` (9 instances in HeroView, StatusView, ChecklistItemRow)
- `rgba(14,116,144,0.25/0.4)` box-shadows → `shadows.accentGlow` / `shadows.accentGlowStrong` (StatusView, EmptyState, Navigation, HeroView)
- `rgba(196,162,101,0.12)` → `warmPalette.goldSoft` (HeroView countdown icon)
- Duplicated 5-line scrim gradient → `scrimGradient` token (TripHeader, HeroView)
- `fontSize: 13` → `typography.helper.fontSize` (~20 instances across 12 files)
- `fontSize: 11` → `typography.caption.fontSize` or removed when redundant with `...typography.caption` spread (~15 instances)
- Added `import { colors }` to Navigation.jsx and CalendarTooltip.jsx

**Dead code removal:**
- Deleted `MonthSummary.jsx` (returned null, was a no-op wrapper kept to avoid breaking imports)
- Removed MonthSummary import and usage from CalendarView.jsx

**Documentation audit (26 fixes):**
- Removed 10 stale token references (`background`, `stone`, `kauai*`, `maui*`, `shadow`, gradients export)
- Fixed wrong hex values: coral (#E8725A→#C74534), sand (#C4A265→#9E7C2E), sunset (#E8925A→#C05D10, light #FFF0E3→#FDE8D3)
- Added missing tokens: `dragHandle`, `textOnDark`, `iconSquare`, `accentGlow`, `accentGlowStrong`, `scrimGradient`
- Fixed warmPalette to show derivation from colors.js (`textDark: colors.textPrimary`, etc.)
- Removed deleted shadows (`lg`, `xl`), glass variants (`tooltip`, `frostedDark`)
- Fixed nav label "Calendar"→"Plan", inactive color #9CA3AF→#9B9B9B
- Removed all MonthSummary references (component section, hierarchy trees, CalendarView zones, file tree)
- Removed stale "header Add button" user flow (removed in v0.0.94)
- Fixed hero gradient description to reference `scrimGradient` token
- Updated component count (20→19), file tree line counts, version references

### v0.0.102 — Highlight Cover Photo Consistency
- **Highlight card photos match event detail and timeline:** Added `coverImage` fields to 4 highlight events in `sampleTrip.js` (e-0205 Poipu Beach, e-0303 Waimea Canyon, e-0602 Road to Hana, e-0802 Haleakala Sunrise) using the same Unsplash URLs from the `HIGHLIGHTS` array in HeroView. The 5th highlight (e-0403 Na Pali Coast) already had `coverImage` set. Now all three surfaces — highlight card, timeline TimeBlock, and EventDetailView — display the same curated photo for each highlight event.
- **DATA_VERSION bumped 4 → 5** to invalidate stale localStorage and load new `coverImage` fields.

### v0.0.101 — Cover Photo Match + Horizontal Wobble Fix
- **EventDetailView cover photos match timeline cards:** Replaced the hardcoded `TYPE_PHOTOS` map (one generic photo per event type) with the same image resolution used by TimeBlock: `event.coverImage` → `getCoverImage(type, id)` → gradient fallback. The "Flight to Kauai" card and all other events now show the same cover photo in both the timeline and the detail page. Added `<img>` tag with `onError` fallback to gradient.
- **Horizontal wobble eliminated on overlay open:** All 4 overlay components (EventEditor, ChecklistEditor, DocumentUploader, DocumentViewer) now use `position: fixed` with saved `scrollY` offset instead of `overflow: hidden` on body. This freezes the background without removing the scrollbar, preventing horizontal layout shift. On unmount, position is cleared and `window.scrollTo` restores the original scroll position. `overflow-x: hidden` set on body during overlay for additional horizontal clamping.

### v0.0.100 — Scroll Restoration Fix
- **Fixed hero scroll restoration (was completely broken):** The `onAnimationComplete` callback on the hero `motion.div` was checking `def === 'animate'`, but Framer Motion 11 with inline animation objects (`{...pageVariants}`) passes definition objects — not strings — to the callback. The condition was always `false` and scroll was never restored. Replaced with a `useEffect` watching `activeView`: when it returns to `'hero'` from another view, a 450ms `setTimeout` (exit 150ms + enter 250ms + 50ms buffer) restores `window.scrollTo(0, savedY)`.

### v0.0.99 — Buffer Card Titles + Highlight Scroll Restoration
- **Buffer cards show duration as title:** All buffer blocks in the day timeline now display `~X min buffer` (e.g. "~30 min buffer", "~95 min buffer") as the bold title instead of the event title. The descriptive `bufferLabel` (or original title if no label) appears below as body text subtitle. Matches the pattern: time range header → `~X min buffer` bold → descriptive label.
- **Scroll restoration on highlight back-nav:** Tapping a Trip Highlight card on the Hero view, navigating to EventDetailView, then pressing back now restores the scroll position to the exact card that was tapped. The `heroScrollRef` save/restore mechanism was upgraded from single `requestAnimationFrame` to a dual-pass strategy (`requestAnimationFrame` + 100ms `setTimeout` fallback) to handle staggered child animations that need time to occupy full DOM height before `scrollTo` can reach the target position.

### v0.0.98 — Weather API Accuracy Fix
- **Real forecasts only for actual trip dates:** Removed the proxy data mapping that was using weather from ~2 weeks before the trip as fake estimates. The API now only returns data for trip dates that genuinely fall within Open-Meteo's 16-day forecast window. When no trip dates overlap, simulated weather is used as fallback.
- **Info message on fetch:** After entering a zip code, the UI displays a contextual message: full forecast available ("Lihue forecast loaded"), partial ("Showing forecast for 3 of 9 trip days"), or not yet available ("Forecasts for Lihue aren't available yet for your trip dates. Real weather will appear once the trip is within 16 days.").
- **Null entry safety:** Skips forecast entries with null temperature values (Open-Meteo sometimes returns null for the last day in a 16-day request).

### v0.0.97 — Weather API Date Range Fix
- **Trip date mapping for out-of-range forecasts:** Fixed weather not updating after entering zip code. The trip dates (Mar 14–22) fell outside Open-Meteo's 16-day forecast window, so no forecast data matched any trip date. Added logic to map the last available forecast days onto trip dates as best-estimate data when there's no direct overlap. (Superseded by v0.0.98 which removed the proxy mapping in favor of honest fallback.)

### v0.0.96 — Destination Strip Sizing, Next Up Layout, Plan Gradient, Weather API
- **Destination strip other-island link sizing:** Font size increased from 13px to 15px, icon-text gap from 3px to 5px, MapPin size from 11px to 13px — now consistent with the active destination pill styling.
- **Next Up card icon alignment:** Restructured icon + title from vertical stack (icon above, `marginBottom: 8`) to horizontal flex row (`display: flex, alignItems: center, gap: 8`) matching the Flight Status and Trip Countdown card layouts. Icon has `flexShrink: 0`.
- **TripHeader gradient matched to HeroView:** Replaced pure-black gradient (`rgba(0,0,0)` at 25%→50%→65%) with HeroView's warm brown gradient (`rgba(28,25,23)` at 30%→20%→25%→60%→90%`). Calendar/Status page headers now match the Trip tab's warm tone.
- **Real weather API integration (Open-Meteo):** Added zip code input field in the Daily Overview section. On submit, geocodes the zip code via Open-Meteo's geocoding API, then fetches a 16-day weather forecast (temperature high/low in °F + WMO weather code). Data is stored in TripContext (`weatherZipCode`, `weatherData`) and persisted to localStorage. Day chips use real forecast data when available, falling back to `getSimulatedWeather()` for dates outside the forecast window. New helper functions: `mapWeatherCode()`, `fetchWeatherForZip()`. New reducer actions: `SET_WEATHER_ZIP`, `SET_WEATHER_DATA`.

### v0.0.95 — Destination Strip Tap Target Improvement
- **Destination strip padding increased:** Banner vertical padding increased from `spacing.sm + 2` (10px) to `spacing.md + 2` (14px) for easier tapping on mobile.
- **Pill vertical padding increased:** Current destination pill padding from `4px 14px` to `6px 14px`.
- **Other island button tap area:** Added `6px 4px` padding to plain text island link buttons (was `0`) for larger touch targets.

### v0.0.94 — Header Centering + Add Button Removal
- **Removed header Add button:** The teal "Add" pill button was removed from the DayTimelineView sticky header. Event creation is still accessible via the bottom nav "+" button and the inline "Add event" button at the end of the timeline.
- **Day info perfectly centered:** Header layout simplified to `flex` with two equal-width 44px arrow buttons on each side and `flex: 1` center section. Removed `position: absolute` centering approach. Day text (`Day X of Y` + date) is now perfectly centered between the prev/next arrows.
- **Vertical spacing fixed:** Removed `marginBottom: 21` from the date heading that was creating asymmetric vertical spacing. Header padding changed from `spacing.md` (12px) to `spacing.lg` (16px) for balanced top/bottom breathing room.

### v0.0.93 — Destination Strip Pill Redesign + Day Info Centering
- **Pill shape on active destination:** Flipped the pill/highlight pattern — the *current* island now has the pill shape (white semi-transparent background `rgba(255,255,255,0.65)`, `borderRadius: 20`, 14px/700 bold text, MapPin 13px). Previously the pill was on the *other* islands.
- **Other islands as plain text:** Non-current islands changed from pill buttons to plain text links (no background, `fontSize: 13`, `fontWeight: 500`, `textMedium` color) with MapPin + ChevronRight for affordance.
- **Day info centering (initial):** Used `position: absolute` with `left: 0; right: 0` to center day header text independently of left/right button widths. (Further refined in v0.0.94.)

### v0.0.87 — Destination Strip Redesign + Card Text Sizing + Calendar Subtitle
- **Destination strip redesigned:** Current island now visually emphasized (bold 15px/700 name, prominent MapPin, `textDark` color). Other islands rendered as subtle muted links (13px/400, `textLight`, ChevronRight arrow). Replaced prior dual-button pill design that made both islands appear co-equal.
- **Cards above highlights text sizing:** Next Up card time/location bumped from `helper` (13px) to `body` (15px), MapPin 12→13px. Flight Status card title now full `sectionHeader` (18px, removed fontSize:15 override), date/time bumped to `body`, badge 11→12px. Trip Countdown card same treatment: title to full `sectionHeader`, date range to `body`, badge to 12px, location to `body` (15px).
- **Calendar subtitle:** Changed text from "Activity days by island" to "Activity days". Changed style from `typography.helper` to `typography.body` (13px → 15px).

### v0.0.86 — Cache Invalidation
- **DATA_VERSION bumped:** 3 → 4 in `TripContext.jsx` to force localStorage reload from `sampleTrip` defaults after sample data changes.

### v0.0.85 — Custom Hero Upload + Body Scroll Lock + Highlight Card Text Sizing
- **Custom hero photo upload:** Added camera button (frosted glass circle, 32x32) to HeroView hero section. Users can select a photo which is compressed via canvas API (1200px max width, JPEG quality 0.7) and stored as data URL in `heroImage` state. TripHeader reads `state.heroImage` from context to display custom photo on calendar page.
- **SET_HERO_IMAGE reducer action:** New action in TripContext to store custom hero photo.
- **Body scroll lock on overlays:** EventEditor, ChecklistEditor, DocumentUploader, and DocumentViewer now set `document.body.style.overflow = 'hidden'` on mount and restore on unmount. Prevents page wobble caused by scrollbar appearance/disappearance.
- **Destination strip centered + brightened:** Added `justifyContent: 'center'`. Changed backgrounds from `dest.accentLight` to brightened tints: `#BAE5E0` (Kauai) and `#EDDBAF` (Maui).
- **Scroll restoration improved:** Changed `onAnimationComplete` in App.jsx to use `requestAnimationFrame` for more reliable scroll position restoration after hero view enter animation.
- **Highlight card text sizing:** Content padding increased (12px 14px → 14px 16px). Title to `sectionHeader` (18px), meta info 11→13px with `textMedium`, description to `body` (15px), CTA 13→15px with marginTop 10→14px. Card gap 14→16px.

### v0.0.84 — Hero Image + MonthSummary Cleanup + Day Tab Readability
- **Hero image replaced:** Changed from Unsplash URL to local `/hero-bg.png` (sunset beach photo). Updated both HeroView and TripHeader.
- **MonthSummary simplified:** Removed per-destination count breakdown ("5 Kauai · 4 Maui"). Now shows only total: "9 trip days".
- **Hour labels readable:** DayTimelineView left hour labels changed from `caption` (11px, `textLight`) to 12px with `textMedium` color.
- **Day counter readable:** "Day X of Y" counter changed from `caption` (11px) to 12px with `textMedium` color.
- **Destination strip clickable:** Added island navigation to destination strip. Tapping a destination navigates to the first day at that location via `SET_SELECTED_DATE`.

### v0.0.83 — Cover Image Fixes + Scroll Restoration
- **Broken Unsplash URLs fixed:** Flight cover images `photo-1436491865332` and `photo-1464037866556` were returning 404. Replaced with verified working URLs in both `sampleTrip.js` (explicit `coverImage` fields) and `coverImages.js` (flight type fallback array).
- **Scroll restoration on back from highlights:** `requestAnimationFrame` was firing before the AnimatePresence enter animation completed (250ms), so `window.scrollTo` had no effect. Replaced with `onAnimationComplete` callback on the hero `motion.div` — scroll restores only after content has rendered and animated in.
- **Hero scroll save/restore:** `App.jsx` saves `window.scrollY` to a ref when leaving hero view. Non-hero navigations scroll to top. Hero returns restore the saved position.

### v0.0.82 — Data Version Cache Invalidation
- **`DATA_VERSION` added to TripContext:** localStorage now stores `_dataVersion` alongside state. On load, version mismatch causes full reload from `sampleTrip` defaults. Bump `DATA_VERSION` when sample data changes (new fields, fixed URLs, etc.).

### v0.0.81 — Highlight Data Fix + Cover Images
- **Haleakala Sunrise highlight:** Fixed incorrect date/day in `HIGHLIGHTS` array — `day: 7` / `2026-03-20` → `day: 8` / `2026-03-21`, time `4:30 AM – 8:00 AM` → `5:30 AM – 7:30 AM` to match actual event `e-0802` in sampleTrip.
- **Explicit cover images added:** `coverImage` field added to 4 events in `sampleTrip.js`: `e-0104` (Flight to Kauai), `e-0403` (Na Pali Coast Boat Tour), `e-0505` (Flight to Maui), `e-0905` (Flight to Chicago). TimeBlock reads `event.coverImage` first, then falls back to `getCoverImage()`.

### v0.0.79 — Icon Changes + Typography Enforcement
- **Boat color:** Changed from `colors.ocean` (#0E7490) to new `colors.navy` (#1E40AF) / `navyLight` (#DBEAFE) — clearly distinct from flight's teal-blue (#2B7A9E).
- **Fun icon:** Swapped `Music` → `PartyPopper` for better semantic match.
- **Buffer icon:** Swapped `Coffee` → `Clock` across `eventTypes.js`, `BufferBlock.jsx`, and `TimeBlock.jsx`.
- **Font weight token overrides (16 fixes):** Eliminated all `fontWeight` overrides that contradicted spread tokens — e.g. `...typography.body, fontWeight: 500` → `...typography.bodyMedium`, `...typography.helper, fontWeight: 600` → `...typography.sectionHeader, fontSize: 13`.
- **Critical minimum fix:** `fontSize: 10` in HeroView milestone → `fontSize: 11` (CLAUDE.md: "Never go below 11px").
- **Off-ramp font sizes:** Snapped ~20 instances to nearest standard (12→11, 14→13, 16→15, 17→18, 20→18, 38→42). Exception: `fontSize: 16` kept on `<input>` elements (iOS zoom prevention).
- **Files touched:** 22 files across colors, data, views, and components.

### v0.0.78 — Text Color Design System Enforcement
- **Aligned `warmPalette` to design system:** `textDark` (#1C1917→#1A1A1A), `textMedium` (#57534E→#6B6B6B), `textLight` (#A8A29E→#9B9B9B) — cascades to all 18 files using these tokens.
- **Removed accent color from non-link text:** Countdown badge, milestone times, count badges, "Now" indicator, category/type picker labels, destination name text — all switched from `#0E7490` or event/destination colors to approved text palette.
- **Kept `#0E7490` for interactive links/buttons:** "View Day" links, "Back to timeline", "Add event" hover state, CalendarTooltip "View Day" button.
- **Fixed category/type pickers:** Selected text in EventEditor, ChecklistEditor, DocumentUploader now uses `textPrimary` instead of category accent colors (colored border+background still communicates selection).
- **Navigation inactive text:** Changed from `#9CA3AF` to `#9B9B9B` (textMuted).
- **Hardcoded hex cleanup:** `EventEditor.jsx` input color changed from `'#1A1A1A'` to `colors.textPrimary` token.
- **Semi-transparent white cleanup:** `rgba(255,255,255,0.8-0.9)` in HeroView hero pill and highlight cards changed to full `#FFFFFF`.

### v0.0.76 — Dead Code Cleanup
- **Removed `hooks/` directory:** Deleted `useTrip.js` and `useDay.js` — neither was imported anywhere. All views use `useTripContext` directly.
- **Removed unused exports from `dateUtils.js`:** `formatMonthYear()` (superseded by `formatMonthYearFromParts`) and `areSameDay()`.
- **Removed unused import:** `AlertTriangle` from `EventCard.jsx`, `isSameDay` from `dateUtils.js`.

### v0.0.71 — Icon Overhaul, Hero Simplification, Tight Buffers
- **Sunrise icon:** Replaced Lucide `Sun` with custom `LightMode` SVG component matching Material Symbols `light_mode` (larger r=5 circle, shorter 2px rays). Exported from `eventTypes.js`.
- **Buffer color:** Changed `tan` from `#A0845C` to `#7B5B3A` (chocolate brown) with `#F7EDE2` light — clearly distinct from hotel's sand gold (#9E7C2E).
- **Transport category:** `statusCategories.js` transport color changed from `colors.info` (blue) to `colors.violet` (#6D28D9) to match event type purple.
- **Hero pills combined:** "9 DAYS" and "Xd away" merged into single frosted pill with dot separator, same 12px font size.
- **Removed NEXT UP header:** Removed "NEXT UP" label and "Day X of Y" counter from the next up card header row on Trip tab.
- **Tight buffer indication:** TimeBlock buffer cards with ≤20 min now show: warning orange background (`colors.warningLight`), dashed left border (`colors.warning`), orange text/icon, and uppercase "TIGHT" badge — matching BufferBlock design system reference.
- **Icon audit:** All 14 event types verified with correct icon assignments.

### v0.0.70 — Icon Updates, Card Refinements, Time Fix
- **Sunrise icon:** Changed from `SunDim` to `Sun` for equal visual weight with other event type icons.
- **Entertainment → Fun:** Event type label renamed from "Entertainment" to "Fun".
- **Type picker line height:** Added `lineHeight: 1.1` to event type labels in EventEditor for tighter spacing.
- **Calendar legend padding:** Added 4px top/bottom padding to "Activity days by island" subtitle.
- **Removed Mark Done from editor:** Removed the status toggle button from EventEditor header.
- **Removed done overlay:** Removed the checkmark toggle button overlay from TimeBlock card images.
- **Edit icon overlay:** Added frosted circle (28px) with Pencil icon at top-right of TimeBlock image area.
- **Removed "Next Up" badge:** Removed amber "NEXT UP" pill from TimeBlock cards.
- **Removed checklist category label:** Removed redundant category icon + label from ChecklistItemRow (left border color suffices).
- **Transport color → violet:** Changed ground_transport from `colors.stone` (#78716C) to `colors.violet` (#6D28D9, darker purple).
- **Buffer color → tan:** Changed buffer from `colors.textSecondary` (#6B6B6B) to `colors.tan` (#A0845C, warm brown).
- **New colors added:** `violet` (#6D28D9 / #EDE9FE) and `tan` (#A0845C / #F5ECD5) in colors.js.
- **Day counter contrast:** "Day X of Y" text changed from `palette.textLight` to `palette.textMedium` with fontWeight 500.
- **Time editing bugfix:** `formatInputTime` now extracts HH:MM directly from ISO string (regex) instead of using `new Date().getHours()` which converted to browser timezone. `buildISOTime` preserves the original event's timezone offset instead of hardcoding `-10:00`. EventEditor preserves `event.timezone` instead of always writing `Pacific/Honolulu`.

### v0.0.64 — Buffer Card Visibility
- **Buffer card background:** Changed from `#EDE8DF` to `#F5EDD8` (sandLight) for clearer contrast against glossy page background.

### v0.0.63 — Buffer Card Distinction
- **Buffer card styling:** Replaced `glass.subtle` with solid `#EDE8DF` background and `1px solid rgba(0,0,0,0.04)` border for clear visual distinction from white event cards.

### v0.0.62 — Calendar Readability + Daily Overview + Done State
- **White daily overview cards:** Day chips in Hero "Daily Overview" changed from `glass.subtle` to `glass.card` (white) for consistency with other cards.
- **Swipe fix:** Added `touchAction: 'pan-x'` to daily overview day buttons to prevent Framer Motion from eating horizontal scroll gestures.
- **Bigger calendar legend:** CalendarLegend button padding increased (8/16px → 12/24px), shape indicators 10→12px, name text 15→16px, count text 13→15px.
- **Bigger month summary:** MonthSummary text changed from `helper` (13px) to `body` (15px), dots 8→10px.
- **Readable calendar subtitle:** "Activity days by island" changed from `textLight` to `textMedium` with `fontWeight: 500`.
- **Bigger calendar numbers:** DayCard day number font size 14→17px, line height 16→20px.
- **Circular tooltip close button:** CalendarTooltip close button now 36x36 circle with `#EDEAE5` background (matching EventEditor style).
- **Stronger done state:** TimeBlock done opacity 0.55→0.45, grayscale 0.4→0.6. Added inline green "Done" badge with CheckCircle2 icon in content area.

### v0.0.61 — Glass Panel Removal
- **Removed `glass.panel` token entirely** from `styles.js`. Was `rgba(255,255,255,0.72)` with 24px blur.
- **HeroView:** Content panel wrapper now uses flat `background: glossyBg` instead of `...glass.panel`.
- **CalendarView:** Content panel wrapper now uses flat `background: glossyBg` instead of `...glass.panel`.
- **Glass system reduced from 12 to 11 tokens.** Visual hierarchy simplified to 2-tier: page bg → glass.card → glass.sheet.

### v0.0.60 — Background Consistency
- **App.jsx wrapper:** Changed outer background from `colors.background` (#EFEEEB) to `glossyBg` (#F0EDE8) for consistency across all views.
- **HeroView content panel:** Already using `glossyBg` (confirmed no change needed).

### v0.0.54–v0.0.59 — Design System Page + Incremental Fixes
- **Design system page created:** New `/travel-design-system` page in ui-test app documenting all travel app design tokens (colors, typography, spacing, shadows, glass, events, icons, status, animation).
- **Various UI polish:** Status card border removals, icon color-coding, background color matching across views.

### v0.0.53 — Live Countdown, Inline Done Toggle, Background Darken, Overflow Fix
- **Hero cover shift:** Cover image pulled up 30px for better visual overlap with the content panel below.
- **Live next-up countdown:** "Upcoming" green dot pill on hero highlight cards replaced with a live countdown display (e.g. "2h 15m", "3d away", "Now"). Updates dynamically.
- **Highlight card navigation:** Tapping a highlight card now navigates to the event's detail page (EventDetailView) instead of the day view. Each highlight now carries its `eventId`.
- **Expanded highlights:** Hero view now shows 3 highlight cards (was 1). *(v0.0.52)*
- **Card icons:** Flight status card shows Plane icon, Trip Countdown card shows CalendarDays icon. Typography hierarchy fixes across all views. *(v0.0.52)*
- **EventEditor Mark Done fix:** Toggle button now updates local `formData` state AND dispatches to context simultaneously, so the button label/color reflects the change immediately without requiring a save.
- **Type picker padding:** Added 5px extra horizontal padding to EventEditor type picker buttons for better label readability (especially longer labels like "Entertainment").
- **Wider type picker grid:** Increased grid spacing for type picker. *(v0.0.51)*
- **Whiter buffer cards:** Buffer card backgrounds made whiter. *(v0.0.51)*
- **TimeBlock "Details" button:** Chevron-only button replaced with explicit "Details" text + ChevronRight icon for clearer affordance.
- **Inline done toggle on timeline:** Added interactive checkmark overlay (top-left of image cards) for marking events done directly from the timeline. CheckCircle2 icon shows green fill when done, semi-transparent dark circle when upcoming. DayTimelineView passes `onToggleStatus` prop to TimeBlock.
- **DayTimelineView heading restored:** Page heading restored to native 18px `sectionHeader` (was overridden to 16px in a prior version).
- **CalendarView Add button removed:** Removed the "Add" button/icon below the calendar grid along with all associated dead code (EventEditor overlay, state variables, callbacks, unused imports).
- **Background darkened globally:** Base background color changed from `#F6F5F2` to `#EFEEEB` in `colors.js`, applied across all views.
- **Mobile overflow fix:** Added `overflow-x: hidden` to `html`/`body` in `index.css` and to the App.jsx wrapper to prevent horizontal page wobble on mobile.
- **App max-width enforced:** App.jsx wrapper now explicitly sets `maxWidth: 480` for consistent mobile framing.
- **Cover photo upload:** EventEditor supports cover photo uploads with canvas-based compression. *(v0.0.50)*
- **StatusView documents verified:** Document upload persistence via TripContext + localStorage confirmed working correctly (no changes needed).

### v0.0.49 — Buffer Block Polish + Trip Tab Layout
- **Next Up card contrast:** Restored `glass.card` border and shadow (were overridden to `none`), card now visually separates from panel.
- **Trip tab shifted up 60px:** Hero section height 170px → 110px.
- **Buffer block lighter bg:** `warmPalette.goldSoft` → `rgba(245,237,216,0.45)` (lighter, airier).
- **Buffer block text:** Title 15px/500 → 16px/600, time 11px caption → 13px helper, subtitle 13px/textLight → 15px/textMedium. Icon 16→18px. More padding.

### v0.0.48 — Type Picker Grid Layout
- **EventEditor type picker:** Replaced broken horizontal scroll with responsive CSS grid (`auto-fill, minmax(64px, 1fr)`). All types visible and tappable without scroll conflicts.

### v0.0.47 — Card Contrast + Visual Hierarchy + Design System Docs
- **Glass token contrast overhaul:** `glass.card` 65%→82%, `glass.panel` 55%→72%, `glass.subtle` 50%→65%, `glass.tooltip` 78%→90%, `glass.badge` 45%→60%. All borders switched from white alpha to dark alpha for visible separation on warm bg.
- **HeroView token cleanup:** Flight status colors use `colors.warningLight`/`colors.success` (were hardcoded). Daily Overview header uses `typography.caption`. Milestone row uses `colors.success`/`colors.border`.
- **CalendarView:** Weekday headers use `typography.caption` (was 10px, now 11px minimum).
- **DayTimelineView:** Hour labels use `typography.caption`, dashed border uses `colors.border`.
- **EventDetailView:** Success icon uses `colors.success` token, added `colors` import.
- **BufferBlock:** Border color uses `colors.border` token.
- **Design system docs:** Updated glassmorphism section with full 11-token reference table, 2-tier hierarchy diagram, component-to-token mapping.

### v0.0.46 — Buffer Block Cleanup
- Removed left border accent line from buffer blocks (kept gold tint bg only).

### v0.0.45 — Nav + Calendar + Background + Buffer Highlight
- **Darker nav bar:** `rgba(31,41,55,0.78)` → `rgba(20,28,40,0.88)`.
- **Taller calendar:** DayCard aspect ratio `1:1` → `5:6` (+70px total grid height).
- **Removed background gradient:** Navigation wrapper gradient → transparent, flat bg throughout.
- **Buffer block highlight:** Added `warmPalette.goldSoft` tint to buffer blocks.

### v0.0.44 — Design System Consistency Pass
- **Glass tokens:** `glass.input` border → `rgba(0,0,0,0.1)`, `glass.sheet` opacity 0.82→0.92, `glass.panel` shadow restored, `glass.frostedLight` border → dark alpha.
- **EventEditor:** Type picker unselected buttons → solid `#EDEAE5` bg, text `textMedium`. Close button → solid bg.
- **ChecklistEditor:** Input padding 12→16px, font 14→16px, radius 8→12px. Category picker larger, save button 16px.
- **DocumentUploader:** Same sizing fixes as ChecklistEditor.
- **EventDetailView:** Back button → solid `#EDEAE5`.
- **TimeBlock:** Chevron button → `#EDEAE5`.

### v0.0.43 — Flat Background + Panel Shadow Removal
- Removed `glass.panel` boxShadow. Flattened `glossyBg` from gradient to flat `#F0EDE8`.

### v0.0.42 — Trip Tab Shift + Inner Shadow Removal
- Hero section 210→170px. Removed all `inset` shadows from every glass token.

### v0.0.41 — Next Up Card Cleanup
- Removed blue teal left border, shadow, and edge line from Next Up card.

### v0.0.40 — Liquid Glass UI Transformation
- **Full glassmorphism overhaul:** Converted all 20+ files from solid white backgrounds to glass tokens.
- **8 new glass presets:** card, panel, sheet, nav, input, subtle, tooltip, badge — each with translucent bg, backdrop blur, border, and shadow.
- **Navigation:** Solid `#1F2937` → `glass.nav` frosted dark.
- **All views:** HeroView, CalendarView, DayTimelineView, StatusView, EventDetailView panels/headers → glass tokens.
- **All components:** EventCard, TimeBlock, ChecklistItemRow, DocumentCard, BufferBlock, DestinationCard, CalendarTooltip, CalendarLegend, EmptyState → glass tokens.
- **Bottom sheets:** EventEditor, ChecklistEditor, DocumentUploader → `glass.sheet` + `glass.input`.
- **Shadows:** Added `shadows.glass` and `shadows.glassHover`.

### v0.0.31 — Day View Polish + Status View Enhancements
- **Scroll-to-top:** DayTimelineView now scrolls to top on mount and whenever `selectedDate` changes via `useEffect`.
- **Shorter image cards:** TimeBlock image area reduced from 140px to 125px for tighter vertical rhythm.
- **Progress bar visibility:** Track background changed from `warmGray` to `accentSoft` (teal tint) so the bar is visible even at 0% completion.
- **Documents empty state:** Background changed to `accentSoft` teal tint, folder icon colored with `accent` teal and centered above text using flexbox column alignment.
- **Destination strip:** Removed `borderLeft: 4px solid` teal/gold line — now a clean full-width tinted bar.
- **MapPin weight:** strokeWidth increased from 2 to 2.5 on destination strip (applies to both Kauai and Maui).
- **Page backgrounds lightened 3%:** `warmGray` adjusted from `#E8E4DE` to `#EDEAE5` across all views.

### v0.0.29 — Design System Font Compliance
- **Buffer card background:** Changed from `#FFFFFF` to `#F3F1EE` (warm off-white) to visually distinguish from full image cards.
- **Font size audit:** Removed all non-standard font size overrides to enforce design system tokens:
  - TimeBlock image title: 16px → `sectionHeader` (18px)
  - TimeBlock image subtitle: `helper` (13px) → `body` (15px)
  - TimeBlock buffer title: 14px → `bodyMedium` (15px)
  - TimeBlock buffer time: 11px override → `caption` (11px proper token)
  - TimeBlock buffer label: 12px → `helper` (13px)
  - DocumentCard name: `helper` (13px) → `bodyMedium` (15px)
  - DocumentCard category: **9px** (below minimum!) → `caption` (11px)
  - HeroView destination dates: 14px → `body` (15px)
  - HeroView featured highlight body: 14px → `body` (15px)
- **No font below 11px minimum** (Apple HIG) in any card component.

### v0.0.28 — Buffer Event Card Redesign
- **Buffer events restyled:** Changed from compact muted row with left accent border to a proper white card container.
- **Layout:** Vertical layout with time range ("4:00 AM – 4:30 AM") at top, icon + title row below, optional buffer label.
- **Styling:** White (#FFFFFF) background, `shadows.sm`, `border: 1px solid rgba(0,0,0,0.06)`, `radius.md`.

### v0.0.27 — Global White Cards + Darker Page Backgrounds
- **All card/shape backgrounds → pure white:** Changed every `warmPalette.warmWhite` usage to `#FFFFFF` across 10+ files: EventEditor, DocumentUploader, ChecklistEditor, CalendarLegend, CalendarView grid, DayTimelineView nav buttons, EventDetailView header/info rows, HeroView chips/cards.
- **Page backgrounds darkened:** `warmGray` changed from `#F0EDE8` to `#E8E4DE` for stronger contrast against white cards. All views (Hero, Calendar, Day, Status, EventDetail) use `warmPalette.warmGray` for page-level backgrounds.
- **EventDetailView hero card:** Background changed from tinted `${bgColor}AA` to pure `#FFFFFF` with accent left border only.

### v0.0.26 — EventDetailView Hero Card Fix
- **Hero card whitened:** EventDetailView hero card background changed from creamy `${bgColor}AA` to pure `#FFFFFF`.

### v0.0.25 — Documentation Update
- Updated DOCUMENTATION.md to v0.0.24 covering image card timeline, EventDetailView, coverImages, and all changes from v0.0.21–v0.0.24.

### v0.0.24 — Image Card Timeline Redesign
- **TimeBlock redesign:** Complete overhaul from colored schedule blocks to image card layout matching travel app reference design.
- **Cover photos:** Each non-buffer event displays a 140px cover image area sourced from Unsplash, mapped by event type via `coverImages.js`. Gradient fallback per type on image load error.
- **Time + type badge:** Frosted dark pill (`rgba(0,0,0,0.6)` + backdrop blur) overlaid on bottom-left of image showing event icon (strokeWidth 2.5) + formatted time + type label.
- **"NEXT UP" badge:** Amber pill at top-right of image area.
- **Content area:** White card below image with title, subtitle/location, and chevron arrow button for detail navigation.
- **Buffer events:** Render as compact text-only rows (no image) — 4px left accent border, type icon, muted styling.
- **New file:** `src/data/coverImages.js` — maps 13 event types to curated Unsplash photo URLs with hash-based selection for variety + gradient fallbacks.

### v0.0.23 — Event Type Icons, Chevron Arrows, Event Detail View
- **TimeBlock icons:** Added event type icons (from `getEventIcon`) with heavy strokeWidth 2.5 for visibility. 38px icon container with tinted background.
- **Chevron arrows:** Added `ChevronRight` button on right side of each non-buffer TimeBlock. Tapping the chevron navigates to EventDetailView (via `stopPropagation` to prevent editor opening).
- **Lower bg opacity:** TimeBlock background colors reduced to ~67% opacity (`hex + AA`) for softer appearance.
- **EventDetailView (new):** Full event information page with sticky header (back + edit buttons), hero card (type icon + title), and info row sections for time, location, confirmation number, timezone, notes, and status toggle.
- **TripContext:** Added `selectedEventId` state and `SET_SELECTED_EVENT` reducer action.
- **App.jsx:** Added `eventDetail` view route rendering `EventDetailView`.
- **DayTimelineView:** Added `handleEventDetail` function that dispatches `SET_SELECTED_EVENT` + navigates to 'eventDetail'. Passes `onDetail` prop to TimeBlock.

### v0.0.22 — TimeBlock Schedule Layout + Calendar EventEditor
- **TimeBlock (new):** Colored schedule block component replacing EventCard/BufferBlock in day timeline. Height scales with event duration (PX_PER_MIN = 1.2, clamped 64–160px). Shows start time, title, subtitle, left accent border in type color.
- **DayTimelineView rewrite:** Timeline section now uses TimeBlock with left hour labels. Hour labels deduplicated by comparing with previous event's hour. Layout: 44px left column for hours + flexible right column for blocks.
- **CalendarView EventEditor:** Add button on calendar page now opens EventEditor popup directly (instead of navigating away). Added `isAddingEvent` state, `handleAddEvent`, `handleEventSave`, and `handleEventEditorClose` handlers.

### v0.0.37 — Trip Countdown, Weather, Compact Destination Cards
- **Trip Countdown Card (new):** Pre-trip card on HeroView showing days until departure, destination route (Kauai → Maui), and milestone log with 6 countdown milestones (trip booked → trip begins). Uses same `FlightMilestoneRow` component and sliding-window pattern as the flight card. Hidden once trip starts.
- **Simulated Weather in Daily Overview:** Day chips in the horizontal scroll strip now show weather icons (Sun, CloudSun, Cloud, CloudRain from Lucide) and temperature (75–85°F). Weather is deterministically seeded from date + destination ID for consistency. Replaces the old destination color bar + event count.
- **Compact Destination Cards:** Photo height reduced from 140px → 50px (-90px). Info section padding tightened (16px → 12px top, 20px → 14px bottom). Title reduced from 20px → 17px. Date text reduced to 12px. Overall card ~90px shorter.
- **New helper functions:** `getSimulatedWeather()`, `WeatherIcon` component, `formatCountdownTime()`, `getTripCountdownMilestones()`.
- **New Lucide imports:** CloudSun, Cloud, CloudRain added to HeroView.

### v0.0.36 — Flight Status Milestone Log
- **Flight milestone log (new):** Flight status card on HeroView now shows a mini vertical timeline of 6 simulated milestones (check-in open, gate assigned, boarding, doors closed, departed/in-flight, landed). Sliding window displays 3 milestones at a time centered on current. Visual indicators: green filled dot (done), teal pulsing dot with glow animation (current), hollow circle (upcoming). Vertical connector lines between dots (green if done, muted otherwise). Relative timestamps right-aligned, updating every 60s.
- **FlightMilestoneRow sub-component (new):** Reusable timeline row with status-based dot styling, label text (bold for current), detail text (shown only for current), and relative time badge.
- **Flight card layout:** Changed from horizontal flex (title + route + badge) to vertical stack (title/badge row, date, centered route visualization, divider, milestone rows).
- **New helper functions:** `seededGate()`, `computeRemaining()`, `formatRelativeTime()`, `getFlightMilestones()`, `getVisibleMilestones()`.

### v0.0.21 — Documentation Update
- Updated DOCUMENTATION.md to reflect all calendar redesign changes from v0.0.18–v0.0.20.

### v0.0.18 → v0.0.20 — Calendar Redesign + Status White Cards
- **CalendarView rewrite:** Month navigation with prev/next chevrons and swipe gesture (Framer Motion `drag="x"`, 80px threshold). Animated slide + fade transitions between months (250ms enter, 150ms exit).
- **CalendarTooltip (new):** Responsive popover (75% container width, 260–340px) on day tap showing day label, destination with shape indicator, event breakdown by type (icon + label + count), and "View Day" button. Dismiss via backdrop, X, or Escape.
- **CalendarLegend (new):** Interactive destination pill buttons with shape indicator (circle=Kauai, square=Maui) + name + day count. Tapping filters/highlights matching days on grid (non-matching dim to 0.3 opacity).
- **MonthSummary (new):** Summary line: "9 trip days · 5 Kauai · 4 Maui" with inline destination color dots.
- **DayCard refactor:** Event dots replaced with horizontal density bars (16px × 3px, second bar at half opacity for >3 events). Small destination shape indicator in bottom-right corner. Selected date gets 2.5px accent ring + elevated shadow. Today gets subtle textLight border (distinct from selection). Text weight varies: bold (events), medium (trip day), regular (non-trip). Filter-aware dimming support.
- **dateUtils:** Added `getAdjacentMonth(year, month, direction)` and `formatMonthYearFromParts(year, month)`.
- **Status view:** ChecklistItemRow and DocumentCard backgrounds changed from `warmPalette.warmWhite` (#FAF8F5) to `#FFFFFF` (pure white).
- **Calendar Add button:** Solid accent pill style matching Day tab's Add button (teal bg, white text, box-shadow).
- **Tooltip View Day button:** Increased padding (+5px) for better touch target.

### v0.0.7
- CTA button color: `#2563EB` (pure blue) → `#0E7490` (teal-blue, 5.35:1 contrast)
- Event type icon backgrounds: diversified from 4 shared colors to 14 unique bg colors
- New icon colors for sightseeing (amber), beach (aqua), hiking (emerald), shopping (rose), entertainment (purple)
- EventCard title: 15px bodyMedium → 18px sectionHeader for readability
- EventCard location: 12px → 13px helper, color upgraded to textMedium
- EventCard icon container: 36x36px → 40x40px with 20px icon
- WCAG fixes: Day nav buttons 36→44px, Add button 36→44px height, StatusBadge min 11px, BufferBlock label 12→13px

### v0.0.6
- CTA buttons: teal `#0A8F8F` → blue `#2563EB` (later refined in v0.0.7)
- "Next up" pill: separated from CTA color, now amber `#B45309` (Nielsen H1)
- Day tab icon strokeWidth: 1.5 → 1.75
- Hero cover image: 420px → 220px height
- Removed duplicate island badge overlay from DestCard photos
- DestCard photo height: 130px → 100px

### v0.0.5
- Removed all neumorphism styling (dual-tone `#D4D0CA`/`#FFFFFF` shadows)
- Kept glassmorphism (backdrop blur) effects
- Replaced neumorphic shadows with clean `shadows` object across all components
- Card backgrounds: `warmGray` → `warmWhite` for clean shadow aesthetic
- Inset shadows replaced with `border: 1px solid rgba(0,0,0,0.06)`
