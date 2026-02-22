import { motion } from 'framer-motion'
import { colors } from '../colors'
import { typography, spacing, fontStack } from '../styles'

// =============================================================================
// TROPICAL HEADER — Square photo with centered text + dark overlay
// =============================================================================

const HERO_PHOTO = 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80'

export default function TripHeader({ title, subtitle, compact }) {
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
        backgroundImage: `url(${HERO_PHOTO})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }} />

      {/* Dark overlay for text readability */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.65) 100%)',
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
            fontSize: compact ? 28 : 38,
            fontWeight: 700,
            color: '#FFFFFF',
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
