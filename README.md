# Travel Day Organizer

A mobile-first trip planning app for managing multi-day, multi-destination itineraries. Built for a Hawaii trip across Kauai and Maui with hour-by-hour timelines, flight tracking, weather, and packing checklists.

**[Live Demo](https://travel.cheyshen.com/)** · **[Design System](https://travel-ds.cheyshen.com/)**





<p align="center"><img src="docs/demo.webp" alt="Tour of the app: Trip, Plan, event details, checklist, Day timeline, and adding an event" width="375" /></p>





## Features

- **Trip Overview** — Destination cards per island, "Up next" event and flight cards, weather forecast, trip highlights
- **Plan** — Month calendar color-coded by island with event dots, a day summary popup, and trip-at-a-glance stats
- **Day Timeline** — Hour-by-hour itinerary on a time spine with a "Now" indicator and a Kauai/Maui switcher
- **Event Details** — Photo-forward detail page with description, place, and directions; sticker-style event-type picker in the editor
- **Status View** — Categorized packing checklists and document management (upload boarding passes, confirmations, etc.)
- **PWA** — Installable on mobile via "Add to Home Screen" with offline caching
- **Live Weather** — Real weather data via Open-Meteo API by zip code

## Tech Stack

- **React 19** + **Vite 7**
- **Tailwind CSS v4**
- **Framer Motion** — Page transitions and micro-interactions
- **Lucide React** — Icons
- **date-fns** — Date formatting and calendar grid
- **DM Sans** — Single typeface, three weights (500 / 600 / 700)

## Getting Started

```bash
npm install
npm run dev    # http://localhost:5173
```

## Build

```bash
npm run build  # Runs ESLint + Vite build
```

## Architecture

```
src/
├── App.jsx               # Root component (view router)
├── context/TripContext.jsx # Central state (useReducer + localStorage)
├── views/
│   ├── HeroView.jsx       # Trip overview
│   ├── CalendarView.jsx   # Plan tab (month calendar)
│   ├── DayTimelineView.jsx # Day itinerary
│   ├── EventDetailView.jsx # Event detail page
│   └── StatusView.jsx     # Checklists + documents
├── components/            # Reusable UI components
├── data/                  # Sample trip data, event types
├── utils/                 # Date and time utilities
├── colors.js              # Design color palette
└── styles.js              # Typography, spacing, shadow tokens
```

State-based view switching with bottom tab navigation (Trip, Plan, Add, Day, Status). All state managed via `useReducer` with debounced `localStorage` persistence.

## Screenshots

The app is designed mobile-first (max 480px) with light surfaces, color-coded islands, and photo-forward event cards.

<table>
  <tr>
    <td valign="top"><img src="docs/hero-view.png" alt="Trip Overview" width="230" /></td>
    <td valign="top"><img src="docs/calendar-view.png" alt="Plan" width="230" /></td>
    <td valign="top"><img src="docs/day-view.png" alt="Day Timeline" width="230" /></td>
    <td valign="top"><img src="docs/status-view.png" alt="Status & Checklists" width="230" /></td>
  </tr>
  <tr>
    <td align="center"><b>Trip Overview</b></td>
    <td align="center"><b>Plan</b></td>
    <td align="center"><b>Day Timeline</b></td>
    <td align="center"><b>Checklists</b></td>
  </tr>
</table>
