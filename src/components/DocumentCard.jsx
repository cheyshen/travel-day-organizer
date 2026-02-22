import { Eye, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { colors } from '../colors'
import { typography, spacing, radius, shadows, warmPalette, glass } from '../styles'
import { getDocumentCategory } from '../data/statusCategories'

// =============================================================================
// DOCUMENT CARD
// =============================================================================

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

export default function DocumentCard({ doc, onPreview, onDelete }) {
  const category = getDocumentCategory(doc.category)
  const CatIcon = category.icon
  const isImage = doc.mimeType?.startsWith('image/')

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      style={{
        ...glass.card,
        borderRadius: radius.md,
        overflow: 'hidden',
      }}
    >
      <div
        onClick={() => onPreview(doc)}
        style={{
          height: 100,
          backgroundColor: category.bgColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {isImage ? (
          <img
            src={doc.dataUrl}
            alt={doc.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <CatIcon size={32} color={category.color} strokeWidth={1.5} />
        )}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0,
          transition: 'opacity 0.15s',
        }}>
          <Eye size={20} color={colors.textOnDark} />
        </div>
      </div>

      <div style={{ padding: `${spacing.sm}px ${spacing.md}px` }}>
        <p style={{
          ...typography.bodyMedium,
          color: warmPalette.textDark,
          margin: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {doc.name}
        </p>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: spacing.xs,
        }}>
          <span style={{ ...typography.caption, color: warmPalette.textLight }}>
            {category.label} · {formatFileSize(doc.fileSize)}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(doc.id) }}
            aria-label="Delete document"
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              border: 'none',
              backgroundColor: colors.dangerLight,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
            }}
          >
            <Trash2 size={12} color={colors.danger} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
