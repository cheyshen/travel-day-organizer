import { Plus, Palmtree, CalendarDays, Clock, CheckCircle2 } from 'lucide-react'
import { spacing, radius, glass } from '../styles'

// =============================================================================
// BOTTOM TAB NAVIGATION
//
// Accessibility (NN/g + WCAG):
// - Touch targets: 48x54px (exceeds WCAG 2.5.5 AAA 44px minimum)
// - Icon + label always visible (NN/g: "icon-only navigation is problematic")
// - Contrast: inactive #9CA3AF on #1F2937 = 4.6:1 (WCAG AA)
//             active #FFFFFF on #1F2937 = 13.5:1 (WCAG AAA)
// - Semantic: role="tablist" + role="tab" + aria-selected
// - Max 5 items in a tab bar (NN/g); we use 4 (3 tabs + 1 action)
// - Persistent: always visible regardless of scroll
// - Stability: flex: 1 on all tabs prevents layout shift when active
//   state changes (NN/g: "elements should not shift unexpectedly")
// - Primary action visually differentiated (NN/g: visual hierarchy)
// =============================================================================

const leftTabs = [
  { id: 'hero', label: 'Trip', icon: Palmtree },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
]

const rightTabs = [
  { id: 'day', label: 'Day', icon: Clock },
  { id: 'status', label: 'Status', icon: CheckCircle2 },
]

// Dark nav palette
const nav = {
  bg: '#1F2937',
  activeText: '#FFFFFF',
  activeIndicator: '#0E7490',
  inactiveText: '#9CA3AF',
}

function NavTab({ tab, activeView, onNavigate }) {
  const isActive = activeView === tab.id
  const Icon = tab.icon

  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-label={tab.label}
      tabIndex={isActive ? 0 : -1}
      onClick={() => onNavigate(tab.id)}
      style={{
        flex: 1,
        minHeight: 54,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        padding: `4px 0 12px`,
        background: 'transparent',
        border: 'none',
        borderRadius: radius.md,
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          bottom: 4,
          width: 20,
          height: 3,
          borderRadius: 1.5,
          backgroundColor: isActive ? nav.activeIndicator : 'transparent',
          transition: 'background-color 0.2s ease',
        }}
      />
      <Icon
        size={22}
        color={isActive ? nav.activeText : nav.inactiveText}
        strokeWidth={isActive ? 2 : 1.5}
        aria-hidden="true"
      />
      <span style={{
        fontSize: 11,
        fontWeight: 600,
        color: isActive ? nav.activeText : nav.inactiveText,
        letterSpacing: '0.01em',
        lineHeight: '1em',
        transition: 'color 0.2s ease',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: '100%',
      }}>
        {tab.label}
      </span>
    </button>
  )
}

export default function Navigation({ activeView, onNavigate, onAdd }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: 480,
      zIndex: 90,
      padding: `0 ${spacing.lg}px calc(${spacing.lg}px + env(safe-area-inset-bottom, 0px))`,
      pointerEvents: 'none',
      background: 'transparent',
    }}>
      <nav
        role="tablist"
        aria-label="Trip navigation"
        style={{
          display: 'flex',
          alignItems: 'center',
          ...glass.nav,
          borderRadius: radius.xl,
          padding: `${spacing.sm}px ${spacing.sm}px`,
          pointerEvents: 'auto',
          position: 'relative',
        }}
      >
        {/* Left tabs */}
        {leftTabs.map(tab => (
          <NavTab key={tab.id} tab={tab} activeView={activeView} onNavigate={onNavigate} />
        ))}

        {/* Center Add button — raised circle */}
        <div style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 54,
        }}>
          <button
            aria-label="Add event"
            onClick={onAdd}
            style={{
              width: 48,
              height: 48,
              borderRadius: 9999,
              backgroundColor: nav.activeIndicator,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(14, 116, 144, 0.4)',
            }}
          >
            <Plus size={24} color="#FFFFFF" strokeWidth={2.5} aria-hidden="true" />
          </button>
        </div>

        {/* Right tabs */}
        {rightTabs.map(tab => (
          <NavTab key={tab.id} tab={tab} activeView={activeView} onNavigate={onNavigate} />
        ))}
      </nav>
    </div>
  )
}
