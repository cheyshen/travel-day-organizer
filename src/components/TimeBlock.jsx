import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { typography, spacing, radius, shadows, warmPalette, glass } from '../styles'
import { formatTime, getEventColor, getEventIcon } from '../utils/timeUtils'
import { getEventType } from '../data/eventTypes'
import { getCoverImage, getCoverGradient } from '../data/coverImages'

// =============================================================================
// TIME BLOCK — Image card for the day timeline (reference design)
// =============================================================================

const IMAGE_HEIGHT = 125

export default function TimeBlock({ event, isNext, onTap, onDetail }) {
  const accentColor = getEventColor(event.type)
  const Icon = getEventIcon(event.type)
  const eventType = getEventType(event.type)
  const isBuffer = event.type === 'buffer'
  const coverUrl = event.coverImage || getCoverImage(event.type, event.id)
  const gradient = getCoverGradient(event.type)

  const [imgError, setImgError] = useState(false)

  // Buffer events stay minimal — compact white card, no image
  if (isBuffer) {
    const timeRange = event.startTime && event.endTime
      ? `${formatTime(event.startTime)} – ${formatTime(event.endTime)}`
      : formatTime(event.startTime)

    return (
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onTap(event)}
        style={{
          ...glass.subtle,
          borderRadius: radius.md,
          backgroundColor: 'rgba(245, 237, 216, 0.45)',
          padding: `${spacing.lg}px`,
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
        role="button"
        tabIndex={0}
      >
        <span style={{
          ...typography.helper,
          color: warmPalette.textMedium,
          fontWeight: 600,
        }}>
          {timeRange}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          <Icon size={18} color={accentColor} strokeWidth={2.5} />
          <p style={{ ...typography.sectionHeader, fontSize: 16, color: warmPalette.textDark, margin: 0 }}>
            {event.title}
          </p>
        </div>
        {event.bufferLabel && !event.subtitle && (
          <p style={{ ...typography.body, color: warmPalette.textMedium, margin: 0 }}>
            {event.bufferLabel}
          </p>
        )}
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onTap(event)}
      style={{
        borderRadius: radius.lg,
        overflow: 'hidden',
        ...glass.card,
        cursor: 'pointer',
      }}
      role="button"
      tabIndex={0}
    >
      {/* Image area */}
      <div style={{
        position: 'relative',
        height: IMAGE_HEIGHT,
        background: gradient,
        overflow: 'hidden',
      }}>
        {/* Cover image */}
        {!imgError && coverUrl && (
          <img
            src={coverUrl}
            alt=""
            onError={() => setImgError(true)}
            loading="lazy"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        )}

        {/* Gradient overlay for badge readability */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 60,
          background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%)',
        }} />

        {/* Time + type badge (bottom-left) */}
        <div style={{
          position: 'absolute',
          bottom: spacing.sm,
          left: spacing.sm,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          padding: `4px ${spacing.sm + 2}px`,
          borderRadius: radius.sm,
        }}>
          <Icon size={14} color="#FFFFFF" strokeWidth={2.5} />
          <span style={{
            color: '#FFFFFF',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.01em',
          }}>
            {formatTime(event.startTime)}
          </span>
          <span style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: 11,
            fontWeight: 500,
          }}>
            · {eventType.label}
          </span>
        </div>

        {/* "NEXT UP" badge (top-right) */}
        {isNext && (
          <div style={{
            position: 'absolute',
            top: spacing.sm,
            right: spacing.sm,
            backgroundColor: '#B45309',
            color: '#FFFFFF',
            padding: `4px ${spacing.sm + 2}px`,
            borderRadius: radius.sm,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}>
            Next up
          </div>
        )}
      </div>

      {/* Content area */}
      <div style={{
        padding: `${spacing.md}px ${spacing.lg}px`,
        display: 'flex',
        alignItems: 'center',
        gap: spacing.sm,
      }}>
        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            ...typography.sectionHeader,
            color: warmPalette.textDark,
            margin: 0,
          }}>
            {event.title}
          </p>
          {(event.subtitle || event.location) && (
            <p style={{
              ...typography.body,
              color: warmPalette.textMedium,
              margin: 0,
              marginTop: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {event.subtitle || event.location?.destination || event.location?.origin || ''}
            </p>
          )}
        </div>

        {/* Chevron → detail page */}
        {onDetail && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDetail(event)
            }}
            style={{
              width: 34,
              height: 34,
              borderRadius: radius.sm,
              border: 'none',
              backgroundColor: '#EDEAE5',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              padding: 0,
            }}
            aria-label={`View details for ${event.title}`}
          >
            <ChevronRight size={18} color={warmPalette.textMedium} strokeWidth={2.5} />
          </button>
        )}
      </div>
    </motion.div>
  )
}
