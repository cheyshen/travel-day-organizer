// =============================================================================
// TRIP SHIFT — pure helpers for evergreen-demo date shifting
// Extracted from TripContext.jsx so they can be unit-tested without React/DOM.
// Every function takes `todayStr` / `trip` / `days` as args — no globals.
// =============================================================================

export function getTodayStr(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

export function isTripOver(todayStr, trip) {
  return todayStr > trip.endDate
}

export function addDaysToDate(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function shiftISODateTime(isoStr, days) {
  if (!isoStr || !isoStr.includes('T')) return isoStr
  const datepart = isoStr.slice(0, 10)
  const rest = isoStr.slice(10)
  return addDaysToDate(datepart, days) + rest
}

/**
 * Compute how many days to shift the trip so it starts on the next occurrence
 * of the same weekday as the original start date, at least 3 days from today.
 */
export function computeShiftDays(todayStr, tripStartDate) {
  const today = new Date(todayStr + 'T00:00:00')
  const origStart = new Date(tripStartDate + 'T00:00:00')
  const origDow = origStart.getDay()

  const candidate = new Date(today)
  candidate.setDate(candidate.getDate() + 3)
  while (candidate.getDay() !== origDow) {
    candidate.setDate(candidate.getDate() + 1)
  }

  const diffMs = candidate.getTime() - origStart.getTime()
  return Math.round(diffMs / (1000 * 60 * 60 * 24))
}

/** Deep-clone trip + days with all dates shifted forward by `shiftDays`. */
export function buildShiftedData(shiftDays, trip, days) {
  const shiftedTrip = {
    ...trip,
    startDate: addDaysToDate(trip.startDate, shiftDays),
    endDate: addDaysToDate(trip.endDate, shiftDays),
    destinations: trip.destinations.map(dest => ({
      ...dest,
      startDate: addDaysToDate(dest.startDate, shiftDays),
      endDate: addDaysToDate(dest.endDate, shiftDays),
    })),
  }

  const shiftedDays = {}
  for (const [dateKey, day] of Object.entries(days)) {
    const newDateKey = addDaysToDate(dateKey, shiftDays)
    shiftedDays[newDateKey] = {
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

  return { trip: shiftedTrip, days: shiftedDays }
}
