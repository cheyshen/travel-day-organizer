import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Clock, MapPin, Hash, FileText, Edit3, CheckCircle, AlertTriangle } from 'lucide-react'
import { useTripContext } from '../context/TripContext'
import { typography, spacing, radius, shadows, warmPalette } from '../styles'
import { formatTime, formatTimeRange, getDurationMinutes, formatDuration, getEventIcon, getEventColor, getEventBgColor, getStatusLabel, getStatusColor, getStatusBg } from '../utils/timeUtils'
import { getEventType } from '../data/eventTypes'
import EventEditor from '../components/EventEditor'

// Event type → location photo mapping (Unsplash)
const TYPE_PHOTOS = {
  flight: 'https://images.unsplash.com/photo-1436491865332-7a61a109db05?auto=format&fit=crop&w=600&h=160&q=80',
  ground_transport: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=600&h=160&q=80',
  hotel: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=600&h=160&q=80',
  activity: 'https://images.unsplash.com/photo-1505852679233-d9fd70aff56d?auto=format&fit=crop&w=600&h=160&q=80',
  dining: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=600&h=160&q=80',
  boat: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&h=160&q=80',
  sunrise: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?auto=format&fit=crop&w=600&h=160&q=80',
  sightseeing: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&h=160&q=80',
  beach: 'https://images.unsplash.com/photo-1559494007-9f5847c49d94?auto=format&fit=crop&w=600&h=160&q=80',
  hiking: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&h=160&q=80',
  shopping: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&h=160&q=80',
  entertainment: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=600&h=160&q=80',
}
const DEFAULT_PHOTO = 'https://images.unsplash.com/photo-1505852679233-d9fd70aff56d?auto=format&fit=crop&w=600&h=160&q=80'

// =============================================================================
// EVENT DETAIL VIEW — Full event information page
// =============================================================================

