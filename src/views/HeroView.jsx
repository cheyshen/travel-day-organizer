import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { CalendarDays, Sun, CloudSun, Cloud, CloudRain, Clock, ArrowRight, MapPin, Plane, Ship, Mountain, Waves, Camera } from 'lucide-react'
import { useTripContext } from '../context/TripContext'
import { fontStack, typography, spacing, glass as sharedGlass, shadows, warmPalette, radius, glossyBg, scrimGradient } from '../styles'
import { colors } from '../colors'
import { formatShortDate, getTripDays, formatDayOfWeek, formatDayNumber, getDayIndex, isTodayDate } from '../utils/dateUtils'
import { formatTime, getEventIcon, getEventColor, getEventBgColor } from '../utils/timeUtils'
import { Sunrise } from 'lucide-react'

// =============================================================================
// HERO VIEW — Glassmorphic Editorial Design
// =============================================================================

// Real stock photography (Unsplash)
const HERO_BG = '/hero-bg.png'
const KAUAI_PHOTO = 'https://images.unsplash.com/photo-1505852679233-d9fd70aff56d?auto=format&fit=crop&w=600&q=80'
const MAUI_PHOTO = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80'

const HIGHLIGHTS = [
  {
    title: 'Na Pali Coast Boat Tour',
    description: '5-hour catamaran cruise along Kauai\'s dramatic coastline with snorkeling and dolphins.',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80',
    day: 4,
    date: '2026-03-17',
    destination: 'Kauai',
    time: '8:00 AM – 1:00 PM',
    icon: Ship,
    eventId: 'e-0403',
  },
  {
    title: 'Haleakala Sunrise',
    description: 'Watch the sunrise from 10,023 feet above Maui\'s dormant volcano crater.',
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&q=80',
    day: 8,
    date: '2026-03-21',
    destination: 'Maui',
    time: '5:30 AM – 7:30 AM',
    icon: Sunrise,
    eventId: 'e-0802',
  },
  {
    title: 'Waimea Canyon Drive',
    description: 'Scenic drive through the "Grand Canyon of the Pacific" with stunning lookout points.',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80',
    day: 3,
    date: '2026-03-16',
    destination: 'Kauai',
    time: '9:00 AM – 2:00 PM',
    icon: Mountain,
    eventId: 'e-0303',
  },
  {
    title: 'Poipu Beach Snorkeling',
    description: 'Crystal-clear waters with sea turtles and tropical fish at Kauai\'s sunny south shore.',
    image: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?auto=format&fit=crop&w=600&q=80',
    day: 2,
    date: '2026-03-15',
    destination: 'Kauai',
    time: '2:00 PM – 5:00 PM',
    icon: Waves,
    eventId: 'e-0205',
  },
  {
    title: 'Road to Hana',
    description: 'Legendary coastal highway through bamboo forests, waterfalls, and black sand beaches.',
    image: 'https://images.unsplash.com/photo-1616193653378-a9414ff47462?auto=format&fit=crop&w=600&q=80',
    day: 6,
    date: '2026-03-19',
    destination: 'Maui',
    time: '6:30 AM – 5:00 PM',
    icon: Mountain,
    eventId: 'e-0602',
  },
]

// --- Design tokens (from shared styles) ---
const palette = warmPalette
const glass = sharedGlass

// --- Inline editable text ---
function InlineEdit({ value, onSave, style }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef(null)

  useEffect(() => { setDraft(value) }, [value])
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  const commit = () => {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== value) onSave(trimmed)
    else setDraft(value)
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === 'Enter') commit()
          if (e.key === 'Escape') { setDraft(value); setEditing(false) }
        }}
        style={{
          ...style,
          border: 'none',
          borderBottom: `2px solid ${palette.accent}`,
          outline: 'none',
          background: 'transparent',
          padding: '0 0 2px',
          margin: 0,
          width: '100%',
        }}
        onClick={e => e.stopPropagation()}
      />
    )
  }

  return (
    <span
      role="button"
      tabIndex={0}
      onClick={e => { e.stopPropagation(); setEditing(true) }}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); setEditing(true) } }}
      style={{
        ...style,
        cursor: 'text',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
      }}
    >
      {value}
    </span>
  )
}

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
  switch (condition) {
    case 'sunny': return <Sun size={size} color={color || colors.sunset} strokeWidth={1.5} />
    case 'partly-cloudy': return <CloudSun size={size} color={color || colors.amber} strokeWidth={1.5} />
    case 'cloudy': return <Cloud size={size} color={color || colors.textMuted} strokeWidth={1.5} />
    case 'rain': return <CloudRain size={size} color={color || colors.info} strokeWidth={1.5} />
    default: return <Sun size={size} color={color || colors.sunset} strokeWidth={1.5} />
  }
}

