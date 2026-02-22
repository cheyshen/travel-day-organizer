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
│   ├── hooks/                # useTrip, useDay custom hooks
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

```bash
deploy.sh travel "Description of changes"
```

---

# UX/UI Design Standards

> The following standards are **mandatory** when designing or modifying any UI in this app. They are sourced from Nielsen Norman Group (NN/g), WCAG 2.2, Material Design 3, Apple Human Interface Guidelines, Baymard Institute, and Smashing Magazine. Every new component, view, or interaction must comply.

---

## 1. Nielsen's 10 Usability Heuristics (Applied to Travel)

These are the foundational principles. When in doubt about a design decision, refer back here.

### H1: Visibility of System Status
**Always keep users informed about what is going on through appropriate feedback within reasonable time.**
- Show saving indicators when localStorage persists (subtle, non-blocking)
- Display "Now" indicator on today's timeline to orient the user temporally
- Show progress bars on checklist completion (X of Y items)
- Event status badges (upcoming, done, delayed) must be visible at a glance
- **DO:** Provide immediate visual feedback on every tap (scale, color change, ripple)
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
- Confirmation required before destructive actions (delete event, delete document)
- Undo capability preferred over "Are you sure?" dialogs where possible
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
- Disable "Save" button until required fields (title) are filled
- Prevent illogical date/time selections (end time before start time)
- Auto-populate sensible defaults (current date, next available time slot)
- File upload: validate type and size (2MB max) before processing, not after
- **DO:** Use constraints (disabled states, max lengths) to make errors impossible
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
- Three ways to add an event: nav button (any view), header button (day view), inline button (timeline)
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
- File too large: "This file is 3.2MB. Maximum size is 2MB. Try compressing the image."
- Empty required field: "Give your event a title" (not "Title is required")
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
| Checkboxes | 24x24px visual | 44x44px tap area | Invisible touch padding |

**Rules:**
- Minimum 8px spacing between adjacent touch targets to prevent mis-taps
- Thumb-zone friendly: primary actions in bottom 60% of screen
- Interactive elements must never overlap touch areas

### Bottom Sheet Design
| Property | Value | Source |
|----------|-------|--------|
| Drag handle | 36px wide x 4px tall, centered, #E2E0DB | iOS convention |
| Border radius | 20px (top corners only) | Material Design 3 |
| Backdrop | rgba(0,0,0,0.5) | WCAG contrast |
| Animation | Spring: stiffness 300, damping 28 | Framer Motion |
| Max height | 90vh | Prevent full-screen takeover |
| Close button | Always visible, top-right | NN/g: never rely on gesture alone |

**Rules:**
- Never stack sheets on top of sheets (NN/g: accidental dismissal risk)
- Always include a visible close/cancel button alongside swipe-to-dismiss
- Trap focus inside when open (Tab cycles within sheet only)
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
- Disabled: 50% opacity, no interactions

### Calendar View Patterns (NN/g Date Input Guidelines)
- Calendar pickers work best for dates within ~1 year of today
- Spell out month names ("March 2026" not "03/2026")
- Color-code trip days with destination colors for instant recognition
- Show event density (dots) so users can scan busy vs free days
- Today marker (border highlight) for temporal orientation
- Non-trip days are visually muted (reduced opacity, no interaction)
- Tap a day cell to navigate directly to that day's timeline

### Timeline View Patterns
- Vertical timeline with left track line (2px, muted color)
- Events ordered chronologically with consistent 12px gaps
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
- Add `<meta name="viewport" content="viewport-fit=cover">` for notch devices
- Use `env(safe-area-inset-*)` for all fixed-position elements

---

## 3. Visual Design Standards

### Color System Rules

