# CLAUDE.md - Travel Day Organizer

## Project Overview

Travel Day Organizer is a mobile-first trip planning app for managing multi-day, multi-destination itineraries. Originally prototyped inside the ui-test app, now a standalone deployment.

**Live URL:** http://192.168.1.198

## Architecture

```
travel/
├── src/
│   ├── main.jsx              # React entry point
│   ├── App.jsx               # Root component (TripProvider + view router)
│   ├── index.css             # Tailwind imports
│   ├── colors.js             # Tropical design color palette
│   ├── styles.js             # Typography, spacing, shadow tokens
│   ├── context/
│   │   └── TripContext.jsx   # Central state (useReducer + localStorage)
│   ├── views/
│   │   ├── HeroView.jsx      # Trip overview with destinations
│   │   ├── CalendarView.jsx   # Month calendar grid
│   │   ├── DayTimelineView.jsx # Hour-by-hour itinerary
│   │   └── StatusView.jsx     # Checklist + document uploads
│   ├── components/           # 17 UI components
│   ├── data/                 # Sample trip data, event types, categories
│   └── utils/                # Date and time utilities
├── package.json
├── vite.config.js
├── Dockerfile
├── nginx.conf
└── index.html
```

## Tech Stack

- **React 19** + **Vite 7**
- **Tailwind CSS v4** (via @tailwindcss/vite)
- **Framer Motion** (page transitions, animations)
- **Lucide React** (icons)
- **date-fns** (date formatting, calendar grid)

## Navigation Model

Uses internal state-based view switching (no URL routing):
- **Hero** — Trip overview with destination cards
- **Calendar** — Month grid with color-coded days
- **Day** — Hour-by-hour timeline for a single date
- **Status** — Packing checklist + document management

Bottom tab bar with 5 tabs: Trip, Calendar, Add, Day, Status.

## State Management

All state lives in `TripContext.jsx` using `useReducer`. Data persists to `localStorage` with 500ms debounced saves. Key actions: event CRUD, checklist management, document upload.

## Development

```bash
npm install
npm run dev   # http://localhost:5173
npm run build
```

## Deployment

### Local (K3s) — Default
All development and testing deploys go to the K3s cluster. This is the standard workflow.

```bash
deploy.sh travel "Description of changes"
```

Local instance: http://192.168.1.198

### Production (Hostinger) — On Request Only
The travel app is also deployed publicly to Hostinger via FTP. **Only run this when explicitly requested** — it pushes to the live internet-facing site.

```bash
cd ~/apps/travel
./deploy-prod.sh "Description of changes"
```

Production URL: https://travel.cheyshen.com/

**How it works:**
1. Runs `vite build` to produce `dist/`
2. Uploads all built files via FTP to `ftp.cheyshen.com:/Travel`
3. Verifies the site returns HTTP 200

**Credentials:** FTP creds loaded from `~/apps/travel/.env.prod` (not committed to git). Passwords stored in Vaultwarden.

**Domain tracking:** The domain-control app (192.168.1.207) tracks all Hostinger domains, environments, and deploy history.

---

# UX/UI Design Standards

> The following standards are **mandatory** when designing or modifying any UI in this app. They are sourced from Nielsen Norman Group (NN/g), WCAG 2.2, Material Design 3, Apple Human Interface Guidelines, Baymard Institute, and Smashing Magazine. Every new component, view, or interaction must comply.

---

## 1. Nielsen's 10 Usability Heuristics (Applied to Travel)

These are the foundational principles. When in doubt about a design decision, refer back here.

### H1: Visibility of System Status
**Always keep users informed about what is going on through appropriate feedback within reasonable time.**
- Display "Now" indicator on today's timeline to orient the user temporally
- Show progress bars on checklist completion (X of Y items)
- Event status badges (upcoming, done, delayed) must be visible at a glance
- **DO:** Provide immediate visual feedback on every tap (scale via `whileTap`)
- **AVOID:** Silent state changes with no visual confirmation

### H2: Match Between System and Real World
**Use language, concepts, and conventions familiar to travelers, not developer jargon.**
- Use "Check-in" / "Check-out" not "Start" / "End" for hotels
- Time formats: "6:50 AM" not "06:50:00"
- Date formats: "Saturday, March 14" not "2026-03-14"
- Use travel-specific icons (plane, hotel, dining) not abstract shapes
- Destination names, not IDs. "Kauai" not "dest-kauai"
- **DO:** Use terms from travel industry (itinerary, boarding pass, confirmation number)
- **AVOID:** Technical terms (dispatch, reducer, state, payload) in any user-facing text

