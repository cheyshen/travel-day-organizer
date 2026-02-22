import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { CalendarDays, Sun, CloudSun, Cloud, CloudRain, Clock, ArrowRight, MapPin, ChevronRight, Plane } from 'lucide-react'
import { useTripContext } from '../context/TripContext'
import { fontStack, typography, glass as sharedGlass, shadows, warmPalette, radius } from '../styles'
import { formatShortDate, getTripDays, formatDayOfWeek, formatDayNumber, getDayIndex, isTodayDate, formatTripDate } from '../utils/dateUtils'
import { formatTime, getEventIcon, getEventColor, getEventBgColor } from '../utils/timeUtils'

// =============================================================================
// HERO VIEW — Glassmorphic Editorial Design
// =============================================================================

// Real stock photography (Unsplash)
const HERO_BG = 'https://images.unsplash.com/photo-1559494007-9f5847c49d94?auto=format&fit=crop&w=1200&q=80'
const KAUAI_PHOTO = 'https://images.unsplash.com/photo-1505852679233-d9fd70aff56d?auto=format&fit=crop&w=600&q=80'
const MAUI_PHOTO = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80'

// --- Design tokens (from shared styles) ---
const palette = warmPalette
const glass = sharedGlass

// --- Flight milestone helpers ---

function seededGate(eventId) {
  let hash = 0
  for (let i = 0; i < eventId.length; i++) {
    hash = ((hash << 5) - hash + eventId.charCodeAt(i)) | 0
  }
  const terminal = String.fromCharCode(65 + (Math.abs(hash) % 6))
  const num = (Math.abs(hash >> 8) % 30) + 1
  return `${terminal}${num}`
}

function computeRemaining(endMs, nowMs) {
  const diff = Math.max(0, endMs - nowMs)
  const hours = Math.floor(diff / 3600000)
  const mins = Math.floor((diff % 3600000) / 60000)
  if (hours > 0) return `${hours}h ${mins}m remaining`
  return `${mins}m remaining`
}

function formatRelativeTime(timestampMs, nowMs) {
  const diff = timestampMs - nowMs
  const absDiff = Math.abs(diff)

  if (absDiff < 60000) return 'Now'

  const totalMins = Math.round(absDiff / 60000)
  const hours = Math.floor(totalMins / 60)
  const mins = totalMins % 60

  if (absDiff > 86400000) {
    const d = new Date(timestampMs)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (diff > 0) {
    if (hours > 0) return mins > 0 ? `in ${hours}h ${mins}m` : `in ${hours}h`
    return `in ${totalMins}m`
  } else {
    if (hours > 0) return mins > 0 ? `${hours}h ${mins}m ago` : `${hours}h ago`
    return `${totalMins}m ago`
  }
}

function getFlightMilestones(flight, nowMs) {
  const startMs = new Date(flight.startTime).getTime()
  const endMs = flight.endTime ? new Date(flight.endTime).getTime() : startMs + 5 * 3600000
  const gate = seededGate(flight.id)

  const extractCode = (str) => {
    if (!str) return ''
    const match = str.match(/\(([A-Z]{3})\)/)
    return match ? match[1] : str.split(',')[0].trim()
  }
  const destCode = extractCode(flight.location?.destination)

  const isInFlight = nowMs >= startMs && nowMs < endMs

  const milestones = [
    { id: 'checkin', triggerMs: startMs - 24 * 3600000, label: 'Check-in open', detail: 'Online check-in available' },
    { id: 'gate', triggerMs: startMs - 90 * 60000, label: 'Gate assigned', detail: `Gate ${gate}` },
    { id: 'boarding', triggerMs: startMs - 35 * 60000, label: 'Boarding', detail: 'Boarding started' },
    { id: 'doors', triggerMs: startMs - 10 * 60000, label: 'Doors closed', detail: 'Doors closing' },
    { id: isInFlight ? 'inflight' : 'departed', triggerMs: startMs, label: isInFlight ? 'In flight' : 'Departed', detail: isInFlight ? computeRemaining(endMs, nowMs) : 'Departed on time' },
    { id: 'landed', triggerMs: endMs, label: 'Landed', detail: destCode ? `Landed at ${destCode}` : 'Arrived' },
  ]

  milestones.forEach((m, i) => {
    const nextTrigger = milestones[i + 1]?.triggerMs
    if (nowMs >= m.triggerMs) {
      m.status = (nextTrigger && nowMs >= nextTrigger) ? 'done' : 'current'
    } else {
      m.status = 'upcoming'
    }
    m.relativeTime = formatRelativeTime(m.triggerMs, nowMs)
  })

  return milestones
}

function getVisibleMilestones(milestones) {
  const currentIdx = milestones.findIndex(m => m.status === 'current')

  if (currentIdx === -1) {
    if (milestones.every(m => m.status === 'done')) return milestones.slice(-3)
    return milestones.slice(0, 3)
  }

  let start = Math.max(0, currentIdx - 1)
  let end = start + 3
  if (end > milestones.length) {
    end = milestones.length
    start = Math.max(0, end - 3)
  }

  return milestones.slice(start, end)
}

// --- Weather simulation helpers ---

const DAY_MS = 86400000

function getSimulatedWeather(dateStr, destId) {
  let hash = 0
  const str = dateStr + (destId || '')
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
  }
  const h = Math.abs(hash)
  const temp = 75 + (h % 11) // 75-85°F realistic for Hawaii March
  const pool = ['sunny', 'sunny', 'partly-cloudy', 'partly-cloudy', 'partly-cloudy', 'cloudy', 'rain', 'sunny']
  const condition = pool[h % pool.length]
  return { temp, condition }
}

