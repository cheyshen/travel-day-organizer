# Travel Day Organizer — UX Documentation

> A portfolio-quality Hawaii trip planner built with React 19, Framer Motion, and a tropical design system. This document serves as the complete UX reference for the Travel module.

**Live URL:** `http://192.168.1.198`
**Deployment:** Standalone K8s namespace `travel`
**Current Version:** v0.0.49

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
- **Total Components:** 38 (1 main entry point, 5 views, 20 components + 3 calendar sub-components, 1 context provider, 9 supporting files)
- **Number of Views:** 5 (Hero, Calendar, Day Timeline, Event Detail, Status)
- **Event Types:** 14 (flight, hotel, dining, beach, sightseeing, shopping, hiking, boat, ground_transport, activity, buffer, entertainment, sunrise, custom)
- **Checklist Categories:** 6 (packing, booking, documents, health, transport, other)
- **Document Categories:** 6 (passport, boarding_pass, hotel_confirmation, insurance, rental_car, other)
- **Total Mock Events:** 57 events distributed across 9 days
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
- Switching tabs calls `window.scrollTo(0, 0)` to reset scroll position
- All views inherit theme colors from a centralized `colors` object and spacing tokens
- The app enforces a max-width of 480px for mobile-first design
- EventDetailView is a sub-view accessed from DayTimelineView via TimeBlock chevron arrows

### Central State Management

The `TripContext` stores:
- `trip` — metadata (title, date range, destinations array)
- `days` — keyed by date, containing events, destination assignment, and day labels
- `activeView` — which view to render ('hero', 'calendar', 'day', 'eventDetail', or 'status')
- `selectedDate` — the currently focused date (when viewing day timeline)
- `selectedEventId` — the event ID for EventDetailView (set when navigating to event detail)
- `checklistItems` — array of preparation checklist items with category, completion state, timestamps
- `documents` — array of uploaded documents stored as base64 data URLs with metadata

## Navigation Model

### Bottom Tab Navigation (persistent, always visible)

| Item | ID | Icon | Purpose | Behavior |
|------|-----|------|---------|----------|
| Trip | `hero` | Palmtree | Trip overview, stats, quick-access chips | Navigates to Hero View |
| Calendar | `calendar` | CalendarDays | Full month grid view of all days | Navigates to Calendar View |
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
   - Inactive tab text: #9CA3AF on #1F2937 (4.6:1 contrast, WCAG AA)
   - Active tab text: #FFFFFF on #1F2937 (13.5:1 contrast, WCAG AAA)
   - Flex layout prevents width shift when active state changes

## Screen-by-Screen Breakdown

### HERO VIEW — Trip Landing Page

**Purpose:** Show trip-at-a-glance, surface key metrics, enable quick access to specific days. Provides temporal orientation through live countdowns, flight tracking, and weather context.

**Content Zones (top to bottom):**

1. **Hero Image** — Full-bleed Unsplash photo (210px) with gradient overlay, glass pill badges ("X DAYS", "Upcoming")
2. **Content Panel** — Warm gray surface overlapping hero by -28px with 24px top radius
3. **Next Up Card** — Shows next upcoming event with icon, title, time, location, destination color accent border, countdown badge. Taps navigate to event detail.
4. **Flight Status Card** — Shows next upcoming flight with route visualization (ORD ——✈—— LIH), status badge (On Time / Delayed), and **simulated milestone log** — a mini vertical timeline of 6 milestones (check-in, gate, boarding, doors, departed/in-flight, landed) with sliding window showing 3 at a time. Milestones: green filled dot (done), teal pulsing dot with glow (current), hollow circle (upcoming). Vertical connector lines between dots. Relative timestamps update every 60s. Skipped if flight is same as Next Up event.
5. **Trip Countdown Card** — Pre-trip card showing days until departure with location route (Kauai → Maui). Uses same milestone log visual pattern with 6 countdown milestones (trip booked, 30 days out, 3 weeks out, 2 weeks out, 1 week out, trip begins). Sliding window of 3 centered on current. Hidden once trip has started.
6. **Destination Cards** — Compact photo cards (50px photo height) per destination with name, date range, day count, and arrow CTA. Tap jumps to first day at that destination.
7. **Daily Overview** — Horizontal scroll of day chips showing: day-of-week abbreviation, date number, **weather icon** (sun/cloud-sun/cloud/rain — deterministic simulation for Hawaii), and **temperature** (75–85°F). Tapping navigates to that day's timeline.
8. **Featured Highlight** — Editorial card with cover photo, title, description, and "View Day X" CTA.

**Sub-Components:**
- `DestCard` — Photo + info card with image preloading, destination color accent
- `FlightMilestoneRow` — Reusable timeline row with dot indicator (done/current/upcoming), label, detail text, and relative timestamp. Used by both flight status and trip countdown cards.
- `WeatherIcon` — Maps simulated weather conditions to Lucide icons (Sun, CloudSun, Cloud, CloudRain)

**Helper Functions (module-level):**
- `seededGate(eventId)` — Deterministic airport gate from event ID hash (e.g. "B12")
- `computeRemaining(endMs, nowMs)` — "2h 15m remaining" for in-flight state
- `formatRelativeTime(timestampMs, nowMs)` — "in 35m", "2h ago", "Now", or short date for >24h
- `formatCountdownTime(triggerMs, nowMs)` — Day-level precision: "in 21d", "7d ago", "Now"
- `getFlightMilestones(flight, nowMs)` — Builds 6 flight milestones with status assignment
- `getTripCountdownMilestones(startDate, nowMs)` — Builds 6 trip countdown milestones
- `getVisibleMilestones(milestones)` — Sliding window of 3 centered on current milestone
- `getSimulatedWeather(dateStr, destId)` — Deterministic weather from date+destination hash (Hawaii-realistic)

### CALENDAR VIEW — Full Trip Overview

**Purpose:** Show the entire trip month in a calendar grid with month navigation, allowing users to scan days by event density and destination, tap for day summaries, and filter by destination.

**Content Zones (top to bottom):**

