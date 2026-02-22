import { motion } from 'framer-motion'
import { Coffee } from 'lucide-react'
import { colors } from '../colors'
import { typography, spacing, radius, shadows, tokens, warmPalette, glass } from '../styles'

// =============================================================================
// BUFFER BLOCK — Buffer time between events
// =============================================================================

export default function BufferBlock({ event, onTap }) {
  const minutes = event.bufferMinutes || 0
  const isTight = minutes > 0 && minutes <= 20
  const bgColor = isTight ? colors.warningLight : null
  const textColor = isTight ? colors.warning : warmPalette.textMedium
  const borderColor = isTight ? colors.warning : colors.border

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      whileHover={{ scale: 1.01 }}
      onClick={() => onTap && onTap(event)}
      style={{
        ...(isTight ? { backgroundColor: bgColor } : glass.subtle),
        borderRadius: tokens.cardRadius,
        borderLeft: `3px dashed ${borderColor}`,
        padding: `${spacing.md}px ${spacing.lg}px`,
        cursor: onTap ? 'pointer' : 'default',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
        <Coffee size={14} color={textColor} strokeWidth={1.5} />
        <span style={{ ...typography.helper, color: textColor, fontWeight: 500 }}>
          {minutes > 0 ? `~${minutes} min buffer` : event.title}
        </span>
        {isTight && (
          <span style={{
            ...typography.caption,
            color: colors.warning,
            backgroundColor: colors.warningLight,
            padding: `1px ${spacing.xs}px`,
            borderRadius: radius.sm,
            marginLeft: 'auto',
          }}>
            Tight
          </span>
        )}
      </div>
      {event.bufferLabel && (
        <p style={{ ...typography.helper, color: textColor, marginTop: spacing.xs, marginLeft: 22 }}>
          {event.bufferLabel}
        </p>
      )}
    </motion.div>
  )
}
