import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, CheckCircle2, Pencil } from 'lucide-react'
import { typography, spacing, radius, shadows, warmPalette, glass } from '../styles'
import { colors } from '../colors'
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

  // Buffer events stay minimal — compact card, no image
  if (isBuffer) {
    const minutes = event.bufferMinutes || 0
    const isTight = minutes > 0 && minutes <= 20
    const bufferTextColor = isTight ? colors.warning : warmPalette.textMedium

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
          borderRadius: radius.md,
          backgroundColor: isTight ? colors.warningLight : colors.surface,
          border: `1px solid ${isTight ? colors.warning + '30' : 'rgba(0,0,0,0.04)'}`,
          borderLeft: isTight ? `3px dashed ${colors.warning}` : '1px solid rgba(0,0,0,0.04)',
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
          ...typography.sectionHeader,
          fontSize: typography.helper.fontSize,
          color: bufferTextColor,
        }}>
          {timeRange}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          <Icon size={18} color={isTight ? colors.warning : accentColor} strokeWidth={2.5} />
          <p style={{ ...typography.sectionHeader, fontSize: 15, color: isTight ? colors.warning : warmPalette.textDark, margin: 0, flex: 1 }}>
            {minutes > 0 ? `~${minutes} min buffer` : event.title}
          </p>
          {isTight && (
            <span style={{
              ...typography.caption,
              color: colors.warning,
              backgroundColor: 'rgba(217,123,43,0.12)',
              padding: `2px ${spacing.sm}px`,
              borderRadius: radius.sm,
              flexShrink: 0,
            }}>
              Tight
            </span>
          )}
        </div>
        {(event.bufferLabel || (minutes > 0 && event.title)) && !event.subtitle && (
          <p style={{ ...typography.body, color: bufferTextColor, margin: 0 }}>
            {event.bufferLabel || event.title}
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
        ...(event.status === 'done' && { opacity: 0.45, filter: 'grayscale(0.6)' }),
        position: 'relative',
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
          <Icon size={14} color={colors.textOnDark} strokeWidth={2.5} />
          <span style={{
            color: colors.textOnDark,
            fontSize: typography.caption.fontSize,
            fontWeight: 600,
            letterSpacing: '0.01em',
          }}>
            {formatTime(event.startTime)}
          </span>
          <span style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: typography.caption.fontSize,
            fontWeight: 500,
          }}>
            · {eventType.label}
          </span>
        </div>

        {/* Edit icon overlay (top-right) */}
        <div style={{
          position: 'absolute',
          top: spacing.sm,
          right: spacing.sm,
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: 'rgba(0,0,0,0.35)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2,
        }}>
          <Pencil size={13} color={colors.textOnDark} strokeWidth={2} />
        </div>
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

        {/* Done badge inline */}
        {event.status === 'done' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            backgroundColor: 'rgba(39,129,91,0.12)',
            padding: '3px 10px',
            borderRadius: radius.pill,
            flexShrink: 0,
            marginRight: 4,
          }}>
            <CheckCircle2 size={14} color="#27815B" strokeWidth={2} />
            <span style={{
              fontSize: typography.caption.fontSize,
              fontWeight: 600,
              color: '#27815B',
              letterSpacing: '0.02em',
            }}>
              Done
            </span>
          </div>
        )}

        {/* Details button */}
        {onDetail && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDetail(event)
            }}
            style={{
              height: 34,
              paddingLeft: 12,
              paddingRight: 10,
              borderRadius: radius.sm,
              border: 'none',
              backgroundColor: warmPalette.warmGray,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              flexShrink: 0,
              fontSize: typography.helper.fontSize,
              fontWeight: 600,
              color: warmPalette.textMedium,
            }}
            aria-label={`View details for ${event.title}`}
          >
            Details
            <ChevronRight size={16} color={warmPalette.textMedium} strokeWidth={2.5} />
          </button>
        )}
      </div>
    </motion.div>
  )
}
