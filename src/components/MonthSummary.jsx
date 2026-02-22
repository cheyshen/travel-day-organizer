import { typography, spacing, warmPalette } from '../styles'

// =============================================================================
// MONTH SUMMARY — "9 trip days · 5 Kauai · 4 Maui"
// =============================================================================

export default function MonthSummary({ days, destinations, trip }) {
  // Count trip days per destination in the visible month
  const destCounts = {}
  let totalTripDays = 0

  for (const [date, day] of Object.entries(days)) {
    if (day.destinationId) {
      const dest = destinations.find(d => d.id === day.destinationId)
      if (dest) {
        destCounts[dest.id] = (destCounts[dest.id] || 0) + 1
        totalTripDays++
      }
    }
  }

  if (totalTripDays === 0) return null

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      flexWrap: 'wrap',
      padding: `${spacing.sm}px 0`,
    }}>
      <span style={{
        ...typography.helper,
        color: warmPalette.textMedium,
        fontWeight: 500,
      }}>
        {totalTripDays} trip {totalTripDays === 1 ? 'day' : 'days'}
      </span>
      {destinations.map(dest => {
        const count = destCounts[dest.id]
        if (!count) return null
        return (
          <span key={dest.id} style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            ...typography.helper,
            color: warmPalette.textMedium,
          }}>
            <span style={{ color: warmPalette.textLight }}>·</span>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: dest.id === 'dest-kauai' ? '50%' : 2,
              backgroundColor: dest.color,
              display: 'inline-block',
              flexShrink: 0,
            }} />
            {count} {dest.name}
          </span>
        )
      })}
    </div>
  )
}