### H3: User Control and Freedom
**Users need a clearly marked "emergency exit" to leave unwanted states without extended dialogue.**
- Every modal/bottom sheet must have a visible close button (X or "Cancel")
- Support back gesture to dismiss overlays (not just X button)
- Confirmation required before destructive actions (delete event via inline confirmation dialog)
- **DO:** Let users cancel mid-form without losing previously saved data
- **AVOID:** Stacking overlays on top of overlays (NN/g: increases accidental dismissal)

### H4: Consistency and Standards
**Follow platform conventions. Users should not have to wonder whether different words, situations, or actions mean the same thing.**
- All cards use the same border-radius (16px), shadow system, and left-accent pattern
- All bottom sheets use the same spring animation, drag handle, and backdrop
- Status colors are consistent everywhere: green=done, amber=warning, red=danger, blue=info
- Navigation tab behavior is identical across all tabs (same transition, same scroll reset)
- **DO:** Reuse existing component patterns from this design system
- **AVOID:** Inventing new interaction patterns when existing ones work

### H5: Error Prevention
**Prevent problems from occurring in the first place. Eliminate error-prone conditions or check for them.**
- Auto-populate sensible defaults (current date, event type)
- File upload: validate type and size (2MB document / 5MB photo) before processing, not after
- **DO:** Use constraints to make errors impossible
- **AVOID:** Relying on error messages to catch preventable mistakes

### H6: Recognition Rather Than Recall
**Minimize memory load. Make objects, actions, and options visible.**
- Show event type icons with labels in the picker (not icons alone)
- Display destination names and colors on every relevant screen
- Calendar cells show event count dots so users don't have to memorize which days are busy
- Quick-access day chips on Hero view let users jump directly without remembering dates
- **DO:** Show context (day name, destination, event count) alongside every navigation target
- **AVOID:** Requiring users to remember information from a previous screen

### H7: Flexibility and Efficiency of Use
**Shortcuts for expert users without confusing novices.**
- Two ways to add an event: nav button (any view), inline button (timeline)
- Tap calendar day cell to jump directly to that day's timeline
- Tap destination card to jump to first day at that destination
- Day navigation chevrons for sequential browsing (prev/next)
- **DO:** Provide multiple pathways to accomplish frequent tasks
- **AVOID:** Forcing all users through the same multi-step flow

### H8: Aesthetic and Minimalist Design
**Every extra unit of information competes with relevant information and diminishes relative visibility.**
- Event cards show title, time, type icon, and status. Details are on tap.
- Calendar cells show date number + event dots. Full details are one tap away.
- Hero view uses progressive disclosure: stats summary first, details on demand
- **DO:** Show the minimum information needed for scanning; expand on interaction
- **AVOID:** Cramming confirmation numbers, notes, and full addresses onto summary cards

### H9: Help Users Recognize, Diagnose, and Recover from Errors
**Error messages should be expressed in plain language, precisely indicate the problem, and constructively suggest a solution.**
- File too large: "File too large (3.2 MB). Maximum is 2 MB." (DocumentUploader) or "This file is 3.2MB. Maximum size is 5MB." (EventEditor photo)
- Errors appear inline, next to the field that caused them (not in a toast at top of screen)
- **DO:** Use specific, actionable language. Preserve user input on error.
- **AVOID:** Generic messages like "An error occurred" or "Invalid input"

### H10: Help and Documentation
**Even though it's better if the system can be used without documentation, it may be necessary to provide help.**
- Empty states include helpful CTA: "No events planned yet — tap + to add one"
- Form fields use placeholder text as hints, but always have visible labels
- First-time experience should be self-explanatory through the sample trip data
- **DO:** Use empty states as opportunities to teach
- **AVOID:** Requiring users to read instructions before they can use a feature

---

## 2. Mobile-First UI Patterns

### Touch Targets (WCAG 2.5.8 + Apple HIG + Material Design)
| Element | Minimum Size | Our Standard | Notes |
|---------|-------------|--------------|-------|
| Buttons | 44x44px (WCAG AAA) | 48x48px | Includes padding around icon |
| Nav tabs | 44px tall | 54px tall | Exceeds minimum by 23% |
| List items | 44px tall | 48px tall | Full-width tap area |
| Icon buttons | 44x44px | 44x44px with 8px spacing | Space between adjacent targets |
| Checkboxes | 22x22px visual | 44x44px tap area | Invisible touch padding |

