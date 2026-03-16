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
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: '0.02em',
      color,
      backgroundColor: bg,
      padding: '3px 10px',
      borderRadius: radius.pill,
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  )
}
