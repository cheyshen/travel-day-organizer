import { colors } from '../colors'
import { typography, spacing } from '../styles'

// =============================================================================
// NOW INDICATOR — Current time marker on timeline
// =============================================================================

export default function NowIndicator() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: spacing.sm,
      padding: `${spacing.md}px 0`,
      position: 'relative',
    }}>
      <div style={{
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.ocean,
        flexShrink: 0,
        boxShadow: `0 0 8px ${colors.ocean}60`,
      }} />
      <div style={{
        flex: 1,
        height: 2,
        backgroundColor: colors.ocean,
        borderRadius: 1,
      }} />
      <span style={{
        ...typography.caption,
        color: colors.ocean,
        flexShrink: 0,
      }}>
        Now
      </span>
    </div>
  )
}
