import { colors } from '../colors'
import { EVENT_TYPES, EVENT_STATUSES } from '../data/eventTypes'

// =============================================================================
// TIME UTILITIES — Formatting, status, icons
// =============================================================================

export function formatTime(isoString) {
  if (!isoString) return ''
  // Extract time directly from ISO string to preserve the event's timezone
  // e.g. "2026-03-14T12:00:00-10:00" → 12:00 PM (Hawaii time, not browser local)
  const match = isoString.match(/T(\d{2}):(\d{2})/)
  if (match) {
    let hour = parseInt(match[1], 10)
    const min = match[2]
    const ampm = hour >= 12 ? 'PM' : 'AM'
    if (hour === 0) hour = 12
    else if (hour > 12) hour -= 12
    return `${hour}:${min} ${ampm}`
  }
  const d = new Date(isoString)
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

export function formatHourLabel(isoString) {
  if (!isoString) return ''
  const match = isoString.match(/T(\d{2}):(\d{2})/)
  if (match) {
    let hour = parseInt(match[1], 10)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    if (hour === 0) hour = 12
    else if (hour > 12) hour -= 12
    return `${hour} ${ampm}`
  }
  return ''
}

export function formatTimeRange(startIso, endIso) {
  if (!startIso || !endIso) return ''
  return `${formatTime(startIso)} - ${formatTime(endIso)}`
}

export function getTimePosition(isoString) {
  if (!isoString) return 0
  return new Date(isoString).getTime()
}

export function getDurationMinutes(startIso, endIso) {
  if (!startIso || !endIso) return 0
  return Math.round((new Date(endIso) - new Date(startIso)) / 60000)
}

export function formatDuration(minutes) {
  if (minutes < 60) return `${minutes}m`
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`
}

export function getStatusColor(status) {
  const s = EVENT_STATUSES[status]
  return s ? s.textColor : colors.textSecondary
}

export function getStatusBg(status) {
  const s = EVENT_STATUSES[status]
  return s ? s.color : colors.borderLight
}

export function getStatusLabel(status) {
  const s = EVENT_STATUSES[status]
  return s ? s.label : 'Upcoming'
}

export function getEventIcon(typeId) {
  const t = EVENT_TYPES[typeId]
  return t ? t.icon : EVENT_TYPES.custom.icon
}

export function getEventColor(typeId) {
  const t = EVENT_TYPES[typeId]
  return t ? t.color : colors.textSecondary
}

export function getEventBgColor(typeId) {
  const t = EVENT_TYPES[typeId]
  return t ? t.bgColor : colors.borderLight
}

export function getNowPosition(events) {
  const nowMs = Date.now()
  for (let i = 0; i < events.length; i++) {
    const start = getTimePosition(events[i].startTime || events[i].estimatedStartTime)
    if (nowMs < start) return i
  }
  return events.length
}

export function generateId() {
  return `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}
