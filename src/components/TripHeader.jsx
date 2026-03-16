import { motion } from 'framer-motion'
import { colors } from '../colors'
import { typography, spacing, fontStack, scrimGradient } from '../styles'
import { useTripContext } from '../context/TripContext'

// =============================================================================
// TROPICAL HEADER — Square photo with centered text + dark overlay
// =============================================================================

const DEFAULT_PHOTO = '/hero-bg.png'

export default function TripHeader({ title, subtitle, compact }) {
  const { state } = useTripContext()
  const heroSrc = state.heroImage || DEFAULT_PHOTO
  const height = compact ? 100 : 240

  return (
    <div style={{
      height,
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* Background photo */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `url(${heroSrc})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }} />

      {/* Dark overlay for text readability */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: scrimGradient,
      }} />

      {/* Centered title — only render when title is provided */}
      {title && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          style={{
            position: 'relative',
            zIndex: 2,
            textAlign: 'center',
            padding: `0 ${spacing.lg}px`,
          }}
        >
          <h1 style={{
            fontFamily: fontStack,
            fontSize: compact ? 28 : 42,
            fontWeight: 700,
            color: colors.textOnDark,
            margin: 0,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            textShadow: '0 2px 16px rgba(0,0,0,0.35)',
          }}>
            {title}
          </h1>
          {subtitle && !compact && (
            <p style={{
              ...typography.body,
              color: 'rgba(255,255,255,0.85)',
              marginTop: spacing.sm,
              textShadow: '0 1px 8px rgba(0,0,0,0.3)',
            }}>
              {subtitle}
            </p>
          )}
        </motion.div>
      )}
    </div>
  )
}
