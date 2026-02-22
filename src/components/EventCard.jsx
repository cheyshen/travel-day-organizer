import { motion } from 'framer-motion'
import { ChevronRight, AlertTriangle } from 'lucide-react'
import { colors } from '../colors'
import { typography, spacing, radius, shadows, tokens, warmPalette, glass } from '../styles'
import { formatTime, getStatusColor, getStatusBg, getEventIcon, getEventColor, getEventBgColor } from '../utils/timeUtils'
import StatusBadge from './StatusBadge'

// =============================================================================
// EVENT CARD — Timeline event card
// =============================================================================

export default function EventCard({ event, isNext, onTap }) {
  const Icon = getEventIcon(event.type)
  const typeColor = getEventColor(event.type)
  const typeBg = getEventBgColor(event.type)
  const statusColor = getStatusColor(event.status)

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onTap(event)}
      style={{
        ...glass.card,
        borderRadius: tokens.cardRadius,
        borderLeft: `4px solid ${statusColor}`,
        padding: spacing.lg,
        cursor: 'pointer',
        boxShadow: isNext
          ? `${shadows.md}, 0 0 0 1px rgba(180, 83, 9, 0.2)`
          : shadows.glass,
        position: 'relative',
      }}
      role="button"
      tabIndex={0}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing.md }}>
        {/* Icon */}
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: typeBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: 2,
        }}>
          <Icon size={20} color={typeColor} strokeWidth={1.75} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: spacing.xs,
          }}>
            <span style={{
              ...typography.body,
              fontWeight: 600,
              color: warmPalette.textDark,
            }}>
              {formatTime(event.startTime)}
            </span>
            {event.status !== 'upcoming' && <StatusBadge status={event.status} />}
          </div>

          <p style={{
            ...typography.sectionHeader,
            color: warmPalette.textDark,
            marginBottom: event.subtitle ? spacing.xs : 0,
          }}>
            {event.title}
          </p>

          {event.subtitle && (
            <p style={{ ...typography.helper, color: warmPalette.textMedium }}>
              {event.subtitle}
            </p>
          )}

          {event.location && (
            <p style={{
              ...typography.helper,
              color: warmPalette.textMedium,
              marginTop: spacing.xs,
            }}>
              {event.location.destination || event.location.origin || ''}
            </p>
          )}
        </div>

        {/* Chevron */}
        <ChevronRight
          size={18}
          color={warmPalette.textLight}
          style={{ flexShrink: 0, marginTop: 10 }}
        />
      </div>

      {/* "Next up" indicator */}
      {isNext && (
        <div style={{
          position: 'absolute',
          top: -8,
          right: spacing.lg,
          backgroundColor: '#B45309',
          color: '#FFFFFF',
          padding: `4px ${spacing.sm}px`,
          borderRadius: radius.sm,
          ...typography.caption,
        }}>
          Next up
        </div>
      )}
    </motion.div>
  )
}
