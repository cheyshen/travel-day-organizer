import { colors } from './colors'

// =============================================================================
// SHARED STYLES — Typography, Spacing, Tokens
// =============================================================================

export const fontStack = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

export const typography = {
  hero: { fontSize: 42, fontWeight: 700, lineHeight: '48px', letterSpacing: '-0.02em' },
  title: { fontSize: 28, fontWeight: 700, lineHeight: '34px' },
  sectionHeader: { fontSize: 18, fontWeight: 600, lineHeight: '24px' },
  body: { fontSize: 15, fontWeight: 400, lineHeight: '22px' },
  bodyMedium: { fontSize: 15, fontWeight: 500, lineHeight: '22px' },
  helper: { fontSize: 13, fontWeight: 400, lineHeight: '18px' },
  caption: { fontSize: 11, fontWeight: 500, lineHeight: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' },
}

export const spacing = {
  xxs: 2,
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
  lg: 16,
  xl: 20,
  pill: 9999,
}

export const shadows = {
  sm: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
  md: '0 4px 12px rgba(0,0,0,0.08)',
  lg: '0 8px 24px rgba(0,0,0,0.12)',
  xl: '0 12px 40px rgba(0,0,0,0.16)',
  card: `0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)`,
  cardHover: `0 4px 16px rgba(0,0,0,0.1)`,
  glass: '0 2px 8px rgba(0,0,0,0.06)',
  glassHover: '0 4px 16px rgba(0,0,0,0.1)',
}

export const tokens = {
  cardRadius: radius.lg,
  buttonRadius: radius.md,
  badgeRadius: radius.sm,
  cardShadow: shadows.card,
  cardBorder: `1px solid ${colors.border}`,
  maxWidth: 480,
}

// =============================================================================
// GLASSMORPHISM TOKENS
// =============================================================================

export const warmPalette = {
  warmWhite: '#FAF8F5',
  warmGray: '#EDEAE5',
  textDark: '#1C1917',
  textMedium: '#57534E',
  textLight: '#A8A29E',
  accent: '#0E7490',
  accentSoft: 'rgba(14, 116, 144, 0.12)',
  gold: '#B8963E',
  goldSoft: 'rgba(184, 150, 62, 0.12)',
}

// Glossy page background — subtle warm gradient with depth
export const glossyBg = '#F0EDE8'

export const glass = {
  frosted: {
    background: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
  },
  frostedDark: {
    background: 'rgba(0, 0, 0, 0.12)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
  },
  frostedMedium: {
    background: 'rgba(255, 255, 255, 0.55)',
    backdropFilter: 'blur(30px)',
    WebkitBackdropFilter: 'blur(30px)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
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
  panel: {
    background: 'rgba(255,255,255,0.72)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(0,0,0,0.05)',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
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
  tooltip: {
    background: 'rgba(255,255,255,0.90)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(0,0,0,0.08)',
    boxShadow: '0 12px 40px rgba(0,0,0,0.16)',
  },
  badge: {
    background: 'rgba(255,255,255,0.60)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: '1px solid rgba(0,0,0,0.06)',
  },
}

