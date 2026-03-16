import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Upload, FileText } from 'lucide-react'
import { colors } from '../colors'
import { typography, spacing, radius, tokens, warmPalette, glass } from '../styles'
import { DOCUMENT_CATEGORIES } from '../data/statusCategories'
import { generateId } from '../utils/timeUtils'

// =============================================================================
// DOCUMENT UPLOADER — Bottom sheet with file input + category picker
// =============================================================================

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB

const categoryOptions = Object.values(DOCUMENT_CATEGORIES)

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

export default function DocumentUploader({ onSave, onClose }) {
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

  const [category, setCategory] = useState('passport')
  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')
  const [fileData, setFileData] = useState(null) // { dataUrl, mimeType, fileSize }
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    if (file.size > MAX_FILE_SIZE) {
      setError(`File too large (${(file.size / 1048576).toFixed(1)} MB). Maximum is 2 MB.`)
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setFileData({
        dataUrl: reader.result,
        mimeType: file.type,
        fileSize: file.size,
      })
      if (!name) setName(file.name.replace(/\.[^/.]+$/, ''))
    }
    reader.readAsDataURL(file)
  }

  function handleSave() {
    if (!fileData || !name.trim()) return

    onSave({
      id: generateId(),
      name: name.trim(),
      category,
      mimeType: fileData.mimeType,
      dataUrl: fileData.dataUrl,
      fileSize: fileData.fileSize,
      createdAt: new Date().toISOString(),
      notes: notes.trim() || null,
    })
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
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)' }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        style={{
          position: 'relative',
          width: 'calc(100% - 32px)',
          maxWidth: 440,
          maxHeight: '80vh',
          ...glass.sheet,
          borderRadius: radius.xl,
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
          borderBottom: tokens.cardBorder,
          position: 'sticky',
          top: 0,
          background: glass.sheet.background,
          backdropFilter: glass.sheet.backdropFilter,
          WebkitBackdropFilter: glass.sheet.WebkitBackdropFilter,
          zIndex: 10,
        }}>
          <h3 style={{ ...typography.sectionHeader, color: warmPalette.textDark }}>
            Upload Document
          </h3>
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

        <div style={{ padding: spacing.lg }}>
          {/* File drop zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: spacing.xl,
              borderRadius: radius.md,
              border: `2px dashed ${fileData ? colors.success : colors.border}`,
              backgroundColor: fileData ? colors.successLight : glass.input.background,
              textAlign: 'center',
              cursor: 'pointer',
              marginBottom: spacing.lg,
              transition: 'all 0.15s ease',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            {fileData ? (
              <>
                {fileData.mimeType.startsWith('image/') ? (
                  <img
                    src={fileData.dataUrl}
                    alt="Preview"
                    style={{ maxWidth: '100%', maxHeight: 120, borderRadius: radius.sm, marginBottom: spacing.sm }}
                  />
                ) : (
                  <FileText size={40} color={colors.success} strokeWidth={1} style={{ marginBottom: spacing.sm }} />
                )}
                <p style={{ ...typography.helper, color: colors.success, margin: 0 }}>
                  File selected — tap to change
                </p>
              </>
            ) : (
              <>
                <Upload size={32} color={colors.textMuted} strokeWidth={1.5} style={{ display: 'block', margin: `0 auto ${spacing.sm}px` }} />
                <p style={{ ...typography.body, color: colors.textSecondary, margin: 0 }}>
                  Tap to select file
                </p>
                <p style={{ ...typography.caption, color: colors.textMuted, margin: 0, marginTop: spacing.xs }}>
                  Images or PDF · Max 2 MB
                </p>
              </>
            )}
          </div>

          {error && (
            <p style={{
              ...typography.helper,
              color: colors.danger,
              backgroundColor: colors.dangerLight,
              padding: `${spacing.sm}px ${spacing.md}px`,
              borderRadius: radius.sm,
              marginBottom: spacing.lg,
            }}>
              {error}
            </p>
          )}

          {/* Name */}
          <div style={{ marginBottom: spacing.lg }}>
            <label style={{
              ...typography.caption,
              color: warmPalette.textMedium,
              display: 'block',
              marginBottom: spacing.sm,
            }}>
              Document Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Passport — John"
              style={inputStyle}
            />
          </div>

          {/* Category */}
          <div style={{ marginBottom: spacing.lg }}>
            <label style={{
              ...typography.caption,
              color: warmPalette.textMedium,
              display: 'block',
              marginBottom: spacing.sm,
            }}>
              Category
            </label>
            <div style={{ display: 'flex', gap: spacing.sm, flexWrap: 'wrap' }}>
              {categoryOptions.map(opt => {
                const Icon = opt.icon
                const isSelected = category === opt.id
                return (
                  <button
                    key={opt.id}
                    onClick={() => setCategory(opt.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing.xs,
                      padding: `${spacing.md}px ${spacing.lg}px`,
                      backgroundColor: isSelected ? opt.bgColor : warmPalette.warmGray,
                      border: isSelected ? `2px solid ${opt.color}` : '2px solid transparent',
                      borderRadius: radius.md,
                      cursor: 'pointer',
                      fontSize: typography.helper.fontSize,
                      fontWeight: isSelected ? 600 : 500,
                      color: isSelected ? warmPalette.textDark : warmPalette.textMedium,
                    }}
                  >
                    <Icon size={16} strokeWidth={2} color={opt.color} />
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: spacing.lg }}>
            <label style={{
              ...typography.caption,
              color: warmPalette.textMedium,
              display: 'block',
              marginBottom: spacing.sm,
            }}>
              Notes (optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any extra details..."
              style={inputStyle}
            />
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={!fileData || !name.trim()}
            style={{
              width: '100%',
              padding: `${spacing.lg}px`,
              backgroundColor: (fileData && name.trim()) ? colors.ocean : colors.borderLight,
              color: (fileData && name.trim()) ? colors.textOnAccent : colors.textMuted,
              border: 'none',
              borderRadius: radius.md,
              fontSize: 16,
              fontWeight: 600,
              cursor: (fileData && name.trim()) ? 'pointer' : 'default',
            }}
          >
            Upload Document
          </button>

          <div style={{ height: spacing.xxl }} />
        </div>
      </motion.div>
    </motion.div>
  )
}
