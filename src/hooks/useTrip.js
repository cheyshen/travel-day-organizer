import { useMemo } from 'react'
import { useTripContext } from '../context/TripContext'
import { getTripDays } from '../utils/dateUtils'

// =============================================================================
// USE TRIP — Trip navigation helpers
// =============================================================================

export function useTrip() {
  const { state, dispatch } = useTripContext()
  const { trip, days, selectedDate, activeView } = state

  const tripDates = useMemo(() => {
    return getTripDays(trip.startDate, trip.endDate)
  }, [trip.startDate, trip.endDate])

  function setSelectedDate(date) {
    dispatch({ type: 'SET_SELECTED_DATE', payload: date })
  }

  function setActiveView(view) {
    dispatch({ type: 'SET_ACTIVE_VIEW', payload: view })
  }

  function navigateToDay(date) {
    dispatch({ type: 'SET_SELECTED_DATE', payload: date })
    dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'day' })
  }

  function getDestinationForDate(date) {
    const day = days[date]
    if (!day) return null
    return trip.destinations.find(d => d.id === day.destinationId) || null
  }

  function reset() {
    dispatch({ type: 'RESET' })
  }

  return {
    trip,
    days,
    selectedDate,
    activeView,
    tripDates,
    setSelectedDate,
    setActiveView,
    navigateToDay,
    getDestinationForDate,
    reset,
  }
}
