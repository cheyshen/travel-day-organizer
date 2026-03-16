import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, FileText } from 'lucide-react'
import { colors } from '../colors'
import { typography, spacing, radius } from '../styles'
import { getDocumentCategory } from '../data/statusCategories'

// =============================================================================
// DOCUMENT VIEWER — Full-screen document preview overlay
// =============================================================================

export default function DocumentViewer({ doc, onClose }) {
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

  if (!doc) return null

  const category = getDocumentCategory(doc.category)
  const isImage = doc.mimeType?.startsWith('image/')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 110,
        backgroundColor: 'rgba(0,0,0,0.9)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `${spacing.lg}px`,
        flexShrink: 0,
      }}>
        <div style={{ minWidth: 0 }}>
          <p style={{
            ...typography.bodyMedium,
            color: colors.textOnDark,
            margin: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {doc.name}
          </p>
          <p style={{
            ...typography.caption,
            color: 'rgba(255,255,255,0.6)',
            margin: 0,
            marginTop: 2,
          }}>
            {category.label}
            {doc.notes && ` · ${doc.notes}`}
          </p>
        </div>
        <button
          onClick={onClose}
          style={{
            width: 36, height: 36, borderRadius: 18,
            backgroundColor: 'rgba(255,255,255,0.15)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            marginLeft: spacing.md,
          }}
        >
          <X size={18} color={colors.textOnDark} />
        </button>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.lg,
        overflow: 'auto',
      }}>
        {isImage ? (
          <img
            src={doc.dataUrl}
            alt={doc.name}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              borderRadius: radius.md,
            }}
          />
        ) : doc.mimeType === 'application/pdf' ? (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.lg,
          }}>
            <FileText size={64} color="rgba(255,255,255,0.4)" strokeWidth={1} />
            <p style={{ ...typography.body, color: 'rgba(255,255,255,0.6)' }}>
              PDF preview
            </p>
            <a
              href={doc.dataUrl}
              download={`${doc.name}.pdf`}
              style={{
                padding: `${spacing.md}px ${spacing.xl}px`,
                backgroundColor: colors.ocean,
                color: colors.textOnDark,
                borderRadius: radius.md,
                textDecoration: 'none',
                fontSize: typography.helper.fontSize,
                fontWeight: 600,
              }}
            >
              Download PDF
            </a>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <FileText size={64} color="rgba(255,255,255,0.3)" strokeWidth={1} />
            <p style={{ ...typography.body, color: 'rgba(255,255,255,0.5)', marginTop: spacing.md }}>
              Preview not available
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
