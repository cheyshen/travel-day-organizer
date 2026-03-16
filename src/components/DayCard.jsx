import { useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { typography, spacing, radius, shadows, warmPalette } from '../styles'
import { colors } from '../colors'
import { isTripDay, isTodayDate, formatDayNumber } from '../utils/dateUtils'

// =============================================================================
// DAY CARD — Calendar grid cell (redesigned)
// =============================================================================

export default function DayCard({ dateInfo, trip, days, destinations, selectedDate, activeFilter, onTap }) {
  const { date, isCurrentMonth } = dateInfo
  const cellRef = useRef(null)
  const isTrip = isTripDay(date, trip.startDate, trip.endDate)
  const isToday = isTodayDate(date)
  const isSelected = selectedDate === date
  const day = days[date]
  const dest = day ? destinations.find(d => d.id === day.destinationId) : null
  const eventCount = day?.events?.length || 0
  const isKauai = dest?.id === 'dest-kauai'

  // Filter dimming: when a filter is active, dim non-matching destinations
  const isDimmed = activeFilter && dest && dest.id !== activeFilter

  const handleClick = useCallback(() => {
    if (!isTrip) return
    const el = cellRef.current
    if (el) {
      const rect = el.getBoundingClientRect()
      onTap(date, rect)
    }
  }, [isTrip, date, onTap])

  // Background color logic
  let bgColor = 'rgba(237,234,229,0.4)'
  if (isTrip && dest) {
    bgColor = isSelected ? `${dest.accentLight}` : dest.accentLight
  } else if (isTrip) {
    bgColor = colors.oceanLight
  }

  // Border logic
  let border = 'none'
  if (isSelected && isTrip) {
    border = '2.5px solid #0E7490'
  } else if (isToday && isCurrentMonth) {
    border = `1.5px solid ${warmPalette.textLight}`
  }

  // Text weight: bold for days with events, medium for trip days without, regular for non-trip
  let fontWeight = 400
  if (isTrip && eventCount > 0) fontWeight = 700
  else if (isTrip) fontWeight = 500

  // Text color
  let textColor = warmPalette.textLight
  if (isTrip) textColor = warmPalette.textDark
  else if (isCurrentMonth) textColor = warmPalette.textMedium

  // Opacity
  let opacity = 1
  if (!isCurrentMonth) opacity = 0.3
  else if (isDimmed) opacity = 0.3

  return (
    <motion.button
      ref={cellRef}
      whileTap={isTrip ? { scale: 0.93 } : {}}
      onClick={handleClick}
      style={{
        aspectRatio: '1 / 1',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        borderRadius: radius.sm,
        border,
        backgroundColor: bgColor,
        boxShadow: isSelected ? shadows.md : isTrip ? shadows.sm : 'none',
        cursor: isTrip ? 'pointer' : 'default',
        opacity,
        padding: 0,
        position: 'relative',
        overflow: 'hidden',
        transition: 'opacity 0.2s ease, box-shadow 0.15s ease',
      }}
    >
      {/* Day number */}
      <span style={{
        fontSize: 18,
        fontWeight,
        color: textColor,
        lineHeight: '20px',
      }}>
        {formatDayNumber(date)}
      </span>

      {/* Destination shape indicator (bottom-right) */}
      {isTrip && dest && (
        <div style={{
          position: 'absolute',
          bottom: 3,
          right: 3,
          width: 5,
          height: 5,
          borderRadius: isKauai ? '50%' : 1,
          backgroundColor: dest.color,
          opacity: 0.5,
        }} />
      )}
    </motion.button>
  )
}
