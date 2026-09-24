import React, { useState } from 'react'
import { AlertCircle, Calendar, CheckSquare, Plus, X } from 'lucide-react'
import Button from './ui/Button'

export default function TaskModal({ isOpen, onClose, onAddTask }) {
  const [text, setText] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [dueDate, setDueDate] = useState('Today')
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) {
      setError('Please enter a task description.')
      return
    }

    onAddTask({
      id: Date.now(),
      text: trimmed,
      priority,
      dueDate,
      done: false,
      createdAt: new Date().toISOString(),
    })

    setText('')
    setPriority('Medium')
    setDueDate('Today')
    setError('')
    onClose()
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
      <div className="task-modal">
        <div className="editor-top">
          <div>
            <p className="eyebrow">Productivity</p>
            <h2>Add New Task</h2>
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

        <form onSubmit={handleSubmit}>
          <label>
            Task Description
            <input
              value={text}
              onChange={(e) => {
                setText(e.target.value)
                if (error) setError('')
              }}
              placeholder="What do you need to get done?"
              autoFocus
            />
          </label>

          {error && <p className="cat-error-text">{error}</p>}

          <div className="task-options-grid">
            <label>
              Priority
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="High">🔴 High Priority</option>
                <option value="Medium">🟡 Medium</option>
                <option value="Low">🟢 Low</option>
              </select>
            </label>

            <label>
              Schedule
              <select
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              >
                <option value="Today">Today</option>
                <option value="Tomorrow">Tomorrow</option>
                <option value="This Week">This Week</option>
                <option value="Later">Later</option>
              </select>
            </label>
          </div>

          <div className="editor-actions">
            <Button secondary type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              <Plus size={16} /> Add Task
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
