# Travel Day Organizer — UX Documentation

> A portfolio-quality Hawaii trip planner built with React 19, Framer Motion, and a tropical design system. This document serves as the complete UX reference for the Travel module.

**Live URL:** `http://192.168.1.198`
**Deployment:** Standalone K8s namespace `travel`
**Current Version:** v0.0.213
**Production URL:** `https://travel.cheyshen.com/`

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
- **9-Day Hawaii Itinerary:** Pre-loaded sample trip (Kauai & Maui). Dates auto-shift forward when the trip ends, so the demo always shows a future vacation.
- **Five Primary Views:**
  - **Hero View:** Trip overview with key details and call-to-action navigation
  - **Calendar View:** Month-at-a-glance visualization showing trip dates and destinations
  - **Day Timeline View:** Hour-by-hour itinerary with image card schedule blocks and full CRUD capabilities
  - **Event Detail View:** Full event information page with location, confirmation, notes, status, and edit access
  - **Status View:** Trip preparation checklist with add/edit/delete/toggle, categorized by type, plus document upload (base64 in localStorage, 2MB limit) with full-screen preview
- **Event Management:** Create, read, update, delete (CRUD) operations for all event types
- **Rich Event Types:** 14 specialized event categories including flights, hotels, dining, activities, ground transport, boat tours, hiking, sunrise viewing, and more
- **LocalStorage Persistence:** All changes automatically save to browser storage, enabling offline access and data retention across sessions
- **Auto-Reset After Trip:** When the trip end date passes, the app automatically shifts all dates forward to the next matching weekday, resets event statuses to "upcoming," and unchecks all checklist items — keeping the demo evergreen
- **Timezone Awareness:** Handles multiple timezones (Chicago Central / Hawaii-Aleutian) with proper time conversion
- **Confirmation Numbers & Details:** Track booking references, locations, special notes, and status for each event
- **Accommodation Tracking:** Full hotel details including addresses and confirmation numbers

## Design Philosophy

The Travel App embraces a **tropical, premium, vacation magazine aesthetic** that evokes the feeling of luxury travel planning:

- **Color Language:** Warm tropical tones (teal-blue #0E7490 for actions, destination Sunrise orange #DB8F43 for Kauai, Boat teal #2AA5CB for Maui, light accents) that reflect Hawaiian islands and beaches
- **Visual Hierarchy:** Clear distinction between destinations through color coding, making multi-location trips easy to follow
- **Premium Typography:** Elegant DM Sans font (three weights: 500/600/700) with generous whitespace, reflecting high-end travel publications
- **Smooth Animations:** Framer Motion transitions between views create a refined, orchestrated feel
- **Contextual Design:** Event cards, timeline indicators, and destination headers are purposefully styled to communicate travel information intuitively
- **Responsive Interaction:** Hover states, smooth page transitions, and interactive elements feel high-touch and polished

## Project Goals

1. **Test Advanced UI Patterns:** Demonstrate proficiency with complex state management (React Context), animations (Framer Motion), and responsive design
2. **Showcase Design Skills:** Create a portfolio piece that proves ability to design cohesive, beautiful interfaces with attention to detail
3. **Explore Real-World Complexity:** Handle intricate data structures (multi-day events, timezones, nested data), validating ability to solve complex UX problems
4. **Demonstrate Full-Stack Thinking:** From conceptual design through implementation, localStorage persistence, and user workflows
5. **Serve as Reference:** Provide a complete example of modern React patterns for future standalone projects

## App Summary Statistics

**Project Scale:**
- **Total Components:** 33 (1 main entry point, 5 views, 15 components + 3 calendar sub-components, 1 context provider, 9 supporting files)
- **Number of Views:** 5 (Hero, Calendar, Day Timeline, Event Detail, Status)
- **Event Types:** 14 (flight, hotel, dining, beach, sightseeing, shopping, hiking, boat, ground_transport, activity, buffer, entertainment, sunrise, custom)
- **Checklist Categories:** 6 (packing, booking, documents, health, transport, other)
- **Document Categories:** 6 (passport, boarding_pass, hotel_confirmation, insurance, rental_car, other)
- **Total Mock Events:** 63 events distributed across 9 days

**Data Architecture:**
- 2 primary destinations (Kauai: Jul 4–8, Maui: Jul 8–12) — pinned to real trip dates as of v0.0.207; auto-shifts forward after Jul 12
- 9 daily itineraries with granular hour-level scheduling
- Accommodation details for 2 luxury resorts
- Rich metadata: confirmation numbers, locations, notes, timezone information

**Technical Implementation:**
- **Architecture:** Component-based with Context API state management (TripProvider, useTripContext)
- **Storage:** LocalStorage for data persistence and offline access
- **Animation Framework:** Framer Motion for page transitions and interactive elements
- **Data Management:** React hooks (useState, useCallback) for state and event handling
- **Styling Approach:** Inline styles with color tokens (DM Sans typography), self-contained component design following UI Test patterns

---

# 2. Information Architecture

## Overview

The Travel app is a single-trip itinerary planner with a focus on multi-destination experiences. It uses a **five-view model** (Hero, Calendar, Day Timeline, Event Detail, Status) with a persistent bottom navigation system. All state is managed centrally through React Context, ensuring data consistency across navigation patterns.

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
- `previousView` — the view that was active before the last navigation (set by `SET_ACTIVE_VIEW`; used by EventDetailView for the back button)
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

1. **Hero Header with Page Title** — Full-bleed photo (200px) with `scrimGradient` overlay. Default image is `/hero-bg.png` (sunset beach). `trip.name` is rendered as a 42px `<h1>` (`typography.hero`) bottom-left over the photo, with a soft text-shadow for legibility. Users can upload a custom photo via the camera button (frosted glass circle, top-right). Uploaded images are compressed via canvas (1200px max width, JPEG 0.7 quality), stored as a data URL in state (`heroImage`), persisted via localStorage, and shared with TripHeader on the calendar page. (The "X days to go" countdown pill was removed in v0.0.208.)
2. **Content Panel** — Light-grey surface (`glossyBg` #F2F3F5) overlapping the hero by -28px with 24px top radius, plus a pull-handle indicator.
3. **Destination Cards** — Full-photo cards (144px tall) stacked full-width, one per destination. Each shows the destination name (30px white title over a bottom scrim), date range, day count, and a chevron CTA. Tap jumps to the first day at that destination. Per-destination cover photos can be swapped (stored in `destImages`). Positioned at the top of the content panel for immediate destination orientation.
4. **"Up next" + Flight cards (side by side)** — A `typography.title` (24px, weight 500) **"Up next"** heading (top margin 40px) sits above a two-card flex row. The **Up Next card** (compact, half-width, `cleanCard` white surface) shows the next upcoming event's title, time, location, and a small countdown badge. The **Flight card** (also compact, half-width) sits beside it and shows the next upcoming flight's title, route codes (origin → destination), and date/time label. The Flight card's **milestone log was removed** — it no longer renders a vertical milestone timeline. The Flight card is hidden when the next flight is the same event as Up Next.
5. **Weather Forecast** — A `typography.title` (24px, weight 500) **"Your trip"** heading (top margin 30px) precedes this section. Horizontal scroll of day chips showing: day-of-week abbreviation, date number, **weather icon** (sun/cloud-sun/cloud/rain), and **temperature**. Weather data comes from the **Open-Meteo API** when a zip code is entered (real forecast within the 16-day window), falling back to **deterministic simulation** (75–85°F, Hawaii-realistic) for dates beyond forecast range. A zip-code input sits beside a "Get Weather" / "Update" / "Loading…" button (`whiteSpace: nowrap` so the button label never wraps or overflows). Tapping a chip navigates to that day's timeline.
6. **Featured Highlights** — 5 editorial cards (Poipu Beach, Waimea Canyon, Na Pali Coast, Road to Hana, Haleakala Sunrise) with cover photo, title, meta info, description, destination badge, and "View Day X" CTA. Tapping navigates to EventDetailView for that event. Defined in the `HIGHLIGHTS` array at the top of HeroView with `eventId`, `date`, `day`, and `time` fields that must match the actual sampleTrip data. Each highlight's curated photo URL is also set as `coverImage` on the corresponding event in `sampleTrip.js`, ensuring visual continuity across highlight card → timeline card → event detail page.

**Sub-Components:**
- `DestCard` — Full-photo destination card (144px) with 30px white title over a bottom scrim, day count, and a per-card camera/photo-swap control
- `WeatherIcon` — Maps weather conditions to Lucide icons (Sun, CloudSun, Cloud, CloudRain)

> Note: the milestone-log helpers (`getFlightMilestones`, `getVisibleMilestones`) and the `FlightMilestoneRow` sub-component still exist at module level but are **no longer rendered** — the redesign removed the flight/countdown milestone log entirely. `getTripCountdownMilestones` was removed.

**Helper Functions (module-level):**
- `seededGate(eventId)` — Deterministic airport gate from event ID hash (e.g. "B12")
- `computeRemaining(endMs, nowMs)` — "2h 15m remaining" for in-flight state
- `formatRelativeTime(timestampMs, nowMs)` — "in 35m", "2h ago", "Now", or short date for >24h
- `getSimulatedWeather(dateStr, destId)` — Deterministic weather from date+destination hash (Hawaii-realistic, fallback when real data unavailable)
- `mapWeatherCode(code)` — Maps WMO weather codes to condition strings (0-1→sunny, 2-3→partly-cloudy, 45-67→cloudy, 71+→rain)
- `fetchWeatherForZip(zipCode, tripStart, tripEnd)` — Geocodes zip via Open-Meteo, fetches 16-day forecast, returns only dates overlapping with trip range

### CALENDAR VIEW — Full Trip Overview

**Purpose:** Show the entire trip month in a calendar grid with month navigation, allowing users to scan days by event density and destination, tap for day summaries, and filter by destination.

**Content Zones (top to bottom):**

1. **Compact Header** — Smaller hero image, no title
2. **Month Navigation** — Prev/next chevron buttons (44x44px) flanking the month title + "Activity days" subtitle (`typography.body` 16px, `warmPalette.textMedium` color). Swipe gesture via Framer Motion `drag="x"` with 80px threshold. Slide + fade animation (250ms enter, 150ms exit) on month change.
3. **Calendar Grid** — 7-column grid with color-coded DayCard cells. Selected date gets accent ring (2.5px solid #0E7490), today gets subtle textLight border, event density shown via horizontal bars instead of dots, destination shape indicators (circle=Kauai, square=Maui).
4. **CalendarTooltip** — On day tap, a positioned popover shows day label, destination with color dot, event breakdown grouped by type (icon + label + count), and "View Day" navigation button. Responsive width (75% of container, 260–340px). Dismissed via backdrop tap, 36x36 circular close button (`warmPalette.warmGray` background, matching EventEditor style), or Escape key.
5. **CalendarLegend (segmented filter control)** — An iOS-style segmented pill control on a `rgba(60,70,90,0.10)` track. Each segment shows a MapPin icon (in the destination color), the destination name, and the trip-day count ("4d"). The active segment fills white with a small shadow and bold text. Tapping a segment filters/highlights those days on the grid (non-matching days dim to 0.3 opacity); tapping the active segment clears the filter. Replaced the old standalone pill list.
6. **Trip at a glance** — Three `cleanCard` stat tiles in a row: **Days** (count of day keys), **Events** (count of non-buffer events across all days), and **Islands** ("Island"/"Islands" by count). Each tile shows a 24px `typography.title` value over a `helper` label. (A short-lived "To-do" checklist tracker was added below this section, then removed — the Plan tab no longer includes a to-do tracker.)

### DAY TIMELINE VIEW — Single Day Deep Dive

**Purpose:** Show all events on a specific day as visual image cards in chronological order, with the ability to edit, add, or open full event details.

**Content Zones (top to bottom):**

1. **Sticky Header** — Glassmorphic blur; prev/next day arrow buttons (44x44px glass pills) flanking a centered block. The block contains: a `caption`-style "Day N of M" eyebrow, a **`typography.title` (24px/700)** full-weekday date via `formatTripDateLong` ("Saturday, July 4"), and an optional `helper`-style route label beneath — when `day.label` contains " to " it renders as origin + `ArrowRight` icon + destination; otherwise plain text. The header background is **tinted by island via `dest.accentLight`**: `#F9F0E6D9` (~85% opacity warm cream) on Kauai days, `#E7F4F8D9` (~85% opacity light blue) on Maui days.
2. **Island switcher (segmented control)** — An iOS-style segmented pill control (replacing the old colored destination strip). One segment per destination, each with a MapPin icon in the destination color + the destination name. The active island fills white with a small shadow and bold text; tapping an inactive island jumps to its first day. Only shown when the trip has more than one destination.
3. **Island color theming (Day tab only)** — The Day tab is the only surface that carries a colored background: the whole page uses `dest.accentLight` as its background color — `#F9F0E6` (warm cream) on Kauai days, `#E7F4F8` (light blue) on Maui days. (Trip, Plan, Status, and Event-Detail pages are now light grey `#F2F3F5`.)
4. **Timeline (spine layout)** — 20px top padding before the first card. Each event renders as a three-column row: a **time column** (per-event start time, split into the time and the AM/PM on two lines), a **spine column** (a continuous vertical line, `rgba(80,92,108,0.20)`, with a 12px dot in the destination color (`dest.color`) bordered in the island background color), and the **TimeBlock card**. The old "show the hour label only when the hour changes" grouping is gone — every event now shows its own start time on the spine. Buffer events render as dashed cards inline. NowIndicator marks the current time; an inline dashed "Add event" button sits after the last card. View scrolls to top on load and date change.
5. **Empty State** — "No events planned" with CTA (if no events)
6. **Bottom Padding** — 80px to prevent content hidden behind nav

**TimeBlock Image Card Layout:**
- **Image area** (125px): Cover photo (type-based or explicit), gradient fallback on error. Dark gradient overlay at the bottom for badge readability.
- **Type badge** (bottom-left of image): Frosted dark pill with icon + event type label. (The time moved out of this badge onto the timeline spine in the v0.0.181–v0.0.192 redesign.)
- **Edit icon overlay** (top-right of image): Frosted circle (28px, `rgba(0,0,0,0.35)` + backdrop blur) with Pencil icon (13px white)
- **Content area** (`cleanCard` white surface, `spacing.xl` = 24px padding, below image): Title (`sectionHeader` 18px), subtitle/location (`body` 16px), and a "Details" button using the soft-teal accent (`accentSoft` bg, ocean text/chevron)
- **Buffer events** render as **distinct dashed-border light cards** (`#F6F8FC` bg, `1.5px dashed #B6C2D1` border, `spacing.xl` padding) — visually separated from the photo event cards. They show a time-range header (`helper` 15px) in `warmPalette.textDark`, the type icon (18px, `warmPalette.textMedium`) + a bold `~X min buffer` title, and a descriptive label (e.g. "Morning prep time") below as body text. No cover image.

### EVENT DETAIL VIEW — Full Event Information

**Purpose:** Display complete event information as a clean, magazine "tour-style" detail page. Accessible via the "Details" button on TimeBlock cards or from HeroView highlight cards.

**Content Zones (top to bottom):**

1. **Sticky Header** — White back button (44x44 `cleanCard` square with a left-arrow), a centered date label ("EEE, MMM d"), and a balancing spacer where the old Edit button used to be (Edit now lives inline in the Details section). The header uses `glass.frostedLight`. No bottom CTA bar.
2. **Title block** — Extra top space (`spacing.xxl`), then a colored event-type **eyebrow** (`caption`, in the event's accent color), a 24px `<h1>` **title** (`typography.title`), and a **tag line** (`body`, subtitle or duration) beneath it.
3. **Hero photo** — A 200px rounded photo using the same cover image source as TimeBlock cards (`event.coverImage` → `getCoverImage(type, id)` → gradient fallback), with a subtle bottom scrim. Ensures visual continuity between timeline card and detail page.
4. **Description section** — A "Description" heading over the event `notes` (pre-wrapped `body` text). When notes are long (>150 chars) the text clamps to 3 lines with a **More/Less** toggle link beside the heading.
5. **Details section** — A "Details" heading with two action **links** on the same row, both `helper` (15px) in the ocean accent: **"Get directions"** (opens a Google Maps directions URL for the place, when a location exists) and **"Edit"** (opens the EventEditor). Below sits a white `cleanCard` of stacked label/value rows (`DetailRow`) — Time, Duration, Place, and Confirmation number (monospace). Each row uses `helper` (15px) for both the muted label and the bold value, divided by a 1px `borderLight` line.

**Sub-Component:**
- `DetailRow` — A single label/value row in the Details card. Label is `helper` muted, value is `helper` bold right-aligned (monospace for confirmation numbers).

**Navigation Flow:**
- TimeBlock "Details" button → dispatches `SET_SELECTED_EVENT` with event ID → navigates to 'eventDetail'
- HeroView highlight card → dispatches `SET_SELECTED_EVENT` + navigates to 'eventDetail' (previousView = 'hero')
- Back button → navigates to `previousView` ('hero' or 'day'), with scroll restoration for hero
- "Edit" link → opens EventEditor bottom sheet; save dispatches `UPDATE_EVENT`
- Delete in editor → removes event and returns to day timeline

### STATUS VIEW — Preparation Checklist & Documents

**Purpose:** Manage trip preparation with a categorized checklist and document uploads for travel paperwork.

**Content Zones (top to bottom):**

1. **Sticky Header** — "Checklist" title with animated progress bar (X/Y completed). Progress bar track uses `accentSoft` teal tint for visibility at 0% progress.
2. **Preparation Section** — Checklist items grouped by category (packing, booking, documents, health, transport, other), each with checkbox toggle, edit, and delete actions. "Add" button opens ChecklistEditor bottom sheet.
3. **Documents Section** — 2-column grid of uploaded document cards with thumbnail preview. Document names use `bodyMedium` (16px), category labels use `caption` (13px). "Upload" button opens DocumentUploader bottom sheet (images/PDF, max 2MB, stored as base64 in localStorage). Tapping a document opens DocumentViewer full-screen overlay.
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

> **Note:** Event type icon colors moved to `eventVisuals.js` (`EVENT_VISUALS`) and no longer use `colors.js` tokens. The extended palette below is still exported from `colors.js` but most tokens are legacy; `violet` and `info` are still actively used for checklist/document categories.

| Token | Hex | Light Variant | Purpose |
|-------|-----|---|---------|
| `ocean` | `#0E7490` | `#E0F7FA` | Primary teal-blue; CTA buttons, links, active accents |
| `coral` | `#C74534` | `#FDE8E3` | Booking checklist category; Rental Car doc category |
| `sand` | `#9E7C2E` | `#F5EDD8` | Documents checklist category; Hotel Confirmation doc category |
| `sunset` | `#C05D10` | `#FDE8D3` | Legacy accent; not actively assigned to a category |
| `palm` | `#2D7D46` | `#E0F2E5` | Health checklist category; Insurance doc category |
| `amber` | `#B45309` | `#FFFBEB` | Legacy extended palette — not actively used |
| `aqua` | `#0891B2` | `#CFFAFE` | Legacy extended palette — not actively used |
| `emerald` | `#059669` | `#D1FAE5` | Legacy extended palette — not actively used |
| `rose` | `#DB2777` | `#FCE7F3` | Legacy extended palette — not actively used |
| `purple` | `#9333EA` | `#F3E8FF` | Legacy extended palette — not actively used |
| `violet` | `#6D28D9` | `#EDE9FE` | Transport checklist category |
| `tan` | `#7B5B3A` | `#F7EDE2` | Legacy extended palette — not actively used |
| `navy` | `#1E40AF` | `#DBEAFE` | Legacy extended palette — not actively used |

### Destination-Specific Colors

Colors are set on each destination object in `sampleTrip.js` (`color` + `accentLight`). They're reused for event-palette hues — zero new colors introduced.

| Location | `color` | `accentLight` | Purpose |
|----------|---------|---------------|---------|
| Kauai | `#DB8F43` (Sunrise orange) | `#F9F0E6` | Island-specific branding; Day tab page/header bg tint |
| Maui | `#2AA5CB` (Boat teal) | `#E7F4F8` | Island-specific branding; Day tab page/header bg tint |

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
'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
```

The app uses **DM Sans** product-wide (loaded via a Google Fonts `<link>` in `index.html` as `wght@500;600;700`). It replaced Inter in June 2026; the hardcoded font strings in `App.jsx`, `EventEditor`, `ChecklistEditor`, and `DocumentUploader` were all switched to DM Sans as well.

### Typography Scale

The type system uses **three weights only — 500 / 600 / 700 (no 400 anywhere)**. `index.css` sets `body { font-weight: 500 }`, and 500 is the lightest weight in the product. `body` and `helper` moved from 400 → 500 in this pass.

| Style | Font Size | Weight | Line Height | Letter Spacing | Use Case |
|-------|-----------|--------|-------------|---|----------|
| `hero` | 42px | 700 | 44px | -0.02em | Page title (hero masthead) only |
| `title` | 24px | 700 | 30px | -0.01em | Feature / section titles (hero "Up next"/"Your trip" use weight 500), overlay titles |
| `heading` | 18px | 700 | 24px | -0.01em | Heavy section headings |
| `sectionHeader` | 18px | 600 | 24px | — | Card headers, subsections |
| `body` | 16px | 500 | 22px | — | Body text, standard content |
| `bodyMedium` | 16px | 500 | 22px | — | Emphasis within body text |
| `helper` | 15px | 500 | 20px | — | Helper text, secondary info, detail rows |
| `caption` | 13px | 600 | 16px | 0.05em | Labels, tags, metadata (uppercase) |

> **Principle:** Use these ramp tokens as-is and differentiate hierarchy by weight and color — avoid ad-hoc `fontSize`/`letterSpacing` overrides. No weight below 500; minimum font size is 13px. All content cards use `spacing.xl` (24px) inner padding.

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

All elevated surfaces use frosted glass tokens from `styles.js`. The system creates a depth hierarchy against the flat light-grey page background (`glossyBg: #F2F3F5`). The redesigned Trip/Plan/Status/Event-Detail surfaces also use `cleanCard` — an opaque white card token (`#FFFFFF`, hairline border, `0 6px 18px rgba(40,50,70,0.08)` shadow) — for crisp, modern cards over the light-grey background. The Day tab is the lone exception: it tints its page by island (warm cream `#F9F0E6` Kauai, light blue `#E7F4F8` Maui — `dest.accentLight`).

### Glass Token Reference

| Token | Background | Blur | Border | Shadow | Use Case |
|-------|-----------|------|--------|--------|----------|
| `glass.frosted` | `rgba(255,255,255,0.2)` | 24px | white 0.3 | — | Hero badges, photo overlays |
| `glass.frostedLight` | `rgba(242,243,245,0.85)` | 20px | black 0.08 | — | Sticky headers |
| `glass.card` | `rgba(255,255,255,0.82)` | 20px | black 0.06 | `0 2px 8px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)` | Event cards, info rows, destination cards |
| `glass.sheet` | `rgba(255,255,255,0.92)` | 24px | black 0.08 | `0 2px 8px rgba(0,0,0,0.06)` | Bottom sheets (EventEditor, ChecklistEditor) |
| `glass.nav` | `rgba(20,28,40,0.88)` | 20px | white 0.08 | `0 8px 32px rgba(0,0,0,0.25)` | Bottom navigation bar |
| `glass.input` | `rgba(237,234,229,0.5)` | 8px | black 0.1 | — | Form fields inside sheets |
| `glass.subtle` | `rgba(237,234,229,0.65)` | 12px | black 0.05 | `0 1px 4px rgba(0,0,0,0.04)` | Empty states |
| `glass.badge` | `rgba(255,255,255,0.60)` | 8px | black 0.06 | — | Legend pills, small glass badges |

### Visual Hierarchy (2-tier depth)

```
Page background (#F2F3F5 light-grey, flat glossyBg; Day tab tints by island — #F9F0E6 Kauai / #E7F4F8 Maui)
  └─ cleanCard / glass.card (white) — event cards, info rows, destinations, stat tiles
       └─ glass.sheet (92% white) — bottom sheets, modals (highest readability)
```

### Glass Usage by Component

| Component | Token | Parent Surface |
|-----------|-------|---------------|
| TimeBlock, ChecklistItemRow, DocumentCard | `glass.card` | Page bg or panel |
| EventDetail Details card (DetailRow) | `cleanCard` | Page bg |
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
- Status indicators (event-type eyebrow, timeline badge) stay solid — semantic colors must be instantly recognizable

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
Page backgrounds use flat `glossyBg` (#F2F3F5 light grey). The Day timeline is the only view that tints its page by island (warm cream #F9F0E6 Kauai; light blue #E7F4F8 Maui — both from `dest.accentLight`). Content panels (HeroView, CalendarView) use flat `glossyBg` directly. The redesigned Trip/Plan/Day cards use the opaque `cleanCard` white token; sheets use `glass.sheet` (92% white). Buffer cards use a dashed light style (`#F6F8FC` bg, `1.5px dashed #B6C2D1` border). Empty states use `glass.subtle`.

## Layout Tokens

| Token | Value | Purpose |
|-------|-------|---------|
| `cardBorder` | `1px solid #E2E0DB` | Divider and border standard |

## Design Rationale

The palette draws from natural island landscapes — ocean teals, coral warmth, sandy beiges, and sunset golds. Light variants create breathable, airy interfaces typical of premium travel publications. Large title text paired with a clean light-grey backdrop creates an editorial, magazine-like experience. Generous spacing avoids density, mirroring high-end travel design where white space equals luxury.

**Styling approach:** A modern, clean surface. The flat light-grey page background (`glossyBg` #F2F3F5) anchors crisp opaque white `cleanCard` cards (hairline border, soft drop shadow) on the Trip/Plan/Status/Event-Detail surfaces; the Day tab tints its page by island. Bottom sheets and a handful of legacy surfaces (documents, checklist rows, hero badges, sticky headers) still use frosted glass tokens. Borders use dark alpha values for visible separation; shadows are soft and diffuse. The depth system (page → card → sheet) ensures clear visual hierarchy.

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
Dark navy glass (`glass.nav`) navigation bar that **clings to the screen edges** — it spans the full width (max 480px, centered), sits flush to the bottom of the viewport, and rounds only its **top two corners** (`radius.xl`). The bottom safe-area inset is absorbed inside the bar's own padding so it reaches the very edge of the device. Contains 5 tabs (Trip, Plan, Add, Day, Status) with a raised teal-blue (#0E7490) circular Add button in the center. The active tab shows a short teal indicator bar below the icon plus white text; inactive tabs show muted gray (`colors.textMuted` #9B9B9B). Each tab is at least 54px tall.

**Key Design Decisions:**
- Full-bleed, flush-to-edge bar (no floating margin) with top-only rounded corners
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
- **Text weight:** Bold (700) for days with events, medium (500) for trip days without, medium (500) for non-trip (minimum weight across the product — no 400 used anywhere)
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
- **Tightened type picker grid** of 38px animated icon tiles (`AnimatedEventIcon`) that replay their per-type motion on selection; selected tile gets a subtle grey fill + bold label
- **Sentence-case field labels** ("Title", "Start Time", "Confirmation #") rather than uppercase, via the `FieldGroup` wrapper (each with a small leading icon)
- **Modern light-grey input fill** (`#F1F3F6`) with a hairline border; inputs use 16px font to prevent iOS focus-zoom
- Sticky header with a single close (X) button
- **Two teal CTAs at the bottom:** a soft-teal "Close" button and a filled-teal "Add Event" / "Save Changes" button, both `whiteSpace: nowrap`; the primary is disabled (dimmed) until the title is filled. The delete trash button sits to their left when editing.
- Delete with inline confirmation dialog
- Time editing preserves original timezone offset (extracted from ISO string, not hardcoded)
- **Body scroll lock + no wobble:** Uses `position: fixed` with saved `scrollY` offset on mount, restoring position + scroll on unmount. Combined with `scrollbar-gutter: stable` (in `index.css`), this prevents both background scrolling and the horizontal "wobble" that occurred when the scrollbar appeared/disappeared. Also sets `left: 0; right: 0; overflowX: hidden` to clamp horizontal movement.

---

## 6. StatusBadge — *removed (v0.0.154)*

`StatusBadge.jsx` was deleted in v0.0.154 along with the entire event "done"/"complete" feature. There is no event-status pill anywhere in the product anymore. The component slot is retained here for changelog continuity only.

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
| `containerRef` | ref | Yes | Formerly used for position clamping; now unused since v0.0.204 (tooltip uses `position: fixed` + viewport clamping instead) |
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

**Purpose:** Interactive destination filter as an iOS-style **segmented control** below the calendar grid. Tapping a segment highlights matching days; tapping the active segment clears the filter.

**Props:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `destinations` | array | Yes | Array of destination objects |
| `days` | object | Yes | Map of day data by date |
| `activeFilter` | string | No | Currently active destination filter ID |
| `onFilter` | function | Yes | Callback with destination ID or null |

**Key Design Decisions:**
- Segmented pill control on a `rgba(60,70,90,0.10)` track; one equal-width segment per destination
- Each segment shows a MapPin icon (in the destination color) + name + trip-day count ("4d")
- Active segment fills white with `shadows.sm` and bold (700) text; inactive segments are transparent with medium-weight text
- Tapping the active segment deselects (shows all days)
- `aria-pressed` reflects active state; tap animation: scale 0.97

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
- **Type badge**: Frosted dark pill (`rgba(0,0,0,0.6)` + backdrop blur) at bottom-left with event icon (strokeWidth 2.5) + the event type label only. (The start time now lives on the timeline spine in DayTimelineView, not on this badge — changed in v0.0.181–v0.0.192.)
- **Edit icon overlay**: Frosted circle (28px, `rgba(0,0,0,0.35)` + backdrop blur) at top-right with Pencil icon (13px white)
- **Content area**: `cleanCard` white surface with `spacing.xl` (24px) padding — title (`sectionHeader` 18px), subtitle/location (`body` 16px), and a "Details" button using the **soft-teal accent** (`accentSoft` bg, ocean text + chevron)
- **Buffer events**: A **distinct dashed-border light card** (`#F6F8FC` bg, `1.5px dashed #B6C2D1` border, `spacing.xl` padding) so buffers read as clearly different from photo event cards. Shows time range (`helper` 15px, `warmPalette.textDark`), type icon (18px, `warmPalette.textMedium`), and a bold `~X min buffer` title plus a descriptive label below. No image.
- **No done/tight-buffer state**: The event "done" dimming + "Done" badge and the tight-buffer warning variant were removed in v0.0.154. The buffer card renders identically regardless of duration.
- **Cover image sources**: Events with explicit `coverImage` field use that URL directly. Otherwise, `coverImages.js` maps event types to Unsplash URLs with consistent hash-based selection per event ID. Gradient fallback on image load error. Explicit cover images on the 3 flights and all 5 Trip Highlight events ensure the same photo appears on the highlight card, timeline card, and event detail page.
- **Card shadow**: `cleanCard` shadow (`0 6px 18px rgba(40,50,70,0.08)`) with a hairline border
- **Tap interaction**: Body tap → `onTap` (editor), Details button tap → `onDetail` (detail page) with `stopPropagation`
- **Font compliance**: All text sizes use design system ramp tokens — no overrides below the 13px minimum.

---

## 16. EventDetailView

**Purpose:** Full-screen, magazine "tour-style" event page. Accessed via the "Details" button on TimeBlock cards or from HeroView highlight cards.

**Key Design Decisions:**
- **Sticky header**: White `cleanCard` back button + centered date label ("EEE, MMM d") + balancing spacer (no Edit button here). Uses `glass.frostedLight`. No bottom CTA bar.
- **Title block**: Extra top space, then a colored event-type **eyebrow** (`caption`, event accent color) → 24px `<h1>` title (`typography.title`) → **tag line** (`body`, subtitle or duration).
- **Hero photo**: 200px rounded photo (same cover source as TimeBlock) with a soft bottom scrim.
- **Description section**: "Description" heading over `notes` (`body`, pre-wrapped); long notes (>150 chars) clamp to 3 lines with a More/Less toggle.
- **Details section**: "Details" heading with inline **"Get directions"** + **"Edit"** action links (`helper`, ocean accent) on the header row; below, a white `cleanCard` of stacked `DetailRow` label/value rows — Time, Duration, Place, Confirmation number (monospace).
- **Edit flow**: "Edit" link opens EventEditor bottom sheet; save dispatches `UPDATE_EVENT`
- **Delete flow**: Delete in EventEditor dispatches `DELETE_EVENT` and navigates back to day timeline
- **Get directions**: Opens a Google Maps directions URL for the event's place (when a location exists)
- **Navigation**: Back button returns to `previousView` ('hero' or 'day')

---

## Component Hierarchy

```
Travel Layout
├── TripHeader (hero section)
├── [View-specific content]
│   ├── Trip View → DestCard (inline, horizontal list)
│   ├── Calendar View → DayCard (grid) + CalendarTooltip + CalendarLegend + EventEditor
│   ├── Day View → TimeBlock (image cards), NowIndicator, EmptyState, EventEditor
│   ├── Event Detail → EventDetailView (eyebrow + title, hero photo, description, DetailRow card, EventEditor)
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
2. Hero page displays the title masthead, destination cards, the side-by-side "Up next" + Flight cards, the Weather Forecast, and Featured Highlights
3. **Option A:** Tap the **Plan** nav tab → CalendarView
4. **Option B:** Tap a destination card → DayTimelineView for the first day of that destination
5. **Option C:** Tap the "Up next" card or a Highlight card → EventDetailView for that event
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
- **Island switcher:** Tap the other island in the segmented control to jump to its first day
- **Calendar tap:** Day cell → CalendarTooltip → "View Day" → DayTimelineView
- **Destination card tap (Hero):** First day of that destination

## 7. Viewing Event Details & Directions

1. User taps the "Details" button on a TimeBlock (or a Highlight card on Hero)
2. `SET_SELECTED_EVENT` dispatched → navigates to EventDetailView (tour-style page)
3. User reads the description (More/Less for long notes) and the Details rows
4. **"Get directions"** link opens a Google Maps directions URL for the event's place
5. **"Edit"** link opens the EventEditor; **Back** returns to the previous view (hero or day)

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

Navigation tabs are 54px tall (23% above minimum). All buttons maintain 44px+ height (day nav buttons 44x44px, Add button 44px tall). 8px spacing between targets prevents accidental activation. Checklist edit/delete buttons use 36x36px visual with adequate spacing. Minimum font size across the product is 13px (bumped in v0.0.174).

### Principle 5: Layout Stability (No Wobble)

Four wobble causes were identified and fixed:
1. Removed Framer Motion `layoutId` (caused shared layout animation)
2. Removed `whileTap={{ scale }}` on flex items (caused space redistribution)
3. Set constant `fontWeight: 600` on all tabs (prevents text-width shift)
4. **Body scroll lock on overlays:** All modal overlays (EventEditor, ChecklistEditor, DocumentUploader, DocumentViewer) use `position: fixed` with saved `scrollY` offset on `document.body`. This freezes the background without removing the scrollbar, preventing horizontal layout shift. On unmount, position is cleared and `window.scrollTo` restores the original scroll position.

### Principle 6: Redundant Encoding

Status uses color + text + icon (not color alone). Event type is always shown as icon + label on the timeline badge and the detail-page eyebrow — never color alone. (`StatusBadge` was removed in v0.0.154; there is no per-event status pill.)

---

# 7. Data Architecture & State Management

## Data Models

### Trip Shape
```javascript
{
  id: string,                    // 'trip-hawaii-2026'
  name: string,                  // 'Hawaii Vacation'
  tagline: string,               // 'Kauai & Maui'
  startDate: string (ISO 8601),  // '2026-07-04'
  endDate: string (ISO 8601),    // '2026-07-12'
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
  color: string (hex),           // '#DB8F43' (Kauai) / '#2AA5CB' (Maui)
  accentLight: string (hex),     // '#F9F0E6' (Kauai) / '#E7F4F8' (Maui)
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

Colors come from `eventVisuals.js` (`EVENT_VISUALS`), not from `colors.js`. Each type gets a saturated tile `color` (the `AnimatedEventIcon` background — white icon on top) and a soft `tint` (used for card accent backgrounds). No two types share the same tile color.

| Type | Icon | Tile Color | Tint | Use Case |
|------|------|-----------|------|----------|
| `flight` | Plane | `#438ADB` | `#E7EFF8` | Air travel |
| `ground_transport` | Car | `#725ED4` | `#EEEBF9` | Taxi, rental car, Uber |
| `hotel` | Building2 | `#A35CCC` | `#F4ECF9` | Check-in, checkout |
| `activity` | Palmtree | `#32AE70` | `#E8F7F0` | Tours, excursions |
| `dining` | UtensilsCrossed | `#DB5743` | `#FAECEA` | Restaurant, meals |
| `buffer` | Clock | `#A8A094` | `#F2F0ED` | Prep time, transitions |
| `boat` | Ship | `#2AA5CB` | `#E7F4F8` | Boat tours, ferry |
| `sunrise` | Sunrise | `#DB8F43` | `#F9F0E6` | Sunrise/sunset viewing |
| `sightseeing` | Camera | `#D5B534` | `#F8F4E2` | Lookouts, photo stops |
| `beach` | Waves | `#29AEA0` | `#E8F8F6` | Swimming, sunbathing |
| `hiking` | Mountain | `#38B242` | `#E8F7EA` | Trails, trekking |
| `shopping` | ShoppingBag | `#DD4B94` | `#FAEAF2` | Markets, retail |
| `entertainment` | PartyPopper | `#D256D2` | `#F9ECF9` | Shows, luaus |
| `custom` | Circle | `#9E9E9E` | `#F2F2F2` | User-defined fallback (never in the picker) |

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
  days: { '2026-07-04': TripDay, '2026-07-05': TripDay, ... },
  selectedDate: string,
  activeView: 'hero' | 'calendar' | 'day' | 'eventDetail' | 'status',
  previousView: string | undefined,  // Set by SET_ACTIVE_VIEW; used by EventDetailView back button
  selectedEventId: string | null,
  checklistItems: ChecklistItem[],
  documents: Document[],
  heroImage: string | null,  // Custom hero photo data URL (JPEG, canvas-compressed)
  destImages: {},            // { 'dest-kauai': dataURL, ... } per-destination cover photos
  weatherZipCode: string,    // User-entered zip code for weather lookup
  weatherData: {},           // { '2026-07-04': { high, low, code, condition }, ... }
}
```

### Reducer Actions (22 types)

| Action | Payload | Purpose |
|--------|---------|---------|
| `SET_SELECTED_DATE` | ISO date string | Change viewed day |
| `SET_ACTIVE_VIEW` | 'hero' / 'calendar' / 'day' / 'eventDetail' / 'status' | Switch views |
| `SET_SELECTED_EVENT` | event ID string | Set event for detail view |
| `ADD_EVENT` | `{ date, event }` | Insert new event (sorted by `startTime` chronologically) |
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
- **Data versioning:** A `DATA_VERSION` constant (currently 9) is saved alongside state as `_dataVersion`. When sample data changes (new fields, enriched notes, updated URLs), bump this to invalidate stale cached data.
- **Graceful fallback:** Falls back to sampleTrip if corrupted or version mismatch

### Auto-Reset & Date Shifting

When the trip's end date has passed (`today > sampleTrip.endDate`), the app automatically:

1. Clears localStorage (removes stale trip data)
2. Computes a date shift: finds the next occurrence of the original start day-of-week (Saturday), at least 3 days from today
3. Shifts **all** dates forward by that offset:
   - Trip-level `startDate` / `endDate`
   - Destination `startDate` / `endDate`
   - Day keys in `sampleDays` (e.g., `'2026-07-04'` → `'2026-07-18'`)
   - Every event's `startTime` and `endTime` (ISO 8601 with timezone offsets preserved)
4. Resets all event statuses to `'upcoming'`
5. Unchecks all checklist items (`completed: false, completedAt: null`)

**Implementation:** `isTripOver()`, `computeShiftDays()`, `shiftISODateTime()`, and `buildShiftedData()` helper functions in `tripShift.js` (imported by `TripContext.jsx`). The shift preserves day-of-week alignment so the itinerary always starts on the same weekday as originally designed.

### Hydration Strategy

1. Check if trip is over (`isTripOver()`) — if yes, clear localStorage and return shifted defaults
2. Build defaults object with all fields (including `checklistItems` and `documents`)
3. Read from localStorage
4. Validate trip ID matches sample trip AND `_dataVersion` matches current `DATA_VERSION`
5. Merge `{ ...defaults, ...parsed }` to backfill any new fields missing from old localStorage data
6. Fall back to full defaults if empty/invalid/version mismatch

## Sample Data Overview

| Day | Date | Destination | Label | Events |
|-----|------|-------------|-------|--------|
| 1 | Jul 4 | Kauai | Chicago to Kauai | 9 |
| 2 | Jul 5 | Kauai | Beach & Explore | 6 |
| 3 | Jul 6 | Kauai | Waimea Canyon | 7 |
| 4 | Jul 7 | Kauai | Na Pali Coast | 6 |
| 5 | Jul 8 | Maui | Kauai to Maui | 8 |
| 6 | Jul 9 | Maui | Road to Hana | 8 |
| 7 | Jul 10 | Maui | Whale Watching | 6 |
| 8 | Jul 11 | Maui | Haleakala Sunrise | 6 |
| 9 | Jul 12 | Maui | Travel Home | 7 |

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
- Clean, modern palette — foundation of light-grey backgrounds (`glossyBg` #F2F3F5), white `cleanCard` surfaces, tropical accents (the Day tab tints its page by island)
- Luxury through simplicity — clean layouts with generous whitespace
- Nature-inspired interactions — smooth animations and pull gestures
- Color as storytelling — each destination has distinct color identity
- Magazine editorial quality — typography hierarchy inspired by high-end travel publications

## Key Layout Patterns

### 1. Card Overlap Pattern

Hero image section (HeroView 200px with page title; CalendarView compact) with a rounded content panel overlapping via `marginTop: -28px`. Creates a "peek-a-boo" visual transition. Both HeroView and CalendarView use this pattern.

### 2. Pull Handle Indicator

32px wide x 4px tall, centered horizontally. Color: `#D6D3CE` (colors.dragHandle). Borrowed from iOS design language to signal scrollability.

### 3. Sticky Header with Glass Blur

- Position: `sticky`, top: 0, z-index: 50
- Uses `glass.frostedLight`: `rgba(242,243,245,0.85)` with `backdrop-filter: blur(20px)` + `WebkitBackdropFilter: blur(20px)`
- Border bottom: `1px solid rgba(255, 255, 255, 0.4)`
- DayTimelineView: day navigation controls + a segmented island switcher; the header background is tinted by island (warm cream #F9F0E6 Kauai, light blue #E7F4F8 Maui, both at ~85% opacity via `${accentLight}D9`)
- StatusView: title + progress bar

### 4. Image Card Timeline with a Vertical Spine

- Each event is a three-column row: a **time column** (46px, per-event start time split into time + AM/PM on two lines, 13px/11px bold, `textMedium`/`textLight`), a **spine column** (20px — a continuous 2px vertical line `rgba(80,92,108,0.20)` with a 12px dot in the destination color (`dest.color`), bordered in the island background), and the **TimeBlock card**
- TimeBlock image cards: rounded corners, cover photo, white content area
- Buffer events: dashed light cards inline on the spine
- The old left-hour-label column (deduplicated by hour) is gone — every event shows its own start time on the spine
- 16px bottom padding per row creates vertical rhythm
- NowIndicator positioned at `getNowPosition(events)` index

### 5. Grid Layout (7-Column Calendar)

- `display: grid`, `gridTemplateColumns: repeat(7, 1fr)`
- 4px gap between cells
- Weekday headers: 13px uppercase caption style (product minimum — 11px was bumped to 13px in v0.0.174)

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

- **DestCard (HeroView):** Full-photo card; destination name over a scrim
- **Calendar grid:** Day cells with colored bottom border
- **Island switcher (Day timeline):** MapPin icon in the destination color; the page/header background follows the island (`dest.accentLight` — warm cream #F9F0E6 Kauai, light blue #E7F4F8 Maui) — the Day tab is the only colored page surface
- **Calendar legend (Plan tab):** Segmented control with MapPin icons in destination colors
- **Badge backgrounds:** accentLight with color text

## Card Design Language

- **Background:** Opaque `cleanCard` white on the redesigned Trip/Plan/Day surfaces (event cards, stat tiles, to-do, details card); `glass.card` (82% white) still used for document/checklist cards. Sheets use `glass.sheet` (92% white). Buffer events use a dashed light card (`#F6F8FC` / `1.5px dashed #B6C2D1`).
- **Border radius:** 8px (badges) → 12px (buttons) → 16px (cards) → 20px (modals/sheets)
- **Shadows:** Clean drop shadows — `cleanCard`'s `0 6px 18px rgba(40,50,70,0.08)`, or `shadows.sm`/`shadows.md` from the `shadows` object
- **Borders:** 1px hairline borders for separation. **No left-accent bars** on cards — categories are conveyed via icon color, tint, and shape instead.
- **Interactive states:** Tap scale 0.93-0.98 (no hover effects)
- **No neumorphism:** Dual-tone embossed shadows (`#D4D0CA` / `#FFFFFF` pairs) were removed in v0.0.5

## Event Type Visual System

- Saturated per-type icon tiles (`AnimatedEventIcon`) with a white glyph and a matching motion
- Event type label + icon shown on the timeline badge and the detail eyebrow (color + text, never color alone)

> The event "done"/status pill was removed in v0.0.154 — there is no per-event status visual anymore.

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
- Hero title: delay 0.3s
- Destination cards container: delay 0.3s (individual cards: 0.35 + 0.1×i)
- Up Next card: delay 0.55s
- Flight card: delay 0.65s
- Weather Forecast container: delay 1.0s (individual chips: 1.05 + 0.04×i)
- Highlights section: delay 1.2s (individual cards: 1.25 + 0.08×i)

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
│   ├── styles.js               (141 lines)   Typography, spacing, shadows, glass + cleanCard tokens, glossyBg, scrimGradient
│   │
│   ├── context/
│   │   └── TripContext.jsx     (~320 lines)   Reducer (22 actions) + localStorage + auto-reset date shifting
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
│   │   ├── EmptyState.jsx      (~112 lines)   Empty state (complete state removed v0.0.154)
│   │   ├── AnimatedEventIcon.jsx              Per-type animated icon tile (saturated tile + white icon)
│   │   ├── NowIndicator.jsx    (~40 lines)    "Now" timeline marker
│   │   ├── ChecklistItemRow.jsx(~113 lines)   Checkbox row with edit/delete
│   │   ├── ChecklistEditor.jsx (~234 lines)   Bottom sheet for checklist CRUD
│   │   ├── DocumentCard.jsx    (~112 lines)   Document thumbnail card
│   │   ├── DocumentUploader.jsx(~327 lines)   Bottom sheet with file upload
│   │   └── DocumentViewer.jsx  (~155 lines)   Full-screen document preview
│   │
│   ├── data/
│   │   ├── sampleTrip.js       Hawaii vacation mock data (notes enriched to 2–4 sentences per place)
│   │   ├── eventTypes.js       Event type definitions
│   │   ├── eventVisuals.js     Per-type icon + saturated color/motion mapping (AnimatedEventIcon)
│   │   ├── coverImages.js      Type-based cover photo URLs + gradient fallbacks
│   │   ├── statusCategories.js Checklist + document categories
│   │   └── sampleChecklist.js  Sample preparation items
│   │
│   └── utils/
│       ├── dateUtils.js        (~105 lines)   Date formatting, calendar grid, month nav
│       └── timeUtils.js        (~101 lines)   Time formatting, event colors
│
├── public/
│   ├── hero-bg.png                 Default hero background image
│   ├── manifest.json               PWA web app manifest
│   ├── sw.js                       Service worker (network-first nav, cache-first assets)
│   ├── favicon.svg                 TreePalm SVG favicon
│   ├── apple-touch-icon.png        180px iOS home screen icon
│   ├── pwa-icon-192.png            192px PWA icon
│   ├── pwa-icon-512.png            512px PWA icon
│   ├── pwa-icon-192-maskable.png   192px maskable PWA icon
│   └── pwa-icon-512-maskable.png   512px maskable PWA icon
├── package.json
├── vite.config.js
├── eslint.config.js                ESLint flat config (no-undef error, no-unused-vars warn)
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
        │   │   ├── Title block + hero photo + Description + Details card (DetailRow)
        │   │   └── EventEditor (modal, from inline Edit link)
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
| `formatTripDate(dateStr)` | Abbreviated weekday + date ("Sat, July 4") — `'EEE, MMMM d'` format |
| `formatTripDateLong(dateStr)` | Full weekday + date ("Saturday, July 4") — used in Day timeline header |
| `getDayIndex(start, date)` | Which day of trip (1-indexed) |
| `getAdjacentDates(date, start, end)` | Prev/next trip dates |
| `getCalendarGrid(year, month)` | 7x6 calendar grid |
| `getAdjacentMonth(year, month, dir)` | Prev/next month `{year, month}` |
| `formatMonthYearFromParts(year, month)` | "March 2026" from numeric parts |
| `isTodayDate(dateStr)` | Is today? |

### Time Utilities

| Function | Purpose |
|----------|---------|
| `formatTime(isoString)` | 12-hour display ("6:50 AM") — extracts from ISO string to preserve event timezone |
| `formatHourLabel(isoString)` | Hour-only label ("6 AM") — timezone-safe, used for timeline hour groups |
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
npm run build        # ESLint check + production bundle (eslint src/ && vite build)
deploy.sh travel "commit message"  # Deploy to cluster
```

---

*Updated June 2026 (v0.0.208). Standalone deployment. This document covers the complete Travel app architecture, the redesigned product surface (**DM Sans** typography in three weights of 500/600/700, light-grey #F2F3F5 backgrounds + opaque `cleanCard` white cards + animated event-icon system + unified single type scale), component library, interaction patterns, accessibility compliance, and technical implementation — including the side-by-side "Up next" + Flight cards, the modern **spine-layout** Day timeline with per-island colored backgrounds (`dest.accentLight` — warm cream Kauai, light blue Maui), the segmented island switcher, the dashed buffer cards, the tour-style EventDetailView (eyebrow → title → hero photo → description → details rows with directions/edit links), the teal-CTA EventEditor with the 38px animated type picker, the Plan tab's segmented destination filter plus the "Trip at a glance" stats, the edge-clinging bottom navigation, custom hero/destination photo upload, body scroll lock + `scrollbar-gutter: stable`, real weather API via Open-Meteo, the Status tab with checklist + document uploads. Trip pinned to real Jul 4–12 2026 dates (v0.0.207); countdown pill removed from hero header (v0.0.208); event colors now come from EVENT_VISUALS palette (not colors.js extended tokens); minimum font size 13px, minimum weight 500 throughout.*

## Changelog

### v0.0.211–v0.0.213 — Calendar today-outline removed, Highlight label polish (2026-07-06)

- **Today outline removed from calendar** (v0.0.211): `DayCard` no longer draws a `1.5px solid warmPalette.textLight` border on the current date. Only the selected-day teal `2.5px solid #0E7490` border remains. `isTodayDate` import also removed.
- **Highlight cards: dark pill label** (v0.0.212): the "Highlight" eyebrow on HeroView highlight cards now renders inside a `rgba(0,0,0,0.6)` + `blur(8px)` pill — matching the day-card type badge style in `TimeBlock`.
- **Highlight label sentence case** (v0.0.213): removed `textTransform: 'uppercase'` and `letterSpacing` from the Highlight label — now reads "Highlight" not "HIGHLIGHT".

### v0.0.193–v0.0.208 — Font cleanup, island colors, July dates, countdown pill removal (2026-06-28)

Polish and correctness pass on the v0.0.181–192 foundation:

- **DM Sans extended product-wide** (v0.0.193): removed stale Google Fonts load for Inter + Gloria Hallelujah from `index.html`. DM Sans only.
- **Island destination colors** (v0.0.204): switched from old `#0A8F8F`/`#C4A265` island palette to hues borrowed from the `EVENT_VISUALS` palette — Kauai = Sunrise `#DB8F43` (tint `#F9F0E6`), Maui = Boat teal `#2AA5CB` (tint `#E7F4F8`) — set on `sampleTrip` destinations as `color`/`accentLight`. Day-tab page bg and header bg now derive from `dest.accentLight` dynamically. Calendar/timeline spine dots follow per-island destination color.
- **Day header redesign** (v0.0.205): was small caption + 18px date. Now: `caption` "DAY N OF 9" eyebrow + bold 24px `typography.title` full-weekday date via new `formatTripDateLong` util + `helper` route label with `ArrowRight` icon (when label has " to " pattern).
- **Trip pinned to real Jul 4–12, 2026** (v0.0.207): all `sampleDays` keys + event ISO times shifted from March +112d; `HeroView` `HIGHLIGHTS` fallback dates synced; `DATA_VERSION` bumped to 9 to flush stale localStorage.
- **Countdown pill removed** (v0.0.208): the "X days to go" glass pill in the hero header masthead was removed. The `daysToGo` calc was deleted; `DAY_MS`/`now` still used elsewhere.
- **Sticker event icons**: `AnimatedEventIcon` gained `sticker` prop (white border + drop shadow + gloss sheen) used product-wide except `TimeBlock` badges (too dense). EventEditor type picker uses sticker tiles with `selected` tilt + `confetti` burst.
- **Checklist row padding** tightened; EventEditor type picker grid cells reduced (44→38px).

### v0.0.181–v0.0.192 — DM Sans, grey backgrounds, modern Day-tab timeline (2026-06-28)

A follow-on polish pass on the v0.0.157–v0.0.180 redesign: a new typeface, a calmer light-grey surface, a three-weight type system, and a fully reworked Day timeline. Changes by area:

**Typography (`styles.js`, `index.html`, `index.css`):**
- **Font switched to DM Sans, app-wide** (was Inter). `fontStack` now leads with `'DM Sans'`; loaded via a Google Fonts `<link>` in `index.html` (`wght@500;600;700`). The hardcoded Inter strings in `App.jsx`, `EventEditor`, `ChecklistEditor`, and `DocumentUploader` were switched to DM Sans too.
- **No 400 weight — three weights only (500 / 600 / 700).** `body` and `helper` moved from 400 → 500; `index.css` sets `body { font-weight: 500 }`; the Google Fonts load dropped 400. 500 is now the lightest weight anywhere. Principle reinforced: no weight below 500, no ad-hoc `fontSize`/`letterSpacing` overrides — differentiate by weight and color.

**Backgrounds (`styles.js`, `index.html`, `manifest.json`):**
- **Page backgrounds went light grey.** `glossyBg` and `pageGradient` are now `#F2F3F5` (were baby-blue `#EAF3FC`); `glass.frostedLight` background is `rgba(242,243,245,0.85)`; the `index.html` `theme-color` and `manifest.json` `background_color`/`theme_color` are `#F2F3F5`. The Trip, Plan, Status, and Event-Detail pages all read light grey now.

**DayTimelineView + TimeBlock — modern timeline redesign:**
- **Per-island background tint (Day tab only — the lone colored page surface):** Kauai = muted slate-blue `#DBE2EC`, Maui = muted warm sand `#ECE5D6`; the sticky header uses translucent island-matched tints (`rgba(219,226,236,0.9)` / `rgba(236,229,214,0.9)`). Tint is chosen by `dest.id`.
- **Timeline spine layout:** each event row is now a time column (per-event start time split into time + AM/PM on two lines) + a spine column (a continuous vertical line `rgba(80,92,108,0.20)` with a 12px dot tinted by `getEventColor(event.type)`, bordered in the island background) + the `TimeBlock` card. The old "show the hour label only when the hour changes" grouping is **gone** — every event shows its own start time on the spine.
- **TimeBlock photo badge** now shows only the event-type label; the start time moved out of the badge onto the spine.

**HeroView (Trip tab) — confirmed current:** "Up next" and Flight are two compact `cleanCard` cards **side by side** (a flex row, each `flex: 1`/half-width); the flight milestone log is removed; the "Up next" / "Your trip" section headings are `typography.title` (24px) at **weight 500** (margins 40px / 30px top).

**CalendarView (Plan tab):**
- The **"Trip at a glance"** stat section (Days / Events (non-buffer) / Islands) is the final block on the page. A short-lived **"To-do" tracker** was added below it and then **removed** — the Plan tab no longer carries a to-do tracker.

### v0.0.157–v0.0.180 — Product-wide redesign: modern surface, side-by-side cards, tour-style detail, island theming (2026-06-27)

A large redesign session that reworked the whole surface around a baby-blue (`glossyBg` #EAF3FC) background, opaque `cleanCard` white cards, a saturated animated event-icon system, and a unified single type scale. Key changes, by area:

**Design system / styles (`styles.js`, `index.css`):**
- New `cleanCard` token (opaque white, hairline border, `0 6px 18px rgba(40,50,70,0.08)` shadow) replaces muddy glass on the Trip/Plan/Day surfaces. `glossyBg` switched from warm `#F0EDE8` to baby-blue `#EAF3FC`.
- **Unified type scale:** ramp is `caption` 13 / `helper` 15 / `body` 17 / `bodyMedium` 17 / `sectionHeader` 18 / `heading` 18 / `title` 24 / `hero` 42; minimum font size is 13px. Principle: use ramp tokens as-is, differentiate by weight/color, no ad-hoc `fontSize`/`letterSpacing` overrides. All content cards use `spacing.xl` (24px) inner padding.
- New `AnimatedEventIcon` + `eventVisuals.js` + `index.css` `kf-*` keyframes: a saturated tile with a white icon per event type, each with a "matching" motion (plane flies, boat rocks, sun rises…); respects `prefers-reduced-motion`.
- `index.css` adds `scrollbar-gutter: stable` so opening a bottom sheet (which locks body scroll) no longer shifts the layout ("wobble" fix).

**HeroView (Trip tab):**
- The **flight milestone log was removed**; the standalone **Trip Countdown card was removed** — the pre-trip countdown is now a small **"X days to go" pill in the hero header**.
- **"Up next" and Flight cards now sit side by side** (two compact half-width `cleanCard` cards in a flex row). "Up next" / "Your trip" section headings are `typography.title` (24px, weight 500) with 40px / 30px top margins.
- **Destination (DestCard) cards** are now full-photo cards, 144px tall, with a 30px white title over a bottom scrim.
- Weather "Get Weather" button label set to `whiteSpace: nowrap` so it never wraps/overflows beside the zip input.
- The milestone helpers (`getFlightMilestones`, `getVisibleMilestones`, `FlightMilestoneRow`) remain in the file but are no longer rendered; `getTripCountdownMilestones` was removed.

**DayTimelineView (Day tab):**
- Header day-nav (prev/next arrows + centered "Day N of M" + date + day label) plus a new **segmented island switcher** (iOS-style pill control) that replaced the old colored destination strip.
- **Island color theming:** Kauai days render the page/header in baby-blue (`#EAF3FC` / `rgba(234,243,252,0.85)`), Maui days in warm yellow (`#FBF4DD` / `rgba(251,244,221,0.85)`).

**TimeBlock:**
- Buffer events now render as **dashed-border light cards** (`#F6F8FC` bg, `1.5px dashed #B6C2D1`), clearly distinct from photo event cards. Content padding is `spacing.xl` (24px); the "Details" button uses the soft-teal accent (ocean text).

**EventDetailView — full "tour-style" redesign:**
- Colored event-type eyebrow → 24px title → tag line → 200px hero photo → "Description" section (notes with More/Less 3-line clamp) → "Details" section: a white card of stacked `DetailRow` label/value rows (both `helper` 15px), with **"Get directions"** + **"Edit"** action links on the Details header row. White back button, no bottom CTA bar.

**EventEditor:**
- Two teal CTAs at the bottom (soft-teal "Close" + filled-teal "Add Event"/"Save Changes", both `whiteSpace: nowrap`); sentence-case field labels (not uppercase); modern light-grey input fill (`#F1F3F6`); tightened type-picker grid (38px animated icon tiles).

**CalendarView (Plan tab):**
- Destination legend is now a **segmented filter control** (`CalendarLegend` — MapPin icons + day counts; tap to filter, tap active to clear).
- New **"Trip at a glance"** section (3 stat tiles: Days / Events (non-buffer) / Islands) and a **"To-do" tracker** (progress bar + first 5 uncompleted checklist items, tappable to complete via `TOGGLE_CHECKLIST_ITEM`, with a "View all N in Status" link when more than 5 remain). The tracker hides when there are no checklist items.

**Navigation:**
- Bottom nav now **clings to the screen edges** — full-width, flush to the bottom, with only the top two corners rounded and the safe-area inset absorbed inside the bar.

**Data:** event `notes` in `sampleTrip.js` enriched to 2–4 sentence descriptions per place; `DATA_VERSION` bumped to 6.

### v0.0.154 — Removed the event "done" / "complete" feature and the tight-buffer alert

A design-system audit (`docs/ds-audit-2026-06-18.md`) surfaced "warning/done" states that never appear with the seeded data. On review these were cut from the product entirely — they were conditional states the app no longer wants.

**Removed — the entire "mark event done" feature:**
- `EVENT_STATUSES` (eventTypes.js) and the `getStatusColor` / `getStatusBg` / `getStatusLabel` helpers (timeUtils.js).
- The `SET_EVENT_STATUS` reducer action (TripContext.jsx).
- The Status toggle row in `EventDetailView`, the status toggle in `EventEditor` (+ the `status` field it saved and the `onStatusToggle` prop), and the timeline `handleStatusToggle` in `DayTimelineView`.
- The done-state visuals in `TimeBlock` (the `opacity: 0.45` + `grayscale(0.6)` dimming and the inline green "Done" badge).
- The day-completion state (`allDone` + the `EmptyState type="complete"` "That's your day" screen). `EmptyState` is now empty-only.
- The Next Up / Next Flight `status === 'done' || 'cancelled'` skip checks in `HeroView`.
- Dead code: deleted the unused `StatusBadge.jsx` component; the phantom `'cancelled'` status (never set anywhere) is gone with the skip checks.

**Removed — the tight-buffer alert:** `TimeBlock`'s `isTight` variant (warning background, dashed amber left border, recolored text/icon, and the "Tight" pill that triggered at ≤20 min). Buffers now always render in the neutral style.

Note: the inert `status: 'upcoming'` field remains in the seeded sample data and the trip-shift reset (harmless, unread) — left untouched to avoid destabilizing the trip-shift regression test. The HeroView flight/countdown *milestone* `status` is unrelated and unchanged.

### v0.0.153 — Hero header page title

Added a dominant page title to the front page hero, which previously had **no title at all** (the trip name only appeared tucked inside the Trip Countdown card). With nothing larger than the 18px section headers, the page read as "blended" — no anchor for the eye.

- **Hero height 110px → 200px** to seat the title.
- **`trip.name` rendered as an `<h1>`** over the existing hero photo (bottom-left), using the restored `typography.hero` token (42px / 700 / -0.02em) — the design system's documented "Page titles only" size, which had been removed as dead code in v0.0.110 and is now back in `styles.js`.
- **Meta line** above the title — date range + day count (e.g. `MAR 14 – MAR 22 · 9 DAYS`), auto-computed from trip dates, in the `caption` style.
- Title legibility comes from the existing `scrimGradient` plus a soft text-shadow.
- **Header-only change.** Destination cards, Next Up, Flight Status, Trip Countdown, Weather Forecast, Trip Highlights, and all logic/data are untouched. Hero photo source is unchanged.

**Files:** `styles.js` (restored `typography.hero`), `HeroView.jsx` (hero height + title overlay).

### Design System Update (ui-test v0.0.356–v0.0.357) — Color Palette Accuracy + Wider Section Descriptions

**v0.0.356 — Color palette subheading accuracy fix (2026-06-05).** The section description claimed "39 tokens from colors.js, 6 destination colors from sampleTrip.js, and 4 warm palette tokens from styles.js". An audit against source found three inaccuracies:

- `colors.js` has **43** tokens, not 39 — the page omits the `warning`/`warningLight` and `danger`/`dangerLight` pairs, which are actively used in the app (TimeBlock tight-buffer warnings, delete confirmations in EventEditor/ChecklistItemRow/DocumentCard, DocumentUploader file-size errors, HeroView delayed flight badge)
- Only **4** of the 6 destination colors come from `sampleTrip.js` (`color` + `accentLight` per island) — the 2 destination strip tints (`#BAE5E0` Kauai, `#EDDBAF` Maui) are hardcoded in `DayTimelineView.jsx`
- `glossyBg` is a standalone `styles.js` export, not part of the `warmPalette` object (which has 7 tokens, 4 of them aliases of colors.js values)

All 49 displayed swatch hex values were verified correct against source — only the counts and source attribution were wrong. Fix was text-only (swatches unchanged). New description: *"39 of the 43 tokens in colors.js (warning/danger pairs omitted), 6 destination colors from sampleTrip.js and DayTimelineView, and 4 warm background tokens from styles.js. Click any swatch to copy its value."*

**v0.0.357 — Section descriptions widened (2026-06-05).** `SectionWrap` description `maxWidth` increased from 640px to 800px so section subheadings span more of the screen — the color palette description now wraps to 2 lines instead of 3. Applies to all section descriptions on the page (shared component).

**Changes:**
- `TravelDesignSystemV2.jsx` (ui-test) — Color palette section `description` prop rewritten; `SectionWrap` description `maxWidth: 640` → `800`

Both versions deployed to local (192.168.1.192/travel-design-system-v2) and prod (travel-ds.cheyshen.com), bundles verified.

### Design System V2 Update (ui-test v0.0.290)

Broke the single "Hero cards" subsection into 3 standalone design system sections, each with proper descriptions, live examples, and spec tables:

- **Next Up card** — Live-updating card showing the next upcoming event. Example updated to "Breakfast at Brennecke's" with coral dining icon. Spec table covers container, icon box, title, day/time, location, tap feedback, and animation.
- **Flight Status card** — Live-updating flight tracker with route diagram and milestone log. Example updated to "Flight to Maui" (LIH → OGG). Added status badge variants (On Time / Delayed), milestone dot states visual reference (done/current/upcoming), and 17-row spec table covering every element.
- **Trip Countdown card** — Pre-trip countdown with destination route and milestone log. Spec table covers container, icon, trip name, countdown badge, date range, destination route, and milestone pattern.

Each section now explains the live-updating behavior and sliding-window milestone pattern, not just visual specs.

### v0.0.148 — Rename "Your Schedule" to "Weather Forecast"

Renamed the hero view card heading from "Your Schedule" to "Weather Forecast" — better describes the section's content (zip code input + day chips with weather icons/temps). Updated design system and documentation references.

**Changes:**
- `HeroView.jsx` — Section header text changed from "Your Schedule" to "Weather Forecast"
- `TravelDesignSystemV2.jsx` — Day chips description updated to reference "Weather Forecast" card
- `DOCUMENTATION.md` — All "Daily Overview" references updated to "Weather Forecast", version bumped

### v0.0.147 — Auto-Reset Trip Dates After Vacation Ends

When the trip end date has passed, the app now automatically shifts all dates forward to the next matching weekday (preserving day-of-week alignment), resets all event statuses to "upcoming," and unchecks all checklist items. This keeps the demo evergreen — the trip always appears in the near future.

**Changes:**
- `TripContext.jsx` — Added `isTripOver()`, `computeShiftDays()`, `shiftISODateTime()`, `addDaysToDate()`, and `buildShiftedData()` helper functions. `getInitialState()` now checks if the trip is over and returns date-shifted defaults instead of stale sample data. ISO 8601 datetime strings (with timezone offsets) are shifted correctly by replacing only the date portion.

### v0.0.145 — ESLint Integration & Chronological Event Sorting

Added ESLint to the build pipeline so undefined variable errors (like the v0.0.144 white screen crash) are caught before deployment. Events now sort chronologically when added.

**Changes:**
- `eslint.config.js` — New ESLint flat config with `no-undef` (error) and `no-unused-vars` (warn). Globals set for browser environment.
- `package.json` — Build script now runs `eslint src/ && vite build`, so undefined variable errors block the build.
- `TripContext.jsx` — `ADD_EVENT` reducer now sorts the day's events by `startTime` (ISO string `localeCompare`) instead of by `sortOrder`, so new events appear in chronological order on the timeline.
- `public/sw.js` — Service worker cache name bumped from `travel-v1` to `travel-v2` to bust stale caches after the build pipeline change.
- `HeroView.jsx` — Changed `eslint-disable-line react-hooks/exhaustive-deps` to generic `eslint-disable-line` since the react-hooks ESLint plugin is not installed.

### v0.0.144 — Fix White Screen Crash (Missing Import)

Fixed a runtime crash ("spacing is not defined") that caused a white screen on load.

**Changes:**
- `HeroView.jsx` — Added missing `spacing` import from `../styles.js`. The variable was used throughout the component but never imported, causing an immediate ReferenceError.

### v0.0.142 — Destination Cards Moved to Top of Hero

Destination cards (Kauai & Maui) relocated from zone 6 to zone 3 — immediately after the content panel pull indicator, before the Next Up card. Gives users instant destination orientation when landing on the hero page.

**Changes:**
- `HeroView.jsx` — Moved `DestCard` render block from after Trip Countdown Card to after pull indicator. Animation delay reduced from 0.7s to 0.3s since cards are now first visible content. Margin adjusted from 24px to 20px bottom.
- `DOCUMENTATION.md` — Version bump to v0.0.142. Hero View content zones reordered (Destination Cards now zone 3). Added production URL. Added changelog entries for v0.0.137 and v0.0.142.

### v0.0.137 — OG Image + Meta Tags for Link Previews

Added Open Graph and Apple touch icon meta tags for rich link previews when sharing the app URL.

**Changes:**
- `index.html` — Added `og:title`, `og:description`, `og:image`, `og:url` meta tags with absolute URLs to `travel.cheyshen.com`. Added sized apple-touch-icons (120/152/167/180px).
- `EventEditor.jsx` — Cover photo preview shows current event image (user-uploaded, event URL, or type fallback via `getCoverImage`). "Tap to change" overlay. X button only for user uploads.

### v0.0.136 — Cover Photo Preview in Event Editor

The EventEditor now shows the event's current cover image (user-uploaded, event-specific URL, or type-based fallback) instead of always showing the empty upload placeholder. Tapping the image opens the file picker to replace it.

**Changes:**
- `EventEditor.jsx` — Imported `getCoverImage` from coverImages.js. Cover photo section resolves display image via `formData.coverImage || getCoverImage(formData.type, event?.id)`. Shows image preview with "Tap to change" overlay. X remove button only appears for user-uploaded images.

### v0.0.132 — Progressive Web App (PWA)

Added full PWA support so the app is installable on mobile (Add to Home Screen) and desktop, with offline caching of static assets.

**New files:**
- `public/manifest.json` — Web app manifest: standalone display, ocean teal theme (#0E7490), warm background (#F0EDE8)
- `public/sw.js` — Service worker with network-first strategy for navigation, cache-first for static assets, automatic old cache cleanup
- `public/pwa-icon-{192,512}.png` — Standard PWA icons (palm tree on warm background)
- `public/pwa-icon-{192,512}-maskable.png` — Maskable icons with safe-zone padding for adaptive icon shapes
- `public/apple-touch-icon.png` — 180px iOS home screen icon

**Modified files:**
- `index.html` — Added manifest link, `theme-color` meta, Apple PWA meta tags (`apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `apple-mobile-web-app-title`)
- `src/main.jsx` — Service worker registration on window load

### v0.0.131 — Lucide TreePalm Favicon

Added SVG favicon to the travel app and design system using the exact Lucide `TreePalm` icon in palm green (`#2D7D46`) on a transparent background. Both https://travel.cheyshen.com/ and https://travel-ds.cheyshen.com/ now display the palm tree favicon.

**Changes:**
- `public/favicon.svg` — New SVG favicon using Lucide TreePalm icon paths with `stroke="#2D7D46"`, `stroke-width="2"`
- `index.html` — Updated favicon link from `/vite.svg` to `/favicon.svg`

### v0.0.128 — Timezone-Safe Time Display

Fixed timezone mismatch where event times displayed in browser's local timezone instead of the event's own timezone. For example, a Hawaii event at 12:00 PM HST (-10:00) was showing as 5:00 PM when viewed from a CST (-05:00) browser.

**Changes:**
- `formatTime()` — Now extracts hours/minutes directly from the ISO string via regex instead of using `new Date().toLocaleTimeString()`. Preserves the event's timezone for display.
- `formatHourLabel()` — New helper for hour-only labels (e.g. "12 PM"), also timezone-safe. Used by DayTimelineView hour group labels.
- `DayTimelineView.jsx` — Replaced two raw `toLocaleTimeString()` calls with `formatHourLabel()`.
- EventEditor already used regex extraction for its `<input type="time">` fields — now card display matches.

**Not changed (correctly using `new Date()`):**
- `getTimePosition()` / `getDurationMinutes()` — Compute absolute milliseconds for ordering/duration, not display.
- HeroView milestone calculations — Same reason, used for comparisons not display.

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
- **Real weather API integration (Open-Meteo):** Added zip code input field in the Weather Forecast section. On submit, geocodes the zip code via Open-Meteo's geocoding API, then fetches a 16-day weather forecast (temperature high/low in °F + WMO weather code). Data is stored in TripContext (`weatherZipCode`, `weatherData`) and persisted to localStorage. Day chips use real forecast data when available, falling back to `getSimulatedWeather()` for dates outside the forecast window. New helper functions: `mapWeatherCode()`, `fetchWeatherForZip()`. New reducer actions: `SET_WEATHER_ZIP`, `SET_WEATHER_DATA`.

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
- **Cards above highlights text sizing:** Next Up card time/location bumped from `helper` (13px) to `body` (16px), MapPin 12→13px. Flight Status card title now full `sectionHeader` (18px, removed fontSize:15 override), date/time bumped to `body`, badge 11→12px. Trip Countdown card same treatment: title to full `sectionHeader`, date range to `body`, badge to 12px, location to `body` (16px).
- **Calendar subtitle:** Changed text from "Activity days by island" to "Activity days". Changed style from `typography.helper` to `typography.body` (13px → 15px).

### v0.0.86 — Cache Invalidation
- **DATA_VERSION bumped:** 3 → 4 in `TripContext.jsx` to force localStorage reload from `sampleTrip` defaults after sample data changes.

### v0.0.85 — Custom Hero Upload + Body Scroll Lock + Highlight Card Text Sizing
- **Custom hero photo upload:** Added camera button (frosted glass circle, 32x32) to HeroView hero section. Users can select a photo which is compressed via canvas API (1200px max width, JPEG quality 0.7) and stored as data URL in `heroImage` state. TripHeader reads `state.heroImage` from context to display custom photo on calendar page.
- **SET_HERO_IMAGE reducer action:** New action in TripContext to store custom hero photo.
- **Body scroll lock on overlays:** EventEditor, ChecklistEditor, DocumentUploader, and DocumentViewer now set `document.body.style.overflow = 'hidden'` on mount and restore on unmount. Prevents page wobble caused by scrollbar appearance/disappearance.
- **Destination strip centered + brightened:** Added `justifyContent: 'center'`. Changed backgrounds from `dest.accentLight` to brightened tints: `#BAE5E0` (Kauai) and `#EDDBAF` (Maui).
- **Scroll restoration improved:** Changed `onAnimationComplete` in App.jsx to use `requestAnimationFrame` for more reliable scroll position restoration after hero view enter animation.
- **Highlight card text sizing:** Content padding increased (12px 14px → 14px 16px). Title to `sectionHeader` (18px), meta info 11→13px with `textMedium`, description to `body` (16px), CTA 13→15px with marginTop 10→14px. Card gap 14→16px.

### v0.0.84 — Hero Image + MonthSummary Cleanup + Day Tab Readability
- **Hero image replaced:** Changed from Unsplash URL to local `/hero-bg.png` (sunset beach photo). Updated both HeroView and TripHeader.
- **MonthSummary simplified:** Removed per-destination count breakdown ("5 Kauai · 4 Maui"). Now shows only total: "9 trip days".
- **Hour labels readable:** DayTimelineView left hour labels changed from `caption` (13px, `textLight`) to 12px with `textMedium` color.
- **Day counter readable:** "Day X of Y" counter changed from `caption` (13px) to 12px with `textMedium` color.
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

### v0.0.62 — Calendar Readability + Weather Forecast + Done State
- **White daily overview cards:** Day chips in Hero "Weather Forecast" changed from `glass.subtle` to `glass.card` (white) for consistency with other cards.
- **Swipe fix:** Added `touchAction: 'pan-x'` to daily overview day buttons to prevent Framer Motion from eating horizontal scroll gestures.
- **Bigger calendar legend:** CalendarLegend button padding increased (8/16px → 12/24px), shape indicators 10→12px, name text 15→16px, count text 13→15px.
- **Bigger month summary:** MonthSummary text changed from `helper` (13px) to `body` (16px), dots 8→10px.
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
- **HeroView token cleanup:** Flight status colors use `colors.warningLight`/`colors.success` (were hardcoded). Weather Forecast header uses `typography.caption`. Milestone row uses `colors.success`/`colors.border`.
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
  - TimeBlock image subtitle: `helper` (13px) → `body` (16px)
  - TimeBlock buffer title: 14px → `bodyMedium` (16px)
  - TimeBlock buffer time: 11px override → `caption` (13px proper token)
  - TimeBlock buffer label: 12px → `helper` (13px)
  - DocumentCard name: `helper` (13px) → `bodyMedium` (16px)
  - DocumentCard category: **9px** (below minimum!) → `caption` (13px)
  - HeroView destination dates: 14px → `body` (16px)
  - HeroView featured highlight body: 14px → `body` (16px)
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
- **Simulated Weather in Weather Forecast:** Day chips in the horizontal scroll strip now show weather icons (Sun, CloudSun, Cloud, CloudRain from Lucide) and temperature (75–85°F). Weather is deterministically seeded from date + destination ID for consistency. Replaces the old destination color bar + event count.
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
