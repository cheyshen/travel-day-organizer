import { Check, Pencil, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { colors } from '../colors'
import { typography, spacing, radius, warmPalette, glass } from '../styles'
import { getChecklistCategory } from '../data/statusCategories'

// =============================================================================
// CHECKLIST ITEM ROW
// =============================================================================

export default function ChecklistItemRow({ item, onToggle, onEdit, onDelete }) {
  const category = getChecklistCategory(item.category)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: spacing.md,
        padding: `${spacing.md}px`,
        ...glass.card,
        borderRadius: radius.md,
      }}
    >
      <button
        onClick={() => onToggle(item.id)}
        aria-label={item.completed ? 'Mark incomplete' : 'Mark complete'}
        style={{
          width: 44,
          height: 44,
          borderRadius: 8,
          border: 'none',
          backgroundColor: 'transparent',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          padding: 0,
        }}
      >
        <div style={{
          width: 22,
          height: 22,
          borderRadius: 6,
          border: item.completed ? 'none' : `3px solid ${category.color}40`,
          backgroundColor: item.completed ? category.color : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.15s ease',
        }}>
          {item.completed && <Check size={13} color={colors.textOnAccent} strokeWidth={3} />}
        </div>
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          ...typography.body,
          color: item.completed ? warmPalette.textLight : warmPalette.textDark,
          textDecoration: item.completed ? 'line-through' : 'none',
          margin: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {item.title}
        </p>
      </div>

      <div style={{ display: 'flex', gap: spacing.xs, flexShrink: 0 }}>
        <button
          onClick={() => onEdit(item)}
          aria-label="Edit item"
          style={{
            width: 40,
            height: 40,
            borderRadius: radius.iconSquare,
            border: 'none',
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Pencil size={14} color={warmPalette.textLight} />
        </button>
        <button
          onClick={() => onDelete(item.id)}
          aria-label="Delete item"
          style={{
            width: 40,
            height: 40,
            borderRadius: radius.iconSquare,
            border: 'none',
            backgroundColor: colors.dangerLight,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Trash2 size={14} color={colors.danger} />
        </button>
      </div>
    </motion.div>
  )
}
