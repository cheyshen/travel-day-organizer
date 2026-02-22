import { createContext, useContext, useReducer, useEffect, useRef } from 'react'
import { sampleTrip, sampleDays } from '../data/sampleTrip'
import { sampleChecklist } from '../data/sampleChecklist'

// =============================================================================
// TRIP CONTEXT — State management with localStorage persistence
// =============================================================================

const STORAGE_KEY = 'travel-trip-state'

const TripContext = createContext(null)

// Initial state
function getInitialState() {
  const defaults = {
    trip: sampleTrip,
    days: sampleDays,
    selectedDate: sampleTrip.startDate,
    activeView: 'hero', // hero | calendar | day | status | eventDetail
    selectedEventId: null,
    checklistItems: sampleChecklist,
    documents: [],
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed.trip?.id === sampleTrip.id) {
        // Merge defaults for any new fields missing from old localStorage
        return { ...defaults, ...parsed }
      }
    }
  } catch (e) { /* ignore */ }

  return defaults
}

// Reducer
function tripReducer(state, action) {
  switch (action.type) {
    case 'SET_SELECTED_DATE':
      return { ...state, selectedDate: action.payload }

    case 'SET_ACTIVE_VIEW':
      return { ...state, activeView: action.payload }

    case 'SET_SELECTED_EVENT':
      return { ...state, selectedEventId: action.payload }

    case 'ADD_EVENT': {
      const { date, event } = action.payload
      const day = state.days[date]
      if (!day) return state
      const events = [...day.events, event].sort((a, b) => a.sortOrder - b.sortOrder)
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
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
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
