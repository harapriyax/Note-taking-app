import React, { useState } from 'react'
import { Check, Plus, Trash2, X } from 'lucide-react'
import Button from './ui/Button'

export const PRESET_COLORS = [
  { name: 'Lavender', color: '#7C5CFC' },
  { name: 'Lilac', color: '#9B7DFF' },
  { name: 'Sage Green', color: '#48A976' },
  { name: 'Sky Blue', color: '#4F8BFF' },
  { name: 'Rose Pink', color: '#E55888' },
  { name: 'Amber Gold', color: '#EAA023' },
  { name: 'Teal', color: '#2CAAA0' },
  { name: 'Slate Gray', color: '#6B7280' },
]

export default function CategoryModal({
  isOpen,
  onClose,
  categories = [],
  onAddCategory,
  onDeleteCategory,
}) {
  const [newCatName, setNewCatName] = useState('')
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0].color)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleAdd = (e) => {
    e.preventDefault()
    const trimmed = newCatName.trim()
    if (!trimmed) {
      setError('Please enter a category name.')
      return
    }
    if (categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      setError('A category with this name already exists.')
      return
    }

    onAddCategory({
      id: `cat-${Date.now()}`,
      name: trimmed,
      color: selectedColor,
      isCustom: true,
    })
    setNewCatName('')
    setError('')
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
      <div className="category-modal">
        <div className="editor-top">
          <div>
            <p className="eyebrow">Organize Workspace</p>
            <h2>Manage Categories</h2>
          </div>
          <button
            className="round-action"
            type="button"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Add Category Form */}
        <form onSubmit={handleAdd} className="add-category-form">
          <label>
            Category Name
            <input
              value={newCatName}
              onChange={(e) => {
                setNewCatName(e.target.value)
                if (error) setError('')
              }}
              placeholder="e.g. Finance, Health, Reading, Client"
              autoFocus
            />
          </label>

          {error && <p className="cat-error-text">{error}</p>}

          <div className="color-picker-label">
            <span>Color Tag</span>
            <div className="color-swatches">
              {PRESET_COLORS.map(({ name, color }) => (
                <button
                  key={color}
                  type="button"
                  className={`color-swatch-btn ${selectedColor === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                  title={name}
                >
                  {selectedColor === color && <Check size={13} color="#FFFFFF" />}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full justify-center mt-3">
            <Plus size={16} /> Add Category
          </Button>
        </form>

        {/* Existing Categories List */}
        <div className="existing-categories-section">
          <h3>Current Categories ({categories.length})</h3>
          <div className="category-list-scroll">
            {categories.map((cat) => (
              <div key={cat.id || cat.name} className="cat-item-row">
                <span className="cat-dot" style={{ backgroundColor: cat.color }} />
                <span className="cat-name">{cat.name}</span>
                {cat.isCustom ? (
                  <button
                    type="button"
                    className="cat-del-btn"
                    onClick={() => onDeleteCategory(cat.id || cat.name)}
                    title="Delete custom category"
                  >
                    <Trash2 size={14} />
                  </button>
                ) : (
                  <span className="cat-default-badge">default</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="editor-actions">
          <span />
          <Button secondary onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  )
}