1. **Compact Header** — Smaller hero image, no title
2. **Month Navigation** — Prev/next chevron buttons (44x44px) flanking the month title + "Activity days by island" subtitle. Swipe gesture via Framer Motion `drag="x"` with 80px threshold. Slide + fade animation (250ms enter, 150ms exit) on month change.
3. **Calendar Grid** — 7-column grid with color-coded DayCard cells. Selected date gets accent ring (2.5px solid #0E7490), today gets subtle textLight border, event density shown via horizontal bars instead of dots, destination shape indicators (circle=Kauai, square=Maui).
4. **CalendarTooltip** — On day tap, a positioned popover shows day label, destination with color dot, event breakdown grouped by type (icon + label + count), and "View Day" navigation button. Responsive width (75% of container, 260–340px). Dismissed via backdrop tap, X button, or Escape key.
5. **CalendarLegend** — Interactive destination pill buttons with shape indicator + name + day count. Tapping a pill filters/highlights those days on the grid (non-matching days dim to 0.3 opacity). Tapping again deselects.
6. **MonthSummary** — Single summary line: "9 trip days · 5 Kauai · 4 Maui" with inline color dots.
7. **Add Button** — Solid accent pill button (matches Day tab style) navigates to Day timeline.

### DAY TIMELINE VIEW — Single Day Deep Dive

**Purpose:** Show all events on a specific day as visual image cards in chronological order, with ability to edit, add, or mark complete.

**Content Zones (top to bottom):**

1. **Sticky Header** — Glassmorphic blur; prev/next day buttons, day counter, Add button
2. **Destination Strip** — MapPin icon (strokeWidth 2.5), destination name and optional day label. No left border — clean full-width tinted bar.
3. **Timeline** — 20px top padding before first card. Image card schedule with TimeBlocks (cover photo cards), buffer blocks (compact `#F3F1EE` cards), NowIndicator, inline Add button. Left hour labels group events by time. View scrolls to top on load and date change.
4. **Empty State** — "No events planned" with CTA (if no events)
5. **Complete State** — "All done for today!" (if all events done)
6. **Bottom Padding** — 80px to prevent content hidden behind nav

**TimeBlock Image Card Layout:**
- **Image area** (125px): Cover photo from Unsplash (type-based), gradient fallback on error. Dark gradient overlay at bottom for badge readability.
- **Time + type badge** (bottom-left of image): Frosted dark pill with icon + time + event type label
- **"NEXT UP" badge** (top-right of image): Amber pill on the next upcoming non-buffer event
- **Content area** (white, below image): Title (`sectionHeader` 18px), subtitle/location (`body` 15px), and chevron arrow button for detail navigation
- **Buffer events** render as compact white cards (`#F3F1EE` bg) with time range (`caption` 11px), type icon, and title (`bodyMedium` 15px) — no cover image

### EVENT DETAIL VIEW — Full Event Information

**Purpose:** Display complete event information including time, location, confirmation number, notes, timezone, and status. Accessible via chevron arrow on TimeBlock cards.

**Content Zones (top to bottom):**

1. **Sticky Header** — Back arrow (returns to day timeline), "Event Details" label, event title, Edit button (opens EventEditor)
2. **Hero Card** — Event type icon (52px, heavy stroke) + type label + title + subtitle on tinted background
3. **Info Rows** — White cards with icon + label + value for: Time (range + duration), Location (origin → destination), Confirmation number (monospace), Timezone
4. **Notes Section** — Pre-wrapped text block
5. **Status Section** — Status badge with toggle button (tap to mark done/upcoming)

**Navigation Flow:**
- TimeBlock chevron → dispatches `SET_SELECTED_EVENT` with event ID → navigates to 'eventDetail'
- Back button → navigates to 'day' view
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
| Transport | Car | Info blue | Transportation logistics |
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
| `background` | `#F6F5F2` | Main page background; warm cream/linen |
| `surface` | `#FFFFFF` | Primary card and container backgrounds |
| `surfaceMuted` | `#EFEEE9` | Secondary surfaces; subtle differentiation |
| `surfaceElevated` | `#FFFFFF` | Elevated containers and modals |

### Tropical Accent Colors

| Token | Hex | Light Variant | Dark Variant | Purpose |
|-------|-----|---|---|---------|
| `ocean` | `#0E7490` | `#E0F7FA` | `#0C6478` | Primary teal-blue; CTA buttons, actions |
| `coral` | `#E8725A` | `#FDE8E3` | — | Warm accent; tropical warmth |
| `sand` | `#C4A265` | `#F5EDD8` | — | Beach sand; warm beige |
| `sunset` | `#E8925A` | `#FFF0E3` | — | Golden hour accent; warmth |
| `palm` | `#2D7D46` | `#E0F2E5` | — | Palm foliage; nature element |
| `lagoon` | `#1B9AAA` | — | — | Deep tropical water |
| `lavender` | `#7C3AED` | `#EDE9FE` | — | Sightseeing event type |
| `aqua` | `#0891B2` | `#CFFAFE` | — | Beach event type |
| `emerald` | `#059669` | `#D1FAE5` | — | Hiking event type |
| `rose` | `#DB2777` | `#FCE7F3` | — | Shopping event type |
| `purple` | `#9333EA` | `#F3E8FF` | — | Entertainment event type |
| `tealLight` | — | `#D5F0F0` | — | Boat tour event bg |

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
| `textOnAccent` | `#FFFFFF` | Text on colored backgrounds |
| `textOnDark` | `#FFFFFF` | Text on dark/opaque backgrounds |

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
| `shadow` | `rgba(0, 0, 0, 0.06)` | Base shadow color |

### Gradient Presets

| Name | Gradient | Usage |
|------|----------|-------|
| `tropicalHeader` | `135deg`: Ocean → Lagoon → Sand | Hero sections, headers |
| `oceanSky` | `180deg`: Ocean → Lagoon → Sky | Background vistas |
| `sunset` | `135deg`: Sunset → Coral → Sand | Warm accents, overlays |
| `sand` | `135deg`: Sand light → White | Subtle backgrounds |
| `kauaiCard` | `135deg`: Ocean → Ocean dark | Destination cards (Kauai) |
| `mauiCard` | `135deg`: Sand → Sand dark | Destination cards (Maui) |

## Typography

### Font Stack

```
'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
```

### Typography Scale

| Style | Font Size | Weight | Line Height | Letter Spacing | Use Case |
|-------|-----------|--------|-------------|---|----------|
| `hero` | 42px | 700 | 48px | -0.02em | Page titles, hero sections |
| `title` | 28px | 700 | 34px | — | Section titles |
| `sectionHeader` | 18px | 600 | 24px | — | Card headers, subsections |
| `body` | 15px | 400 | 22px | — | Body text, standard content |
| `bodyMedium` | 15px | 500 | 22px | — | Emphasis within body text |
| `helper` | 13px | 400 | 18px | — | Helper text, secondary info |
| `caption` | 11px | 500 | 14px | 0.05em | Labels, tags, metadata (uppercase) |

## Spacing Scale

| Token | Pixels | Common Uses |
|-------|--------|-------------|
| `xxs` | 2px | Micro-spacing between tight elements |
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
| `lg` | `0 8px 24px rgba(0,0,0,0.12)` | Sticky headers, panels |
| `xl` | `0 12px 40px rgba(0,0,0,0.16)` | Modals, bottom sheets |
| `card` | `0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)` | Default card shadow (event cards, document cards) |
| `cardHover` | `0 4px 16px rgba(0,0,0,0.1)` | Card hover state |
| **Navigation** | `0 8px 32px rgba(0,0,0,0.25)` | Bottom nav bar (highest z-index) |

### Shadow Usage by Component

| Component | Shadow Token | Notes |
|-----------|-------------|-------|
| EventCard | `shadows.card` (default), `shadows.md` + ring (when "next up") | "Next up" adds `0 0 0 1px rgba(180,83,9,0.2)` amber ring |
| DestCard (HeroView) | `shadows.md` | Elevated photo cards |
| Day chips (HeroView) | `shadows.sm` | Horizontal scroll chips |
| Featured highlight | `shadows.md` | Editorial card with photo |
| DayCard (Calendar) | `shadows.sm` | Trip days only, non-trip = none |
| BufferBlock | `shadows.sm` | Tight buffers get no shadow |
| ChecklistItemRow | `shadows.sm` | With 4px left category border |
| DocumentCard | `shadows.card` | 2-column grid cards |
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
| `glass.frostedDark` | `rgba(0,0,0,0.12)` | 20px | white 0.12 | — | Dark overlays on photos |
| `glass.frostedMedium` | `rgba(255,255,255,0.55)` | 30px | white 0.5 | — | Medium-opacity overlays |
| `glass.frostedLight` | `rgba(240,237,232,0.85)` | 20px | black 0.08 | — | Sticky headers |
| `glass.card` | `rgba(255,255,255,0.82)` | 20px | black 0.06 | `0 2px 8px rgba(0,0,0,0.08)` | Event cards, info rows, destination cards |
| `glass.panel` | `rgba(255,255,255,0.72)` | 24px | black 0.05 | `0 1px 4px rgba(0,0,0,0.06)` | Content panels (HeroView, CalendarView) |
| `glass.sheet` | `rgba(255,255,255,0.92)` | 24px | black 0.08 | `0 2px 8px rgba(0,0,0,0.06)` | Bottom sheets (EventEditor, ChecklistEditor) |
| `glass.nav` | `rgba(20,28,40,0.88)` | 20px | white 0.08 | `0 8px 32px rgba(0,0,0,0.25)` | Bottom navigation bar |
| `glass.input` | `rgba(237,234,229,0.5)` | 8px | black 0.1 | — | Form fields inside sheets |
| `glass.subtle` | `rgba(237,234,229,0.65)` | 12px | black 0.05 | `0 1px 4px rgba(0,0,0,0.04)` | Buffer blocks, empty states, day chips |
| `glass.tooltip` | `rgba(255,255,255,0.90)` | 20px | black 0.08 | `0 12px 40px rgba(0,0,0,0.16)` | Calendar tooltip popover |
| `glass.badge` | `rgba(255,255,255,0.60)` | 8px | black 0.06 | — | Legend pills, small glass badges |

### Visual Hierarchy (3-tier depth)

```
Page background (#F0EDE8)
  └─ glass.panel (72% white) — content panels, calendar wrapper
       └─ glass.card (82% white) — event cards, info rows, destinations
            └─ glass.sheet (92% white) — bottom sheets, modals (highest readability)
```

### Glass Usage by Component

| Component | Token | Parent Surface |
|-----------|-------|---------------|
| EventCard, TimeBlock, ChecklistItemRow, DocumentCard | `glass.card` | Page bg or panel |
| DestinationCard, InfoRow (EventDetail) | `glass.card` | Page bg |
| HeroView content panel, CalendarView content area | `glass.panel` | Page bg |
| EventEditor, ChecklistEditor, DocumentUploader | `glass.sheet` | Overlay |
| DayTimelineView sticky header, StatusView header | `glass.frostedLight` | Page bg |
| EventDetailView header | `glass.frostedLight` | Page bg |
| Bottom navigation bar | `glass.nav` | Page bg |
| CalendarTooltip | `glass.tooltip` | Calendar grid |
| CalendarLegend inactive pills | `glass.badge` | Panel |
| BufferBlock (normal), EmptyState, day chips | `glass.subtle` | Page bg |
| Form inputs inside sheets | `glass.input` | Sheet |
| Hero photo badges | `glass.frosted` | Photo |
| DestCard island badge | `glass.frostedDark` | Photo |

### Glass Implementation Rules
- Always spread as full style objects: `...glass.card`
- Always include `WebkitBackdropFilter` alongside `backdropFilter` (Safari)
- Borders use dark alpha (`rgba(0,0,0,...)`) for visible separation against warm bg
- No blur on DayCard grid cells (42 simultaneous blur layers hurts scroll performance)
- StatusBadge and AlertCard stay solid — semantic status colors must be instantly recognizable

## Warm Palette Tokens

Extended color tokens for the warm, luxury aesthetic (exported from `styles.js`):

| Token | Value | Usage |
|-------|-------|-------|
| `warmWhite` | `#FAF8F5` | Legacy token — cards now use `#FFFFFF` directly; retained for reference |
| `warmGray` | `#EDEAE5` | Page-level backgrounds (all views), content panels |
| `textDark` | `#1C1917` | Primary text on warm surfaces |
| `textMedium` | `#57534E` | Secondary text, labels |
| `textLight` | `#A8A29E` | Tertiary text, disabled, placeholder |
| `accent` | `#0E7490` | Primary action color (teal-blue), CTA buttons, links |
| `accentSoft` | `rgba(14,116,144,0.12)` | Accent background tint |
| `gold` | `#B8963E` | Maui destination accent |
| `goldSoft` | `rgba(184,150,62,0.12)` | Gold background tint |

### Card Background Convention (v0.0.47+)
All elevated surfaces use glass tokens (translucent with backdrop blur). Page backgrounds use flat `glossyBg` (#F0EDE8). Cards use `glass.card` (82% white), panels use `glass.panel` (72% white), sheets use `glass.sheet` (92% white). Buffer blocks use `glass.subtle` with `warmPalette.goldSoft` tint. Empty states use `glass.subtle`. No solid white (#FFFFFF) backgrounds on cards — all use glass tokens for the liquid glass aesthetic.

## Layout Tokens

| Token | Value | Purpose |
|-------|-------|---------|
| `cardRadius` | 16px | Border radius for card components |
| `buttonRadius` | 12px | Border radius for buttons |
| `badgeRadius` | 8px | Border radius for badges and tags |
| `cardBorder` | `1px solid #E2E0DB` | Divider and border standard |
| `maxWidth` | 480px | Maximum container width (mobile-first) |

## Design Rationale

The palette draws from natural island landscapes — ocean teals, coral warmth, sandy beiges, and sunset golds. Light variants create breathable, airy interfaces typical of premium travel publications. Large hero text (42px) paired with warm cream backgrounds creates an editorial, magazine-like experience. Generous spacing avoids density, mirroring high-end travel design where white space equals luxury.

**Styling approach:** Liquid glass (glassmorphism). All elevated surfaces use translucent backgrounds with backdrop blur, creating a layered depth hierarchy. The flat warm page background (#F0EDE8) bleeds subtly through panels and cards. Borders use dark alpha values for visible separation. Shadows are soft and diffuse. The 3-tier system (page → panel → card → sheet) ensures clear visual hierarchy. No solid white cards — everything is glass.

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
Dark gray (#1F2937) navigation bar anchored to the bottom with max-width 480px. Contains 5 tabs (Trip, Calendar, Add, Day, Status) with teal-blue (#0E7490) Add button. Active tab displays a small teal-blue indicator bar below the icon and white text; inactive tabs show gray text (#9CA3AF). Each tab has a 54px minimum height.

**Key Design Decisions:**
- Touch targets 48x54px (exceeds WCAG AAA 44px minimum)
- Icon + label always visible (NN/g: "icon-only navigation is problematic")
- `flex: 1` on all tabs prevents layout shifts
- `role="tablist"` + `role="tab"` + `aria-selected` for screen readers

---

## 2. TripHeader

**Purpose:** Hero header with tropical beach photo, centered title, and dark overlay.

**Props:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `title` | string | No | Main heading text (centered over the photo) |
| `subtitle` | string | No | Secondary text below title (only shown in full mode) |
| `compact` | boolean | No | If true, height is 100px; else 240px |

**Visual Description:**
Full-width hero with Na Pali Coast background image. Dark gradient overlay (25% → 50% → 65% opacity). White text with drop shadow. Compact mode: 100px height, no subtitle.

---

## 3. DestinationCard

**Purpose:** Interactive card displaying a single destination with accommodation details, date range, day count, and event count.

**Props:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `destination` | object | Yes | Destination data with id, name, color, dates, accommodation |
| `dayCount` | number | Yes | Number of days at this destination |
| `eventCount` | number | Yes | Number of events planned |
| `onTap` | function | Yes | Callback fired when card is tapped |

**Key Design Decisions:**
- 4px left border accent in destination color
- Island badge with map pin icon
- Hover lift (-3px) with `shadows.md`
- Tap scale 0.98 for tactile feedback
- Background: `warmWhite` with clean drop shadow

---

## 4. DayCard

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
- **Event density bars** (16px wide, 3px tall) replace dots — second bar at half opacity when >3 events
- **Shape encoding** in bottom-right: circle for Kauai, square for Maui (color isn't sole differentiator)
- **Selected date:** Strong accent ring (2.5px solid #0E7490) + elevated shadow — distinct from "has events"
- **Today:** Subtle textLight border (no longer confused with selection)
- **Text weight:** Bold (700) for days with events, medium (500) for trip days without, regular (400) for non-trip
- **Filter dimming:** Non-matching destinations go to 0.3 opacity when filter is active
- Trip days get `shadows.sm`, selected gets `shadows.md`, non-trip = no shadow
- Tap handler passes `(date, cellRect)` to parent for tooltip positioning

---

## 5. EventCard

**Purpose:** Timeline event card displaying a single trip event with time, status badge, location, and action chevron.

**Props:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `event` | object | Yes | Event data with id, type, title, subtitle, startTime, status, location |
| `isNext` | boolean | Yes | If true, shows "Next up" label |
| `onTap` | function | Yes | Callback when card is tapped |

**Key Design Decisions:**
- Background: `warmWhite` with `shadows.card` (default) or `shadows.md` + amber ring (when "next up")
- 4px left border in status color for at-a-glance identification
- Type-specific icon (40x40, rounded 12px, 20px icon) + unique colored background per type
- Title: `sectionHeader` (18px, weight 600) for readability
- Location: `helper` (13px) in `textMedium` color for visibility
- "Next up" amber (#B45309) pill positioned absolute top -8px right — distinct from CTA color per Nielsen H1 (temporal orientation vs action)
- Right-aligned chevron indicates tappability
- Hover: `scale: 1.01`, tap: `scale: 0.99`

---

## 6. BufferBlock

**Purpose:** Non-interactive timeline block for buffer/break time between events.

**Props:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `event` | object | Yes | Event data: `{ bufferMinutes, bufferLabel, title }` |
| `onTap` | function | No | Optional callback for editable buffers |

**Key Design Decisions:**
- Dashed 3px left border distinguishes from event cards
- Normal buffers: `warmGray` background + `shadows.sm`
- Tight buffer warning (<=20 min): amber background + "Tight" badge, no shadow
- Coffee icon (14px) suggests break/downtime

---

## 7. NowIndicator

**Purpose:** Timeline marker showing the current time with glowing dot + horizontal line.

**Props:** None. Stateless component.

**Visual Description:**
Glowing teal circle (10x10px with shadow), horizontal teal line, "Now" text label. Uses ocean teal color (#0D9488).

---

## 8. EventEditor

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
| `onStatusToggle` | function | No | Callback to toggle event status |

**Key Design Decisions:**
- Bottom sheet pattern (standard mobile editing)
- Horizontal scrollable type picker with color-coded buttons
- Sticky header with close/done buttons
- Save button disabled until title is filled in
- Delete with confirmation dialog

---

## 9. StatusBadge

**Purpose:** Reusable small pill displaying event status with semantic coloring.

**Props:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `status` | string | Yes | Status value ('upcoming', 'done', 'delayed', etc.) |
| `size` | string | No | 'sm' (default) or 'lg' |

---

## 10. EmptyState

**Purpose:** Placeholder for when a day has no events or when all events are done.

**Props:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `type` | string | No | 'empty' (default) or 'complete' |
| `onAddEvent` | function | No | Callback for Add Event button (empty state only) |

## 11. ChecklistItemRow

**Purpose:** Single checklist item with checkbox toggle, category indicator, edit and delete buttons.

**Props:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `item` | object | Yes | Checklist item data |
| `onToggle` | function | Yes | Callback to toggle completion |
| `onEdit` | function | Yes | Callback to open editor |
| `onDelete` | function | Yes | Callback to delete item |

**Key Design Decisions:**
- Background: `#FFFFFF` (pure white) with `shadows.sm`
- 4px left border in category color for grouping identification
- Checkbox: 24x24, rounded 6px, success green fill + white checkmark when complete
- Title gets line-through + muted color when completed
- Action buttons: edit (28x28, light bg) + delete (28x28, danger light)
- Animated layout with Framer Motion exit transitions (x: -20 on exit)

---

## 12. ChecklistEditor

**Purpose:** Bottom sheet for adding or editing checklist items with title input and category picker.

**Props:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `item` | object | No | Existing item to edit (null for new) |
| `onSave` | function | Yes | Callback with item data or { id, updates } |
| `onClose` | function | Yes | Callback to close sheet |

---

## 13. DocumentCard

**Purpose:** Thumbnail card in 2-column grid showing uploaded document with image preview or icon fallback.

**Props:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `doc` | object | Yes | Document data with dataUrl, name, category, fileSize |
| `onPreview` | function | Yes | Callback to open full-screen viewer |
| `onDelete` | function | Yes | Callback to delete document |

---

## 14. DocumentUploader

**Purpose:** Bottom sheet with file picker, category selector, name input, and 2MB size enforcement.

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

## 15. DocumentViewer

**Purpose:** Full-screen dark overlay for viewing uploaded documents at full size.

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

## 16. AlertCard

**Purpose:** Colored notification card with icon, title, and optional message. Supports info, warning, and success types.

**Props:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `type` | string | No | 'info' (default), 'warning', or 'success' |
| `title` | string | Yes | Alert title |
| `message` | string | No | Optional description text |

---

## 17. CalendarTooltip

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
- Dismiss: backdrop tap, X button, Escape key
- Animation: scale + opacity spring (stiffness 400, damping 28)
- Event breakdown grouped by type with icon + label + count
- Destination shown with shape indicator (circle/square) + color
- "View Day" button at bottom with chevron

---

## 18. CalendarLegend

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

## 19. MonthSummary

**Purpose:** Single-line summary of trip days in the visible month, broken down by destination.

**Props:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `days` | object | Yes | Map of day data by date |
| `destinations` | array | Yes | Array of destination objects |
| `trip` | object | Yes | Trip data |

**Key Design Decisions:**
- Format: "9 trip days · 5 Kauai · 4 Maui"
- Inline color dots (circle/square per destination) before each name
- Hidden when no trip days in visible month

---

## 20. TimeBlock

**Purpose:** Image card schedule block for the day timeline. Displays a cover photo with time/type badge overlay, title, subtitle, and chevron arrow for detail navigation. Buffer events render as compact text-only rows.

**Props:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `event` | object | Yes | Event data with id, type, title, subtitle, startTime, location, coverImage |
| `isNext` | boolean | Yes | If true, shows "NEXT UP" badge on image |
| `onTap` | function | Yes | Callback when card body is tapped (opens editor) |
| `onDetail` | function | No | Callback when chevron is tapped (navigates to detail) |

**Key Design Decisions:**
- **Image area** (125px): Cover photo from Unsplash via `getCoverImage(type, id)` with gradient fallback per event type. `loading="lazy"` for performance.
- **Dark gradient overlay**: Bottom 60px of image has `rgba(0,0,0,0.5)` gradient for badge readability
- **Time + type badge**: Frosted dark pill (`rgba(0,0,0,0.6)` + backdrop blur) at bottom-left with event icon (strokeWidth 2.5) + time + type label
- **"NEXT UP" badge**: Amber (#B45309) pill at top-right, uppercase, 10px font
- **Content area**: White (#FFFFFF) with title (`sectionHeader` 18px), subtitle/location (`body` 15px), and chevron button (`warmGray` bg)
- **Buffer events**: Compact white card (`#F3F1EE` bg) with time range (`caption` 11px), type icon (16px), and title (`bodyMedium` 15px). No image, no left accent border.
- **Cover image sources**: `coverImages.js` maps event types to Unsplash URLs with consistent hash-based selection per event ID. Gradient fallback on image load error.
- **Card shadow**: `shadows.sm` with `border: 1px solid rgba(0,0,0,0.06)`
- **Tap interaction**: Body tap → `onTap` (editor), chevron tap → `onDetail` (detail page) with `stopPropagation`
- **Font compliance**: All text sizes use design system tokens — no overrides below minimum (11px). Title uses `sectionHeader`, subtitle uses `body`, buffer title uses `bodyMedium`.

---

## 21. EventDetailView

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
│   ├── Trip View → DestinationCard (horizontal list)
│   ├── Calendar View → DayCard (grid) + CalendarTooltip + CalendarLegend + MonthSummary + EventEditor
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
2. Hero page displays TripHeader, stats row, DestinationCards, "View Calendar" CTA, Quick Access day chips
3. **Option A:** Tap "View Calendar" → CalendarView
4. **Option B:** Tap destination card → DayTimelineView for first day of that destination
5. **Option C:** Tap quick-access day chip → DayTimelineView for that date
6. Page transitions with fade/slide animation (opacity 0→1, y: 12→0)

## 2. Adding a New Event — Header "Add" Button

1. User is on DayTimelineView with sticky header
2. Taps "Add" pill button in header
3. `handleCreateNew()` → sets `isCreating = true`
4. EventEditor opens as bottom sheet
5. User fills form, taps "Add Event"
6. `ADD_EVENT` dispatched, editor closes, event appears in timeline

## 3. Adding a New Event — Inline Timeline Button

1. User scrolls to bottom of timeline
2. Taps dashed "Add event" button (positioned after last event, aligned with timeline)
3. Same flow as header Add button

## 4. Adding a New Event — Bottom Navigation Button

1. User is on any view
2. Taps teal "Add" button in bottom nav
3. `handleNavAdd()`: dispatches `SET_ACTIVE_VIEW: 'day'`, increments `addTrigger`
4. DayTimelineView detects `addTrigger` change via `useEffect`
5. EventEditor automatically opens

## 5. Editing an Existing Event

1. User taps EventCard or BufferBlock in timeline
2. `handleEventTap(event)` → sets `editingEvent`, opens EventEditor
3. Form pre-populated with event data
4. User modifies fields, taps "Save Changes"
5. `UPDATE_EVENT` dispatched, editor closes

## 6. Deleting an Event

1. User is editing an event (EventEditor open)
2. Taps red trash icon
3. Confirmation dialog slides in: 'Delete "[Title]"?'
4. Taps "Delete" → `DELETE_EVENT` dispatched
5. Editor closes, timeline re-renders

## 7. Navigating Between Days

- **Chevron arrows:** Prev/next day buttons in sticky header
- **Calendar tap:** Day cell → DayTimelineView
- **Day chip tap:** Quick access in HeroView
- **Destination card tap:** First day of that destination

## 8. Toggling Event Status

1. In EventEditor, tap status toggle button
2. Toggles between 'done' and 'upcoming'
3. `SET_EVENT_STATUS` dispatched
4. If all events done, EmptyState "complete" appears

## 9. Adding a Checklist Item

1. User is on StatusView
2. Taps "Add" pill button next to Preparation section header
3. ChecklistEditor bottom sheet slides up
4. User enters title, selects category from chip picker
5. Taps "Add Item"
6. `ADD_CHECKLIST_ITEM` dispatched, editor closes, item appears under its category group

## 10. Toggling/Editing/Deleting Checklist Items

- **Toggle:** Tap checkbox → `TOGGLE_CHECKLIST_ITEM` → sets `completed` + `completedAt`; progress bar animates
- **Edit:** Tap pencil icon → ChecklistEditor opens pre-populated → save dispatches `UPDATE_CHECKLIST_ITEM`
- **Delete:** Tap trash icon → `DELETE_CHECKLIST_ITEM` dispatched, item animates out

## 11. Uploading a Document

1. User taps "Upload" pill button next to Documents section header
2. DocumentUploader bottom sheet slides up
3. User taps dashed drop zone → file picker opens (images + PDF)
4. File validated (max 2MB) → read as base64 data URL
5. User sets name (auto-populated from filename), category, optional notes
6. Taps "Upload Document" → `ADD_DOCUMENT` dispatched, card appears in grid

## 12. Viewing/Deleting a Document

- **Preview:** Tap document card → DocumentViewer full-screen overlay with dark backdrop
- **Delete:** Tap small trash icon on card → `DELETE_DOCUMENT` dispatched

## Entry Points Summary

| Action | Entry Point | Components |
|--------|-------------|-----------|
| Add Event | Header button | DayTimelineView + EventEditor |
| Add Event | Inline button | DayTimelineView + EventEditor |
| Add Event | Nav button | Navigation + EventEditor |
| Add Event | Empty state | EmptyState + EventEditor |
| Edit Event | Event tap | EventCard + EventEditor |
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
| Inactive nav | #9CA3AF | #1F2937 | 4.6:1 | AA |
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

Instead of a floating button, three redundant entry points:
1. Navigation bottom bar (always visible)
2. Sticky header add button (visible during scroll)
3. Inline add button (context-aware, after events)

### Principle 3: Bottom Navigation Best Practices

- **Icon + Label always visible** (never icon-only)
- **Limited to 4 items** (under max 5 per NN/g)
- **Persistent and always visible** (fixed bottom, no scroll-to-hide)
- **Visual stability** (flex: 1, constant fontWeight, CSS transitions not layoutId)
- **Primary action differentiated** (teal background on Add button)

### Principle 4: Touch Targets (44px Minimum)

Navigation tabs are 54px tall (23% above minimum). All buttons maintain 44px+ height (day nav buttons 44x44px, Add button 44px tall). 8px spacing between targets prevents accidental activation. Checklist edit/delete buttons use 36x36px visual with adequate spacing. StatusBadge minimum font size is 11px (Apple HIG minimum).

### Principle 5: Layout Stability (No Wobble)

Three wobble causes were identified and fixed:
1. Removed Framer Motion `layoutId` (caused shared layout animation)
2. Removed `whileTap={{ scale }}` on flex items (caused space redistribution)
3. Set constant `fontWeight: 600` on all tabs (prevents text-width shift)

### Principle 6: Redundant Encoding

Status uses color + text + position (not color alone). EventCard left border color + StatusBadge text + shadow elevation = three-part encoding for maximum accessibility.

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
  status: string,                // 'upcoming', 'active', 'completed'
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
  status: string,                  // 'upcoming', 'done', 'delayed', 'cancelled'
  sortOrder: number,
  bufferMinutes?: number,          // Buffer-specific
  bufferLabel?: string
}
```

## Event Types Catalog (14 types)

Each event type has a unique icon color + background color pairing for maximum visual variety. No two types share the same bg color (except buffer/custom which share surfaceMuted as utility types).

| Type | Icon | Icon Color | Bg Color | Use Case |
|------|------|-----------|----------|----------|
| `flight` | Plane | `info` (#2B7A9E) | `infoLight` (#E0F1F8) | Air travel |
| `ground_transport` | Car | `ocean` (#0E7490) | `oceanLight` (#E0F7FA) | Taxi, rental car, Uber |
| `hotel` | Building2 | `sand` (#C4A265) | `sandLight` (#F5EDD8) | Check-in, checkout |
| `activity` | Palmtree | `palm` (#2D7D46) | `palmLight` (#E0F2E5) | Tours, excursions |
| `dining` | UtensilsCrossed | `coral` (#E8725A) | `coralLight` (#FDE8E3) | Restaurant, meals |
| `buffer` | Coffee | `textMuted` (#9B9B9B) | `surfaceMuted` (#EFEEE9) | Prep time, transitions |
| `boat` | Ship | `lagoon` (#1B9AAA) | `tealLight` (#D5F0F0) | Boat tours, ferry |
| `sunrise` | Sunrise | `sunset` (#E8925A) | `sunsetLight` (#FFF0E3) | Sunrise/sunset viewing |
| `sightseeing` | Camera | `lavender` (#7C3AED) | `lavenderLight` (#EDE9FE) | Lookouts, photo stops |
| `beach` | Waves | `aqua` (#0891B2) | `aquaLight` (#CFFAFE) | Swimming, sunbathing |
| `hiking` | Mountain | `emerald` (#059669) | `emeraldLight` (#D1FAE5) | Trails, trekking |
| `shopping` | ShoppingBag | `rose` (#DB2777) | `roseLight` (#FCE7F3) | Markets, retail |
| `entertainment` | Music | `purple` (#9333EA) | `purpleLight` (#F3E8FF) | Shows, luaus |
| `custom` | Circle | `textMuted` (#9B9B9B) | `surfaceMuted` (#EFEEE9) | User-defined |

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
}
```

### Reducer Actions (16 types)

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
| `ADD_CHECKLIST_ITEM` | ChecklistItem | Add preparation item |
| `UPDATE_CHECKLIST_ITEM` | `{ id, updates }` | Edit checklist item |
| `DELETE_CHECKLIST_ITEM` | item id string | Remove checklist item |
| `TOGGLE_CHECKLIST_ITEM` | item id string | Toggle completion + set completedAt |
| `ADD_DOCUMENT` | Document | Upload document |
| `UPDATE_DOCUMENT` | `{ id, updates }` | Edit document metadata |
| `DELETE_DOCUMENT` | doc id string | Remove document |
| `RESET` | none | Revert to sample data |

### localStorage Persistence

- **Key:** `travel-trip-state`
- **Debounced 500ms** after every state change
- **Validation:** Trip ID check on load prevents data pollution
- **Graceful fallback:** Falls back to sampleTrip if corrupted

### Hydration Strategy

1. Build defaults object with all fields (including `checklistItems` and `documents`)
2. Read from localStorage
3. Validate trip ID matches sample trip
4. Merge `{ ...defaults, ...parsed }` to backfill any new fields missing from old localStorage data
5. Fall back to full defaults if empty/invalid

## Sample Data Overview

| Day | Date | Destination | Label | Events |
|-----|------|-------------|-------|--------|
| 1 | Mar 14 | Kauai | Chicago to Kauai | 8 |
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
- Warm, inviting palette — foundation of beige backgrounds (#F6F5F2), white surfaces, tropical accents
- Luxury through simplicity — clean layouts with generous whitespace
- Nature-inspired interactions — smooth animations and pull gestures
- Color as storytelling — each destination has distinct color identity
- Magazine editorial quality — typography hierarchy inspired by high-end travel publications

## Key Layout Patterns

### 1. Card Overlap Pattern

Hero image section (240px/100px) with rounded content card overlapping via `marginTop: -28px`. Creates sophisticated "peek-a-boo" visual transition. Both HeroView and CalendarView use this pattern.

### 2. Pull Handle Indicator

36px wide x 4px tall, centered horizontally. Color: `#E2E0DB`. Borrowed from iOS design language to signal scrollability.

### 3. Sticky Header with Glass Blur

- Position: `sticky`, top: 0, z-index: 50
- Uses `glass.frostedLight`: `rgba(240,237,232,0.85)` with `backdrop-filter: blur(20px)` + `WebkitBackdropFilter: blur(20px)`
- Border bottom: `1px solid rgba(255, 255, 255, 0.4)`
- DayTimelineView: two sections — day navigation controls + destination strip
- StatusView: title + progress bar

### 4. Image Card Timeline with Left Hour Labels

- No track line — replaced with image card layout
- TimeBlock image cards: rounded corners, cover photo, white content area
- Buffer events: compact text-only rows between image cards
- Left hour labels (44px column): deduplicated by comparing with previous event's hour
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

- Na Pali Coast photograph at full coverage
- Dark gradient overlay: `rgba(0,0,0,0.25)` → `rgba(0,0,0,0.5)` → `rgba(0,0,0,0.65)`
- Progressive darkening ensures text readability
- Text shadow: `0 2px 16px rgba(0,0,0,0.35)` on titles

## Destination Color Coding

Each destination cascades its color throughout the entire app:

- **DestinationCard:** 4px left border
- **Calendar grid:** Day cells with colored bottom border
- **Destination strip:** Background uses accentLight
- **Quick access chips:** Bottom border in destination color
- **Badge backgrounds:** accentLight with color text

## Card Design Language

- **Background:** `#FFFFFF` (pure white) for all cards — event, document, checklist, destination, info rows, editor sheets. Buffer events use `#F3F1EE`.
- **Border radius:** 8px (badges) → 12px (buttons) → 16px (cards) → 20px (modals/sheets)
- **Shadows:** Clean drop shadows from `shadows` object — `sm` for resting, `md` for elevated/highlighted
- **Borders:** 1px solid rgba(0,0,0,0.06) for recessed containers; 4px colored left accent for categorization
- **Interactive states:** Tap scale 0.97-0.99, hover lift -3px or scale 1.01 with shadow elevation
- **No neumorphism:** Dual-tone embossed shadows (`#D4D0CA` / `#FFFFFF` pairs) were removed in v0.0.5

## Status Visual System

- Left border color for instant recognition
- StatusBadge pill with semantic text
- "Next up" amber (#B45309) badge on first upcoming event (distinct from CTA buttons)
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

HeroView uses sequential reveal with 100ms stagger intervals:
- Stats row: delay 0.2s
- Destination cards: delay 0.3s
- CTA button: delay 0.4s
- Quick access chips: delay 0.5s

Guides user's eye downward through natural reading flow.

## Micro-Interactions

### Hover Effects
- `scale: 1.01` — EventCard, BufferBlock (1% enlargement)
- `y: -3` — DestinationCard (3px upward lift + shadow)

### Pressure Feedback (whileTap)
- Calendar cells: 0.93 (7% reduction, high confidence)
- Day chips: 0.95 (5% reduction)
- Event cards: 0.99 (1% reduction, subtle)
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

No `layout` prop used. Fixed viewport at 480px prevents cascading reflows.

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
│   ├── colors.js               (68 lines)    Color palette + gradients
│   ├── styles.js               (97 lines)    Typography, spacing, shadows, glass tokens
│   │
│   ├── context/
│   │   └── TripContext.jsx     (~230 lines)   Reducer (16 actions) + localStorage
│   │
│   ├── views/                  (5 files)
│   │   ├── HeroView.jsx        (~614 lines)   Trip landing page + DestCard component
│   │   ├── CalendarView.jsx    (~370 lines)   Monthly calendar with nav, tooltip, legend
│   │   ├── DayTimelineView.jsx (~350 lines)   Image card schedule timeline
│   │   ├── EventDetailView.jsx (~280 lines)   Full event information page
│   │   └── StatusView.jsx      (~345 lines)   Checklist + document management
│   │
│   ├── components/             (17 files)
│   │   ├── Navigation.jsx      (~169 lines)   Bottom tab navigation (5 items)
│   │   ├── TripHeader.jsx      (~79 lines)    Hero header with photo
│   │   ├── DestinationCard.jsx (~92 lines)    Destination preview card
│   │   ├── DayCard.jsx         (~115 lines)   Calendar grid day cell (redesigned)
│   │   ├── CalendarTooltip.jsx (~180 lines)   Day summary popover on cell tap
│   │   ├── CalendarLegend.jsx  (~75 lines)    Interactive destination filter pills
│   │   ├── MonthSummary.jsx    (~60 lines)    Trip day count summary line
│   │   ├── TimeBlock.jsx       (~160 lines)   Image card schedule block (cover photo + badges)
│   │   ├── EventCard.jsx       (~125 lines)   Timeline event card (legacy, retained)
│   │   ├── EventEditor.jsx     (~463 lines)   Bottom sheet for event CRUD
│   │   ├── BufferBlock.jsx     (~58 lines)    Buffer time display (legacy, retained)
│   │   ├── EmptyState.jsx      (~113 lines)   Empty + complete states
│   │   ├── StatusBadge.jsx     (~30 lines)    Status indicator badge
│   │   ├── NowIndicator.jsx    (~40 lines)    "Now" timeline marker
│   │   ├── AlertCard.jsx       (~65 lines)    Info/warning/success alert card
│   │   ├── ChecklistItemRow.jsx(~111 lines)   Checkbox row with edit/delete
│   │   ├── ChecklistEditor.jsx (~212 lines)   Bottom sheet for checklist CRUD
│   │   ├── DocumentCard.jsx    (~114 lines)   Document thumbnail card
│   │   ├── DocumentUploader.jsx(~304 lines)   Bottom sheet with file upload
│   │   └── DocumentViewer.jsx  (~136 lines)   Full-screen document preview
│   │
│   ├── hooks/
│   │   ├── useTrip.js          (53 lines)     Trip-level helpers
│   │   └── useDay.js           (74 lines)     Day-level CRUD + stats
│   │
│   ├── data/
│   │   ├── sampleTrip.js       (1,021 lines)  Hawaii vacation mock data
│   │   ├── eventTypes.js       (128 lines)    Event type definitions
│   │   ├── coverImages.js      (~80 lines)    Type-based cover photo URLs + gradient fallbacks
│   │   ├── statusCategories.js (~95 lines)    Checklist + document categories
│   │   └── sampleChecklist.js  (~80 lines)    8 sample preparation items
│   │
│   └── utils/
│       ├── dateUtils.js        (~115 lines)   Date formatting, calendar grid, month nav
│       └── timeUtils.js        (78 lines)     Time formatting, event colors
│
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
        │   │   ├── TripHeader + DestinationCard + DayCard chips
        │   ├── CalendarView
        │   │   ├── TripHeader (compact) + DayCard grid + CalendarTooltip
        │   │   ├── CalendarLegend (interactive filter)
        │   │   ├── MonthSummary
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

*Updated February 2026 (v0.0.31). Standalone deployment. This document covers the complete Travel app architecture, design system (glassmorphism + clean shadows, no neumorphism), component library, interaction patterns, accessibility compliance, and technical implementation — including the Status tab with checklist management and document uploads, the redesigned Calendar view with month navigation, tooltip, and interactive legend, the image card timeline with cover photos, the event detail view, design system font compliance, and the warm-white/pure-white card convention.*

## Changelog

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
- **Design system docs:** Updated glassmorphism section with full 12-token reference table, 3-tier hierarchy diagram, component-to-token mapping.

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
- New icon colors for sightseeing (lavender), beach (aqua), hiking (emerald), shopping (rose), entertainment (purple)
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
