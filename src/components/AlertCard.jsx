import { AlertTriangle, Info, CheckCircle2 } from 'lucide-react'
import { colors } from '../colors'
import { typography, spacing, radius } from '../styles'

// =============================================================================
// ALERT CARD — Info/Warning/Success notification card
// =============================================================================

const ALERT_STYLES = {
  info: {
    bg: colors.infoLight,
    border: colors.info,
    icon: Info,
    iconColor: colors.info,
  },
  warning: {
    bg: colors.warningLight,
    border: colors.warning,
    icon: AlertTriangle,
    iconColor: colors.warning,
  },
  success: {
    bg: colors.successLight,
    border: colors.success,
    icon: CheckCircle2,
    iconColor: colors.success,
  },
}

export default function AlertCard({ type = 'info', title, message }) {
  const style = ALERT_STYLES[type] || ALERT_STYLES.info
  const Icon = style.icon

  return (
    <div style={{
      display: 'flex',
      gap: spacing.md,
      padding: spacing.md,
      backgroundColor: style.bg,
      borderRadius: radius.md,
      borderLeft: `4px solid ${style.border}`,
    }}>
      <Icon size={18} color={style.iconColor} strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          ...typography.bodyMedium,
          color: colors.textPrimary,
          margin: 0,
        }}>
          {title}
        </p>
        {message && (
          <p style={{
            ...typography.helper,
            color: colors.textSecondary,
            margin: 0,
            marginTop: spacing.xxs,
          }}>
            {message}
          </p>
        )}
      </div>
    </div>
  )
}
