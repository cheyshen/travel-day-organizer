import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Trash2, CheckCircle2, Clock, MapPin, FileText, Hash, Tag } from 'lucide-react'
import { colors } from '../colors'
import { typography, spacing, radius, shadows, tokens, warmPalette, glass } from '../styles'
import { formatTime } from '../utils/timeUtils'
import { generateId } from '../utils/timeUtils'
import { EVENT_TYPES } from '../data/eventTypes'
import StatusBadge from './StatusBadge'

// =============================================================================
// EVENT EDITOR — Add/Edit/Delete event modal (bottom sheet)
// =============================================================================

const typeOptions = Object.values(EVENT_TYPES).filter(t => t.id !== 'custom')

export default function EventEditor({ event, isNew, date, onSave, onDelete, onClose, onStatusToggle }) {
  const [formData, setFormData] = useState({
    type: event?.type || 'activity',
    title: event?.title || '',
    subtitle: event?.subtitle || '',
    startTime: event?.startTime || '',
    endTime: event?.endTime || '',
    location: event?.location ? (typeof event.location === 'string' ? event.location : (event.location.destination || event.location.origin || '')) : '',
    confirmationNumber: event?.confirmationNumber || '',
    notes: event?.notes || '',
    status: event?.status || 'upcoming',
    bufferMinutes: event?.bufferMinutes || 30,
    bufferLabel: event?.bufferLabel || '',
  })

  const [showDelete, setShowDelete] = useState(false)

  function update(field, value) {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  function handleSave() {
    if (!formData.title.trim()) return

    const data = {
      id: event?.id || generateId(),
      type: formData.type,
      title: formData.title.trim(),
      subtitle: formData.subtitle.trim() || null,
      startTime: formData.startTime || null,
      endTime: formData.endTime || null,
      timezone: 'Pacific/Honolulu',
      location: formData.location.trim()
        ? { destination: formData.location.trim() }
        : null,
      confirmationNumber: formData.confirmationNumber.trim() || null,
      notes: formData.notes.trim() || null,
      status: formData.status,
    }

    if (formData.type === 'buffer') {
      data.bufferMinutes = formData.bufferMinutes
      data.bufferLabel = formData.bufferLabel.trim() || null
    }

    onSave(data)
  }

  function handleDelete() {
    if (event?.id) onDelete(event.id)
  }

  const selectedType = EVENT_TYPES[formData.type] || EVENT_TYPES.custom

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.35)',
        }}
      />

      {/* Sheet */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 480,
          maxHeight: '90vh',
          ...glass.sheet,
          borderRadius: `${radius.xl}px ${radius.xl}px 0 0`,
          overflow: 'auto',
        }}
      >
        {/* Drag handle */}
        <div style={{ padding: `${spacing.md}px 0 0`, display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: '#D6D3CE' }} />
        </div>

        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `${spacing.sm}px ${spacing.lg}px ${spacing.md}px`,
          borderBottom: tokens.cardBorder,
          position: 'sticky',
          top: 0,
          background: glass.sheet.background,
          backdropFilter: glass.sheet.backdropFilter,
          WebkitBackdropFilter: glass.sheet.WebkitBackdropFilter,
          zIndex: 10,
        }}>
          <h3 style={{ ...typography.sectionHeader, color: warmPalette.textDark }}>
            {isNew ? 'New Event' : 'Edit Event'}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
            {event && onStatusToggle && (
              <button
                onClick={onStatusToggle}
                style={{
                  display: 'flex', alignItems: 'center', gap: spacing.xs,
                  padding: `${spacing.xs}px ${spacing.sm}px`,
                  backgroundColor: event.status === 'done' ? colors.successLight : colors.surfaceMuted,
                  color: event.status === 'done' ? colors.success : colors.textSecondary,
                  border: 'none',
                  borderRadius: radius.sm,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <CheckCircle2 size={16} strokeWidth={2} />
                {event.status === 'done' ? 'Done' : 'Mark Done'}
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                width: 36, height: 36, borderRadius: 18,
                backgroundColor: '#EDEAE5',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <X size={18} color={warmPalette.textMedium} strokeWidth={2} />
            </button>
          </div>
        </div>

        <div style={{ padding: spacing.lg }}>
          {/* Type picker */}
          <label style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: warmPalette.textMedium, display: 'block', marginBottom: spacing.sm }}>
            Type
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(64px, 1fr))',
            gap: spacing.sm,
            marginBottom: spacing.lg,
          }}>
            {typeOptions.map(opt => {
              const Icon = opt.icon
              const isSelected = formData.type === opt.id
              return (
                <button
                  key={opt.id}
                  onClick={() => update('type', opt.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 3,
                    padding: `${spacing.md}px ${spacing.sm}px`,
                    backgroundColor: isSelected ? opt.bgColor : '#EDEAE5',
                    border: isSelected ? `2px solid ${opt.color}` : '2px solid transparent',
                    borderRadius: radius.md,
                    cursor: 'pointer',
                    minHeight: 64,
                  }}
                >
                  <Icon size={22} color={isSelected ? opt.color : warmPalette.textMedium} strokeWidth={2} />
                  <span style={{
                    fontSize: 11,
                    fontWeight: isSelected ? 600 : 500,
                    color: isSelected ? opt.color : warmPalette.textMedium,
                  }}>
                    {opt.label}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Title */}
          <FieldGroup label="Title" icon={Tag}>
            <input
              type="text"
              value={formData.title}
              onChange={e => update('title', e.target.value)}
              placeholder="Event title"
              style={inputStyle}
            />
          </FieldGroup>

          {/* Subtitle */}
          <FieldGroup label="Subtitle" icon={FileText}>
            <input
              type="text"
              value={formData.subtitle}
              onChange={e => update('subtitle', e.target.value)}
              placeholder="Optional subtitle"
              style={inputStyle}
            />
          </FieldGroup>

          {/* Times */}
          <div style={{ display: 'flex', gap: spacing.md, marginBottom: spacing.lg }}>
            <div style={{ flex: 1 }}>
              <FieldGroup label="Start Time" icon={Clock}>
                <input
                  type="time"
                  value={formData.startTime ? formatInputTime(formData.startTime) : ''}
                  onChange={e => update('startTime', buildISOTime(date, e.target.value))}
                  style={inputStyle}
                />
              </FieldGroup>
            </div>
            <div style={{ flex: 1 }}>
              <FieldGroup label="End Time" icon={Clock}>
                <input
                  type="time"
                  value={formData.endTime ? formatInputTime(formData.endTime) : ''}
                  onChange={e => update('endTime', buildISOTime(date, e.target.value))}
                  style={inputStyle}
                />
              </FieldGroup>
            </div>
          </div>

          {/* Location */}
          <FieldGroup label="Location" icon={MapPin}>
            <input
              type="text"
              value={formData.location}
              onChange={e => update('location', e.target.value)}
              placeholder="Where is this?"
              style={inputStyle}
            />
          </FieldGroup>

          {/* Confirmation */}
          <FieldGroup label="Confirmation #" icon={Hash}>
            <input
              type="text"
              value={formData.confirmationNumber}
              onChange={e => update('confirmationNumber', e.target.value)}
              placeholder="Booking reference"
              style={inputStyle}
            />
          </FieldGroup>

          {/* Notes */}
          <FieldGroup label="Notes" icon={FileText}>
            <textarea
              value={formData.notes}
              onChange={e => update('notes', e.target.value)}
              placeholder="Any extra details..."
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
            />
          </FieldGroup>

          {/* Buffer-specific fields */}
          {formData.type === 'buffer' && (
            <div style={{ display: 'flex', gap: spacing.md, marginBottom: spacing.lg }}>
              <div style={{ flex: 1 }}>
                <FieldGroup label="Buffer Minutes">
                  <input
                    type="number"
                    value={formData.bufferMinutes}
                    onChange={e => update('bufferMinutes', parseInt(e.target.value) || 0)}
                    style={inputStyle}
                  />
                </FieldGroup>
              </div>
              <div style={{ flex: 2 }}>
                <FieldGroup label="Buffer Label">
                  <input
                    type="text"
                    value={formData.bufferLabel}
                    onChange={e => update('bufferLabel', e.target.value)}
                    placeholder="What's the buffer for?"
                    style={inputStyle}
                  />
                </FieldGroup>
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: spacing.md, paddingTop: spacing.md }}>
            {!isNew && (
              <button
                onClick={() => setShowDelete(true)}
                style={{
                  flex: 0,
                  padding: `${spacing.lg}px`,
                  backgroundColor: colors.dangerLight,
                  color: colors.danger,
                  border: 'none',
                  borderRadius: radius.md,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Trash2 size={20} strokeWidth={2} />
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={!formData.title.trim()}
              style={{
                flex: 1,
                padding: `${spacing.lg}px`,
                backgroundColor: formData.title.trim() ? colors.ocean : colors.surfaceMuted,
                color: formData.title.trim() ? colors.textOnAccent : colors.textMuted,
                border: 'none',
                borderRadius: radius.md,
                fontSize: 16,
                fontWeight: 600,
                cursor: formData.title.trim() ? 'pointer' : 'default',
              }}
            >
              {isNew ? 'Add Event' : 'Save Changes'}
            </button>
          </div>

          {/* Delete confirmation */}
          {showDelete && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: spacing.lg,
                padding: spacing.lg,
                backgroundColor: colors.dangerLight,
                borderRadius: radius.md,
                textAlign: 'center',
              }}
            >
              <p style={{ ...typography.body, color: colors.danger, fontWeight: 500, marginBottom: spacing.md }}>
                Delete "{event?.title}"?
              </p>
              <div style={{ display: 'flex', gap: spacing.md }}>
                <button
                  onClick={() => setShowDelete(false)}
                  style={{
                    flex: 1,
                    padding: `${spacing.md}px`,
                    backgroundColor: colors.surface,
                    color: colors.textSecondary,
                    border: tokens.cardBorder,
                    borderRadius: radius.sm,
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  style={{
                    flex: 1,
                    padding: `${spacing.md}px`,
                    backgroundColor: colors.danger,
                    color: colors.textOnAccent,
                    border: 'none',
                    borderRadius: radius.sm,
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          )}

          {/* Bottom padding for safe area */}
          <div style={{ height: spacing.xxl }} />
        </div>
      </motion.div>
    </motion.div>
  )
}

// Helper components
function FieldGroup({ label, icon: Icon, children }) {
  return (
    <div style={{ marginBottom: spacing.lg }}>
      <label style={{
        fontSize: 13,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: warmPalette.textMedium,
        display: 'flex',
        alignItems: 'center',
        gap: spacing.xs,
        marginBottom: spacing.sm,
      }}>
        {Icon && <Icon size={14} strokeWidth={2} />}
        {label}
      </label>
      {children}
    </div>
  )
}

const inputStyle = {
  width: '100%',
  padding: `${spacing.lg}px`,
  ...glass.input,
  borderRadius: radius.md,
  fontSize: 16,
  color: warmPalette.textDark,
  outline: 'none',
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  boxSizing: 'border-box',
}

// Time helpers
function formatInputTime(isoString) {
  if (!isoString) return ''
  try {
    const d = new Date(isoString)
    const h = String(d.getHours()).padStart(2, '0')
    const m = String(d.getMinutes()).padStart(2, '0')
    return `${h}:${m}`
  } catch { return '' }
}

function buildISOTime(date, timeStr) {
  if (!timeStr || !date) return ''
  return `${date}T${timeStr}:00-10:00`
}
