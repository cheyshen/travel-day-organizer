import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Plus, MapPin } from 'lucide-react'
import { useTripContext } from '../context/TripContext'
import { colors } from '../colors'
import { typography, spacing, radius, shadows, warmPalette, glass, glossyBg } from '../styles'
import { formatTripDate, getDayIndex, getAdjacentDates, isTodayDate } from '../utils/dateUtils'
import { getNowPosition, formatTime, formatHourLabel } from '../utils/timeUtils'
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

  function handleStatusToggle(eventId) {
    const event = events.find(e => e.id === eventId)
    if (!event) return
    const newStatus = event.status === 'done' ? 'upcoming' : 'done'
    dispatch({
      type: 'SET_EVENT_STATUS',
      payload: { date: selectedDate, eventId, status: newStatus },
    })
  }

  const allDone = events.length > 0 && events.every(e => e.status === 'done')

  return (
    <div style={{ background: glossyBg, minHeight: '100vh' }}>
      {/* Sticky header — glassmorphic */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        ...glass.frostedLight,
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
            <ChevronLeft size={20} color={warmPalette.textDark} />
          </button>

          {/* Centered day info — flex:1 between equal-width arrow buttons */}
          <div style={{
            flex: 1,
            textAlign: 'center',
          }}>
            <p style={{ ...typography.caption, fontSize: 12, color: warmPalette.textMedium, marginBottom: 2 }}>
              Day {dayNum} of {Object.keys(days).length}
            </p>
            <h2 style={{ ...typography.sectionHeader, color: warmPalette.textDark, margin: 0 }}>
              {formatTripDate(selectedDate)}
            </h2>
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
            <ChevronRight size={20} color={warmPalette.textDark} />
          </button>
        </div>

        {/* Destination strip — pill on current island, others as plain text links */}
        {dest && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: `${spacing.md + 2}px ${spacing.lg}px`,
            backgroundColor: dest.id === 'dest-kauai' ? '#BAE5E0' : '#EDDBAF',
            borderTop: `1px solid ${dest.color}40`,
          }}>
            {/* Current destination — pill shape, bold */}
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              padding: '6px 14px',
              background: 'rgba(255,255,255,0.65)',
              borderRadius: 20,
            }}>
              <MapPin size={13} color={dest.color} strokeWidth={2.5} />
              <span style={{
                fontSize: 14,
                fontWeight: 700,
                color: warmPalette.textDark,
              }}>
                {dest.name}
              </span>
            </span>

            {day?.label && (
              <>
                <span style={{ color: warmPalette.textLight, margin: '0 2px' }}>·</span>
                <span style={{ ...typography.body, color: warmPalette.textMedium }}>
                  {day.label}
                </span>
              </>
            )}

            {/* Other islands — plain text links */}
            {trip.destinations.filter(d => d.id !== dest.id).map(d => {
              const firstDate = Object.entries(days).find(([, dy]) => dy.destinationId === d.id)?.[0]
              return (
                <span key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 4 }}>
                  <span style={{ color: warmPalette.textLight, marginRight: 2 }}>·</span>
                  <button
                    onClick={() => {
                      if (firstDate) dispatch({ type: 'SET_SELECTED_DATE', payload: firstDate })
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '6px 4px',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <MapPin size={13} color={d.color} strokeWidth={2} />
                    <span style={{
                      fontSize: 15,
                      fontWeight: 500,
                      color: warmPalette.textMedium,
                    }}>
                      {d.name}
                    </span>
                    <ChevronRight size={12} color={warmPalette.textMedium} strokeWidth={2} />
                  </button>
                </span>
              )
            })}
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
            gap: 10,
          }}>
            {events.map((event, idx) => {
              const showNow = idx === nowPos
              // Extract hour label from start time
              const startHour = event.startTime
                ? formatHourLabel(event.startTime)
                : ''
              // Show hour label if it differs from previous event's hour
              const prevEvent = idx > 0 ? events[idx - 1] : null
              const prevHour = prevEvent?.startTime
                ? formatHourLabel(prevEvent.startTime)
                : ''
              const showHourLabel = startHour !== prevHour

              return (
                <div key={event.id}>
                  {showNow && <NowIndicator />}
                  <div style={{
                    display: 'flex',
                    gap: spacing.sm,
                    alignItems: 'flex-start',
                  }}>
                    {/* Left hour label */}
                    <div style={{
                      width: 44,
                      flexShrink: 0,
                      paddingTop: spacing.md,
                      textAlign: 'right',
                    }}>
                      {showHourLabel && (
                        <span style={{
                          ...typography.caption,
                          fontSize: 12,
                          color: warmPalette.textMedium,
                        }}>
                          {startHour}
                        </span>
                      )}
                    </div>

                    {/* Time block */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <TimeBlock
                        event={event}
                        isNext={nextUpcoming?.id === event.id}
                        onTap={handleEventTap}
                        onDetail={handleEventDetail}
                        onToggleStatus={handleStatusToggle}
                      />
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Now at end */}
            {nowPos >= events.length && isToday && <NowIndicator />}

            {/* Inline "Add Event" */}
            <div style={{ display: 'flex', gap: spacing.sm }}>
              <div style={{ width: 44, flexShrink: 0 }} />
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

        {/* Day complete */}
        {allDone && <EmptyState type="complete" />}

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
            onStatusToggle={editingEvent ? () => handleStatusToggle(editingEvent.id) : null}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
