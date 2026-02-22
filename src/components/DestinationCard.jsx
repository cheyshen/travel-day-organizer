import { motion } from 'framer-motion'
import { MapPin, CalendarDays, Building2 } from 'lucide-react'
import { colors } from '../colors'
import { typography, spacing, radius, shadows } from '../styles'
import { formatShortDate } from '../utils/dateUtils'

// =============================================================================
// DESTINATION CARD — Kauai/Maui overview card
// =============================================================================

export default function DestinationCard({ destination, dayCount, eventCount, onTap }) {
  const isKauai = destination.id === 'dest-kauai'

  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: shadows.cardHover }}
      whileTap={{ scale: 0.98 }}
      onClick={onTap}
      style={{
        backgroundColor: colors.surface,
        borderRadius: radius.xl,
        border: `1px solid ${colors.border}`,
        borderLeft: `4px solid ${destination.color}`,
        padding: spacing.xl,
        cursor: 'pointer',
        boxShadow: shadows.card,
        flex: 1,
        minWidth: 0,
      }}
    >
      {/* Island badge */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: spacing.xs,
        backgroundColor: destination.accentLight,
        padding: `${spacing.xs}px ${spacing.sm}px`,
        borderRadius: radius.sm,
        marginBottom: spacing.md,
      }}>
        <MapPin size={12} color={destination.color} strokeWidth={2} />
        <span style={{
          ...typography.caption,
          color: destination.color,
          textTransform: 'none',
          fontWeight: 600,
        }}>
          {destination.island}
        </span>
      </div>

      {/* Name */}
      <h3 style={{
        ...typography.sectionHeader,
        color: colors.textPrimary,
        marginBottom: spacing.xs,
      }}>
        {destination.name}
      </h3>

      {/* Dates */}
      <p style={{
        ...typography.helper,
        color: colors.textSecondary,
        marginBottom: spacing.md,
      }}>
        {formatShortDate(destination.startDate)} — {formatShortDate(destination.endDate)}
      </p>

      {/* Stats row */}
      <div style={{
        display: 'flex',
        gap: spacing.lg,
        paddingTop: spacing.md,
        borderTop: `1px solid ${colors.borderLight}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
          <CalendarDays size={13} color={colors.textMuted} strokeWidth={1.5} />
          <span style={{ ...typography.helper, color: colors.textSecondary }}>
            {dayCount} days
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
          <Building2 size={13} color={colors.textMuted} strokeWidth={1.5} />
          <span style={{ ...typography.helper, color: colors.textSecondary }}>
            {destination.accommodation.name.split(' ').slice(0, 2).join(' ')}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