function WeatherIcon({ condition, size = 16, color }) {
  const c = color || palette.textMedium
  switch (condition) {
    case 'sunny': return <Sun size={size} color={c} strokeWidth={1.5} />
    case 'partly-cloudy': return <CloudSun size={size} color={c} strokeWidth={1.5} />
    case 'cloudy': return <Cloud size={size} color={c} strokeWidth={1.5} />
    case 'rain': return <CloudRain size={size} color={c} strokeWidth={1.5} />
    default: return <Sun size={size} color={c} strokeWidth={1.5} />
  }
}

// --- Trip countdown helpers ---

function formatCountdownTime(triggerMs, nowMs) {
  const diff = triggerMs - nowMs
  if (Math.abs(diff) < 60000) return 'Now'

  const absDiff = Math.abs(diff)
  const days = Math.floor(absDiff / DAY_MS)
  const hours = Math.floor((absDiff % DAY_MS) / 3600000)

  const prefix = diff > 0 ? 'in ' : ''
  const suffix = diff < 0 ? ' ago' : ''

  if (days > 0) return `${prefix}${days}d${suffix}`
  if (hours > 0) return `${prefix}${hours}h${suffix}`
  const mins = Math.floor(absDiff / 60000)
  return `${prefix}${mins}m${suffix}`
}

function getTripCountdownMilestones(startDate, nowMs) {
  const startMs = new Date(startDate).getTime()

  const milestones = [
    { id: 'booked', triggerMs: startMs - 45 * DAY_MS, label: 'Trip booked', detail: 'Itinerary confirmed' },
    { id: '30days', triggerMs: startMs - 30 * DAY_MS, label: '30 days out', detail: 'Start planning activities' },
    { id: '3weeks', triggerMs: startMs - 21 * DAY_MS, label: '3 weeks out', detail: 'Book restaurants & tours' },
    { id: '2weeks', triggerMs: startMs - 14 * DAY_MS, label: '2 weeks out', detail: 'Start packing list' },
    { id: '1week', triggerMs: startMs - 7 * DAY_MS, label: '1 week out', detail: 'Final preparations' },
    { id: 'depart', triggerMs: startMs, label: 'Trip begins', detail: 'Aloha!' },
  ]

  milestones.forEach((m, i) => {
    const nextTrigger = milestones[i + 1]?.triggerMs
    if (nowMs >= m.triggerMs) {
      m.status = (nextTrigger && nowMs >= nextTrigger) ? 'done' : 'current'
    } else {
      m.status = 'upcoming'
    }
    m.relativeTime = formatCountdownTime(m.triggerMs, nowMs)
  })

  return milestones
}

