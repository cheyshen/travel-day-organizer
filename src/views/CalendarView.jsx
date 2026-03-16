import { useState, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Camera } from 'lucide-react'
import { useTripContext } from '../context/TripContext'
import { colors } from '../colors'
import { typography, spacing, radius, warmPalette, glass, glossyBg } from '../styles'
import { getCalendarGrid, getAdjacentMonth, formatMonthYearFromParts } from '../utils/dateUtils'
import TripHeader from '../components/TripHeader'
import DayCard from '../components/DayCard'
import CalendarTooltip from '../components/CalendarTooltip'
import CalendarLegend from '../components/CalendarLegend'

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
  const calFileRef = useRef(null)

  // Hero photo upload (shared with HeroView)
  const handlePhotoUpload = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const maxW = 1200
        const scale = Math.min(1, maxW / img.width)
        canvas.width = img.width * scale
        canvas.height = img.height * scale
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7)
        dispatch({ type: 'SET_HERO_IMAGE', payload: dataUrl })
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }, [dispatch])

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
    <div style={{ background: glossyBg, minHeight: '100vh' }}>
      <div style={{ position: 'relative' }}>
        <TripHeader compact />
        {/* Camera upload button */}
        <button
          onClick={() => calFileRef.current?.click()}
          aria-label="Change cover photo"
          style={{
            ...glass.frosted,
            position: 'absolute',
            top: 16,
            right: 16,
            width: 32,
            height: 32,
            borderRadius: '50%',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 3,
            padding: 0,
          }}
        >
          <Camera size={14} color={colors.textOnDark} strokeWidth={2} />
        </button>
        <input
          ref={calFileRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          style={{ display: 'none' }}
        />
      </div>

      {/* Rounded content card */}
      <div style={{
        background: glossyBg,
        borderRadius: '24px 24px 0 0',
        marginTop: -28,
        position: 'relative',
        zIndex: tooltipState ? 100 : 2,
        padding: `${spacing.xl}px ${spacing.lg}px`,
      }}>
        {/* Pull handle */}
        <div style={{
          width: 32,
          height: 4,
          borderRadius: 2,
          backgroundColor: colors.dragHandle,
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
              ...typography.body,
              color: warmPalette.textMedium,
              margin: 0,
              marginTop: 2,
              paddingTop: 4,
              paddingBottom: 4,
            }}>
              Activity days
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
            ...glass.card,
            borderRadius: radius.xl,
            padding: spacing.md,
            marginTop: spacing.md,
            marginBottom: spacing.lg,
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

        {/* Bottom padding so content isn't hidden behind nav */}
        <div style={{ height: 80 }} />
      </div>
    </div>
  )
}
