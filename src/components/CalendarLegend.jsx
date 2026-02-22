import { motion } from 'framer-motion'
import { typography, spacing, radius, shadows, warmPalette, glass } from '../styles'

// =============================================================================
// CALENDAR LEGEND — Interactive destination filter pills
// =============================================================================

export default function CalendarLegend({ destinations, days, activeFilter, onFilter }) {
  // Count trip days per destination
  const destCounts = {}
  for (const day of Object.values(days)) {
    if (day.destinationId) {
      destCounts[day.destinationId] = (destCounts[day.destinationId] || 0) + 1
    }
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      gap: spacing.sm,
      padding: `${spacing.md}px 0`,
    }}>
      {destinations.map(dest => {
        const isActive = activeFilter === dest.id
        const count = destCounts[dest.id] || 0
        const isKauai = dest.id === 'dest-kauai'

        return (
          <motion.button
            key={dest.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => onFilter(isActive ? null : dest.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing.sm,
              padding: `${spacing.sm}px ${spacing.lg}px`,
              borderRadius: radius.pill,
              border: isActive
                ? `2px solid ${dest.color}`
                : '2px solid transparent',
              ...(isActive ? { backgroundColor: dest.accentLight } : glass.badge),
              boxShadow: isActive ? shadows.md : glass.badge.boxShadow,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {/* Shape indicator */}
            <span style={{
              width: 10,
              height: 10,
              borderRadius: isKauai ? '50%' : 2,
              backgroundColor: dest.color,
              display: 'inline-block',
              flexShrink: 0,
            }} />
            <span style={{
              ...typography.helper,
              fontWeight: 600,
              color: isActive ? dest.color : warmPalette.textDark,
            }}>
              {dest.name}
            </span>
            <span style={{
              ...typography.caption,
              fontSize: 10,
              color: isActive ? dest.color : warmPalette.textLight,
            }}>
              {count}d
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
