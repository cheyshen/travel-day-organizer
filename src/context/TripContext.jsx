import { createContext, useContext, useReducer, useEffect, useRef } from 'react'
import { sampleTrip, sampleDays } from '../data/sampleTrip'
import { sampleChecklist } from '../data/sampleChecklist'

// =============================================================================
// TRIP CONTEXT — State management with localStorage persistence
// =============================================================================

const STORAGE_KEY = 'travel-trip-state'
const DATA_VERSION = 5 // Bump to invalidate cached localStorage

const TripContext = createContext(null)

// =============================================================================
// DATE SHIFTING — When the trip is over, shift all dates forward so the trip
// always starts in the near future. Preserves the same day-of-week alignment.
// =============================================================================

function getTodayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function isTripOver() {
  return getTodayStr() > sampleTrip.endDate
}

/** Add `days` to a YYYY-MM-DD string, return new YYYY-MM-DD */
function addDaysToDate(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Shift ISO datetime (e.g. 2026-03-14T06:50:00-05:00) by N days, preserve time+tz */
function shiftISODateTime(isoStr, days) {
  if (!isoStr || !isoStr.includes('T')) return isoStr
  const datepart = isoStr.slice(0, 10) // YYYY-MM-DD
  const rest = isoStr.slice(10)         // T06:50:00-05:00
  return addDaysToDate(datepart, days) + rest
}

/**
 * Compute how many days to shift the trip so it starts in the near future.
 * Finds the next occurrence of the same weekday as the original start date,
 * at least 3 days from today.
 */
function computeShiftDays() {
  const today = new Date(getTodayStr() + 'T00:00:00')
  const origStart = new Date(sampleTrip.startDate + 'T00:00:00')
  const origDow = origStart.getDay() // day-of-week (0=Sun)

  // Start searching from 3 days ahead
  const candidate = new Date(today)
  candidate.setDate(candidate.getDate() + 3)
  // Advance to matching day-of-week
  while (candidate.getDay() !== origDow) {
    candidate.setDate(candidate.getDate() + 1)
  }

  const diffMs = candidate.getTime() - origStart.getTime()
  return Math.round(diffMs / (1000 * 60 * 60 * 24))
}

/** Deep-clone the sample trip data with all dates shifted forward */
function buildShiftedData(shiftDays) {
  // Shift trip-level dates
  const trip = {
    ...sampleTrip,
    startDate: addDaysToDate(sampleTrip.startDate, shiftDays),
    endDate: addDaysToDate(sampleTrip.endDate, shiftDays),
    destinations: sampleTrip.destinations.map(dest => ({
      ...dest,
      startDate: addDaysToDate(dest.startDate, shiftDays),
      endDate: addDaysToDate(dest.endDate, shiftDays),
    })),
  }

  // Shift day keys and all event datetimes
  const days = {}
  for (const [dateKey, day] of Object.entries(sampleDays)) {
    const newDateKey = addDaysToDate(dateKey, shiftDays)
    days[newDateKey] = {
      ...day,
      date: newDateKey,
      events: day.events.map(event => ({
        ...event,
        startTime: shiftISODateTime(event.startTime, shiftDays),
        endTime: shiftISODateTime(event.endTime, shiftDays),
        status: 'upcoming',
      })),
    }
  }

  return { trip, days }
}

// Initial state
function getInitialState() {
  const today = getTodayStr()

  // Try loading saved state first
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed.trip?.id === sampleTrip.id && parsed._dataVersion === DATA_VERSION) {
        // Check if the SAVED trip is still valid (not over yet)
        if (today <= parsed.trip.endDate) {
          const defaults = {
            trip: parsed.trip,
            days: parsed.days,
            selectedDate: parsed.trip.startDate,
            activeView: 'hero',
            selectedEventId: null,
            checklistItems: sampleChecklist,
            documents: [],
            destImages: {},
            weatherZipCode: '',
            weatherData: {},
          }
          return { ...defaults, ...parsed }
        }
        // Saved trip is over — fall through to re-shift
      }
    }
  } catch (e) { /* ignore */ }

  // No valid saved data, or saved trip ended — compute fresh data
  const shouldShift = isTripOver()

  const { trip, days } = shouldShift
    ? buildShiftedData(computeShiftDays())
    : { trip: sampleTrip, days: sampleDays }

  const defaults = {
    trip,
    days,
    selectedDate: trip.startDate,
    activeView: 'hero',
    selectedEventId: null,
    checklistItems: sampleChecklist.map(item =>
      shouldShift ? { ...item, completed: false, completedAt: null } : item
    ),
    documents: [],
    destImages: {},
    weatherZipCode: '',
    weatherData: {},
  }

  if (shouldShift) {
    localStorage.removeItem(STORAGE_KEY)
  }

  return defaults
}

