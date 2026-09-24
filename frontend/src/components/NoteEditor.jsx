import React, { useState, useEffect } from 'react'
import { ArrowRight, Plus, Star, Trash2, X } from 'lucide-react'
import Button from './ui/Button'

export default function NoteEditor({
  note,
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
      isFavorite: false,
    }
  )

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [draft])

  const handleSave = (event) => {
    if (event) event.preventDefault()
    onSave({
      ...draft,
      tags:
        typeof draft.tags === 'string'
          ? draft.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : draft.tags || [],
    })
  }

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <form className="note-editor" onSubmit={handleSave}>
        <div className="editor-top">
          <div>
            <p className="eyebrow">{note?.id ? 'Edit note' : 'New note'}</p>
            <h2>{note?.id ? 'Refine your thought' : 'Capture a fresh idea'}</h2>
          </div>
          <div className="flex items-center gap-2">
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

        <label>
          Title
          <input
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            placeholder="Give this thought a name"
            autoFocus
          />
        </label>

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

        <label>
          Note content
          <textarea
            rows={8}
            value={draft.content || ''}
            onChange={(e) => setDraft({ ...draft, content: e.target.value })}
            placeholder="Write your thoughts, checklist, or plan here..."
          />
        </label>

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
    </div>
  )
}
