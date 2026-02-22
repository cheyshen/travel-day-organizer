import { useState, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useTripContext } from '../context/TripContext'
import { colors } from '../colors'
import { typography, spacing, radius, shadows, warmPalette } from '../styles'
import { getCalendarGrid, getAdjacentMonth, formatMonthYearFromParts } from '../utils/dateUtils'
import TripHeader from '../components/TripHeader'
import DayCard from '../components/DayCard'
import CalendarTooltip from '../components/CalendarTooltip'
import CalendarLegend from '../components/CalendarLegend'
import MonthSummary from '../components/MonthSummary'
import EventEditor from '../components/EventEditor'

// =============================================================================
// CALENDAR VIEW — Month navigation + tooltip + interactive legend
// =============================================================================

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Swipe threshold in pixels
const SWIPE_THRESHOLD = 80

export default function CalendarView({ onNavigate }) {
  const { state, dispatch } = useTripContext()
  const { trip, days, selectedDate } = state
  const gridContainerRef = useRef(null)

  // Month navigation state — initialize to trip start month
  const tripStart = new Date(trip.startDate)
  const [viewMonth, setViewMonth] = useState({
    year: tripStart.getFullYear(),
    month: tripStart.getMonth(),
  })

  // Tooltip state
  const [tooltipState, setTooltipState] = useState(null) // { date, anchorRect }

  // Legend filter state
  const [activeFilter, setActiveFilter] = useState(null)

  // Slide direction for animation
  const [slideDirection, setSlideDirection] = useState(0)

  // EventEditor state
  const [isAddingEvent, setIsAddingEvent] = useState(false)

  // Calendar grid for current view month
  const grid = useMemo(
    () => getCalendarGrid(viewMonth.year, viewMonth.month),
    [viewMonth.year, viewMonth.month]
  )

  // Month title
  const monthTitle = formatMonthYearFromParts(viewMonth.year, viewMonth.month)

  // Navigate to prev/next month
  const goMonth = useCallback((direction) => {
    setTooltipState(null)
    setSlideDirection(direction)
    setViewMonth(prev => getAdjacentMonth(prev.year, prev.month, direction))
  }, [])

  // Day tap — select date + open tooltip
  const handleDayTap = useCallback((date, cellRect) => {
    dispatch({ type: 'SET_SELECTED_DATE', payload: date })
    setTooltipState({ date, anchorRect: cellRect })
  }, [dispatch])

  // Tooltip "View Day" — navigate to day timeline
  const handleViewDay = useCallback((date) => {
    setTooltipState(null)
    onNavigate('day', date)
  }, [onNavigate])

  // Close tooltip
  const closeTooltip = useCallback(() => {
    setTooltipState(null)
  }, [])

  // Legend filter handler
  const handleFilter = useCallback((destId) => {
    setActiveFilter(destId)
  }, [])

  // Event editor handlers
  const handleAddEvent = useCallback(() => {
    setIsAddingEvent(true)
  }, [])

  const handleEventSave = useCallback((eventData) => {
    const day = days[selectedDate]
    dispatch({
      type: 'ADD_EVENT',
      payload: {
        date: selectedDate,
        event: {
          ...eventData,
          sortOrder: day?.events?.length || 0,
        },
      },
    })
    setIsAddingEvent(false)
  }, [dispatch, selectedDate, days])

  const handleEventEditorClose = useCallback(() => {
    setIsAddingEvent(false)
  }, [])

  // Swipe handling
  const dragStartX = useRef(0)

  const handleDragStart = useCallback((_, info) => {
    dragStartX.current = info.point.x
  }, [])

  const handleDragEnd = useCallback((_, info) => {
    const dx = info.point.x - dragStartX.current
    if (Math.abs(dx) >= SWIPE_THRESHOLD) {
      goMonth(dx > 0 ? -1 : 1)
    }
  }, [goMonth])

  // Slide animation variants
  const gridVariants = {
    initial: { opacity: 0, x: slideDirection * 60 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.25, ease: 'easeOut' } },
    exit: { opacity: 0, x: slideDirection * -60, transition: { duration: 0.15 } },
  }

  // Get day data for tooltip
  const tooltipDay = tooltipState ? days[tooltipState.date] : null
  const tooltipDest = tooltipDay
    ? trip.destinations.find(d => d.id === tooltipDay.destinationId)
    : null

  return (
    <div style={{ backgroundColor: warmPalette.warmGray, minHeight: '100vh' }}>
      <TripHeader compact />

      {/* Rounded content card */}
      <div style={{
        backgroundColor: warmPalette.warmGray,
        borderRadius: '24px 24px 0 0',
        marginTop: -28,
        position: 'relative',
        zIndex: 2,
        padding: `${spacing.xl}px ${spacing.lg}px`,
      }}>
        {/* Pull handle */}
        <div style={{
          width: 32,
          height: 4,
          borderRadius: 2,
          backgroundColor: '#D6D3CE',
          margin: '0 auto',
          marginBottom: spacing.lg,
        }} />

        {/* Month navigation header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: spacing.xs,
          padding: `0 ${spacing.xs}px`,
        }}>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => goMonth(-1)}
            aria-label="Previous month"
            style={{
              width: 44,
              height: 44,
              borderRadius: radius.md,
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
            }}
          >
            <ChevronLeft size={22} color={warmPalette.textMedium} />
          </motion.button>

          <div style={{ textAlign: 'center' }}>
            <h2 style={{
              ...typography.title,
              color: warmPalette.textDark,
              margin: 0,
            }}>
              {monthTitle}
            </h2>
            <p style={{
              ...typography.helper,
              color: warmPalette.textLight,
              margin: 0,
              marginTop: 2,
            }}>
              Activity days by island
            </p>
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => goMonth(1)}
            aria-label="Next month"
            style={{
              width: 44,
              height: 44,
              borderRadius: radius.md,
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
            }}
          >
            <ChevronRight size={22} color={warmPalette.textMedium} />
          </motion.button>
        </div>

        {/* Calendar grid container */}
        <div
          ref={gridContainerRef}
          style={{
            position: 'relative',
            backgroundColor: '#FFFFFF',
            borderRadius: radius.xl,
            padding: spacing.md,
            marginTop: spacing.md,
            marginBottom: spacing.lg,
            border: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          {/* Weekday headers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: spacing.xs,
            marginBottom: spacing.sm,
          }}>
            {WEEKDAYS.map(day => (
              <div key={day} style={{
                ...typography.caption,
                fontSize: 10,
                color: warmPalette.textLight,
                textAlign: 'center',
                padding: `${spacing.xs}px 0`,
              }}>
                {day}
              </div>
            ))}
          </div>

          {/* Animated grid */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${viewMonth.year}-${viewMonth.month}`}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.15}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              variants={gridVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: spacing.xs,
                touchAction: 'pan-y',
              }}
            >
              {grid.map((dateInfo) => (
                <DayCard
                  key={dateInfo.date}
                  dateInfo={dateInfo}
                  trip={trip}
                  days={days}
                  destinations={trip.destinations}
                  selectedDate={selectedDate}
                  activeFilter={activeFilter}
                  onTap={handleDayTap}
                />
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Tooltip */}
          <AnimatePresence>
            {tooltipState && tooltipDay && (
              <CalendarTooltip
                date={tooltipState.date}
                anchorRect={tooltipState.anchorRect}
                containerRef={gridContainerRef}
                day={tooltipDay}
                destination={tooltipDest}
                onViewDay={handleViewDay}
                onClose={closeTooltip}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Interactive legend */}
        <CalendarLegend
          destinations={trip.destinations}
          days={days}
          activeFilter={activeFilter}
          onFilter={handleFilter}
        />

        {/* Month summary */}
        <MonthSummary
          days={days}
          destinations={trip.destinations}
          trip={trip}
        />

        {/* Add event button */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: spacing.md,
        }}>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleAddEvent}
            style={{
              height: 44,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: `0 ${spacing.lg}px`,
              borderRadius: radius.pill,
              border: 'none',
              backgroundColor: warmPalette.accent,
              color: '#FFFFFF',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(14, 116, 144, 0.25)',
            }}
          >
            <Plus size={14} strokeWidth={2.5} />
            Add
          </motion.button>
        </div>
      </div>

      {/* EventEditor overlay */}
      <AnimatePresence>
        {isAddingEvent && (
          <EventEditor
            event={null}
            isNew={true}
            date={selectedDate}
            onSave={handleEventSave}
            onDelete={() => {}}
            onClose={handleEventEditorClose}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
