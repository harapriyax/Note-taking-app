import React, { useState, useEffect, useRef } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Image as ImageIcon,
  Paperclip,
  Pin,
  Plus,
  RefreshCw,
  Star,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react'
import Button from './ui/Button'
import { uploadAttachments } from '../lib/api'

function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export default function NoteEditor({
  note,
  token,
  onClose,
  onSave,
  onTrash,
  categories = [],
  onOpenAddCategory,
}) {
  const [draft, setDraft] = useState(
    note || {
      title: '',
      content: '',
      category: categories[0]?.name || 'Personal',
      tags: [],
      attachments: [],
      isFavorite: false,
      isPinned: false,
    }
  )

  const [attachments, setAttachments] = useState(note?.attachments || [])
  const [uploadQueue, setUploadQueue] = useState([]) // [{ id, name, size, type, progress, error }]
  const [isDragging, setIsDragging] = useState(false)
  const [activePreview, setActivePreview] = useState(null) // { url, name, type }
  const [uploadError, setUploadError] = useState('')

  const fileInputRef = useRef(null)

  useEffect(() => {
    if (note) {
      setDraft(note)
      setAttachments(note.attachments || [])
    }
  }, [note])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (activePreview) {
          setActivePreview(null)
        } else {
          onClose()
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [draft, attachments, activePreview])

  // Handle Drag & Drop
  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      processSelectedFiles(e.dataTransfer.files)
    }
  }

  // Handle Selected Files from Input
  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processSelectedFiles(e.target.files)
    }
    e.target.value = '' // reset input
  }

  const processSelectedFiles = async (filesList) => {
    setUploadError('')
    const fileArray = Array.from(filesList)

    // Filter valid files (images and PDFs)
    const validFiles = []
    const invalidNames = []

    for (const file of fileArray) {
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
      const isImg = file.type.startsWith('image/')
      if (isPdf || isImg) {
        if (file.size > 25 * 1024 * 1024) {
          invalidNames.push(`${file.name} (exceeds 25MB limit)`)
        } else {
          validFiles.push(file)
        }
      } else {
        invalidNames.push(`${file.name} (unsupported format)`)
      }
    }

    if (invalidNames.length > 0) {
      setUploadError(`Some files were skipped: ${invalidNames.join(', ')}`)
    }

    if (validFiles.length === 0) return

    // Prepare upload queue state
    const queueEntries = validFiles.map((f, i) => ({
      queueId: `queue-${Date.now()}-${i}`,
      name: f.name,
      size: f.size,
      type: f.type.startsWith('image/') ? 'image' : 'pdf',
      progress: 0,
      status: 'uploading',
    }))

    setUploadQueue((prev) => [...prev, ...queueEntries])

    try {
      const uploaded = await uploadAttachments(validFiles, token, (fileIndex, percent) => {
        setUploadQueue((prev) =>
          prev.map((item, idx) => {
            if (item.queueId === queueEntries[fileIndex]?.queueId) {
              return { ...item, progress: percent }
            }
            return item
          })
        )
      })

      // Add to attachments list
      setAttachments((prev) => [...prev, ...uploaded])

      // Remove finished items from upload queue
      const finishedIds = new Set(queueEntries.map((q) => q.queueId))
      setUploadQueue((prev) => prev.filter((q) => !finishedIds.has(q.queueId)))
    } catch (err) {
      console.error('Batch upload failed:', err)
      setUploadError(err.message || 'Failed to upload attachments. Please try again.')
      // Mark pending items with error
      setUploadQueue((prev) =>
        prev.map((q) => ({ ...q, status: 'error', error: err.message }))
      )
    }
  }

  // Remove attachment
  const handleRemoveAttachment = (attachmentIdOrKey) => {
    setAttachments((prev) =>
      prev.filter((a) => a.id !== attachmentIdOrKey && a.key !== attachmentIdOrKey)
    )
  }

  const handleSave = (event) => {
    if (event) event.preventDefault()

    const parsedTags =
      typeof draft.tags === 'string'
        ? draft.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : draft.tags || []

    onSave({
      ...draft,
      isPinned: Boolean(draft.isPinned),
      tags: parsedTags,
      attachments: attachments,
    })
  }

  const imagesList = attachments.filter((a) => a.type === 'image' || a.mimeType?.startsWith('image/'))
  const pdfsList = attachments.filter((a) => a.type === 'pdf' || a.mimeType === 'application/pdf')

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget && !activePreview) onClose()
      }}
    >
      <form
        className="note-editor"
        onSubmit={handleSave}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Top Header */}
        <div className="editor-top">
          <div>
            <p className="eyebrow">{note?.id ? 'Edit note' : 'New note'}</p>
            <h2>{note?.id ? 'Refine your thought' : 'Capture a fresh idea'}</h2>
            {note?.updatedAt && (
              <p className="editor-last-updated text-xs text-stone-500 mt-1 flex items-center gap-1.5 font-medium">
                <Clock3 size={12} className="inline opacity-70" />
                <span>
                  Last modified: {new Date(note.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(note.updatedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                </span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={`pin-action ${draft.isPinned ? 'pinned' : ''}`}
              onClick={() => setDraft((d) => ({ ...d, isPinned: !d.isPinned }))}
              title={draft.isPinned ? 'Unpin note' : 'Pin note to top'}
            >
              <Pin size={18} fill={draft.isPinned ? 'currentColor' : 'none'} />
            </button>
            <button
              type="button"
              className={`star-action ${draft.isFavorite ? 'starred' : ''}`}
              onClick={() => setDraft((d) => ({ ...d, isFavorite: !d.isFavorite }))}
              title={draft.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star size={18} fill={draft.isFavorite ? 'currentColor' : 'none'} />
            </button>
            <button
              className="round-action"
              type="button"
              onClick={onClose}
              aria-label="Close editor"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Title Input */}
        <label>
          Title
          <input
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            placeholder="Give this thought a name"
            autoFocus
          />
        </label>

        {/* Category & Tags Split */}
        <div className="editor-split">
          <label>
            Category
            <div className="category-select-row">
              <select
                value={draft.category || categories[0]?.name || 'Personal'}
                onChange={(e) => {
                  if (e.target.value === '__NEW__') {
                    if (onOpenAddCategory) onOpenAddCategory()
                  } else {
                    setDraft({ ...draft, category: e.target.value })
                  }
                }}
              >
                {categories.map((option) => (
                  <option key={option.id || option.name} value={option.name}>
                    {option.name}
                  </option>
                ))}
                <option value="__NEW__">+ New category...</option>
              </select>
              {onOpenAddCategory && (
                <button
                  type="button"
                  className="quick-add-cat-btn"
                  onClick={onOpenAddCategory}
                  title="Add new category"
                >
                  <Plus size={15} />
                </button>
              )}
            </div>
          </label>
          <label>
            Tags (comma separated)
            <input
              value={Array.isArray(draft.tags) ? draft.tags.join(', ') : draft.tags || ''}
              onChange={(e) => setDraft({ ...draft, tags: e.target.value })}
              placeholder="#ideas, #project"
            />
          </label>
        </div>

        {/* Content Textarea */}
        <label>
          Note content
          <textarea
            rows={7}
            value={draft.content || ''}
            onChange={(e) => setDraft({ ...draft, content: e.target.value })}
            placeholder="Write your thoughts, checklist, or plan here..."
          />
        </label>

        {/* Attachments Section */}
        <div className="editor-attachments-container">
          <div className="attachments-header">
            <span className="attachments-label">
              <Paperclip size={14} className="text-[#7C5CFC]" />
              <span>Attachments ({attachments.length})</span>
            </span>
            <button
              type="button"
              className="attach-button"
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud size={14} />
              <span>Add Images & PDFs</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,application/pdf"
              className="hidden"
              style={{ display: 'none' }}
              onChange={handleFileInputChange}
            />
          </div>

          {/* Drag & Drop Visual Area */}
          <div
            className={`attachments-dropzone ${isDragging ? 'dragging' : ''}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud size={24} className="dropzone-icon" />
            <p className="dropzone-text">
              <strong>Drag & drop multiple images or PDFs here</strong>, or{' '}
              <span className="text-[#7C5CFC] underline">browse files</span>
            </p>
            <span className="dropzone-hint">PNG, JPG, WEBP, GIF, SVG, and PDF up to 25MB each</span>
          </div>

          {/* Upload Error Alert */}
          {uploadError && (
            <div className="upload-error-alert">
              <span>{uploadError}</span>
              <button type="button" onClick={() => setUploadError('')}>
                <X size={14} />
              </button>
            </div>
          )}

          {/* Active Uploading Queue Cards */}
          {uploadQueue.length > 0 && (
            <div className="upload-queue-list">
              {uploadQueue.map((item) => (
                <div key={item.queueId} className="upload-progress-item">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {item.type === 'image' ? (
                      <ImageIcon size={16} className="text-[#7C5CFC] flex-shrink-0" />
                    ) : (
                      <FileText size={16} className="text-[#E05A47] flex-shrink-0" />
                    )}
                    <span className="upload-item-name truncate">{item.name}</span>
                    <span className="upload-item-size text-[#8A84A3]">
                      ({formatBytes(item.size)})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="upload-bar-track">
                      <div
                        className="upload-bar-fill"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                    <span className="upload-item-percent">{item.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Existing Image Attachments Grid */}
          {imagesList.length > 0 && (
            <div className="attachments-grid-section">
              <h4 className="attachments-subhead">
                <ImageIcon size={13} /> Images ({imagesList.length})
              </h4>
              <div className="attachments-images-grid">
                {imagesList.map((img) => (
                  <div key={img.id || img.key} className="attachment-image-card">
                    <img
                      src={img.url}
                      alt={img.name || 'Attached image'}
                      className="attachment-thumb"
                      onClick={() => setActivePreview(img)}
                    />
                    <div className="attachment-overlay">
                      <button
                        type="button"
                        className="preview-overlay-btn"
                        onClick={() => setActivePreview(img)}
                        title="View image"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        type="button"
                        className="delete-overlay-btn"
                        onClick={() => handleRemoveAttachment(img.id || img.key)}
                        title="Remove image"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="attachment-caption truncate">
                      {img.name || img.fileName}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Existing PDF Attachments List */}
          {pdfsList.length > 0 && (
            <div className="attachments-grid-section">
              <h4 className="attachments-subhead">
                <FileText size={13} /> Documents ({pdfsList.length})
              </h4>
              <div className="attachments-pdfs-list">
                {pdfsList.map((pdf) => (
                  <div key={pdf.id || pdf.key} className="attachment-pdf-card">
                    <div className="pdf-icon-wrap">
                      <FileText size={20} className="text-[#E05A47]" />
                      <span className="pdf-tag">PDF</span>
                    </div>

                    <div className="pdf-info-wrap truncate">
                      <span className="pdf-title truncate" title={pdf.name || pdf.fileName}>
                        {pdf.name || pdf.fileName}
                      </span>
                      <span className="pdf-size">{formatBytes(pdf.size)}</span>
                    </div>

                    <div className="pdf-actions-wrap">
                      <a
                        href={pdf.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pdf-action-link"
                        title="Open PDF in new tab"
                      >
                        <ExternalLink size={14} /> Open
                      </a>
                      <button
                        type="button"
                        className="pdf-delete-btn"
                        onClick={() => handleRemoveAttachment(pdf.id || pdf.key)}
                        title="Remove PDF"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions Bar */}
        <div className="editor-actions">
          {note?.id ? (
            <button
              className="editor-trash"
              type="button"
              onClick={() => onTrash(note)}
            >
              <Trash2 size={16} /> Move to trash
            </button>
          ) : (
            <div />
          )}
          <div className="flex gap-2">
            <Button secondary type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Save note <ArrowRight size={15} />
            </Button>
          </div>
        </div>
      </form>

      {/* Lightbox Preview Modal for Image/PDF */}
      {activePreview && (
        <div
          className="lightbox-backdrop"
          onClick={() => setActivePreview(null)}
        >
          <div
            className="lightbox-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="lightbox-topbar">
              <span className="lightbox-title truncate">
                {activePreview.name || activePreview.fileName}
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={activePreview.url}
                  download={activePreview.name || activePreview.fileName}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lightbox-btn"
                  title="Download file"
                >
                  <Download size={16} />
                </a>
                <button
                  type="button"
                  className="lightbox-btn"
                  onClick={() => setActivePreview(null)}
                  title="Close preview"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="lightbox-content">
              {activePreview.type === 'pdf' || activePreview.mimeType === 'application/pdf' ? (
                <iframe
                  src={activePreview.url}
                  title={activePreview.name}
                  className="lightbox-pdf-frame"
                />
              ) : (
                <img
                  src={activePreview.url}
                  alt={activePreview.name}
                  className="lightbox-img"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