// --- Main Component ---
export default function HeroView({ onNavigate }) {
  const { state, dispatch } = useTripContext()
  const { trip, days } = state
  const tripDates = getTripDays(trip.startDate, trip.endDate)
  const [heroLoaded, setHeroLoaded] = useState(false)
  const [now, setNow] = useState(Date.now())

  // Preload hero image
  useEffect(() => {
    const img = new Image()
    img.src = HERO_BG
    img.onload = () => setHeroLoaded(true)
  }, [])

  // Live countdown — update every 60s
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60000)
    return () => clearInterval(id)
  }, [])

  // Find next upcoming event across all trip days
  const nextUp = useMemo(() => {
    for (const dateStr of tripDates) {
      const day = days[dateStr]
      if (!day) continue
      const sorted = [...day.events].sort((a, b) => a.sortOrder - b.sortOrder)
      for (const event of sorted) {
        if (event.type === 'buffer') continue
        if (event.status === 'done' || event.status === 'cancelled') continue
        const startMs = new Date(event.startTime).getTime()
        const endMs = event.endTime ? new Date(event.endTime).getTime() : startMs
        // Currently in progress or upcoming
        if (endMs > now) {
          return { event, dateStr, day }
        }
      }
    }
    return null
  }, [days, tripDates, now])

  // Derived next-up values
  const nextDest = nextUp ? trip.destinations.find(d => d.id === nextUp.day.destinationId) : null
  const nextDayNum = nextUp ? getDayIndex(trip.startDate, nextUp.dateStr) : null
  const minutesUntil = nextUp ? Math.max(0, Math.round((new Date(nextUp.event.startTime).getTime() - now) / 60000)) : null
  const isNow = nextUp ? (new Date(nextUp.event.startTime).getTime() <= now && new Date(nextUp.event.endTime || nextUp.event.startTime).getTime() > now) : false
  const isNextToday = nextUp ? isTodayDate(nextUp.dateStr) : false

  // Find next upcoming flight across all trip days
  const nextFlight = useMemo(() => {
    for (const dateStr of tripDates) {
      const day = days[dateStr]
      if (!day) continue
      const sorted = [...day.events].sort((a, b) => a.sortOrder - b.sortOrder)
      for (const event of sorted) {
        if (event.type !== 'flight') continue
        if (event.status === 'done' || event.status === 'cancelled') continue
        const endMs = event.endTime ? new Date(event.endTime).getTime() : new Date(event.startTime).getTime()
        if (endMs > now) {
          return { event, dateStr, day }
        }
      }
    }
    return null
  }, [days, tripDates, now])

  // Flight milestone state
  const flightMilestones = useMemo(() => {
    if (!nextFlight) return []
    return getFlightMilestones(nextFlight.event, now)
  }, [nextFlight, now])

  const visibleMilestones = useMemo(() => {
    return getVisibleMilestones(flightMilestones)
  }, [flightMilestones])

  // Trip countdown milestone state
  const countdownMilestones = useMemo(() => {
    const tripStartMs = new Date(trip.startDate).getTime()
    if (now >= tripStartMs) return []
    return getTripCountdownMilestones(trip.startDate, now)
  }, [trip.startDate, now])

  const visibleCountdownMilestones = useMemo(() => {
    return getVisibleMilestones(countdownMilestones)
  }, [countdownMilestones])

  function getDestDayCount(destId) {
    return Object.values(days).filter(d => d.destinationId === destId).length
  }

  function getDestForDate(date) {
    const day = days[date]
    if (!day) return null
    return trip.destinations.find(d => d.id === day.destinationId)
  }

  return (
    <div style={{ backgroundColor: palette.warmGray, minHeight: '100vh' }}>

      {/* ================================================================ */}
      {/* HERO SECTION — Full-bleed photo with glass overlays              */}
      {/* ================================================================ */}
      <div style={{
        position: 'relative',
        height: 210,
        overflow: 'hidden',
      }}>
        {/* Background photo */}
        <motion.div
          initial={{ scale: 1.08, opacity: 0 }}
          animate={{ scale: 1, opacity: heroLoaded ? 1 : 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            inset: -4,
            backgroundImage: `url(${HERO_BG})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 40%',
          }}
        />

        {/* Gradient overlay — warm, subtle */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `
            linear-gradient(180deg,
              rgba(28, 25, 23, 0.3) 0%,
              rgba(28, 25, 23, 0.2) 30%,
              rgba(28, 25, 23, 0.25) 50%,
              rgba(28, 25, 23, 0.6) 80%,
              rgba(28, 25, 23, 0.9) 100%
            )
          `,
        }} />

        {/* Top bar — glass pill with trip status */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            right: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 3,
          }}
        >
          <div style={{
            ...glass.frosted,
            borderRadius: 40,
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <Sun size={14} color="#FFF" strokeWidth={2} />
            <span style={{
              fontSize: 12,
              fontWeight: 600,
              color: '#FFF',
              letterSpacing: '0.04em',
            }}>
              {tripDates.length} DAYS
            </span>
          </div>

          <div style={{
            ...glass.frosted,
            borderRadius: 40,
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <div style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: '#4ADE80',
            }} />
            <span style={{
              fontSize: 11,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.9)',
              letterSpacing: '0.03em',
            }}>
              Upcoming
            </span>
          </div>
        </motion.div>

      </div>

      {/* ================================================================ */}
      {/* CONTENT PANEL — Surface overlapping hero                        */}
      {/* ================================================================ */}
      <div style={{
        backgroundColor: palette.warmGray,
        borderRadius: '24px 24px 0 0',
        marginTop: -28,
        position: 'relative',
        zIndex: 2,
        padding: '20px 20px 20px',
      }}>
        {/* Pull indicator */}
        <div style={{
          width: 32,
          height: 4,
          borderRadius: 2,
          backgroundColor: '#D6D3CE',
          margin: '0 auto 16px',
        }} />

        {/* --- Next Up Card — Temporal orientation --- */}
        {nextUp && (() => {
          const EventIcon = getEventIcon(nextUp.event.type)
          const eventColor = getEventColor(nextUp.event.type)
          const eventBgColor = getEventBgColor(nextUp.event.type)
          const destColor = nextDest?.color || palette.accent
          const locationStr = nextUp.event.location?.destination || nextUp.event.location?.origin || null

          // Format countdown text
          let countdownText
          if (isNow) {
            countdownText = 'Now'
          } else if (minutesUntil < 60) {
            countdownText = `${minutesUntil} min`
          } else {
            const hrs = Math.floor(minutesUntil / 60)
            const mins = minutesUntil % 60
            countdownText = mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`
          }

          // Day label for the time column
          const dayLabel = isNextToday ? 'Today' : `Day ${nextDayNum}`

          return (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.5 }}
              style={{ marginBottom: 20 }}
            >
              {/* Header row */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 10,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={14} color={palette.accent} strokeWidth={2} />
                  <span style={{
                    ...typography.caption,
                    color: palette.textMedium,
                  }}>
                    NEXT UP
                  </span>
                  <span style={{
                    ...typography.caption,
                    fontSize: 10,
                    backgroundColor: palette.accentSoft,
                    color: palette.accent,
                    padding: '2px 8px',
                    borderRadius: 20,
                    fontWeight: 600,
                  }}>
                    {countdownText}
                  </span>
                </div>
                <span style={{
                  ...typography.helper,
                  color: palette.textLight,
                }}>
                  Day {nextDayNum} of {tripDates.length}
                </span>
              </div>

              {/* Primary card */}
              <motion.div
                role="button"
                tabIndex={0}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  dispatch({ type: 'SET_SELECTED_EVENT', payload: nextUp.event.id })
                  onNavigate('eventDetail', nextUp.dateStr)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    dispatch({ type: 'SET_SELECTED_EVENT', payload: nextUp.event.id })
                    onNavigate('eventDetail', nextUp.dateStr)
                  }
                }}
                style={{
                  background: '#FFFFFF',
                  boxShadow: shadows.md,
                  borderRadius: radius.lg,
                  borderLeft: `4px solid ${destColor}`,
                  padding: 16,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  position: 'relative',
                  fontFamily: fontStack,
                }}
              >
                {/* Left: Icon + text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Icon pill */}
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    backgroundColor: eventBgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 8,
                  }}>
                    <EventIcon size={16} color={eventColor} strokeWidth={2} />
                  </div>

                  {/* Title */}
                  <div style={{
                    ...typography.sectionHeader,
                    color: palette.textDark,
                    fontFamily: fontStack,
                    marginBottom: 4,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {nextUp.event.title}
                  </div>

                  {/* Time line */}
                  <div style={{
                    ...typography.helper,
                    color: palette.textMedium,
                    marginBottom: locationStr ? 4 : 0,
                  }}>
                    {dayLabel} · {formatTime(nextUp.event.startTime)}
                  </div>

                  {/* Location */}
                  {locationStr && (
                    <div style={{
                      ...typography.helper,
                      color: palette.textLight,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}>
                      <MapPin size={12} color={palette.textLight} strokeWidth={1.5} />
                      <span style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {locationStr}
                      </span>
                    </div>
                  )}
                </div>

                {/* Right: Time + day + destination */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  flexShrink: 0,
                  gap: 2,
                  paddingRight: 16,
                }}>
                  <span style={{
                    ...typography.bodyMedium,
                    fontWeight: 700,
                    color: palette.textDark,
                    fontFamily: fontStack,
                  }}>
                    {formatTime(nextUp.event.startTime)}
                  </span>
                  <span style={{
                    ...typography.helper,
                    color: palette.textLight,
                  }}>
                    Day {nextDayNum}
                  </span>
                  <span style={{
                    ...typography.caption,
                    fontSize: 10,
                    color: destColor,
                    fontWeight: 600,
                  }}>
                    {nextDest?.name?.toUpperCase() || ''}
                  </span>
                </div>

                {/* Chevron */}
                <div style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}>
                  <ChevronRight size={16} color={palette.textLight} strokeWidth={1.5} />
                </div>
              </motion.div>
            </motion.div>
          )
        })()}

        {/* --- Flight Status Card with milestone log (skip if same as Next Up) --- */}
        {nextFlight && nextFlight.event.id !== nextUp?.event?.id && (() => {
          const fl = nextFlight.event
          const extractCode = (str) => {
            if (!str) return ''
            const match = str.match(/\(([A-Z]{3})\)/)
            return match ? match[1] : str.split(',')[0].trim()
          }
          const originCode = extractCode(fl.location?.origin)
          const destCode = extractCode(fl.location?.destination)
          const flDate = new Date(fl.startTime)
          const dateLabel = `${flDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
          const timeLabel = formatTime(fl.startTime)
          const isDelayed = fl.status === 'delayed'
          const statusLabel = isDelayed ? 'Delayed' : 'On Time'
          const statusBg = isDelayed ? '#FFF3E0' : '#E8F5E9'
          const statusColor = isDelayed ? '#D97B2B' : '#27815B'

          return (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.5 }}
              role="button"
              tabIndex={0}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                dispatch({ type: 'SET_SELECTED_EVENT', payload: fl.id })
                onNavigate('eventDetail', nextFlight.dateStr)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  dispatch({ type: 'SET_SELECTED_EVENT', payload: fl.id })
                  onNavigate('eventDetail', nextFlight.dateStr)
                }
              }}
              style={{
                background: '#FFFFFF',
                boxShadow: shadows.md,
                borderRadius: radius.lg,
                padding: '16px',
                marginBottom: 20,
                cursor: 'pointer',
                fontFamily: fontStack,
              }}
            >
              {/* Top row: title + status badge */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: 2,
              }}>
                <div style={{
                  ...typography.sectionHeader,
                  fontSize: 16,
                  color: palette.textDark,
                  fontFamily: fontStack,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  flex: 1,
                  minWidth: 0,
                  marginRight: 8,
                }}>
                  {fl.title}
                </div>
                <div style={{
                  backgroundColor: statusBg,
                  color: statusColor,
                  padding: '3px 10px',
                  borderRadius: radius.pill,
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}>
                  {statusLabel}
                </div>
              </div>

              {/* Date/time line */}
              <div style={{
                ...typography.helper,
                color: palette.textLight,
                marginBottom: 14,
              }}>
                {dateLabel} · {timeLabel}
              </div>

              {/* Route visualization */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginBottom: 14,
              }}>
                <span style={{
                  ...typography.bodyMedium,
                  fontWeight: 700,
                  color: palette.textDark,
                  fontSize: 15,
                  fontFamily: fontStack,
                }}>
                  {originCode}
                </span>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  flex: 1,
                  maxWidth: 120,
                }}>
                  <div style={{ flex: 1, height: 1, backgroundColor: palette.textLight, opacity: 0.4 }} />
                  <Plane size={14} color={palette.textMedium} strokeWidth={2} />
                  <div style={{ flex: 1, height: 1, backgroundColor: palette.textLight, opacity: 0.4 }} />
                </div>
                <span style={{
                  ...typography.bodyMedium,
                  fontWeight: 700,
                  color: palette.textDark,
                  fontSize: 15,
                  fontFamily: fontStack,
                }}>
                  {destCode}
                </span>
              </div>

              {/* Divider */}
              <div style={{
                height: 1,
                backgroundColor: '#F0EFEA',
                marginBottom: 14,
              }} />

              {/* Milestone log */}
              {visibleMilestones.length > 0 && (
                <div>
                  {visibleMilestones.map((m, i) => (
                    <FlightMilestoneRow
                      key={m.id}
                      milestone={m}
                      isLast={i === visibleMilestones.length - 1}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )
        })()}

        {/* --- Trip Countdown Card — Days until departure with milestones --- */}
        {visibleCountdownMilestones.length > 0 && (() => {
          const tripStartMs = new Date(trip.startDate).getTime()
          const daysAway = Math.ceil((tripStartMs - now) / DAY_MS)
          const destNames = trip.destinations.map(d => d.name).join(' \u2192 ')

          return (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75, duration: 0.5 }}
              style={{
                background: '#FFFFFF',
                boxShadow: shadows.md,
                borderRadius: radius.lg,
                padding: '16px',
                marginBottom: 20,
                fontFamily: fontStack,
              }}
            >
              {/* Header row: trip name + countdown badge */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: 2,
              }}>
                <div style={{
                  ...typography.sectionHeader,
                  fontSize: 16,
                  color: palette.textDark,
                  fontFamily: fontStack,
                }}>
                  {trip.name || 'Your Trip'}
                </div>
                <div style={{
                  backgroundColor: palette.accentSoft,
                  color: palette.accent,
                  padding: '3px 10px',
                  borderRadius: radius.pill,
                  fontSize: 11,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}>
                  {daysAway}d away
                </div>
              </div>

              {/* Date range */}
              <div style={{
                ...typography.helper,
                color: palette.textLight,
                marginBottom: 8,
              }}>
                {formatShortDate(trip.startDate)} — {formatShortDate(trip.endDate)}
              </div>

              {/* Location */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                marginBottom: 14,
              }}>
                <MapPin size={14} color={palette.accent} strokeWidth={1.5} />
                <span style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: palette.textMedium,
                }}>
                  {destNames}
                </span>
              </div>

              {/* Divider */}
              <div style={{
                height: 1,
                backgroundColor: '#F0EFEA',
                marginBottom: 14,
              }} />

              {/* Countdown milestones */}
              {visibleCountdownMilestones.map((m, i) => (
                <FlightMilestoneRow
                  key={m.id}
                  milestone={m}
                  isLast={i === visibleCountdownMilestones.length - 1}
                />
              ))}
            </motion.div>
          )
        })()}

        {/* --- Destination Cards — Photo + Glass overlay --- */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          style={{
            display: 'flex',
            gap: 14,
            marginBottom: 24,
          }}
        >
          {trip.destinations.map((dest, i) => (
            <DestCard
              key={dest.id}
              destination={dest}
              photo={i === 0 ? KAUAI_PHOTO : MAUI_PHOTO}
              dayCount={getDestDayCount(dest.id)}
              delay={0.75 + i * 0.1}
              onTap={() => {
                const firstDay = Object.values(days).find(d => d.destinationId === dest.id)
                if (firstDay) onNavigate('day', firstDay.date)
              }}
            />
          ))}
        </motion.div>

        {/* --- Quick Access Days --- */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 14,
          }}>
            <span style={{
              fontSize: 13,
              fontWeight: 600,
              color: palette.textMedium,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}>
              Daily Overview
            </span>
            <span style={{
              fontSize: 12,
              color: palette.textLight,
            }}>
              {tripDates.length} days
            </span>
          </div>

          <div style={{
            display: 'flex',
            gap: 10,
            overflowX: 'auto',
            paddingBottom: 8,
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            marginLeft: -4,
            paddingLeft: 4,
          }}>
            {tripDates.map((date, i) => {
              const dest = getDestForDate(date)
              const weather = getSimulatedWeather(date, dest?.id)

              return (
                <motion.button
                  key={date}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.05 + i * 0.04 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onNavigate('day', date)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '10px 12px 8px',
                    background: '#FFFFFF',
                    boxShadow: shadows.sm,
                    borderRadius: 14,
                    border: 'none',
                    cursor: 'pointer',
                    minWidth: 56,
                    flexShrink: 0,
                    fontFamily: fontStack,
                    position: 'relative',
                  }}
                >
                  <span style={{
                    fontSize: 9,
                    fontWeight: 600,
                    color: palette.textLight,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: 3,
                  }}>
                    {formatDayOfWeek(date)}
                  </span>
                  <span style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: palette.textDark,
                    lineHeight: '24px',
                  }}>
                    {formatDayNumber(date)}
                  </span>
                  <div style={{ marginTop: 5 }}>
                    <WeatherIcon condition={weather.condition} size={16} />
                  </div>
                  <span style={{
                    fontSize: 10,
                    color: palette.textMedium,
                    marginTop: 2,
                    fontWeight: 500,
                  }}>
                    {weather.temp}°
                  </span>
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* --- Featured Highlight — Editorial touch --- */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          style={{
            marginTop: 24,
            background: '#FFFFFF',
            boxShadow: shadows.md,
            borderRadius: 20,
            overflow: 'hidden',
          }}
        >
          <div style={{
            height: 140,
            backgroundImage: `url(https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, transparent 20%, rgba(28,25,23,0.8) 100%)',
            }} />
            <div style={{
              position: 'absolute',
              bottom: 12,
              left: 16,
              right: 16,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
            }}>
              <div>
                <span style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.75)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}>
                  Highlight
                </span>
                <h3 style={{
                  fontFamily: fontStack,
                  fontSize: 23,
                  fontWeight: 600,
                  color: '#FFF',
                  margin: '2px 0 0',
                }}>
                  Na Pali Coast Boat Tour
                </h3>
              </div>
              <div style={{
                ...glass.frosted,
                borderRadius: 20,
                padding: '6px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}>
                <Clock size={11} color="#FFF" />
                <span style={{ fontSize: 10, color: '#FFF', fontWeight: 500 }}>Day 4</span>
              </div>
            </div>
          </div>
          <div style={{ padding: '14px 16px 16px' }}>
            <p style={{
              ...typography.body,
              fontFamily: fontStack,
              color: palette.textMedium,
              margin: 0,
            }}>
              5-hour catamaran cruise along Kauai's most dramatic coastline. Snorkeling, lunch, and dolphin spotting included.
            </p>
            <button
              onClick={() => onNavigate('day', '2026-03-17')}
              style={{
                marginTop: 14,
                background: 'none',
                border: 'none',
                color: palette.accent,
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontFamily: fontStack,
              }}
            >
              View Day 4 <ArrowRight size={16} strokeWidth={2.5} />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// --- Flight Milestone Row — Timeline dot + label + relative time ---
function FlightMilestoneRow({ milestone, isLast }) {
  const isDone = milestone.status === 'done'
  const isCurrent = milestone.status === 'current'

  const dotSize = isCurrent ? 10 : 8
  const dotColor = isDone ? '#27815B' : isCurrent ? '#0E7490' : 'transparent'
  const dotBorder = !isDone && !isCurrent ? '2px solid #D6D3CE' : 'none'
  const lineColor = isDone ? '#27815B' : '#E2E0DB'

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      {/* Dot + connector column */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: 12,
        flexShrink: 0,
        paddingTop: 3,
      }}>
        {isCurrent ? (
          <motion.div
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            style={{
              width: dotSize,
              height: dotSize,
              borderRadius: '50%',
              backgroundColor: dotColor,
              boxShadow: '0 0 6px rgba(14, 116, 144, 0.4)',
              flexShrink: 0,
            }}
          />
        ) : (
          <div style={{
            width: dotSize,
            height: dotSize,
            borderRadius: '50%',
            backgroundColor: dotColor,
            border: dotBorder,
            flexShrink: 0,
          }} />
        )}
        {!isLast && (
          <div style={{
            width: 2,
            flex: 1,
            minHeight: 14,
            backgroundColor: lineColor,
            marginTop: 4,
          }} />
        )}
      </div>

      {/* Text column */}
      <div style={{
        flex: 1,
        minWidth: 0,
        paddingBottom: isLast ? 0 : 8,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{
            fontSize: 13,
            fontWeight: isCurrent ? 700 : 400,
            color: isCurrent ? palette.textDark : palette.textLight,
            fontFamily: fontStack,
          }}>
            {milestone.label}
          </span>
          <span style={{
            fontSize: 10,
            fontWeight: 600,
            color: isCurrent ? palette.accent : palette.textLight,
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
            flexShrink: 0,
            marginLeft: 8,
          }}>
            {milestone.relativeTime}
          </span>
        </div>
        {isCurrent && milestone.detail && (
          <span style={{
            fontSize: 11,
            color: palette.textMedium,
          }}>
            {milestone.detail}
          </span>
        )}
      </div>
    </div>
  )
}

// --- Destination Card — Photo + Glass info overlay ---
function DestCard({ destination, photo, dayCount, delay, onTap }) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const isKauai = destination.id === 'dest-kauai'
  const accentColor = isKauai ? palette.accent : palette.gold

  useEffect(() => {
    const img = new Image()
    img.src = photo
    img.onload = () => setImgLoaded(true)
  }, [photo])

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.97 }}
      onClick={onTap}
      style={{
        flex: 1,
        borderRadius: 20,
        overflow: 'hidden',
        cursor: 'pointer',
        background: '#FFFFFF',
        boxShadow: shadows.md,
        position: 'relative',
      }}
    >
      {/* Photo */}
      <div style={{
        height: 50,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: imgLoaded ? 1 : 0 }}
          transition={{ duration: 0.6 }}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${photo})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        {!imgLoaded && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: isKauai
              ? 'linear-gradient(135deg, #0A8F8F22, #0A8F8F44)'
              : 'linear-gradient(135deg, #C4A26522, #C4A26544)',
          }} />
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '12px 16px 14px' }}>
        <h3 style={{
          fontSize: 17,
          fontWeight: 700,
          color: palette.textDark,
          margin: 0,
          fontFamily: fontStack,
        }}>
          {destination.name}
        </h3>
        <p style={{
          fontSize: 12,
          color: palette.textMedium,
          margin: '2px 0 0',
          lineHeight: '16px',
        }}>
          {formatShortDate(destination.startDate)} — {formatShortDate(destination.endDate)}
        </p>

        {/* Bottom row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 8,
          paddingTop: 8,
          borderTop: `1px solid rgba(0,0,0,0.06)`,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}>
            <CalendarDays size={14} color={palette.textLight} strokeWidth={1.5} />
            <span style={{ fontSize: 13, color: palette.textMedium, fontWeight: 500 }}>
              {dayCount} days
            </span>
          </div>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: 10,
            background: accentColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <ArrowRight size={14} color="#FFF" strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
