import { format, parseISO, differenceInDays, addDays, startOfDay, isSameDay, isToday } from 'date-fns'

// =============================================================================
// DATE UTILITIES — Trip date math helpers
// =============================================================================

export function formatTripDate(dateStr) {
  return format(parseISO(dateStr), 'EEE, MMMM d')
}

export function formatShortDate(dateStr) {
  return format(parseISO(dateStr), 'MMM d')
}

export function formatDayOfWeek(dateStr) {
  return format(parseISO(dateStr), 'EEE')
}

export function formatDayNumber(dateStr) {
  return format(parseISO(dateStr), 'd')
}

export function formatMonthYear(dateStr) {
  return format(parseISO(dateStr), 'MMMM yyyy')
}

export function getDayIndex(tripStartDate, currentDate) {
  return differenceInDays(parseISO(currentDate), parseISO(tripStartDate)) + 1
}

export function getTripDays(startDate, endDate) {
  const start = parseISO(startDate)
  const end = parseISO(endDate)
  const days = differenceInDays(end, start) + 1
  return Array.from({ length: days }, (_, i) => {
    const date = addDays(start, i)
    return format(date, 'yyyy-MM-dd')
  })
}

export function isTripDay(dateStr, tripStartDate, tripEndDate) {
  const date = parseISO(dateStr)
  const start = parseISO(tripStartDate)
  const end = parseISO(tripEndDate)
  return date >= startOfDay(start) && date <= startOfDay(end)
}

export function areSameDay(dateStr1, dateStr2) {
  return isSameDay(parseISO(dateStr1), parseISO(dateStr2))
}

export function isTodayDate(dateStr) {
  return isToday(parseISO(dateStr))
}

export function getAdjacentDates(dateStr, tripStartDate, tripEndDate) {
  const date = parseISO(dateStr)
  const start = parseISO(tripStartDate)
  const end = parseISO(tripEndDate)

  const prev = addDays(date, -1)
  const next = addDays(date, 1)

  return {
    prev: prev >= startOfDay(start) ? format(prev, 'yyyy-MM-dd') : null,
    next: next <= startOfDay(end) ? format(next, 'yyyy-MM-dd') : null,
  }
}

export function getAdjacentMonth(year, month, direction) {
  // month is 0-indexed (0=Jan, 11=Dec)
  const m = month + direction
  if (m < 0) return { year: year - 1, month: 11 }
  if (m > 11) return { year: year + 1, month: 0 }
  return { year, month: m }
}

export function formatMonthYearFromParts(year, month) {
  const date = new Date(year, month, 1)
  return format(date, 'MMMM yyyy')
}

export function getCalendarGrid(year, month) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startPad = firstDay.getDay() // 0=Sun
  const daysInMonth = lastDay.getDate()

  const grid = []

  // Padding before
  for (let i = 0; i < startPad; i++) {
    const date = addDays(firstDay, -(startPad - i))
    grid.push({ date: format(date, 'yyyy-MM-dd'), isCurrentMonth: false })
  }

  // Days in month
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    grid.push({ date: format(date, 'yyyy-MM-dd'), isCurrentMonth: true })
  }

  // Pad to fill last week
  const remaining = 7 - (grid.length % 7)
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      const date = addDays(lastDay, i)
      grid.push({ date: format(date, 'yyyy-MM-dd'), isCurrentMonth: false })
    }
  }

  return grid
}
