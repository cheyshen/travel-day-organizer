import { colors } from './colors'

// =============================================================================
// SHARED STYLES — Typography, Spacing, Tokens
// =============================================================================

export const fontStack = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

export const typography = {
  title: { fontSize: 28, fontWeight: 700, lineHeight: '34px' },
  sectionHeader: { fontSize: 18, fontWeight: 600, lineHeight: '24px' },
  body: { fontSize: 15, fontWeight: 400, lineHeight: '22px' },
  bodyMedium: { fontSize: 15, fontWeight: 500, lineHeight: '22px' },
  helper: { fontSize: 13, fontWeight: 400, lineHeight: '18px' },
  caption: { fontSize: 11, fontWeight: 500, lineHeight: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' },
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
}

export const radius = {
  sm: 8,
  md: 12,
  iconSquare: 10,
  lg: 16,
  xl: 20,
  pill: 9999,
}

export const shadows = {
  sm: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
  md: '0 4px 12px rgba(0,0,0,0.08)',
  glass: '0 2px 8px rgba(0,0,0,0.06)',
  accentGlow: '0 2px 8px rgba(14, 116, 144, 0.25)',
  accentGlowStrong: '0 4px 16px rgba(14, 116, 144, 0.4)',
}

export const tokens = {
  cardBorder: `1px solid ${colors.border}`,
}

// =============================================================================
// GLASSMORPHISM TOKENS
// =============================================================================

export const warmPalette = {
  warmGray: '#EDEAE5',
  textDark: colors.textPrimary,
  textMedium: colors.textSecondary,
  textLight: colors.textMuted,
  accent: colors.ocean,
  accentSoft: 'rgba(14, 116, 144, 0.12)',
  goldSoft: 'rgba(184, 150, 62, 0.12)',
}

// Glossy page background — warm sand tone
export const glossyBg = '#F0EDE8'

export const glass = {
  frosted: {
    background: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
  },
  frostedLight: {
    background: 'rgba(240, 237, 232, 0.85)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(0, 0, 0, 0.08)',
  },
  card: {
    background: 'rgba(255,255,255,0.82)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(0,0,0,0.06)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
  },
  sheet: {
    background: 'rgba(255,255,255,0.92)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(0,0,0,0.08)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  nav: {
    background: 'rgba(20,28,40,0.88)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
  },
  input: {
    background: 'rgba(237,234,229,0.5)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: '1px solid rgba(0,0,0,0.1)',
  },
  subtle: {
    background: 'rgba(237,234,229,0.65)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(0,0,0,0.05)',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  badge: {
    background: 'rgba(255,255,255,0.60)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: '1px solid rgba(0,0,0,0.06)',
  },
}

// Dark scrim gradient for text readability over hero images
export const scrimGradient = `linear-gradient(180deg,
  rgba(28, 25, 23, 0.3) 0%,
  rgba(28, 25, 23, 0.2) 30%,
  rgba(28, 25, 23, 0.25) 50%,
  rgba(28, 25, 23, 0.6) 80%,
  rgba(28, 25, 23, 0.9) 100%
)`

