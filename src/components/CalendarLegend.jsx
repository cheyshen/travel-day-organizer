import { motion } from 'framer-motion'
import { MapPin } from 'lucide-react'
import { typography, spacing, radius, shadows, warmPalette } from '../styles'

// =============================================================================
// CALENDAR LEGEND — Destination filter as a segmented control
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
    <div style={{ padding: `${spacing.md}px 0` }}>
      <div style={{
        display: 'flex',
        gap: spacing.xs,
        padding: spacing.xs,
        backgroundColor: 'rgba(60,70,90,0.10)',
        borderRadius: radius.pill,
      }}>
        {destinations.map(dest => {
          const isActive = activeFilter === dest.id
          const count = destCounts[dest.id] || 0

          return (
            <motion.button
              key={dest.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => onFilter(isActive ? null : dest.id)}
              aria-pressed={isActive}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing.sm,
                padding: `${spacing.sm + 2}px ${spacing.md}px`,
                borderRadius: radius.pill,
                border: 'none',
                background: isActive ? '#FFFFFF' : 'transparent',
                boxShadow: isActive ? shadows.sm : 'none',
                cursor: 'pointer',
              }}
            >
              <MapPin size={16} color={dest.color} strokeWidth={2.5} />
              <span style={{
                ...typography.bodyMedium,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? warmPalette.textDark : warmPalette.textMedium,
              }}>
                {dest.name}
              </span>
              <span style={{
                ...typography.helper,
                color: isActive ? warmPalette.textMedium : warmPalette.textLight,
              }}>
                {count}d
              </span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
