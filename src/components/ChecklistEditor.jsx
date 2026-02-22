import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Tag, FileText } from 'lucide-react'
import { colors } from '../colors'
import { typography, spacing, radius, shadows, tokens, warmPalette, glass } from '../styles'
import { CHECKLIST_CATEGORIES } from '../data/statusCategories'
import { generateId } from '../utils/timeUtils'

// =============================================================================
// CHECKLIST EDITOR — Bottom sheet to add/edit checklist items
// =============================================================================

const categoryOptions = Object.values(CHECKLIST_CATEGORIES)

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

export default function ChecklistEditor({ item, onSave, onClose }) {
  const isNew = !item
  const [title, setTitle] = useState(item?.title || '')
  const [category, setCategory] = useState(item?.category || 'packing')

  function handleSave() {
    if (!title.trim()) return

    if (isNew) {
      onSave({
        id: generateId(),
        title: title.trim(),
        category,
        completed: false,
        completedAt: null,
        createdAt: new Date().toISOString(),
        sortOrder: Date.now(),
      })
    } else {
      onSave({
        id: item.id,
        updates: {
          title: title.trim(),
          category,
        },
      })
    }
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
        style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)' }}
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
        }}>
          <h3 style={{ ...typography.sectionHeader, color: warmPalette.textDark }}>
            {isNew ? 'New Item' : 'Edit Item'}
          </h3>
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

        <div style={{ padding: spacing.lg }}>
          {/* Title */}
          <div style={{ marginBottom: spacing.lg }}>
            <label style={{
              ...typography.caption,
              color: warmPalette.textMedium,
              display: 'flex',
              alignItems: 'center',
              gap: spacing.xs,
              marginBottom: spacing.sm,
            }}>
              <Tag size={14} strokeWidth={2} />
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              autoFocus
              style={inputStyle}
            />
          </div>

          {/* Category picker */}
          <div style={{ marginBottom: spacing.lg }}>
            <label style={{
              ...typography.caption,
              color: warmPalette.textMedium,
              display: 'flex',
              alignItems: 'center',
              gap: spacing.xs,
              marginBottom: spacing.sm,
            }}>
              <FileText size={14} strokeWidth={2} />
              Category
            </label>
            <div style={{
              display: 'flex',
              gap: spacing.sm,
              flexWrap: 'wrap',
            }}>
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
                      backgroundColor: isSelected ? opt.bgColor : '#EDEAE5',
                      border: isSelected ? `2px solid ${opt.color}` : '2px solid transparent',
                      borderRadius: radius.md,
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: isSelected ? 600 : 500,
                      color: isSelected ? opt.color : warmPalette.textMedium,
                    }}
                  >
                    <Icon size={16} strokeWidth={2} />
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            style={{
              width: '100%',
              padding: `${spacing.lg}px`,
              backgroundColor: title.trim() ? colors.ocean : colors.surfaceMuted,
              color: title.trim() ? colors.textOnAccent : colors.textMuted,
              border: 'none',
              borderRadius: radius.md,
              fontSize: 16,
              fontWeight: 600,
              cursor: title.trim() ? 'pointer' : 'default',
            }}
          >
            {isNew ? 'Add Item' : 'Save Changes'}
          </button>

          <div style={{ height: spacing.xxl }} />
        </div>
      </motion.div>
    </motion.div>
  )
}
