import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Plus, MapPin, ArrowRight } from 'lucide-react'
import { useTripContext } from '../context/TripContext'
import { colors } from '../colors'
import { typography, spacing, radius, shadows, warmPalette, glass, glossyBg } from '../styles'
import { formatTripDateLong, getDayIndex, getAdjacentDates, isTodayDate } from '../utils/dateUtils'
import { getNowPosition, formatTime } from '../utils/timeUtils'
import TimeBlock from '../components/TimeBlock'
import NowIndicator from '../components/NowIndicator'
import EmptyState from '../components/EmptyState'
import EventEditor from '../components/EventEditor'

// =============================================================================
// DAY TIMELINE VIEW — Single day vertical timeline
// =============================================================================

export default function DayTimelineView({ onNavigate }) {
  const { state, dispatch } = useTripContext()
  const { trip, days, selectedDate } = state

  const [editingEvent, setEditingEvent] = useState(null)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => { window.scrollTo(0, 0) }, [selectedDate])

  const day = days[selectedDate]
  const events = day?.events || []
  const dest = trip.destinations.find(d => d.id === day?.destinationId)
  // Day background tinted by the island's soft accentLight; header = same tint, translucent
  const islandBg = dest ? dest.accentLight : glossyBg
  const islandHeaderBg = dest ? `${dest.accentLight}D9` : 'rgba(242,243,245,0.85)'
  const adjacent = getAdjacentDates(selectedDate, trip.startDate, trip.endDate)
  const dayNum = getDayIndex(trip.startDate, selectedDate)
  const isToday = isTodayDate(selectedDate)

  // Find "next upcoming" event (first non-buffer upcoming)
  const nextUpcoming = useMemo(() => {
    return events.find(e => e.status === 'upcoming' && e.type !== 'buffer')
  }, [events])

  // Where "Now" should appear
  const nowPos = useMemo(() => {
    return isToday ? getNowPosition(events) : -1
  }, [events, isToday])

  function goDay(date) {
    if (date) {
      dispatch({ type: 'SET_SELECTED_DATE', payload: date })
    }
  }

  function handleEventTap(event) {
    setEditingEvent(event)
    setIsCreating(false)
  }

  function handleEventDetail(event) {
    dispatch({ type: 'SET_SELECTED_EVENT', payload: event.id })
    onNavigate('eventDetail')
  }

  function handleCreateNew() {
    setEditingEvent(null)
    setIsCreating(true)
  }

  function handleEditorClose() {
    setEditingEvent(null)
    setIsCreating(false)
  }

  function handleEventSave(eventData) {
    if (editingEvent) {
      dispatch({
        type: 'UPDATE_EVENT',
        payload: { date: selectedDate, eventId: editingEvent.id, updates: eventData },
      })
    } else {
      dispatch({
        type: 'ADD_EVENT',
        payload: {
          date: selectedDate,
          event: {
            ...eventData,
            sortOrder: events.length,
          },
        },
      })
    }
    handleEditorClose()
  }

  function handleEventDelete(eventId) {
    dispatch({
      type: 'DELETE_EVENT',
      payload: { date: selectedDate, eventId },
    })
    handleEditorClose()
  }

  return (
    <div style={{ background: islandBg, minHeight: '100vh' }}>
      {/* Sticky header — glassmorphic, tinted by island */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        ...glass.frostedLight,
        background: islandHeaderBg,
        borderBottom: '1px solid rgba(255, 255, 255, 0.4)',
      }}>
        {/* Day navigation — arrows on sides, day info perfectly centered */}
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `${spacing.lg}px ${spacing.lg}px`,
        }}>
          <button
            onClick={() => goDay(adjacent.prev)}
            disabled={!adjacent.prev}
            style={{
              width: 44, height: 44,
              borderRadius: radius.sm,
              border: adjacent.prev ? '1px solid rgba(255,255,255,0.45)' : '1px solid rgba(0,0,0,0.06)',
              background: adjacent.prev ? 'rgba(255,255,255,0.65)' : 'transparent',
              backdropFilter: adjacent.prev ? 'blur(12px)' : 'none',
              WebkitBackdropFilter: adjacent.prev ? 'blur(12px)' : 'none',
              boxShadow: adjacent.prev ? shadows.glass : 'none',
              cursor: adjacent.prev ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: adjacent.prev ? 1 : 0.3,
              zIndex: 1,
              flexShrink: 0,
            }}
          >
            <ChevronLeft size={20} color={warmPalette.textLight} strokeWidth={2} />
          </button>

          {/* Centered day info — flex:1 between equal-width arrow buttons */}
          <div style={{
            flex: 1,
            minWidth: 0,
            textAlign: 'center',
            padding: `0 ${spacing.sm}px`,
          }}>
            <p style={{ ...typography.caption, color: warmPalette.textMedium, marginBottom: 4 }}>
              Day {dayNum} of {Object.keys(days).length}
            </p>
            <h2 style={{ ...typography.title, color: warmPalette.textDark, margin: 0 }}>
              {formatTripDateLong(selectedDate)}
            </h2>
            {day?.label && (() => {
              const parts = day.label.split(' to ')
              const isRoute = parts.length === 2
              return (
                <p style={{
                  ...typography.helper,
                  color: warmPalette.textMedium,
                  margin: '4px 0 0',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  maxWidth: '100%',
                  overflow: 'hidden',
                }}>
                  {isRoute ? (
                    <>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{parts[0]}</span>
                      <ArrowRight size={14} color={warmPalette.textLight} strokeWidth={2.2} style={{ flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{parts[1]}</span>
                    </>
                  ) : (
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{day.label}</span>
                  )}
                </p>
              )
            })()}
          </div>

          <button
            onClick={() => goDay(adjacent.next)}
            disabled={!adjacent.next}
            style={{
              width: 44, height: 44,
              borderRadius: radius.sm,
              border: adjacent.next ? '1px solid rgba(255,255,255,0.45)' : '1px solid rgba(0,0,0,0.06)',
              background: adjacent.next ? 'rgba(255,255,255,0.65)' : 'transparent',
              backdropFilter: adjacent.next ? 'blur(12px)' : 'none',
              WebkitBackdropFilter: adjacent.next ? 'blur(12px)' : 'none',
              boxShadow: adjacent.next ? shadows.glass : 'none',
              cursor: adjacent.next ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: adjacent.next ? 1 : 0.3,
              zIndex: 1,
              flexShrink: 0,
            }}
          >
            <ChevronRight size={20} color={warmPalette.textLight} strokeWidth={2} />
          </button>
        </div>

        {/* Island switcher — modern segmented control */}
        {dest && trip.destinations.length > 1 && (
          <div style={{ padding: `0 ${spacing.lg}px ${spacing.md}px` }}>
            <div style={{
              display: 'flex',
              gap: spacing.xs,
              padding: spacing.xs,
              backgroundColor: 'rgba(60,70,90,0.10)',
              borderRadius: radius.pill,
            }}>
              {trip.destinations.map(d => {
                const isActive = d.id === dest.id
                const firstDate = Object.entries(days).find(([, dy]) => dy.destinationId === d.id)?.[0]
                return (
                  <button
                    key={d.id}
                    onClick={() => {
                      if (!isActive && firstDate) dispatch({ type: 'SET_SELECTED_DATE', payload: firstDate })
                    }}
                    aria-label={`Go to ${d.name}`}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 7,
                      padding: `${spacing.sm + 2}px ${spacing.md}px`,
                      border: 'none',
                      borderRadius: radius.pill,
                      background: isActive ? '#FFFFFF' : 'transparent',
                      boxShadow: isActive ? shadows.sm : 'none',
                      cursor: isActive ? 'default' : 'pointer',
                    }}
                  >
                    <MapPin size={16} color={d.color} strokeWidth={2.5} />
                    <span style={{
                      ...typography.bodyMedium,
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? warmPalette.textDark : warmPalette.textMedium,
                    }}>
                      {d.name}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Time-block schedule */}
      <div style={{ padding: `20px ${spacing.md}px ${spacing.lg}px` }}>
        {events.length === 0 ? (
          <EmptyState type="empty" onAddEvent={handleCreateNew} />
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
          }}>
            {events.map((event, idx) => {
              const showNow = idx === nowPos
              const [timeMain, timeAmpm] = (event.startTime ? formatTime(event.startTime) : '').split(' ')

              return (
                <div key={event.id}>
                  {showNow && <NowIndicator />}
                  <div style={{ display: 'flex', alignItems: 'stretch' }}>
                    {/* Time */}
                    <div style={{ width: 46, flexShrink: 0, textAlign: 'right', paddingRight: 10, paddingTop: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: warmPalette.textMedium, lineHeight: '15px' }}>
                        {timeMain}
                      </div>
                      {timeAmpm && (
                        <div style={{ fontSize: 11, fontWeight: 700, color: warmPalette.textLight, lineHeight: '13px' }}>
                          {timeAmpm}
                        </div>
                      )}
                    </div>

                    {/* Timeline spine — line + colored dot */}
                    <div style={{ width: 20, flexShrink: 0, display: 'flex', justifyContent: 'center', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: 0, bottom: 0, width: 2, backgroundColor: 'rgba(80,92,108,0.20)' }} />
                      <div style={{
                        width: 12, height: 12, borderRadius: '50%', marginTop: 3,
                        backgroundColor: dest ? dest.color : colors.ocean,
                        border: `2px solid ${islandBg}`,
                        position: 'relative', zIndex: 1,
                      }} />
                    </div>

                    {/* Card */}
                    <div style={{ flex: 1, minWidth: 0, paddingBottom: 16, paddingLeft: 6 }}>
                      <TimeBlock
                        event={event}
                        isNext={nextUpcoming?.id === event.id}
                        onTap={handleEventTap}
                        onDetail={handleEventDetail}
                      />
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Now at end */}
            {nowPos >= events.length && isToday && <NowIndicator />}

            {/* Inline "Add Event" */}
            <div style={{ display: 'flex' }}>
              <div style={{ width: 72, flexShrink: 0 }} />
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleCreateNew}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.sm,
                  padding: `${spacing.md}px ${spacing.lg}px`,
                  ...glass.subtle,
                  border: `1.5px dashed ${colors.border}`,
                  borderRadius: radius.md,
                  cursor: 'pointer',
                  color: warmPalette.textMedium,
                  transition: 'border-color 0.2s, color 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = warmPalette.accent
                  e.currentTarget.style.color = warmPalette.accent
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = colors.dragHandle
                  e.currentTarget.style.color = warmPalette.textMedium
                }}
              >
                <Plus size={16} strokeWidth={2} />
                <span style={{ ...typography.bodyMedium, fontSize: typography.helper.fontSize }}>
                  Add event
                </span>
              </motion.button>
            </div>
          </div>
        )}

        {/* Bottom padding so content isn't hidden behind nav */}
        <div style={{ height: 80 }} />
      </div>


      {/* Event Editor Modal */}
      <AnimatePresence>
        {(editingEvent || isCreating) && (
          <EventEditor
            event={editingEvent}
            isNew={isCreating}
            date={selectedDate}
            onSave={handleEventSave}
            onDelete={handleEventDelete}
            onClose={handleEditorClose}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