**Rules:**
- Minimum 8px spacing between adjacent touch targets to prevent mis-taps
- Thumb-zone friendly: primary actions in bottom 60% of screen
- Interactive elements must never overlap touch areas

### Bottom Sheet Design
| Property | Value | Source |
|----------|-------|--------|
| Drag handle | 36px wide x 4px tall, centered, `colors.dragHandle` (#D6D3CE) | iOS convention |
| Border radius | 20px (top corners only) | Material Design 3 |
| Backdrop | rgba(0,0,0,0.35) | Translucent overlay |
| Animation | Spring: stiffness 300, damping 28 | Framer Motion |
| Max height | 90vh | Prevent full-screen takeover |
| Close button | Always visible, top-right | NN/g: never rely on gesture alone |

**Rules:**
- Never stack sheets on top of sheets (NN/g: accidental dismissal risk)
- Always include a visible close/cancel button alongside swipe-to-dismiss
- Lock body scroll when sheet is open

### Card Design (NN/g Card Component Guidelines)
**When to use cards:**
- Browsing heterogeneous content (different event types, destinations)
- Summary + link pattern (card shows preview, tap for full details)
- Collections where items have variable content heights

**When NOT to use cards:**
- Homogeneous lists (use list rows instead)
- Comparison tasks (use tables or aligned lists)
- Search results (cards deemphasize ranking)

**Card anatomy in this app:**
1. Left accent border (4px, colored by type/destination/status)
2. Type icon with colored background (top-left)
3. Title (primary text, sectionHeader weight)
4. Subtitle/time (secondary text)
5. Status badge (top-right)
6. Chevron indicating tappability (right edge)

**Card interaction states:**
- Default: `shadow.card`, no transform
- Hover: `shadow.cardHover`, `translateY(-3px)` (desktop)
- Press: `scale(0.98-0.99)` via `whileTap` (mobile)

### Calendar View Patterns (NN/g Date Input Guidelines)
- Calendar pickers work best for dates within ~1 year of today
- Spell out month names ("March 2026" not "03/2026")
- Color-code trip days with destination colors for instant recognition
- Show event density (dots) so users can scan busy vs free days
- Today marker (border highlight) for temporal orientation
- Non-trip days are visually muted (reduced opacity, no interaction)
- Tap a day cell to navigate directly to that day's timeline

### Timeline View Patterns
- Events ordered chronologically with consistent 10px gaps
- "Now" indicator positioned between events based on current time
- Sticky header with glassmorphic blur for day navigation
- Buffer blocks (dashed border) visually distinct from event cards
- "Next up" badge on the first upcoming event for orientation
- Empty state with CTA when no events exist
- Completion state when all events are done

### Sticky Header Rules
- `position: sticky; top: 0; z-index: 50`
- Background: semi-transparent with `backdrop-filter: blur(20px)`
- Must never obscure focused content (WCAG 2.4.11: Focus Not Obscured)
- Compact height to preserve content area (max 80px for day nav)

### Safe Area Handling
- Bottom nav padding: `calc(16px + env(safe-area-inset-bottom, 0px))`

---

## 3. Visual Design Standards

### Color System Rules

**60-30-10 Rule:**
- 60% — Background/surface colors (`glossyBg` #F0EDE8, `colors.surface` #FFFFFF)
- 30% — Secondary elements (borders, muted surfaces, secondary text)
- 10% — Accent colors (ocean teal, coral, destination colors)

**Contrast Requirements (WCAG 1.4.3 + 1.4.11):**

| Element | Minimum Ratio | Our Actual | Level |
|---------|--------------|------------|-------|
| Body text on white | 4.5:1 | 15:1 (#1A1A1A) | AAA |
| Secondary text on white | 4.5:1 | 8.3:1 (#6B6B6B) | AA |
| Muted text on white | 3:1 (large text) | 6.2:1 (#9B9B9B) | AA |
| Button text on ocean | 4.5:1 | 5.35:1 (#FFF on #0E7490) | AA |
| Nav inactive on dark | 4.5:1 | 4.5:1 (#9B9B9B on #1F2937) | AA |
| Nav active on dark | 4.5:1 | 13.5:1 (#FFF on #1F2937) | AAA |
| Non-text elements | 3:1 | Verify per component | AA |

**Color-Blind Safety (WCAG 1.4.1: Use of Color):**
- NEVER use color as the sole indicator of status, state, or meaning
- Always pair color with: text label, icon, pattern, or position
- Event status uses: colored border + text badge + icon (triple encoding)
- Destination coding uses: color + name label + map pin icon

**Semantic Status Colors:**

| Status | Primary | Light BG | Text On Light | Icon |
|--------|---------|----------|---------------|------|
| Success/Done | #27815B | #E8F5E9 | #27815B | CheckCircle |
| Warning | #D97B2B | #FFF3E0 | #D97B2B | AlertTriangle |
| Danger/Error | #C0392B | #FDECEA | #C0392B | XCircle |
| Info | #2B7A9E | #E0F1F8 | #2B7A9E | Info |

### Typography Standards

**Type Ramp (based on iOS HIG + Material Design 3):**

| Style | Size | Weight | Line Height | Use |
|-------|------|--------|-------------|-----|
| hero | 42px | 700 | 48px | Page titles only |
| title | 28px | 700 | 34px | Section titles |
| sectionHeader | 18px | 600 | 24px | Card headers, subsections |
| body | 15px | 400 | 22px | Primary content |
| bodyMedium | 15px | 500 | 22px | Emphasized body text |
| helper | 13px | 400 | 18px | Secondary info, metadata |
| caption | 11px | 500 | 14px | Labels, tags (UPPERCASE) |

**Typography Rules:**
- Never go below 11px (Apple HIG minimum; WCAG readability)
- Use a single font family (Inter) — mixing fonts looks fragmented
- Use weight, size, and color to create hierarchy (not decoration)
- Line height should be 1.4-1.6x the font size for body text
- Avoid Ultralight/Thin weights (Apple HIG: not user-friendly)
- Maximum 3-4 sizes visible simultaneously on one screen
- Long text: max 65-75 characters per line for readability

### Spacing System (8px Grid)

| Token | Value | Use |
|-------|-------|-----|
| xxs | 2px | Micro-gaps (icon-to-label) |
| xs | 4px | Tight internal padding |
| sm | 8px | Component internal spacing |
| md | 12px | List gaps, medium padding |
| lg | 16px | Section spacing, card padding |
| xl | 24px | Large section separation |
| xxl | 32px | Major layout gaps |
| xxxl | 48px | Full-section spacing |

**Rules:**
- All spacing values must be multiples of 4px (base unit)
- Consistent padding within component types (all cards use `lg` padding)
- White space = luxury. When in doubt, add more space, not less.
- Related items: 8-12px apart. Unrelated sections: 24-32px apart.

### Shadow & Elevation

| Token | Shadow | Use |
|-------|--------|-----|
| flat | none | Inline elements, text |
| `sm`/`card` | `0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)` | Cards at rest |
| `md` | `0 4px 12px rgba(0,0,0,0.08)` | Cards on hover, elevated cards |
| `cardHover` | `0 4px 16px rgba(0,0,0,0.1)` | Card hover state |
| `glass` | `0 2px 8px rgba(0,0,0,0.06)` | Glass card box shadow |
| `accentGlow` | `0 2px 8px rgba(14,116,144,0.25)` | CTA button glow |
| `accentGlowStrong` | `0 4px 16px rgba(14,116,144,0.4)` | Nav Add button glow |
| Navigation | `0 8px 32px rgba(0,0,0,0.25)` | Bottom nav bar (via `glass.nav`) |

**Rules:**
- Shadows should be soft and diffuse, never harsh (this is a luxury aesthetic)
- Only increase shadow on interaction (hover/focus), never decrease
- Text over images requires a scrim: `scrimGradient` token from styles.js

### Border & Divider Guidelines
- Use borders (1px solid #E2E0DB) sparingly — prefer spacing for separation
- Left accent borders (4px) for category/status identification on cards
- Dividers between list items: full-bleed, 1px, #F0EFEA (very subtle)
- If a layout needs many dividers, fix the hierarchy first (spacing, type scale, grouping)

### Icon Standards
- Size: 20-24px for UI icons, 16px inline with text
- Stroke width: 1.5 (inactive), 2.0 (active/emphasis)
- Always pair with text labels (NN/g: icon-only navigation is problematic)
- Set `aria-hidden="true"` when adjacent text provides meaning
- Color: inherit from parent text color, or use accent for interactive

---

## 4. Motion & Animation Standards

### Core Principle
**Animation must be functional, not decorative.** Every animation should serve one of four purposes (NN/g):
1. **Feedback** — Confirm the system recognized user input
2. **State change** — Communicate mode transitions
3. **Spatial navigation** — Clarify position in information hierarchy
4. **Interaction signifier** — Teach users how to interact

If an animation doesn't serve one of these, remove it.

### Timing Reference

| Duration | Use Case |
|----------|----------|
| 150ms | Page exit animations |
| 200ms | Color transitions, tab highlights |
| 250ms | Page enter, card reveals |

**Rules:**
- Exit animations should be faster than enter animations (150ms exit, 250ms enter)
- Button press feedback: instant (`whileTap`, no delay)
- Bottom sheets use spring physics (stiffness 300, damping 28) instead of fixed duration

### Spring Configurations

| Use Case | Stiffness | Damping | Easing | Feel |
|----------|-----------|---------|--------|------|
| Bottom sheet slide | 300 | 28 | spring | Smooth, no bounce |
| Tooltip reveal | 400 | 28 | spring | Snappy popup |
| Page transition | — | — | 250ms `easeOut` | Duration-based |

### Page Transitions
```jsx
const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.15 } },
}
// Use with AnimatePresence mode="wait"
```

### Micro-Interaction Values

| Interaction | Property | Value | Element |
|------------|----------|-------|---------|
| Hover lift | translateY | -3px | Destination cards |
| Hover scale | scale | 1.01 | Event cards, buffer blocks |
| Press | scale | 0.93 | Calendar cells (high confidence) |
| Press | scale | 0.95 | Day chips |
| Press | scale | 0.97-0.99 | Event cards (subtle) |
| Active indicator | width/opacity | 20px / 1.0 | Nav tab dot |

### Performance Rules
- **ONLY animate GPU-accelerated properties:** `opacity`, `transform` (translate, scale, rotate)
- **NEVER animate:** `width`, `height`, `top`, `left`, `padding`, `margin` (triggers layout reflow)
- `filter` (blur, drop-shadow) is accelerated in modern browsers — use sparingly
- Maximum 480px viewport prevents cascading reflows
- No `layout` prop on elements inside flex containers (causes wobble)
- Target 60fps: each frame must complete in <16.7ms
- Test on mid-range devices, not just dev machines

### Reduced Motion (WCAG 2.3.3 + Framer Motion)
```jsx
// Wrap app root for global reduced motion support:
<MotionConfig reducedMotion="user">
```
- When reduced motion is enabled: `transform` and `layout` animations are disabled
- `opacity` and `backgroundColor` animations persist (these are generally safe)
- Always provide instant state changes as fallback
- Never use parallax, auto-playing animations, or flashing without reduced-motion alternative

---

## 5. Accessibility Standards (WCAG 2.2 AA)

### Focus Management
- View changes reset scroll to top via `window.scrollTo(0, 0)`
- Roving tabindex on nav tabs: only active tab in document tab order (`tabIndex={isActive ? 0 : -1}`)
- Interactive cards use `tabIndex={0}` for keyboard access

### ARIA Patterns Used

| Component | ARIA Pattern | Attributes |
|-----------|-------------|------------|
| Bottom nav | Tablist | `role="tablist"`, `role="tab"`, `aria-selected` |
| Event cards | Button | `role="button"`, `tabIndex={0}` |
| Icons | Decorative | `aria-hidden="true"` (text labels carry meaning) |
| Buttons | Labeled | `aria-label` on icon-only buttons (camera, edit, delete, toggle) |

### Form Accessibility

**Labels:**
- Form inputs have visible `<label>` elements via FieldGroup wrapper component
- File upload errors shown inline with specific messages (e.g. "This file is 3.2MB. Maximum size is 5MB.")

### Keyboard Navigation
- Roving tabindex on nav tabs: only active tab in tab order
- Escape closes CalendarTooltip
- Interactive cards have `tabIndex={0}` for Tab key access

### WCAG 2.2 Compliance

| Criterion | Level | Status |
|-----------|-------|--------|
| 2.5.8 Target Size (Minimum) | AA | Met — touch targets 44-54px, exceeds 24px minimum |

### Color Accessibility
- Never rely on color alone (1.4.1): Status always uses color + text + icon
- Destination coding uses color + name label + map pin icon (triple encoding)

---

## 6. Content & Information Architecture

### Progressive Disclosure (NN/g)
Mobile viewing is "looking through a peephole" — show minimum viable information first, details on demand.

**Level 1 — Scan (Hero/Calendar):**
- Trip name, dates, destination count
- Day numbers with event density dots
- High-level stats (X days, Y events, Z islands)

**Level 2 — Browse (Day Timeline):**
- Event title, time, type, status
- Destination name and day label
- "Next up" indicator for orientation

**Level 3 — Detail (Event Editor / Document Viewer):**
- Full event details: location, confirmation number, notes, timezone
- Document preview at full size
- Edit/delete capabilities

### Card Information Density
**Event Card (Level 2):** Show only title, time, type icon, status badge, chevron
**Do NOT show on card:** Confirmation numbers, full addresses, notes, timezone details
**Show on tap (Level 3):** Everything above in the EventEditor bottom sheet

### Empty States as Teaching Moments
Every empty state must include:
1. An illustrative icon or graphic (not just text)
2. A clear explanation of what belongs here
3. A primary CTA to add the first item
4. Example: "No events planned yet" + palm tree icon + "Add your first event" button

---

## 7. Overlay & Modal Best Practices (NN/g)

### Preventing Accidental Dismissal
- Prefer partial overlays (bottom sheets) over full-screen — users recognize them as distinct from pages
- Never stack overlays (sheets on sheets) — increases accidental full-stack dismissal
- Include visible close button (X) alongside backdrop tap to dismiss

### Bottom Sheet Checklist
- [ ] Drag handle visible at top
- [ ] Close/cancel button visible
- [ ] Body scroll locked
- [ ] Backdrop click dismisses (unless form has changes)
- [ ] Spring animation on open/close (stiffness 300, damping 28)
- [ ] Max height 90vh

### Delete Confirmation Pattern
1. User taps delete icon
2. Inline confirmation appears (not a separate modal): "Delete '[Title]'?"
3. Two buttons: "Cancel" (secondary) and "Delete" (danger red)
4. Confirmation auto-dismisses on cancel
5. Animation: opacity + translateY reveal (200ms)

---

## 8. Error Handling Standards (NN/g)

### Error Message Format
```
[Icon] [Specific problem description]
[Suggested fix or action]
```

### Error Message Rules
1. **Visible:** Bold, high-contrast, near the error source
2. **Specific:** "Event title can't be empty" not "Required field"
3. **Constructive:** Tell users HOW to fix it, not just what's wrong
4. **Non-judgmental:** "Please enter a title" not "Invalid input"
5. **Preserving:** Never clear user input on error
6. **Timed right:** Show on blur or submit, never mid-typing

### Severity-Based Display
| Severity | Display Method | Example |
|----------|---------------|---------|
| Moderate | Inline error text | "This file is 3.2MB. Maximum size is 5MB." |
| Severe | AlertCard component | Info, warning, or success alerts with icon + title + message |

---

## 9. Design Quality Checklist

Before shipping any UI change, verify:

### Visual
- [ ] Colors from `colors.js` only (no hardcoded hex values)
- [ ] Typography from `styles.js` only (no arbitrary font sizes)
- [ ] Spacing uses tokens from `styles.js` (multiples of 4px)
- [ ] Shadows from `shadows` object only
- [ ] Border radius from `radius` object only
- [ ] Max width 480px enforced on all containers

### Interaction
- [ ] All interactive elements have visible hover/focus/active states
- [ ] Touch targets >= 44x44px with >= 8px spacing
- [ ] Tap feedback via `whileTap` scale (0.93-0.99 depending on context)
- [ ] Animations use GPU-accelerated properties only (transform, opacity)
- [ ] Page transitions use `pageVariants` pattern with `AnimatePresence`
- [ ] Bottom sheets include drag handle, close button, body scroll lock

### Accessibility
- [ ] Color contrast ratios meet WCAG AA minimums (4.5:1 text, 3:1 non-text)
- [ ] No information conveyed by color alone (always text + icon backup)
- [ ] All images/icons have appropriate `alt`/`aria-hidden` attributes
- [ ] Form inputs have visible labels (not just placeholders)
- [ ] Error messages are inline, specific, and constructive
- [ ] Keyboard-accessible: interactive elements have `tabIndex={0}`
- [ ] `<MotionConfig reducedMotion="user">` wraps app root

### Content
- [ ] User-facing text uses plain language (no technical jargon)
- [ ] Empty states include explanation + CTA
- [ ] Dates/times formatted for humans (not ISO strings)
- [ ] Destructive actions require confirmation

---

*Updated February 2026. Standards sourced from: Nielsen Norman Group (NN/g), WCAG 2.2, Material Design 3, Apple Human Interface Guidelines, Baymard Institute, Smashing Magazine, and Framer Motion documentation.*
