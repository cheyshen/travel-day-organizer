import { useMemo } from 'react'
import { useTripContext } from '../context/TripContext'
import { generateId } from '../utils/timeUtils'

// =============================================================================
// USE DAY — Day event CRUD + helpers
// =============================================================================

export function useDay(date) {
  const { state, dispatch } = useTripContext()
  const day = state.days[date]
  const events = day?.events || []

  function addEvent(eventData) {
    dispatch({
      type: 'ADD_EVENT',
      payload: {
        date,
        event: {
          ...eventData,
          id: eventData.id || generateId(),
          sortOrder: events.length,
        },
      },
    })
  }

  function updateEvent(eventId, updates) {
    dispatch({
      type: 'UPDATE_EVENT',
      payload: { date, eventId, updates },
    })
  }

  function deleteEvent(eventId) {
    dispatch({
      type: 'DELETE_EVENT',
      payload: { date, eventId },
    })
  }

  function setEventStatus(eventId, status) {
    dispatch({
      type: 'SET_EVENT_STATUS',
      payload: { date, eventId, status },
    })
  }

  function toggleEventDone(eventId) {
    const event = events.find(e => e.id === eventId)
    if (!event) return
    setEventStatus(eventId, event.status === 'done' ? 'upcoming' : 'done')
  }

  const stats = useMemo(() => {
    const total = events.length
    const done = events.filter(e => e.status === 'done').length
    const upcoming = events.filter(e => e.status === 'upcoming').length
    const allDone = total > 0 && done === total
    return { total, done, upcoming, allDone }
  }, [events])

  return {
    day,
    events,
    stats,
    addEvent,
    updateEvent,
    deleteEvent,
    setEventStatus,
    toggleEventDone,
  }
}