export default function EventDetailView({ onNavigate }) {
  const { state, dispatch } = useTripContext()
  const { days, selectedDate, selectedEventId } = state

  const [isEditing, setIsEditing] = useState(false)

  const day = days[selectedDate]
  const event = day?.events?.find(e => e.id === selectedEventId)

  // If event not found, go back
  if (!event) {
    return (
      <div style={{ backgroundColor: warmPalette.warmGray, minHeight: '100vh', padding: spacing.xl }}>
        <button
          onClick={() => onNavigate('day')}
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
  const Icon = getEventIcon(event.type)
  const accentColor = getEventColor(event.type)
  const bgColor = getEventBgColor(event.type)
  const duration = getDurationMinutes(event.startTime, event.endTime)

  function handleBack() {
    onNavigate('day')
  }

  function handleEdit() {
    setIsEditing(true)
  }

  function handleEditorSave(eventData) {
    dispatch({
      type: 'UPDATE_EVENT',
      payload: { date: selectedDate, eventId: event.id, updates: eventData },
    })
    setIsEditing(false)
  }

  function handleEditorDelete(eventId) {
    dispatch({
      type: 'DELETE_EVENT',
      payload: { date: selectedDate, eventId },
    })
    onNavigate('day')
  }

  function handleEditorClose() {
    setIsEditing(false)
  }

  function handleStatusToggle() {
    const newStatus = event.status === 'done' ? 'upcoming' : 'done'
    dispatch({
      type: 'SET_EVENT_STATUS',
      payload: { date: selectedDate, eventId: event.id, status: newStatus },
    })
  }

  return (
    <div style={{ backgroundColor: warmPalette.warmGray, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        padding: `${spacing.lg}px ${spacing.lg}px ${spacing.md}px`,
        display: 'flex',
        alignItems: 'center',
        gap: spacing.md,
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        backgroundColor: '#FFFFFF',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <button
          onClick={handleBack}
          style={{
            width: 44, height: 44,
            borderRadius: radius.sm,
            border: `1.5px solid rgba(0,0,0,0.12)`,
            backgroundColor: '#FFFFFF',
            boxShadow: shadows.sm,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 0,
          }}
        >
          <ArrowLeft size={20} color={warmPalette.textDark} strokeWidth={2} />
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ ...typography.caption, color: warmPalette.textLight, margin: 0 }}>
            Event Details
          </p>
          <p style={{
            ...typography.bodyMedium,
            color: warmPalette.textDark,
            margin: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {event.title}
          </p>
        </div>

        <button
          onClick={handleEdit}
          style={{
            width: 44, height: 44,
            borderRadius: radius.sm,
            border: 'none',
            backgroundColor: warmPalette.accentSoft,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 0,
          }}
          aria-label="Edit event"
        >
          <Edit3 size={18} color={warmPalette.accent} strokeWidth={2} />
        </button>
      </div>

      {/* Location photo */}
      <div style={{
        height: 80,
        margin: `0 ${spacing.lg}px`,
        marginTop: spacing.md,
        borderRadius: `${radius.md}px ${radius.md}px 0 0`,
        backgroundImage: `url(${TYPE_PHOTOS[event.type] || DEFAULT_PHOTO})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, transparent 30%, rgba(28,25,23,0.35) 100%)',
        }} />
      </div>

      {/* Hero card — type icon + title */}
      <div style={{
        margin: `0 ${spacing.lg}px ${spacing.lg}px`,
        backgroundColor: '#FFFFFF',
        borderRadius: `0 0 ${radius.lg}px ${radius.lg}px`,
        border: `1px solid rgba(0,0,0,0.06)`,
        borderTop: 'none',
        borderLeftWidth: 5,
        borderLeftColor: accentColor,
        borderLeftStyle: 'solid',
        padding: `${spacing.xl}px ${spacing.lg}px`,
        display: 'flex',
        alignItems: 'center',
        gap: spacing.lg,
      }}>
        <div style={{
          width: 52,
          height: 52,
          borderRadius: radius.md,
          backgroundColor: `${accentColor}1A`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={26} color={accentColor} strokeWidth={2.5} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{
            ...typography.caption,
            color: accentColor,
            display: 'block',
            marginBottom: 4,
          }}>
            {eventType.label}
          </span>
          <h1 style={{
            ...typography.title,
            color: warmPalette.textDark,
            margin: 0,
            fontSize: 22,
            lineHeight: '28px',
          }}>
            {event.title}
          </h1>
          {event.subtitle && (
            <p style={{
              ...typography.body,
              color: warmPalette.textMedium,
              margin: 0,
              marginTop: 4,
            }}>
              {event.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Info sections */}
      <div style={{
        padding: `0 ${spacing.lg}px`,
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.md,
      }}>
        {/* Time */}
        {event.startTime && (
          <InfoRow
            icon={Clock}
            label="Time"
            value={formatTimeRange(event.startTime, event.endTime) || formatTime(event.startTime)}
            secondary={duration > 0 ? formatDuration(duration) : null}
            accentColor={accentColor}
          />
        )}

        {/* Location — origin/destination or single location */}
        {event.location && (
          <InfoRow
            icon={MapPin}
            label="Location"
            value={
              event.location.origin && event.location.destination
                ? `${event.location.origin} → ${event.location.destination}`
                : event.location.destination || event.location.origin || event.location.name || ''
            }
            accentColor={accentColor}
          />
        )}

        {/* Confirmation number */}
        {event.confirmationNumber && (
          <InfoRow
            icon={Hash}
            label="Confirmation"
            value={event.confirmationNumber}
            accentColor={accentColor}
            mono
          />
        )}

        {/* Timezone */}
        {event.timezone && (
          <InfoRow
            icon={Clock}
            label="Timezone"
            value={event.timezone.replace(/_/g, ' ').replace('America/', '')}
            accentColor={warmPalette.textLight}
          />
        )}

        {/* Notes */}
        {event.notes && (
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: radius.md,
            padding: spacing.lg,
            border: '1px solid rgba(0,0,0,0.06)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing.sm,
              marginBottom: spacing.sm,
            }}>
              <FileText size={16} color={warmPalette.textLight} strokeWidth={2} />
              <span style={{ ...typography.caption, color: warmPalette.textLight }}>
                Notes
              </span>
            </div>
            <p style={{
              ...typography.body,
              color: warmPalette.textMedium,
              margin: 0,
              whiteSpace: 'pre-wrap',
            }}>
              {event.notes}
            </p>
          </div>
        )}

        {/* Status */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: radius.md,
          padding: spacing.lg,
          border: '1px solid rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
            {event.status === 'done'
              ? <CheckCircle size={18} color="#27815B" strokeWidth={2.5} />
              : <AlertTriangle size={18} color={warmPalette.textLight} strokeWidth={2} />
            }
            <span style={{ ...typography.bodyMedium, color: warmPalette.textDark }}>
              Status
            </span>
          </div>

          <button
            onClick={handleStatusToggle}
            style={{
              padding: `${spacing.xs}px ${spacing.md}px`,
              borderRadius: radius.pill,
              border: 'none',
              backgroundColor: getStatusBg(event.status),
              color: getStatusColor(event.status),
              cursor: 'pointer',
              ...typography.helper,
              fontWeight: 600,
            }}
          >
            {getStatusLabel(event.status)}
          </button>
        </div>
      </div>

      {/* Bottom padding */}
      <div style={{ height: 100 }} />

      {/* Event Editor Modal */}
      <AnimatePresence>
        {isEditing && (
          <EventEditor
            event={event}
            isNew={false}
            date={selectedDate}
            onSave={handleEditorSave}
            onDelete={handleEditorDelete}
            onClose={handleEditorClose}
            onStatusToggle={handleStatusToggle}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// =============================================================================
// INFO ROW — Reusable detail row
// =============================================================================

function InfoRow({ icon: RowIcon, label, value, secondary, accentColor, mono }) {
  if (!value) return null

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      borderRadius: radius.md,
      padding: spacing.lg,
      border: '1px solid rgba(0,0,0,0.06)',
      display: 'flex',
      alignItems: 'flex-start',
      gap: spacing.md,
    }}>
      <div style={{
        width: 32,
        height: 32,
        borderRadius: radius.sm,
        backgroundColor: `${accentColor}14`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <RowIcon size={16} color={accentColor} strokeWidth={2} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{
          ...typography.caption,
          color: warmPalette.textLight,
          display: 'block',
          marginBottom: 2,
        }}>
          {label}
        </span>
        <p style={{
          ...typography.bodyMedium,
          color: warmPalette.textDark,
          margin: 0,
          fontFamily: mono ? "'SF Mono', 'Fira Code', monospace" : 'inherit',
          wordBreak: 'break-word',
        }}>
          {value}
        </p>
        {secondary && (
          <span style={{
            ...typography.helper,
            color: warmPalette.textLight,
            marginTop: 2,
            display: 'block',
          }}>
            {secondary}
          </span>
        )}
      </div>
    </div>
  )
}
