import { useCallback, useState } from 'react'
import { AnimatePresence, motion, MotionConfig } from 'framer-motion'
import { TripProvider, useTripContext } from './context/TripContext'
import { colors } from './colors'
import { tokens } from './styles'
import Navigation from './components/Navigation'
import HeroView from './views/HeroView'
import CalendarView from './views/CalendarView'
import DayTimelineView from './views/DayTimelineView'
import EventEditor from './components/EventEditor'
import StatusView from './views/StatusView'
import EventDetailView from './views/EventDetailView'

// =============================================================================
// TRAVEL APP — Entry Point
// =============================================================================

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.15 } },
}

function TravelInner() {
  const { state, dispatch } = useTripContext()
  const { activeView, selectedDate, days } = state

  // Nav "Add" opens EventEditor as overlay on current view
  const [isAddingFromNav, setIsAddingFromNav] = useState(false)

  const navigate = useCallback((view, date) => {
    if (date) dispatch({ type: 'SET_SELECTED_DATE', payload: date })
    dispatch({ type: 'SET_ACTIVE_VIEW', payload: view })
    window.scrollTo(0, 0)
  }, [dispatch])

  const handleNavAdd = useCallback(() => {
    setIsAddingFromNav(true)
  }, [])

  const handleNavEditorSave = useCallback((eventData) => {
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
    setIsAddingFromNav(false)
  }, [dispatch, selectedDate, days])

  const handleNavEditorClose = useCallback(() => {
    setIsAddingFromNav(false)
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: colors.background,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      maxWidth: tokens.maxWidth,
      margin: '0 auto',
      position: 'relative',
      paddingBottom: 80,
    }}>
      <AnimatePresence mode="wait">
        {activeView === 'hero' && (
          <motion.div key="hero" {...pageVariants}>
            <HeroView onNavigate={navigate} />
          </motion.div>
        )}
        {activeView === 'calendar' && (
          <motion.div key="calendar" {...pageVariants}>
            <CalendarView onNavigate={navigate} />
          </motion.div>
        )}
        {activeView === 'day' && (
          <motion.div key="day" {...pageVariants}>
            <DayTimelineView onNavigate={navigate} />
          </motion.div>
        )}
        {activeView === 'status' && (
          <motion.div key="status" {...pageVariants}>
            <StatusView />
          </motion.div>
        )}
        {activeView === 'eventDetail' && (
          <motion.div key="eventDetail" {...pageVariants}>
            <EventDetailView onNavigate={navigate} />
          </motion.div>
        )}
      </AnimatePresence>

      <Navigation activeView={activeView} onNavigate={navigate} onAdd={handleNavAdd} />

      {/* EventEditor overlay — opens from nav Add on any view */}
      <AnimatePresence>
        {isAddingFromNav && (
          <EventEditor
            event={null}
            isNew={true}
            date={selectedDate}
            onSave={handleNavEditorSave}
            onDelete={() => {}}
            onClose={handleNavEditorClose}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Travel() {
  return (
    <MotionConfig reducedMotion="user">
      <TripProvider>
        <TravelInner />
      </TripProvider>
    </MotionConfig>
  )
}
