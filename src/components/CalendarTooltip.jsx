import { useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, X } from 'lucide-react'
import { typography, spacing, radius, shadows, warmPalette } from '../styles'
import { formatTripDate } from '../utils/dateUtils'
import { getEventType } from '../data/eventTypes'

// =============================================================================
// CALENDAR TOOLTIP — Day summary popover on cell tap
// =============================================================================

export default function CalendarTooltip({
  date,
  anchorRect,
  containerRef,
  day,
  destination,
  onViewDay,
  onClose,
}) {
  const tooltipRef = useRef(null)

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Position + responsive width calculation
  const getLayout = useCallback(() => {
    if (!anchorRect || !containerRef?.current) return { top: 0, left: 0, width: 280 }

    const container = containerRef.current.getBoundingClientRect()
    // Responsive: 75% of container width, clamped 260–340px
    const tooltipWidth = Math.min(340, Math.max(260, container.width * 0.75))
    const tooltipEstHeight = 200

    // Horizontal: center on cell, clamp to container edges
    let left = anchorRect.left - container.left + anchorRect.width / 2 - tooltipWidth / 2
    left = Math.max(8, Math.min(left, container.width - tooltipWidth - 8))

    // Vertical: prefer below, fall back to above if not enough room
    const spaceBelow = container.bottom - anchorRect.bottom
    let top
    if (spaceBelow >= tooltipEstHeight + 8) {
      top = anchorRect.bottom - container.top + 8
    } else {
      top = anchorRect.top - container.top - tooltipEstHeight - 8
    }

    return { top, left, width: tooltipWidth }
  }, [anchorRect, containerRef])

  if (!date || !anchorRect || !day) return null

  const events = day.events || []
  const layout = getLayout()

  // Group events by type
  const typeGroups = {}
  for (const event of events) {
    const type = event.type || 'custom'
    if (!typeGroups[type]) typeGroups[type] = { type, count: 0 }
    typeGroups[type].count++
  }
  const groups = Object.values(typeGroups)

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99,
        }}
      />

      {/* Tooltip */}
      <motion.div
        ref={tooltipRef}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28, duration: 0.2 }}
        style={{
          position: 'absolute',
          top: layout.top,
          left: layout.left,
          width: layout.width,
          backgroundColor: '#FFFFFF',
          borderRadius: radius.lg,
          boxShadow: shadows.xl,
          zIndex: 100,
          overflow: 'hidden',
          border: '1px solid rgba(0,0,0,0.08)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: `${spacing.lg}px ${spacing.lg}px ${spacing.md}px`,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}>
          <div>
            <p style={{
              ...typography.sectionHeader,
              color: warmPalette.textDark,
              margin: 0,
            }}>
              {formatTripDate(date)}
            </p>
            {destination && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                marginTop: 4,
              }}>
                <span style={{
                  width: 10,
                  height: 10,
                  borderRadius: destination.id === 'dest-kauai' ? '50%' : 2,
                  backgroundColor: destination.color,
                  display: 'inline-block',
                }} />
                <span style={{ ...typography.body, color: destination.color, fontWeight: 500 }}>
                  {destination.name}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close tooltip"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              flexShrink: 0,
            }}
          >
            <X size={16} color={warmPalette.textLight} />
          </button>
        </div>

        {/* Event breakdown */}
        <div style={{ padding: `${spacing.md}px ${spacing.lg}px` }}>
          {events.length === 0 ? (
            <p style={{ ...typography.body, color: warmPalette.textLight, margin: 0 }}>
              No events planned
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
              {groups.map(group => {
                const eventType = getEventType(group.type)
                const Icon = eventType.icon
                return (
                  <div key={group.type} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing.md,
                  }}>
                    <Icon size={18} color={eventType.color} strokeWidth={2} />
                    <span style={{ ...typography.body, color: warmPalette.textMedium, flex: 1 }}>
                      {eventType.label}
                    </span>
                    <span style={{ ...typography.bodyMedium, color: warmPalette.textLight }}>
                      {group.count}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* View Day button */}
        <button
          onClick={() => onViewDay(date)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: `${spacing.md + 5}px`,
            border: 'none',
            borderTop: '1px solid rgba(0,0,0,0.06)',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            ...typography.bodyMedium,
            fontWeight: 600,
            color: warmPalette.accent,
          }}
        >
          View Day
          <ChevronRight size={16} color={warmPalette.accent} />
        </button>
      </motion.div>
    </>
  )
}
