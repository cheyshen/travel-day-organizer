import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Trash2, Clock, MapPin, FileText, Hash, Tag, ImagePlus } from 'lucide-react'
import { colors } from '../colors'
import { typography, spacing, radius, tokens, warmPalette, glass } from '../styles'
import { generateId } from '../utils/timeUtils'
import { EVENT_TYPES } from '../data/eventTypes'
import { getCoverImage } from '../data/coverImages'

// =============================================================================
// EVENT EDITOR — Add/Edit/Delete event modal (bottom sheet)
// =============================================================================

const typeOptions = Object.values(EVENT_TYPES).filter(t => t.id !== 'custom')

function compressImage(dataUrl, maxDim = 800, quality = 0.6) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let { width, height } = img
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.src = dataUrl
  })
}

export default function EventEditor({ event, isNew, date, onSave, onDelete, onClose, onStatusToggle }) {
  // Lock body scroll while overlay is open — prevent horizontal wobble
  useEffect(() => {
    const scrollY = window.scrollY
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.left = '0'
    document.body.style.right = '0'
    document.body.style.overflowX = 'hidden'
    return () => {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      document.body.style.overflowX = ''
      window.scrollTo(0, scrollY)
    }
  }, [])

  // Preserve the original timezone offset from the event's times
  const originalTzOffset = event?.startTime
    ? extractTimezoneOffset(event.startTime)
    : '-10:00'

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
    coverImage: event?.coverImage || null,
  })

  const [showDelete, setShowDelete] = useState(false)
  const [photoError, setPhotoError] = useState(null)
  const fileInputRef = useRef(null)

  function update(field, value) {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  function handleStatusToggle() {
    if (onStatusToggle) onStatusToggle()
    setFormData(prev => ({
      ...prev,
      status: prev.status === 'done' ? 'upcoming' : 'done',
    }))
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
      timezone: event?.timezone || 'Pacific/Honolulu',
      location: formData.location.trim()
        ? { destination: formData.location.trim() }
        : null,
      confirmationNumber: formData.confirmationNumber.trim() || null,
      notes: formData.notes.trim() || null,
      status: formData.status,
      coverImage: formData.coverImage || null,
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
          background: 'rgba(255,255,255,0.98)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: `${radius.xl}px ${radius.xl}px 0 0`,
          overflow: 'auto',
        }}
      >
        {/* Drag handle */}
        <div style={{ padding: `${spacing.md}px 0 0`, display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: colors.dragHandle }} />
        </div>

        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `${spacing.sm}px ${spacing.lg}px ${spacing.md}px`,
          position: 'sticky',
          top: 0,
          background: 'rgba(255,255,255,0.98)',
          zIndex: 10,
        }}>
          <h3 style={{ ...typography.sectionHeader, color: warmPalette.textDark }}>
            {isNew ? 'New Event' : 'Edit Event'}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
            <button
              onClick={onClose}
              style={{
                width: 36, height: 36, borderRadius: 18,
                backgroundColor: warmPalette.warmGray,
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
          <label style={{ fontSize: typography.helper.fontSize, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: warmPalette.textMedium, display: 'block', marginBottom: spacing.sm }}>
            Type
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(74px, 1fr))',
            gap: spacing.md,
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
                    padding: `${spacing.md}px ${spacing.sm + 5}px`,
                    backgroundColor: isSelected ? opt.bgColor : warmPalette.warmGray,
                    border: isSelected ? `2px solid ${opt.color}` : '2px solid transparent',
                    borderRadius: radius.md,
                    cursor: 'pointer',
                    minHeight: 64,
                  }}
                >
                  <Icon size={22} color={isSelected ? opt.color : warmPalette.textMedium} strokeWidth={2} />
                  <span style={{
                    fontSize: typography.caption.fontSize,
                    fontWeight: isSelected ? 600 : 500,
                    color: isSelected ? warmPalette.textDark : warmPalette.textMedium,
                    lineHeight: '1.1',
                  }}>
                    {opt.label}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Cover Photo */}
          <FieldGroup label="Cover Photo" icon={ImagePlus}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                setPhotoError(null)
                if (file.size > 5 * 1024 * 1024) {
                  setPhotoError(`This file is ${(file.size / (1024 * 1024)).toFixed(1)}MB. Maximum size is 5MB.`)
                  e.target.value = ''
                  return
                }
                const reader = new FileReader()
                reader.onload = async (ev) => {
                  const compressed = await compressImage(ev.target.result)
                  update('coverImage', compressed)
                }
                reader.readAsDataURL(file)
                e.target.value = ''
              }}
            />
            {(() => {
              const displayImage = formData.coverImage || getCoverImage(formData.type, event?.id)
              return displayImage ? (
                <div style={{ position: 'relative' }}>
                  <img
                    src={displayImage}
                    alt="Cover preview"
                    style={{
                      width: '100%',
                      height: 120,
                      objectFit: 'cover',
                      borderRadius: radius.md,
                      display: 'block',
                      cursor: 'pointer',
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  />
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    width: '100%',
                    padding: spacing.xl,
                    backgroundColor: glass.input.background,
                    border: `2px dashed ${colors.border}`,
                    borderRadius: radius.md,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: spacing.sm,
                    color: warmPalette.textMedium,
                  }}
                >
                  <ImagePlus size={32} strokeWidth={1.5} />
                  <span style={{ ...typography.body, color: colors.textSecondary, margin: 0 }}>Tap to add a cover photo</span>
                  <span style={{ ...typography.caption, color: colors.textMuted, margin: 0 }}>Images only · Max 5 MB</span>
                </button>
              )
            })()}
            {photoError && (
              <p style={{
                ...typography.helper,
                color: colors.danger,
                marginTop: spacing.sm,
              }}>
                {photoError}
              </p>
            )}
          </FieldGroup>

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
                  onChange={e => update('startTime', buildISOTime(date, e.target.value, originalTzOffset))}
                  style={inputStyle}
                />
              </FieldGroup>
            </div>
            <div style={{ flex: 1 }}>
              <FieldGroup label="End Time" icon={Clock}>
                <input
                  type="time"
                  value={formData.endTime ? formatInputTime(formData.endTime) : ''}
                  onChange={e => update('endTime', buildISOTime(date, e.target.value, originalTzOffset))}
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
                backgroundColor: formData.title.trim() ? colors.ocean : colors.borderLight,
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
              <p style={{ ...typography.bodyMedium, color: colors.danger, marginBottom: spacing.md }}>
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
                    fontSize: typography.helper.fontSize,
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
                    fontSize: typography.helper.fontSize,
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
        fontSize: typography.helper.fontSize,
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
  background: 'rgba(240,238,235,0.7)',
  border: '1px solid rgba(0,0,0,0.14)',
  borderRadius: radius.md,
  fontSize: 16,
  color: colors.textPrimary,
  outline: 'none',
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  boxSizing: 'border-box',
}

// Time helpers — extract time directly from ISO string to preserve timezone
function formatInputTime(isoString) {
  if (!isoString) return ''
  try {
    // Extract HH:MM directly from the ISO string (before the timezone offset)
    // e.g. "2026-03-14T06:50:00-05:00" → "06:50"
    const match = isoString.match(/T(\d{2}):(\d{2})/)
    if (match) return `${match[1]}:${match[2]}`
    return ''
  } catch { return '' }
}

function extractTimezoneOffset(isoString) {
  if (!isoString) return '-10:00'
  // Match timezone offset at end: +HH:MM, -HH:MM, or Z
  const match = isoString.match(/([+-]\d{2}:\d{2})$/)
  if (match) return match[1]
  if (isoString.endsWith('Z')) return '+00:00'
  return '-10:00'
}

function buildISOTime(date, timeStr, tzOffset) {
  if (!timeStr || !date) return ''
  return `${date}T${timeStr}:00${tzOffset || '-10:00'}`
}
