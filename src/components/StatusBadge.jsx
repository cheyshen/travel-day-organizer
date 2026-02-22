import { getStatusColor, getStatusBg, getStatusLabel } from '../utils/timeUtils'
import { typography, spacing, radius } from '../styles'

// =============================================================================
// STATUS BADGE — Reusable status pill
// =============================================================================

export default function StatusBadge({ status, size = 'sm' }) {
  const color = getStatusColor(status)
  const bg = getStatusBg(status)
  const label = getStatusLabel(status)

  const isLarge = size === 'lg'

  return (
    <span style={{
      ...typography.caption,
      fontSize: 11,
      color,
      backgroundColor: bg,
      padding: isLarge
        ? `${spacing.xs}px ${spacing.sm}px`
        : `2px ${spacing.sm - 2}px`,
      borderRadius: radius.sm,
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  )
}
