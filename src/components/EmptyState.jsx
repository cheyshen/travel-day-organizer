import { motion } from 'framer-motion'
import { Plus, CheckCircle2, Palmtree } from 'lucide-react'
import { colors } from '../colors'
import { typography, spacing, radius, shadows, warmPalette, glass } from '../styles'

// =============================================================================
// EMPTY STATE — Empty day + day-complete states
// =============================================================================

export default function EmptyState({ type = 'empty', onAddEvent }) {
  if (type === 'complete') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          textAlign: 'center',
          padding: `${spacing.xxxl}px ${spacing.lg}px`,
        }}
      >
        <div style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: colors.successLight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto',
          marginBottom: spacing.md,
          boxShadow: shadows.sm,
        }}>
          <CheckCircle2 size={28} color={colors.success} />
        </div>
        <p style={{
          ...typography.sectionHeader,
          color: warmPalette.textDark,
          marginBottom: spacing.xs,
        }}>
          That's your day. You made it.
        </p>
        <p style={{ ...typography.helper, color: warmPalette.textMedium }}>
          Rest up for tomorrow.
        </p>
      </motion.div>
    )
  }

  // Empty state
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        textAlign: 'center',
        padding: `${spacing.xxxl}px ${spacing.lg}px`,
        ...glass.subtle,
        borderRadius: radius.xl,
      }}
    >
      <div style={{
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: warmPalette.accentSoft,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto',
        marginBottom: spacing.md,
      }}>
        <Palmtree size={28} color={warmPalette.accent} />
      </div>
      <p style={{
        ...typography.sectionHeader,
        color: warmPalette.textDark,
        marginBottom: spacing.xs,
      }}>
        Nothing planned yet
      </p>
      <p style={{
        ...typography.helper,
        color: warmPalette.textMedium,
        marginBottom: spacing.xl,
      }}>
        Tap the button below to add your first event.
      </p>
      {onAddEvent && (
        <button
          onClick={onAddEvent}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: spacing.sm,
            backgroundColor: warmPalette.accent,
            color: colors.textOnAccent,
            border: 'none',
            borderRadius: radius.md,
            padding: `${spacing.md}px ${spacing.xl}px`,
            fontSize: typography.helper.fontSize,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: shadows.accentGlow,
          }}
        >
          <Plus size={16} />
          Add Event
        </button>
      )}
    </motion.div>
  )
}