// Reducer
function tripReducer(state, action) {
  switch (action.type) {
    case 'SET_SELECTED_DATE':
      return { ...state, selectedDate: action.payload }

    case 'SET_ACTIVE_VIEW':
      return { ...state, previousView: state.activeView, activeView: action.payload }

    case 'SET_SELECTED_EVENT':
      return { ...state, selectedEventId: action.payload }

    case 'ADD_EVENT': {
      const { date, event } = action.payload
      const day = state.days[date]
      if (!day) return state
      const events = [...day.events, event].sort((a, b) =>
        (a.startTime || '').localeCompare(b.startTime || '')
      )
      return {
        ...state,
        days: { ...state.days, [date]: { ...day, events } },
      }
    }

    case 'UPDATE_EVENT': {
      const { date, eventId, updates } = action.payload
      const day = state.days[date]
      if (!day) return state
      return {
        ...state,
        days: {
          ...state.days,
          [date]: {
            ...day,
            events: day.events.map(e => e.id === eventId ? { ...e, ...updates } : e),
          },
        },
      }
    }

    case 'DELETE_EVENT': {
      const { date, eventId } = action.payload
      const day = state.days[date]
      if (!day) return state
      return {
        ...state,
        days: {
          ...state.days,
          [date]: {
            ...day,
            events: day.events.filter(e => e.id !== eventId),
          },
        },
      }
    }

    case 'SET_EVENT_STATUS': {
      const { date, eventId, status } = action.payload
      const day = state.days[date]
      if (!day) return state
      return {
        ...state,
        days: {
          ...state.days,
          [date]: {
            ...day,
            events: day.events.map(e => e.id === eventId ? { ...e, status } : e),
          },
        },
      }
    }

    case 'REORDER_EVENTS': {
      const { date, events } = action.payload
      const day = state.days[date]
      if (!day) return state
      return {
        ...state,
        days: {
          ...state.days,
          [date]: { ...day, events },
        },
      }
    }

    case 'UPDATE_DAY': {
      const { date, updates } = action.payload
      const day = state.days[date]
      if (!day) return state
      return {
        ...state,
        days: { ...state.days, [date]: { ...day, ...updates } },
      }
    }

    // === Checklist actions ===
    case 'ADD_CHECKLIST_ITEM':
      return {
        ...state,
        checklistItems: [...state.checklistItems, action.payload],
      }

    case 'UPDATE_CHECKLIST_ITEM':
      return {
        ...state,
        checklistItems: state.checklistItems.map(item =>
          item.id === action.payload.id ? { ...item, ...action.payload.updates } : item
        ),
      }

    case 'DELETE_CHECKLIST_ITEM':
      return {
        ...state,
        checklistItems: state.checklistItems.filter(item => item.id !== action.payload),
      }

    case 'TOGGLE_CHECKLIST_ITEM':
      return {
        ...state,
        checklistItems: state.checklistItems.map(item =>
          item.id === action.payload
            ? { ...item, completed: !item.completed, completedAt: !item.completed ? new Date().toISOString() : null }
            : item
        ),
      }

    // === Document actions ===
    case 'ADD_DOCUMENT':
      return {
        ...state,
        documents: [...state.documents, action.payload],
      }

    case 'UPDATE_DOCUMENT':
      return {
        ...state,
        documents: state.documents.map(doc =>
          doc.id === action.payload.id ? { ...doc, ...action.payload.updates } : doc
        ),
      }

    case 'DELETE_DOCUMENT':
      return {
        ...state,
        documents: state.documents.filter(doc => doc.id !== action.payload),
      }

    case 'UPDATE_TRIP':
      return {
        ...state,
        trip: { ...state.trip, ...action.payload },
      }

    case 'SET_HERO_IMAGE':
      return { ...state, heroImage: action.payload }

    case 'SET_DEST_IMAGE': {
      const { destId, dataUrl } = action.payload
      return { ...state, destImages: { ...state.destImages, [destId]: dataUrl } }
    }

    case 'SET_WEATHER_ZIP':
      return { ...state, weatherZipCode: action.payload }

    case 'SET_WEATHER_DATA':
      return { ...state, weatherData: action.payload }

    case 'RESET':
      localStorage.removeItem(STORAGE_KEY)
      return {
        trip: sampleTrip,
        days: sampleDays,
        selectedDate: sampleTrip.startDate,
        activeView: 'hero',
        selectedEventId: null,
        checklistItems: sampleChecklist,
        documents: [],
      }

    default:
      return state
  }
}

// Provider
export function TripProvider({ children }) {
  const [state, dispatch] = useReducer(tripReducer, null, getInitialState)
  const saveTimer = useRef(null)

  // Debounced save to localStorage
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, _dataVersion: DATA_VERSION }))
      } catch (e) { /* storage full */ }
    }, 500)
    return () => clearTimeout(saveTimer.current)
  }, [state])

  return (
    <TripContext.Provider value={{ state, dispatch }}>
      {children}
    </TripContext.Provider>
  )
}

// Hook
export function useTripContext() {
  const ctx = useContext(TripContext)
  if (!ctx) throw new Error('useTripContext must be used within TripProvider')
  return ctx
}
