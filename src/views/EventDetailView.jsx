import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import { ArrowLeft, Edit3, Navigation as DirectionsIcon } from 'lucide-react'
import { useTripContext } from '../context/TripContext'
import { typography, spacing, radius, warmPalette, glass, glossyBg, cleanCard } from '../styles'
import { colors } from '../colors'
import { formatTime, getDurationMinutes, formatDuration, getEventColor } from '../utils/timeUtils'
import { getEventType } from '../data/eventTypes'
import { getCoverImage, getCoverGradient } from '../data/coverImages'
import EventEditor from '../components/EventEditor'

// =============================================================================
// EVENT DETAIL VIEW — Tour-style detail page
// Title → tag line → hero photo → description → details (stacked rows + action links)
// =============================================================================

const NOTES_CLAMP = 150

export default function EventDetailView({ onNavigate }) {
  const { state, dispatch } = useTripContext()
  const { days, selectedDate, selectedEventId, previousView } = state

  const [isEditing, setIsEditing] = useState(false)
  const [notesExpanded, setNotesExpanded] = useState(false)

  const day = days[selectedDate]
  const event = day?.events?.find(e => e.id === selectedEventId)

  // If event not found, go back
  if (!event) {
    return (
      <div style={{ background: glossyBg, minHeight: '100vh', padding: spacing.xl }}>
        <button
          onClick={() => onNavigate(previousView === 'hero' ? 'hero' : 'day')}
          style={{
            display: 'flex', alignItems: 'center', gap: spacing.sm,
            border: 'none', background: 'none', cursor: 'pointer',
            ...typography.bodyMedium, color: warmPalette.accent,
          }}
        >
          <ArrowLeft size={20} strokeWidth={2} />
          Back to timeline
        </button>
        <p style={{ ...typography.body, color: warmPalette.textMedium, marginTop: spacing.xl }}>
          Event not found
        </p>
      </div>
    )
  }

  const eventType = getEventType(event.type)
  const accentColor = getEventColor(event.type)
  const duration = getDurationMinutes(event.startTime, event.endTime)
  const coverSrc = event.coverImage || getCoverImage(event.type, event.id)

  // Location → maps query (destination preferred)
  const loc = event.location
  const placeQuery = loc ? (loc.destination || loc.name || loc.origin || '') : ''
  const directionsUrl = placeQuery
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(placeQuery)}`
    : null

  // Tag line beneath the title
  const tagLine = event.subtitle || (duration > 0 ? formatDuration(duration) : '')

  // Info chips (reference "Tour Package" row)
  const chips = []
  if (event.startTime) chips.push({ k: 'Time', v: formatTime(event.startTime), filled: true })
  if (duration > 0) chips.push({ k: 'Duration', v: formatDuration(duration) })
  if (placeQuery) chips.push({ k: 'Place', v: placeQuery })
  if (event.confirmationNumber) chips.push({ k: 'Confirmation', v: event.confirmationNumber, mono: true })

  const notes = event.notes || ''
  const notesIsLong = notes.length > NOTES_CLAMP

  let headerLabel = 'Detail'
  try { headerLabel = format(parseISO(selectedDate), 'EEE, MMM d') } catch { /* keep default */ }

  function handleBack() {
    onNavigate(previousView === 'hero' ? 'hero' : 'day')
  }

  function openMaps(url) {
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
  }

  function handleEditorSave(eventData) {
    dispatch({ type: 'UPDATE_EVENT', payload: { date: selectedDate, eventId: event.id, updates: eventData } })
    setIsEditing(false)
  }

  function handleEditorDelete(eventId) {
    dispatch({ type: 'DELETE_EVENT', payload: { date: selectedDate, eventId } })
    onNavigate('day')
  }

  return (
    <div style={{ background: glossyBg, minHeight: 'calc(100vh - 80px)' }}>
      {/* Header */}
      <div style={{
        padding: `${spacing.md}px ${spacing.lg}px`,
        display: 'flex',
        alignItems: 'center',
        gap: spacing.md,
        ...glass.frostedLight,
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <button
          onClick={handleBack}
          aria-label="Back"
          style={{
            width: 44, height: 44,
            borderRadius: radius.sm,
            ...cleanCard,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
          }}
        >
          <ArrowLeft size={20} color={warmPalette.textDark} strokeWidth={2} />
        </button>

        <span style={{ ...typography.bodyMedium, color: warmPalette.textMedium, flex: 1, textAlign: 'center' }}>
          {headerLabel}
        </span>

        {/* spacer balances the back button (edit lives in the bottom bar) */}
        <div style={{ width: 44, height: 44, flexShrink: 0 }} />
      </div>

      {/* Title + tag line */}
      <div style={{ padding: `${spacing.xxl}px ${spacing.lg}px 0` }}>
        <span style={{ ...typography.caption, color: accentColor, display: 'block', marginBottom: spacing.xs }}>
          {eventType.label}
        </span>
        <h1 style={{ ...typography.title, color: warmPalette.textDark, margin: 0 }}>
          {event.title}
        </h1>
        {tagLine && (
          <p style={{ ...typography.body, color: warmPalette.textMedium, margin: `${spacing.sm}px 0 0` }}>
            {tagLine}
          </p>
        )}
      </div>

      {/* Hero photo */}
      <div style={{
        height: 200,
        margin: `${spacing.lg}px ${spacing.lg}px 0`,
        borderRadius: radius.lg,
        overflow: 'hidden',
        position: 'relative',
        background: getCoverGradient(event.type),
        boxShadow: cleanCard.boxShadow,
      }}>
        <img
          src={coverSrc}
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => { e.target.style.display = 'none' }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, transparent 55%, rgba(28,25,23,0.28) 100%)',
        }} />
      </div>

      {/* Description */}
      {notes && (
        <div style={{ padding: `${spacing.xxl}px ${spacing.lg}px 0` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ ...typography.sectionHeader, color: warmPalette.textDark, margin: 0 }}>
              Description
            </h2>
            {notesIsLong && (
              <button
                onClick={() => setNotesExpanded(v => !v)}
                style={{
                  border: 'none', background: 'none', cursor: 'pointer', padding: 0,
                  ...typography.helper, fontWeight: 600, color: warmPalette.accent,
                }}
              >
                {notesExpanded ? 'Less' : 'More'}
              </button>
            )}
          </div>
          <p style={{
            ...typography.body,
            color: warmPalette.textMedium,
            margin: `${spacing.sm}px 0 0`,
            whiteSpace: 'pre-wrap',
            ...(notesIsLong && !notesExpanded ? {
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            } : {}),
          }}>
            {notes}
          </p>
        </div>
      )}

      {/* Details — stacked rows, with action links across from the title */}
      {chips.length > 0 && (
        <div style={{ padding: `${spacing.xxl}px ${spacing.lg}px 0` }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: spacing.sm, margin: `0 0 ${spacing.md}px`,
          }}>
            <h2 style={{ ...typography.sectionHeader, color: warmPalette.textDark, margin: 0 }}>
              Details
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.lg }}>
              {directionsUrl && (
                <button
                  onClick={() => openMaps(directionsUrl)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: spacing.xs,
                    border: 'none', background: 'none', cursor: 'pointer', padding: `${spacing.xs}px 0`,
                    ...typography.helper, fontWeight: 600, color: warmPalette.accent,
                  }}
                >
                  <DirectionsIcon size={14} strokeWidth={2.2} />
                  Get directions
                </button>
              )}
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: spacing.xs,
                  border: 'none', background: 'none', cursor: 'pointer', padding: 0,
                  ...typography.helper, fontWeight: 600, color: warmPalette.accent,
                }}
              >
                <Edit3 size={14} strokeWidth={2.2} />
                Edit
              </button>
            </div>
          </div>
          <div style={{ ...cleanCard, borderRadius: radius.lg, padding: `0 ${spacing.xl}px` }}>
            {chips.map((chip, i) => (
              <DetailRow key={i} chip={chip} isLast={i === chips.length - 1} />
            ))}
          </div>
        </div>
      )}

      {/* Bottom breathing room (global nav reserves 80px below) */}
      <div style={{ height: spacing.xl }} />

      {/* Event Editor Modal */}
      <AnimatePresence>
        {isEditing && (
          <EventEditor
            event={event}
            isNew={false}
            date={selectedDate}
            onSave={handleEditorSave}
            onDelete={handleEditorDelete}
            onClose={() => setIsEditing(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// =============================================================================
// DETAIL ROW — stacked label/value row inside the Details card
// =============================================================================

function DetailRow({ chip, isLast }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: spacing.lg,
      padding: `${spacing.md}px 0`,
      borderBottom: isLast ? 'none' : `1px solid ${colors.borderLight}`,
    }}>
      <span style={{ ...typography.helper, color: warmPalette.textLight, flexShrink: 0 }}>
        {chip.k}
      </span>
      <span style={{
        ...typography.helper,
        fontWeight: 600,
        color: warmPalette.textDark,
        textAlign: 'right',
        fontFamily: chip.mono ? "'SF Mono', 'Fira Code', monospace" : 'inherit',
        wordBreak: 'break-word',
        minWidth: 0,
      }}>
        {chip.v}
      </span>
    </div>
  )
}