function mapWeatherCode(code) {
  if (code <= 1) return 'sunny'
  if (code <= 3) return 'partly-cloudy'
  if (code <= 67) return 'cloudy'
  return 'rain'
}

async function fetchWeatherForZip(zipCode, tripStart, tripEnd) {
  const geoRes = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(zipCode)}&count=1&language=en&format=json`
  )
  const geoData = await geoRes.json()
  if (!geoData.results?.length) throw new Error('Location not found')
  const { latitude, longitude, name } = geoData.results[0]

  // Fetch maximum 16-day forecast
  const wxRes = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weathercode&temperature_unit=fahrenheit&timezone=auto&forecast_days=16`
  )
  const wxData = await wxRes.json()
  if (wxData.error) throw new Error(wxData.reason || 'Weather fetch failed')

  // Only keep forecast entries that overlap with trip dates
  const result = {}
  const tripDays = new Set()
  const d = new Date(tripStart + 'T00:00:00')
  const end = new Date(tripEnd + 'T00:00:00')
  while (d <= end) {
    tripDays.add(d.toISOString().slice(0, 10))
    d.setDate(d.getDate() + 1)
  }

  let forecastEnd = null
  wxData.daily.time.forEach((date, i) => {
    const hi = wxData.daily.temperature_2m_max[i]
    const lo = wxData.daily.temperature_2m_min[i]
    const code = wxData.daily.weathercode[i]
    if (hi == null || lo == null) return // skip null entries
    forecastEnd = date
    if (tripDays.has(date)) {
      result[date] = {
        high: Math.round(hi),
        low: Math.round(lo),
        code,
        condition: mapWeatherCode(code),
      }
    }
  })

  const matched = Object.keys(result).length
  const total = tripDays.size
  return { data: result, locationName: name, matched, total, forecastEnd }
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
  const fileInputRef = useRef(null)
  const [zipInput, setZipInput] = useState(state.weatherZipCode || '')
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [weatherError, setWeatherError] = useState('')
  const [weatherInfo, setWeatherInfo] = useState('')

  // Fetch weather on mount if zip code was previously saved
  useEffect(() => {
    if (state.weatherZipCode && Object.keys(state.weatherData).length === 0) {
      setWeatherLoading(true)
      fetchWeatherForZip(state.weatherZipCode, trip.startDate, trip.endDate)
        .then(({ data, matched, total, locationName }) => {
          dispatch({ type: 'SET_WEATHER_DATA', payload: data })
          if (matched === 0) {
            setWeatherInfo(`Forecasts for ${locationName} aren't available yet for your trip dates. Real weather will appear once the trip is within 16 days.`)
          } else if (matched < total) {
            setWeatherInfo(`Showing forecast for ${matched} of ${total} trip days from ${locationName}`)
          } else {
            setWeatherInfo(`${locationName} forecast loaded`)
          }
        })
        .catch(() => {})
        .finally(() => setWeatherLoading(false))
    }
  }, []) // eslint-disable-line

  const handleWeatherSubmit = useCallback(async () => {
    const zip = zipInput.trim()
    if (!zip) return
    setWeatherError('')
    setWeatherInfo('')
    setWeatherLoading(true)
    try {
      const { data, matched, total, locationName } = await fetchWeatherForZip(zip, trip.startDate, trip.endDate)
      dispatch({ type: 'SET_WEATHER_ZIP', payload: zip })
      dispatch({ type: 'SET_WEATHER_DATA', payload: data })
      if (matched === 0) {
        setWeatherInfo(`Forecasts for ${locationName} aren't available yet for your trip dates. Real weather will appear once the trip is within 16 days.`)
      } else if (matched < total) {
        setWeatherInfo(`Showing forecast for ${matched} of ${total} trip days from ${locationName}`)
      } else {
        setWeatherInfo(`${locationName} forecast loaded`)
      }
    } catch {
      setWeatherError('Could not find weather for that location')
    } finally {
      setWeatherLoading(false)
    }
  }, [zipInput, dispatch, trip.startDate, trip.endDate])

  // Helper: get weather for a date (real data or simulated fallback)
  const getWeather = useCallback((date, destId) => {
    const real = state.weatherData[date]
    if (real) return { temp: real.high, condition: real.condition, isReal: true }
    return { ...getSimulatedWeather(date, destId), isReal: false }
  }, [state.weatherData])

  // Resolve hero image: custom upload > default
  const heroSrc = state.heroImage || HERO_BG

  // Compress and store uploaded image
  const handleHeroUpload = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const maxW = 1200
        const scale = Math.min(1, maxW / img.width)
        canvas.width = img.width * scale
        canvas.height = img.height * scale
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7)
        dispatch({ type: 'SET_HERO_IMAGE', payload: dataUrl })
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }, [dispatch])

  // Preload hero image
  useEffect(() => {
    const img = new Image()
    img.src = heroSrc
    img.onload = () => setHeroLoaded(true)
  }, [heroSrc])

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
    <div style={{ background: glossyBg, minHeight: '100vh' }}>

      {/* ================================================================ */}
      {/* HERO SECTION — Full-bleed photo with glass overlays              */}
      {/* ================================================================ */}
      <div style={{
        position: 'relative',
        height: 110,
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
            backgroundImage: `url(${heroSrc})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 40%',
          }}
        />

        {/* Gradient overlay — warm, subtle */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: scrimGradient,
        }} />

        {/* Top bar — camera upload only */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 3,
          }}
        >
          {/* Camera upload button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            aria-label="Change cover photo"
            style={{
              ...glass.frosted,
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Camera size={14} color={colors.textOnDark} strokeWidth={2} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleHeroUpload}
            style={{ display: 'none' }}
          />
        </motion.div>

      </div>

      {/* ================================================================ */}
      {/* CONTENT PANEL — Surface overlapping hero                        */}
      {/* ================================================================ */}
      <div style={{
        background: glossyBg,
        borderRadius: '24px 24px 0 0',
        marginTop: -28,
        position: 'relative',
        zIndex: 2,
        padding: '20px 20px 100px',
      }}>
        {/* Pull indicator */}
        <div style={{
          width: 32,
          height: 4,
          borderRadius: 2,
          backgroundColor: colors.dragHandle,
          margin: '0 auto 16px',
        }} />

        {/* --- Destination Cards — Photo + Glass overlay --- */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          style={{
            display: 'flex',
            gap: 14,
            marginBottom: 20,
          }}
        >
          {trip.destinations.map((dest, i) => (
            <DestCard
              key={dest.id}
              destination={dest}
              photo={state.destImages?.[dest.id] || (i === 0 ? KAUAI_PHOTO : MAUI_PHOTO)}
              dayCount={getDestDayCount(dest.id)}
              delay={0.35 + i * 0.1}
              onTap={() => {
                const firstDay = Object.values(days).find(d => d.destinationId === dest.id)
                if (firstDay) onNavigate('day', firstDay.date)
              }}
              onPhotoChange={(dataUrl) => {
                dispatch({ type: 'SET_DEST_IMAGE', payload: { destId: dest.id, dataUrl } })
              }}
            />
          ))}
        </motion.div>

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
                  ...glass.card,
                  borderRadius: radius.lg,
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
                  {/* Icon + Title row */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 4,
                  }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: radius.iconSquare,
                      backgroundColor: eventBgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <EventIcon size={16} color={eventColor} strokeWidth={2} />
                    </div>
                    <span style={{
                      ...typography.sectionHeader,
                      color: palette.textDark,
                      fontFamily: fontStack,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {nextUp.event.title}
                    </span>
                  </div>

                  {/* Time line */}
                  <div style={{
                    ...typography.body,
                    color: palette.textMedium,
                    marginBottom: locationStr ? 4 : 0,
                  }}>
                    {dayLabel} · {formatTime(nextUp.event.startTime)}
                  </div>

                  {/* Location */}
                  {locationStr && (
                    <div style={{
                      ...typography.body,
                      color: palette.textLight,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}>
                      <MapPin size={13} color={palette.textLight} strokeWidth={1.5} />
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
          const statusBg = isDelayed ? colors.warningLight : colors.successLight
          const statusColor = isDelayed ? colors.warning : colors.success

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
                ...glass.card,
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
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  flex: 1,
                  minWidth: 0,
                  marginRight: 8,
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: radius.iconSquare,
                    backgroundColor: 'rgba(43,122,158,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Plane size={16} color="#2B7A9E" strokeWidth={2} />
                  </div>
                  <InlineEdit
                    value={fl.title}
                    onSave={(v) => dispatch({ type: 'UPDATE_EVENT', payload: { date: nextFlight.dateStr, eventId: fl.id, updates: { title: v } } })}
                    style={{
                      ...typography.sectionHeader,
                      color: palette.textDark,
                      fontFamily: fontStack,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  />
                </div>
                <div style={{
                  backgroundColor: statusBg,
                  color: statusColor,
                  padding: '3px 10px',
                  borderRadius: radius.pill,
                  fontSize: 12,
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
                ...typography.body,
                color: palette.textMedium,
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
                  fontWeight: 600,
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
                  fontWeight: 600,
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
                backgroundColor: colors.borderLight,
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
                ...glass.card,
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
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  flex: 1,
                  minWidth: 0,
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: radius.iconSquare,
                    backgroundColor: warmPalette.goldSoft,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <CalendarDays size={16} color={colors.sand} strokeWidth={2} />
                  </div>
                  <InlineEdit
                    value={trip.name || 'Your Trip'}
                    onSave={(v) => dispatch({ type: 'UPDATE_TRIP', payload: { name: v } })}
                    style={{
                      ...typography.sectionHeader,
                      color: palette.textDark,
                      fontFamily: fontStack,
                    }}
                  />
                </div>
                <div style={{
                  backgroundColor: palette.accentSoft,
                  color: palette.textDark,
                  padding: '3px 10px',
                  borderRadius: radius.pill,
                  fontSize: 12,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}>
                  {daysAway}d away
                </div>
              </div>

              {/* Date range */}
              <div style={{
                ...typography.body,
                color: palette.textMedium,
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
                  ...typography.body,
                  fontWeight: 500,
                  color: palette.textMedium,
                }}>
                  {destNames}
                </span>
              </div>

              {/* Divider */}
              <div style={{
                height: 1,
                backgroundColor: colors.borderLight,
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

        {/* --- Your Schedule --- */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          style={{
            ...glass.card,
            borderRadius: radius.lg,
            padding: spacing.lg,
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: spacing.md,
          }}>
            <span style={{
              ...typography.sectionHeader,
              color: palette.textDark,
            }}>
              Your Schedule
            </span>
            <span style={{
              ...typography.helper,
              color: palette.textLight,
            }}>
              Swipe to browse
            </span>
          </div>

          {/* Weather zip code input */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 14,
          }}>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Zip code for weather"
              value={zipInput}
              onChange={e => setZipInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleWeatherSubmit() }}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: radius.iconSquare,
                border: `1px solid ${weatherError ? '#C0392B' : '#E2E0DB'}`,
                backgroundColor: colors.surface,
                fontSize: 14,
                fontFamily: fontStack,
                color: palette.textDark,
                outline: 'none',
              }}
            />
            <button
              onClick={handleWeatherSubmit}
              disabled={weatherLoading || !zipInput.trim()}
              style={{
                padding: '8px 14px',
                borderRadius: radius.iconSquare,
                border: 'none',
                backgroundColor: weatherLoading || !zipInput.trim() ? palette.warmGray : colors.ocean,
                color: weatherLoading || !zipInput.trim() ? palette.textMedium : colors.textOnAccent,
                fontSize: typography.helper.fontSize,
                fontWeight: 600,
                fontFamily: fontStack,
                cursor: weatherLoading || !zipInput.trim() ? 'default' : 'pointer',
                opacity: weatherLoading || !zipInput.trim() ? 0.5 : 1,
                whiteSpace: 'nowrap',
              }}
            >
              {weatherLoading ? 'Loading…' : state.weatherZipCode ? 'Update' : 'Get Weather'}
            </button>
          </div>
          {weatherError && (
            <div style={{
              ...typography.helper,
              color: '#C0392B',
              marginBottom: 10,
              marginTop: -8,
            }}>
              {weatherError}
            </div>
          )}
          {weatherInfo && !weatherError && (
            <div style={{
              ...typography.helper,
              color: palette.textMedium,
              marginBottom: 10,
              marginTop: -8,
            }}>
              {weatherInfo}
            </div>
          )}

          <div style={{
            display: 'flex',
            gap: 10,
            overflowX: 'auto',
            paddingBottom: 4,
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            marginLeft: -4,
            paddingLeft: 4,
          }}>
            {tripDates.map((date, i) => {
              const dest = getDestForDate(date)
              const weather = getWeather(date, dest?.id)

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
                    backgroundColor: 'rgba(0,0,0,0.03)',
                    borderRadius: 14,
                    border: 'none',
                    cursor: 'pointer',
                    minWidth: 56,
                    flexShrink: 0,
                    fontFamily: fontStack,
                    position: 'relative',
                    touchAction: 'pan-x',
                  }}
                >
                  <span style={{
                    fontSize: typography.caption.fontSize,
                    fontWeight: 600,
                    color: palette.textLight,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: 3,
                  }}>
                    {formatDayOfWeek(date)}
                  </span>
                  <span style={{
                    fontSize: 18,
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
                    fontSize: typography.caption.fontSize,
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

        {/* --- Trip Highlights — Scrollable editorial cards --- */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          style={{
            marginTop: 24,
            ...glass.card,
            borderRadius: radius.lg,
            padding: spacing.lg,
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 14,
          }}>
            <span style={{
              ...typography.sectionHeader,
              color: palette.textDark,
            }}>
              Trip Highlights
            </span>
            <span style={{
              ...typography.helper,
              color: palette.textLight,
            }}>
              {HIGHLIGHTS.length} highlights
            </span>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}>
            {HIGHLIGHTS.map((hl, i) => {
              const HlIcon = hl.icon
              return (
                <motion.div
                  key={hl.date}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.25 + i * 0.08 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    dispatch({ type: 'SET_SELECTED_EVENT', payload: hl.eventId })
                    onNavigate('eventDetail', hl.date)
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      dispatch({ type: 'SET_SELECTED_EVENT', payload: hl.eventId })
                      onNavigate('eventDetail', hl.date)
                    }
                  }}
                  style={{
                    ...glass.card,
                    borderRadius: radius.lg,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    width: '100%',
                  }}
                >
                  {/* Image area */}
                  <div style={{
                    height: 130,
                    backgroundImage: `url(${hl.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative',
                  }}>
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, transparent 30%, rgba(28,25,23,0.75) 100%)',
                    }} />
                    <div style={{
                      position: 'absolute',
                      bottom: 10,
                      left: 12,
                      right: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <HlIcon size={14} color={colors.textOnDark} strokeWidth={2} />
                        <span style={{
                          fontSize: typography.caption.fontSize,
                          fontWeight: 600,
                          color: colors.textOnDark,
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                        }}>
                          Highlight
                        </span>
                      </div>
                      <div style={{
                        ...glass.frosted,
                        borderRadius: radius.pill,
                        padding: '4px 8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}>
                        <Clock size={11} color={colors.textOnDark} />
                        <span style={{ fontSize: typography.caption.fontSize, color: colors.textOnDark, fontWeight: 500 }}>Day {hl.day}</span>
                      </div>
                    </div>
                  </div>

                  {/* Content area */}
                  <div style={{ padding: '14px 16px 16px' }}>
                    <h3 style={{
                      ...typography.sectionHeader,
                      fontFamily: fontStack,
                      color: palette.textDark,
                      margin: '0 0 8px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {hl.title}
                    </h3>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      marginBottom: 8,
                    }}>
                      <MapPin size={13} color={palette.textMedium} strokeWidth={2} />
                      <span style={{
                        fontSize: typography.helper.fontSize,
                        fontWeight: 500,
                        color: palette.textMedium,
                        fontFamily: fontStack,
                      }}>
                        {hl.destination}
                      </span>
                      <span style={{ fontSize: typography.helper.fontSize, color: palette.textLight }}>·</span>
                      <Clock size={13} color={palette.textMedium} strokeWidth={2} />
                      <span style={{
                        fontSize: typography.helper.fontSize,
                        fontWeight: 500,
                        color: palette.textMedium,
                        fontFamily: fontStack,
                      }}>
                        {hl.time}
                      </span>
                    </div>
                    <p style={{
                      ...typography.body,
                      fontFamily: fontStack,
                      color: palette.textMedium,
                      margin: 0,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      {hl.description}
                    </p>
                  </div>
                </motion.div>
              )
            })}
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
  const dotColor = isDone ? colors.success : isCurrent ? palette.accent : 'transparent'
  const dotBorder = !isDone && !isCurrent ? `2px solid ${colors.border}` : 'none'
  const lineColor = isDone ? colors.success : colors.border

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
              boxShadow: shadows.accentGlowStrong,
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
            fontSize: typography.helper.fontSize,
            fontWeight: isCurrent ? 700 : 400,
            color: isCurrent ? palette.textDark : palette.textLight,
            fontFamily: fontStack,
          }}>
            {milestone.label}
          </span>
          <span style={{
            fontSize: typography.caption.fontSize,
            fontWeight: 600,
            color: isCurrent ? palette.textDark : palette.textLight,
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
            fontSize: typography.caption.fontSize,
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
function DestCard({ destination, photo, dayCount, delay, onTap, onPhotoChange }) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const destFileRef = useRef(null)
  const isKauai = destination.id === 'dest-kauai'
  const accentColor = isKauai ? palette.accent : colors.sand

  useEffect(() => {
    const img = new Image()
    img.src = photo
    img.onload = () => setImgLoaded(true)
  }, [photo])

  const handlePhotoUpload = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const maxW = 600
        const scale = Math.min(1, maxW / img.width)
        canvas.width = img.width * scale
        canvas.height = img.height * scale
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7)
        onPhotoChange(dataUrl)
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }, [onPhotoChange])

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      style={{
        flex: 1,
        borderRadius: 20,
        overflow: 'hidden',
        ...glass.card,
        position: 'relative',
      }}
    >
      {/* Photo zone — tap to change photo */}
      <div
        onClick={() => destFileRef.current?.click()}
        style={{
          height: 50,
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer',
        }}
      >
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
              : `linear-gradient(135deg, ${colors.sand}22, ${colors.sand}44)`,
          }} />
        )}
        {/* Subtle camera hint */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.15)',
          opacity: 0,
          transition: 'opacity 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
          onMouseLeave={e => e.currentTarget.style.opacity = '0'}
        >
          <Camera size={16} color={colors.textOnDark} strokeWidth={2} />
        </div>
        <input
          ref={destFileRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          style={{ display: 'none' }}
        />
      </div>

      {/* Info zone — tap to navigate to schedule */}
      <div
        onClick={onTap}
        style={{ padding: '12px 16px 14px', cursor: 'pointer' }}
      >
        <h3 style={{
          fontSize: 18,
          fontWeight: 700,
          color: palette.textDark,
          margin: 0,
          fontFamily: fontStack,
        }}>
          {destination.name}
        </h3>
        <p style={{
          ...typography.body,
          color: palette.textMedium,
          margin: '2px 0 0',
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
            <span style={{ fontSize: typography.helper.fontSize, color: palette.textMedium, fontWeight: 500 }}>
              {dayCount} days
            </span>
          </div>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: radius.iconSquare,
            background: accentColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <ArrowRight size={14} color={colors.textOnDark} strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