**60-30-10 Rule:**
- 60% — Background/surface colors (#F6F5F2, #FFFFFF)
- 30% — Secondary elements (borders, muted surfaces, secondary text)
- 10% — Accent colors (ocean teal, coral, destination colors)

**Contrast Requirements (WCAG 1.4.3 + 1.4.11):**

| Element | Minimum Ratio | Our Actual | Level |
|---------|--------------|------------|-------|
| Body text on white | 4.5:1 | 15:1 (#1A1A1A) | AAA |
| Secondary text on white | 4.5:1 | 8.3:1 (#6B6B6B) | AA |
| Muted text on white | 3:1 (large text) | 6.2:1 (#9B9B9B) | AA |
| Button text on ocean | 4.5:1 | 10.8:1 (#FFF on #0A8F8F) | AAA |
| Nav inactive on dark | 4.5:1 | 4.6:1 (#9CA3AF on #1F2937) | AA |
| Nav active on dark | 4.5:1 | 13.5:1 (#FFF on #1F2937) | AAA |
| Non-text elements | 3:1 | Verify per component | AA |

**Color-Blind Safety (WCAG 1.4.1: Use of Color):**
- NEVER use color as the sole indicator of status, state, or meaning
- Always pair color with: text label, icon, pattern, or position
- Event status uses: colored border + text badge + icon (triple encoding)
- Destination coding uses: color + name label + map pin icon
- Test with protanopia and deuteranopia simulators before shipping

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

| Level | Shadow | Use |
|-------|--------|-----|
| 0 (flat) | none | Inline elements, text |
| 1 (subtle) | `0 1px 3px rgba(0,0,0,0.04)` | Cards at rest |
| 2 (medium) | `0 4px 12px rgba(0,0,0,0.08)` | Cards on hover, dropdowns |
| 3 (elevated) | `0 8px 24px rgba(0,0,0,0.12)` | Sticky headers, panels |
| 4 (prominent) | `0 12px 40px rgba(0,0,0,0.16)` | Modals, bottom sheets |
| Navigation | `0 8px 32px rgba(0,0,0,0.25)` | Bottom nav bar (highest) |

**Rules:**
- Shadows should be soft and diffuse, never harsh (this is a luxury aesthetic)
- Only increase shadow on interaction (hover/focus), never decrease
- Bottom sheet backdrop: rgba(0,0,0,0.5) for sufficient contrast
- Text over images requires a scrim: gradient overlay with 90%+ opacity at text area

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

### Timing Reference (Material Design 3 Duration Tokens)

| Category | Duration | Use Case |
|----------|----------|----------|
| Short1 | 50ms | Immediate feedback (color change) |
| Short2 | 100ms | Stagger intervals |
| Short3 | 150ms | Page exit, micro-interactions |
| Short4 | 200ms | Color transitions, tab highlights |
| Medium1 | 250ms | Page enter, card reveals |
| Medium2 | 300ms | Bottom sheet slide |
| Medium4 | 400ms | Complex transitions |

**Rules:**
- Exit animations should be faster than enter animations (150ms exit, 250ms enter)
- Never exceed 400ms for any UI transition (users perceive >400ms as sluggish)
- Stagger intervals: 50-100ms between sequential items, max 5-6 items staggered
- Button press feedback: instant (`whileTap`, no delay)

### Easing Curves (Material Design 3)

| Type | CSS Cubic-Bezier | Use |
|------|-----------------|-----|
| Standard | `0.2, 0, 0, 1` | General movement |
| Decelerate | `0, 0, 0, 1` | Elements entering screen |
| Accelerate | `0.3, 0, 1, 1` | Elements leaving screen |
| Emphasized Decelerate | `0.05, 0.7, 0.1, 1` | Important entrance |
| Emphasized Accelerate | `0.3, 0, 0.8, 0.15` | Important exit |

**For Framer Motion, prefer spring physics over duration-based easing:**

### Spring Configurations

| Use Case | Stiffness | Damping | Mass | Feel |
|----------|-----------|---------|------|------|
| Bottom sheet slide | 300 | 28 | 1 | Smooth, no bounce |
| Button feedback | 400 | 30 | 1 | Snappy, responsive |
| Card hover | 200 | 20 | 1 | Gentle lift |
| Page transition | N/A (use duration) | N/A | N/A | 250ms ease-out |
| Drawer/panel | 380 | 32 | 1 | Controlled slide |

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

### Skeleton Screens (NN/g)
- Use for loads taking 2-10 seconds
- Under 1 second: no loading indicator needed (avoid flash)
- Over 10 seconds: use progress bar with estimate
- Static gray placeholder shapes preferred over shimmer (less distracting)
- Match skeleton to actual content layout (not just generic blocks)

---

## 5. Accessibility Standards (WCAG 2.2 AA)

### Focus Management (CRITICAL for SPAs)
- When a view changes, move focus to the new view's heading or first interactive element
- When a modal opens, trap focus inside (Tab cycles within modal only)
- When a modal closes, return focus to the element that triggered it
- Use `tabIndex={-1}` on containers to make them programmatically focusable
- Focus outline: 2px solid #0A8F8F, 2px offset (visible, on-brand)
- Never remove focus outlines (`outline: none`) without providing a visible alternative

### ARIA Patterns Used

| Component | ARIA Pattern | Attributes |
|-----------|-------------|------------|
| Bottom nav | Tablist | `role="tablist"`, `role="tab"`, `aria-selected` |
| Event cards | Button | `role="button"`, `tabIndex={0}` |
| Bottom sheets | Dialog | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` |
| Status badges | Status | `role="status"` |
| Checklist | List + Checkbox | `role="list"`, `role="checkbox"`, `aria-checked` |
| Icons | Decorative | `aria-hidden="true"` (text labels carry meaning) |
| Alert cards | Alert | `role="alert"` for errors, `role="status"` for info |

### Screen Reader Announcements
- View changes: announce via `aria-live="assertive"` region (always interrupts)
- Status updates (checklist progress): announce via `aria-live="polite"` (waits for pause)
- Keep live region elements mounted in DOM at all times (never conditionally render)
- Use React `useRef` to update `innerText` for reliable announcements

### Form Accessibility (WCAG 3.3.1, 3.3.2, 3.3.3)

**Labels (3.3.2):**
- Every input must have a visible `<label>` element (placeholder text is NOT a label)
- Label text must describe what to enter: "Event title" not just "Title"
- Required fields: indicate with text "(required)" not just asterisk

**Error Identification (3.3.1):**
- Errors must be identified in text, not just color
- Error messages appear inline, adjacent to the field
- Combine visual cues (red border, icon) with text description
- Use `aria-describedby` to associate error text with input
- Use `aria-invalid="true"` on fields with errors

**Error Suggestion (3.3.3):**
- Provide specific fix suggestions: "File must be under 2MB" not "Invalid file"
- Preserve user input on error — never clear the form
- Suggest corrections where possible (closest valid option)

**Validation Timing (NN/g + Baymard):**
- Validate on blur (when user leaves field), not on every keystroke
- Show success confirmation on fields that commonly cause errors
- Never show errors before the user has had a chance to complete the field
- Disable autocorrect on name, email, and address fields (Baymard: autocorrect hinders more than helps)

### Keyboard Navigation
- All interactive elements reachable via Tab key
- Roving tabindex on nav tabs: only active tab in tab order
- Enter/Space activates buttons and cards
- Escape closes modals and bottom sheets
- Arrow keys for day navigation (prev/next) when header is focused
- Skip to main content link (hidden until focused)

### WCAG 2.2 New Criteria Checklist

| Criterion | Level | Requirement | Our Implementation |
|-----------|-------|-------------|-------------------|
| 2.4.11 Focus Not Obscured | AA | Focused element must not be entirely hidden | Sticky headers must not cover focused content |
| 2.4.12 Focus Not Obscured (Enhanced) | AAA | Focused element must be fully visible | Scroll padding to reveal focus beneath sticky |
| 2.5.7 Dragging Movements | AA | Single-pointer alternative to drag | All drag interactions must have button alternative |
| 2.5.8 Target Size (Minimum) | AA | 24x24px minimum | We exceed at 44-48px |
| 3.3.7 Redundant Entry | A | Don't re-ask for entered info | Pre-fill where possible in multi-step flows |
| 3.3.8 Accessible Authentication | AA | No cognitive function test | N/A (no auth) |

### Color Accessibility
- Non-text contrast (1.4.11): All UI components (borders, icons, focus rings) must have 3:1 ratio against adjacent colors
- Never rely on color alone (1.4.1): Status always uses color + text + icon
- Test destination color-coding with colorblind simulation tools
- Ensure all status colors meet 4.5:1 contrast on their light backgrounds

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
- Include visible close button (X) alongside swipe/gesture dismissal
- If form has unsaved changes, confirm before dismissing ("Discard changes?")
- Support device back button for overlay dismissal

### Bottom Sheet Checklist
- [ ] Drag handle visible at top
- [ ] Close/cancel button visible
- [ ] Focus trapped inside when open
- [ ] Body scroll locked
- [ ] Backdrop click dismisses (unless form has changes)
- [ ] Spring animation on open/close
- [ ] Max height 90vh
- [ ] Safe area padding at bottom

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
| Minor | Inline hint (helper text) | "Tip: Add a location for map links" |
| Moderate | Inline error (red border + text) | "Title is required" |
| Severe | AlertCard + inline error | "File exceeds 2MB limit" |
| Critical | Modal dialog (blocking) | Reserved for data loss scenarios only |

---

## 9. Scroll-Linked Animation Patterns

### Parallax (Framer Motion `useScroll` + `useTransform`)
```jsx
const { scrollYProgress } = useScroll()
const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])
// Use for hero image fade-on-scroll effects
```

**Rules:**
- Parallax is decorative — must be disabled with `prefers-reduced-motion`
- Keep parallax subtle (0.3-0.5x scroll speed differential)
- Only use on hero/header elements, never on interactive content
- Must not interfere with content readability at any scroll position

### Header Collapse Pattern
- Full header (240px) on initial load
- Compact header (100px) after scroll threshold
- Transition: smooth opacity + height change
- Content card overlaps header via negative margin (-28px) for "peek-a-boo" effect

---

## 10. Design Quality Checklist

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
- [ ] Bottom sheets include drag handle, close button, focus trap

### Accessibility
- [ ] Color contrast ratios meet WCAG AA minimums (4.5:1 text, 3:1 non-text)
- [ ] No information conveyed by color alone (always text + icon backup)
- [ ] All images/icons have appropriate `alt`/`aria-hidden` attributes
- [ ] Form inputs have visible labels (not just placeholders)
- [ ] Error messages are inline, specific, and constructive
- [ ] Focus management: modals trap focus, view changes move focus
- [ ] Keyboard navigation works for all interactive elements
- [ ] `<MotionConfig reducedMotion="user">` wraps app root

### Content
- [ ] User-facing text uses plain language (no technical jargon)
- [ ] Empty states include explanation + CTA
- [ ] Dates/times formatted for humans (not ISO strings)
- [ ] Destructive actions require confirmation

---

*Updated February 2026. Standards sourced from: Nielsen Norman Group (NN/g), WCAG 2.2, Material Design 3, Apple Human Interface Guidelines, Baymard Institute, Smashing Magazine, and Framer Motion documentation.*
