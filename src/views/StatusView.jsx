import { useState, useMemo, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Upload, ClipboardList, FolderOpen } from 'lucide-react'
import { useTripContext } from '../context/TripContext'
import { colors } from '../colors'
import { typography, spacing, radius, shadows, warmPalette, glass, glossyBg } from '../styles'
import { CHECKLIST_CATEGORIES } from '../data/statusCategories'
import ChecklistItemRow from '../components/ChecklistItemRow'
import ChecklistEditor from '../components/ChecklistEditor'
import DocumentCard from '../components/DocumentCard'
import DocumentUploader from '../components/DocumentUploader'
import DocumentViewer from '../components/DocumentViewer'

// =============================================================================
// STATUS VIEW — Default light theme
// =============================================================================

function SectionHeader({ icon: Icon, title, count, children }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
      marginTop: spacing.xxl,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
        {Icon && (
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: warmPalette.accentSoft,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Icon size={16} color={warmPalette.accent} strokeWidth={2} />
          </div>
        )}
        <h3 style={{
          ...typography.sectionHeader,
          color: warmPalette.textDark,
          margin: 0,
        }}>
          {title}
        </h3>
        {count !== undefined && (
          <span style={{
            ...typography.caption,
            fontSize: 11,
            color: warmPalette.accent,
            backgroundColor: warmPalette.accentSoft,
            padding: `2px ${spacing.sm}px`,
            borderRadius: radius.pill,
          }}>
            {count}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

export default function StatusView() {
  const { state, dispatch } = useTripContext()
  const checklistItems = state.checklistItems || []
  const documents = state.documents || []

  const [checklistEditing, setChecklistEditing] = useState(null)
  const [showUploader, setShowUploader] = useState(false)
  const [viewingDoc, setViewingDoc] = useState(null)

  const completedCount = checklistItems.filter(i => i.completed).length
  const totalCount = checklistItems.length
  const progress = totalCount > 0 ? completedCount / totalCount : 0

  const groupedChecklist = useMemo(() => {
    const groups = {}
    for (const item of checklistItems) {
      const cat = item.category || 'other'
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(item)
    }
    return Object.entries(CHECKLIST_CATEGORIES)
      .map(([id]) => ({
        id,
        items: (groups[id] || []).sort((a, b) => a.sortOrder - b.sortOrder),
      }))
      .filter(g => g.items.length > 0)
  }, [checklistItems])

  const handleToggle = useCallback((id) => {
    dispatch({ type: 'TOGGLE_CHECKLIST_ITEM', payload: id })
  }, [dispatch])

  const handleDeleteChecklist = useCallback((id) => {
    dispatch({ type: 'DELETE_CHECKLIST_ITEM', payload: id })
  }, [dispatch])

  const handleChecklistSave = useCallback((data) => {
    if (data.updates) {
      dispatch({ type: 'UPDATE_CHECKLIST_ITEM', payload: data })
    } else {
      dispatch({ type: 'ADD_CHECKLIST_ITEM', payload: data })
    }
    setChecklistEditing(null)
  }, [dispatch])

  const handleDocumentSave = useCallback((doc) => {
    dispatch({ type: 'ADD_DOCUMENT', payload: doc })
    setShowUploader(false)
  }, [dispatch])

  const handleDeleteDocument = useCallback((id) => {
    dispatch({ type: 'DELETE_DOCUMENT', payload: id })
  }, [dispatch])

  return (
    <div style={{
      background: glossyBg,
      minHeight: '100vh',
    }}>
      {/* Sticky header — glassmorphic */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        ...glass.frostedLight,
        padding: `${spacing.lg}px ${spacing.lg}px ${spacing.md}px`,
        borderBottom: '1px solid rgba(255, 255, 255, 0.4)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: spacing.sm,
        }}>
          <h2 style={{
            ...typography.title,
            color: warmPalette.textDark,
            margin: 0,
          }}>
            Checklist
          </h2>
          <button
            onClick={() => setChecklistEditing('new')}
            style={{
              height: 44,
              padding: `0 ${spacing.lg}px`,
              borderRadius: radius.pill,
              border: 'none',
              backgroundColor: warmPalette.accent,
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 13,
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(14, 116, 144, 0.25)',
            }}
          >
            <Plus size={14} strokeWidth={2.5} />
            Add
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
          <div style={{
            flex: 1,
            height: 6,
            backgroundColor: warmPalette.accentSoft,
            borderRadius: 3,
            overflow: 'hidden',
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{
                height: '100%',
                backgroundColor: progress === 1 ? colors.success : warmPalette.accent,
                borderRadius: 3,
              }}
            />
          </div>
          <span style={{
            ...typography.caption,
            color: warmPalette.textMedium,
            minWidth: 40,
            textAlign: 'right',
          }}>
            {completedCount}/{totalCount}
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: `0 ${spacing.lg}px ${spacing.xxxl}px` }}>

        {/* ===================== CHECKLIST ===================== */}
        <div style={{ height: 10 }} />

        {groupedChecklist.map(group => {
          const cat = CHECKLIST_CATEGORIES[group.id]
          const CatIcon = cat.icon
          return (
            <div key={group.id} style={{ marginBottom: spacing.lg }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing.xs,
                marginBottom: spacing.sm,
              }}>
                <CatIcon size={14} color={cat.color} strokeWidth={2.5} />
                <span style={{ ...typography.caption, color: warmPalette.textDark, fontSize: 12, fontWeight: 700 }}>
                  {cat.label}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
                <AnimatePresence>
                  {group.items.map(item => (
                    <ChecklistItemRow
                      key={item.id}
                      item={item}
                      onToggle={handleToggle}
                      onEdit={(it) => setChecklistEditing(it)}
                      onDelete={handleDeleteChecklist}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )
        })}

        {totalCount === 0 && (
          <div style={{
            textAlign: 'center',
            padding: spacing.xxl,
            ...glass.subtle,
            borderRadius: radius.xl,
          }}>
            <ClipboardList size={32} strokeWidth={1} color={warmPalette.textLight} style={{ marginBottom: spacing.sm }} />
            <p style={{ ...typography.body, margin: 0, color: warmPalette.textMedium }}>No checklist items yet</p>
            <p style={{ ...typography.helper, margin: 0, marginTop: spacing.xs, color: warmPalette.textLight }}>
              Tap "Add" to start your packing list
            </p>
          </div>
        )}

        {/* ===================== DOCUMENTS ===================== */}
        <SectionHeader
          icon={FolderOpen}
          title="Documents"
          count={documents.length}
        >
          <button
            onClick={() => setShowUploader(true)}
            style={{
              height: 44,
              padding: `0 ${spacing.lg}px`,
              borderRadius: radius.pill,
              border: 'none',
              backgroundColor: warmPalette.accent,
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 13,
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(14, 116, 144, 0.25)',
            }}
          >
            <Upload size={14} strokeWidth={2.5} />
            Upload
          </button>
        </SectionHeader>

        {documents.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: spacing.md,
          }}>
            <AnimatePresence>
              {documents.map(doc => (
                <DocumentCard
                  key={doc.id}
                  doc={doc}
                  onPreview={(d) => setViewingDoc(d)}
                  onDelete={handleDeleteDocument}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: spacing.xxl,
            ...glass.subtle,
            borderRadius: radius.xl,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <FolderOpen size={32} strokeWidth={1} color={warmPalette.accent} style={{ marginBottom: spacing.sm }} />
            <p style={{ ...typography.body, margin: 0, color: warmPalette.textMedium }}>No documents uploaded</p>
            <p style={{ ...typography.helper, margin: 0, marginTop: spacing.xs, color: warmPalette.textLight }}>
              Upload passports, boarding passes, or itineraries
            </p>
          </div>
        )}
      </div>

      {/* ===================== OVERLAYS ===================== */}
      <AnimatePresence>
        {checklistEditing && (
          <ChecklistEditor
            item={checklistEditing === 'new' ? null : checklistEditing}
            onSave={handleChecklistSave}
            onClose={() => setChecklistEditing(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showUploader && (
          <DocumentUploader
            onSave={handleDocumentSave}
            onClose={() => setShowUploader(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewingDoc && (
          <DocumentViewer
            doc={viewingDoc}
            onClose={() => setViewingDoc(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
