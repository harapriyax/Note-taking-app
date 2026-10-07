import React, { useEffect, useState, useMemo } from 'react'
import {
  ArrowRight, Bell, CheckCircle2, CheckSquare, ChevronDown, ChevronRight, Clock3,
  Cloud, CloudOff, Download, ExternalLink, FileText, Folder, Grid2X2, Home, Image as ImageIcon,
  LayoutGrid, List, LogOut, Menu, MoreHorizontal,
  PanelLeft, Plus, RefreshCw, RotateCcw, Search, Sparkles, Star, Tag, Trash2, X
} from 'lucide-react'
import { api, apiGet, apiPost, apiPut, apiDelete } from '../lib/api'
import Button from '../components/ui/Button'
import Logo from '../components/BrandLogo'
import CalendarWidget from '../components/CalendarWidget'
import NoteEditor from '../components/NoteEditor'
import CategoryModal from '../components/CategoryModal'
import TaskModal from '../components/TaskModal'

const SEED_NOTES = [
  {
    id: 'note-1',
    title: 'Project Planning',
    content: 'Key steps for the upcoming Trident project. Client requirements, design system deliverables, and timeline milestones.',
    category: 'Work',
    tags: ['#work', '#project', '#trident'],
    isFavorite: true,
    isTrashed: false,
    createdAt: new Date(Date.now() - 36e5 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 36e5 * 2).toISOString(),
  },
  {
    id: 'note-2',
    title: 'Gym Routine',
    content: 'Push, Pull, Legs routine. Weekly strength goals and high protein diet plan. Track progressive overload consistently!',
    category: 'Personal',
    tags: ['#health', '#fitness'],
    isFavorite: false,
    isTrashed: false,
    createdAt: new Date(Date.now() - 36e5 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 36e5 * 18).toISOString(),
  },
  {
    id: 'note-3',
    title: 'DBMS Notes',
    content: 'Normalization (1NF to BCNF), indexing (B+ trees), ACID properties, SQL query optimization, and transaction concurrency.',
    category: 'College',
    tags: ['#study', '#dbms', '#cs'],
    isFavorite: true,
    isTrashed: false,
    createdAt: new Date(Date.now() - 36e5 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 36e5 * 30).toISOString(),
  },
  {
    id: 'note-4',
    title: 'AI Project Ideas',
    content: 'Smart AI note organizer, voice-to-structured-notes, chat with PDF textbooks, and instant quiz flashcard generator.',
    category: 'Ideas',
    tags: ['#ideas', '#ai', '#startup'],
    isFavorite: false,
    isTrashed: false,
    createdAt: new Date(Date.now() - 36e5 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 36e5 * 48).toISOString(),
  },
  {
    id: 'note-5',
    title: 'Design Inspiration',
    content: 'Clean editorial typography, warm earth-toned palettes, fluid micro-interactions, and high-contrast readable cards.',
    category: 'Projects',
    tags: ['#design', '#ui', '#inspiration'],
    isFavorite: false,
    isTrashed: false,
    createdAt: new Date(Date.now() - 36e5 * 72).toISOString(),
    updatedAt: new Date(Date.now() - 36e5 * 72).toISOString(),
  },
]

const DEFAULT_CATEGORIES = [
  { id: 'cat-work', name: 'Work', color: '#e07a4a', isCustom: false },
  { id: 'cat-personal', name: 'Personal', color: '#58a06d', isCustom: false },
  { id: 'cat-college', name: 'College', color: '#5a7be8', isCustom: false },
  { id: 'cat-ideas', name: 'Ideas', color: '#9b6bd5', isCustom: false },
  { id: 'cat-projects', name: 'Projects', color: '#d29641', isCustom: false },
]

const DEFAULT_TASKS = [
  { id: 1, text: 'Review DBMS lecture notes', priority: 'High', done: true },
  { id: 2, text: 'Finalize NoteFlow UI redesign', priority: 'High', done: false },
  { id: 3, text: 'Prepare gym workout plan', priority: 'Medium', done: false },
]

function dateLabel(iso) {
  if (!iso) return 'Just now'
  const delta = Math.max(0, Date.now() - new Date(iso).getTime())
  const mins = Math.round(delta / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function plainText(value = '') {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

export default function DashboardPage({ session, onLogout }) {
  const token = session?.token
  const isCloud = Boolean(token && !token.startsWith('demo-') && !token.startsWith('google-'))

  // For cloud users: start empty (will load from API). For local: load from localStorage/seed.
  const [notes, setNotes] = useState(() => {
    if (isCloud) return [] // Will be populated by cloud fetch
    try {
      const saved = localStorage.getItem('noteflow_notes')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch (e) {
      console.warn('Failed to parse notes from storage', e)
    }
    return SEED_NOTES
  })

  // Categories: merge defaults with any categories found in cloud notes
  const [customCategories, setCustomCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('noteflow_categories')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch (e) {
      console.warn('Failed to parse categories from storage', e)
    }
    return DEFAULT_CATEGORIES
  })

  // Build categories from defaults + any new ones from cloud notes
  const categories = useMemo(() => {
    const known = new Set(customCategories.map((c) => c.name.toLowerCase()))
    const fromNotes = []
    const colors = ['#2563eb', '#dc2626', '#059669', '#d97706', '#7c3aed', '#0891b2', '#be185d']
    notes.forEach((n) => {
      if (n.category && !known.has(n.category.toLowerCase())) {
        known.add(n.category.toLowerCase())
        fromNotes.push({
          id: `cat-auto-${n.category}`,
          name: n.category,
          color: colors[fromNotes.length % colors.length],
          isCustom: true,
        })
      }
    })
    return [...customCategories, ...fromNotes]
  }, [customCategories, notes])

  // Load tasks from localStorage or default
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('noteflow_tasks')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) return parsed
      }
    } catch (e) {
      console.warn('Failed to parse tasks from storage', e)
    }
    return DEFAULT_TASKS
  })

  const [query, setQuery] = useState('')
  const [activeNav, setActiveNav] = useState('All Notes')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [viewMode, setViewMode] = useState('grid')
  const [editor, setEditor] = useState(null)
  const [mediaPreview, setMediaPreview] = useState(null)
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [taskText, setTaskText] = useState('')
  const [taskPriority, setTaskPriority] = useState('Medium')
  const [taskFilter, setTaskFilter] = useState('all')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const [syncStatus, setSyncStatus] = useState(isCloud ? 'syncing' : 'local')
  const [isLoading, setIsLoading] = useState(isCloud)
  const [toast, setToast] = useState(null)

  const user = session?.user || { fullName: 'User' }
  const firstName = user.fullName?.split(' ')[0] || 'User'

  // Cloud Notes Fetch from AWS DynamoDB — runs once on mount for cloud users
  useEffect(() => {
    if (!isCloud) return

    let cancelled = false

    async function fetchCloudNotes() {
      setSyncStatus('syncing')
      setIsLoading(true)
      try {
        const res = await apiGet('/notes?trashed=all', token)
        if (cancelled) return

        if (res?.notes && Array.isArray(res.notes)) {
          const cloudNotes = res.notes.map((n) => ({
            id: n.noteId || n.id,
            title: n.title || 'Untitled',
            content: n.content || '',
            category: n.category || 'General',
            tags: Array.isArray(n.tags) ? n.tags : [],
            color: n.color || '#e07a4a',
            attachments: Array.isArray(n.attachments) ? n.attachments : [],
            isFavorite: Boolean(n.isFavorite),
            isTrashed: Boolean(n.isTrashed),
            createdAt: n.createdAt,
            updatedAt: n.updatedAt,
          }))
          setNotes(cloudNotes)
          // Clear old localStorage seed data
          localStorage.removeItem('noteflow_notes')
          setSyncStatus('synced')
        }
      } catch (err) {
        console.error('Failed to load notes from AWS:', err)
        // Fallback: try localStorage
        try {
          const saved = localStorage.getItem('noteflow_notes')
          if (saved) {
            const parsed = JSON.parse(saved)
            if (Array.isArray(parsed) && parsed.length > 0 && !cancelled) {
              setNotes(parsed)
            }
          }
        } catch {}
        if (!cancelled) setSyncStatus('error')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchCloudNotes()
    return () => { cancelled = true }
  }, [token, isCloud])

  // Cloud fetch for Tasks from AWS DynamoDB
  useEffect(() => {
    if (!isCloud) return
    let cancelled = false
    async function fetchCloudTasks() {
      try {
        const res = await apiGet('/tasks', token)
        if (cancelled) return
        if (res?.tasks && Array.isArray(res.tasks)) {
          const cloudTasks = res.tasks.map((t) => ({
            id: t.taskId || t.id,
            text: t.text || '',
            priority: t.priority || 'Medium',
            done: Boolean(t.done),
            createdAt: t.createdAt,
          }))
          setTasks(cloudTasks)
        }
      } catch (err) {
        console.warn('Failed to load tasks from AWS:', err)
      }
    }
    fetchCloudTasks()
    return () => { cancelled = true }
  }, [token, isCloud])

  // Cloud fetch for Categories from AWS DynamoDB
  useEffect(() => {
    if (!isCloud) return
    let cancelled = false
    async function fetchCloudCategories() {
      try {
        const res = await apiGet('/categories', token)
        if (cancelled) return
        if (res?.categories && Array.isArray(res.categories) && res.categories.length > 0) {
          const cloudCats = res.categories.map((c) => ({
            id: c.categoryId || c.id,
            name: c.name,
            color: c.color || '#e07a4a',
            isCustom: true,
          }))
          // Merge: keep defaults, add cloud custom ones
          setCustomCategories((prev) => {
            const defaultNames = new Set(DEFAULT_CATEGORIES.map((d) => d.name.toLowerCase()))
            const customs = cloudCats.filter((c) => !defaultNames.has(c.name.toLowerCase()))
            return [...DEFAULT_CATEGORIES, ...customs]
          })
        }
      } catch (err) {
        console.warn('Failed to load categories from AWS:', err)
      }
    }
    fetchCloudCategories()
    return () => { cancelled = true }
  }, [token, isCloud])

  // Persist notes locally as fallback cache (skip during initial cloud load)
  useEffect(() => {
    if (isCloud && notes.length === 0) return
    try {
      localStorage.setItem('noteflow_notes', JSON.stringify(notes))
    } catch (e) {
      console.error('Could not save notes to storage', e)
    }
  }, [notes, isCloud])

  // Persist custom categories locally
  useEffect(() => {
    try {
      localStorage.setItem('noteflow_categories', JSON.stringify(customCategories))
    } catch (e) {
      console.error('Could not save categories to storage', e)
    }
  }, [customCategories])

  // Persist tasks locally
  useEffect(() => {
    try {
      localStorage.setItem('noteflow_tasks', JSON.stringify(tasks))
    } catch (e) {
      console.error('Could not save tasks to storage', e)
    }
  }, [tasks])

  const showToast = (message) => {
    setToast(message)
    setTimeout(() => {
      setToast((curr) => (curr === message ? null : curr))
    }, 3200)
  }

  // Dynamic Category color helper
  const getCatColor = (catName) => {
    const found = categories.find((c) => c.name.toLowerCase() === catName?.toLowerCase())
    return found ? found.color : '#e07a4a'
  }

  // Category Actions (synced with AWS DynamoDB)
  const handleAddCategory = async (newCat) => {
    // Optimistic UI
    setCustomCategories((prev) => [...prev, newCat])
    setCategoryModalOpen(false)
    showToast(`Category "${newCat.name}" added`)

    if (isCloud) {
      try {
        const res = await apiPost('/categories', token, { name: newCat.name, color: newCat.color })
        if (res?.category) {
          // Replace optimistic entry with real cloud id
          setCustomCategories((prev) =>
            prev.map((c) => c.id === newCat.id ? { ...c, id: res.category.categoryId } : c)
          )
        }
      } catch (err) {
        console.warn('Failed to sync category to cloud:', err)
      }
    }
  }

  const handleDeleteCategory = async (catIdOrName) => {
    const cat = categories.find((c) => c.id === catIdOrName || c.name === catIdOrName)
    setCustomCategories((prev) => prev.filter((c) => c.id !== catIdOrName && c.name !== catIdOrName))
    if (selectedCategory === catIdOrName) setSelectedCategory('All')
    showToast('Category deleted')

    if (isCloud && cat?.id) {
      try {
        await apiDelete(`/categories/${cat.id}`, token)
      } catch (err) {
        console.warn('Failed to delete category from cloud:', err)
      }
    }
  }

  // Save / Update note (Sync with AWS DynamoDB)
  const handleSaveNote = async (draft) => {
    const isEdit = Boolean(draft.id && !String(draft.id).startsWith('temp-'))
    const now = new Date().toISOString()
    const tempId = draft.id || `temp-${Date.now()}`

    const nextNote = {
      ...draft,
      id: tempId,
      updatedAt: now,
      createdAt: draft.createdAt || now,
      isFavorite: Boolean(draft.isFavorite),
      isTrashed: false,
    }

    // Optimistic UI update
    setNotes((prev) =>
      isEdit ? prev.map((n) => (n.id === draft.id ? nextNote : n)) : [nextNote, ...prev]
    )
    setEditor(null)

    if (isCloud) {
      setSyncStatus('syncing')
      try {
        if (isEdit) {
          const res = await apiPut(`/notes/${draft.id}`, token, {
            title: draft.title,
            content: draft.content,
            category: draft.category,
            tags: draft.tags,
            color: draft.color,
            attachments: draft.attachments || [],
            isFavorite: draft.isFavorite,
            isTrashed: draft.isTrashed,
          })
          if (res?.note) {
            const saved = { ...res.note, id: res.note.noteId }
            setNotes((prev) => prev.map((n) => (n.id === draft.id ? saved : n)))
          }
        } else {
          const res = await apiPost('/notes', token, {
            title: draft.title || 'Untitled Note',
            content: draft.content || '',
            category: draft.category || (categories[0]?.name || 'Work'),
            tags: draft.tags || [],
            color: draft.color || '#e07a4a',
            attachments: draft.attachments || [],
          })
          if (res?.note) {
            const saved = { ...res.note, id: res.note.noteId }
            setNotes((prev) => prev.map((n) => (n.id === tempId ? saved : n)))
          }
        }
        setSyncStatus('synced')
        showToast(isEdit ? 'Note updated & synced to AWS' : 'Note created & synced to AWS')
      } catch (err) {
        console.error('Cloud note sync failed:', err)
        setSyncStatus('error')
        showToast('Saved locally (cloud sync offline)')
      }
    } else {
      showToast(isEdit ? 'Note updated' : 'New note created')
    }
  }

  // Toggle favorite (Sync with AWS DynamoDB)
  const handleToggleFavorite = async (e, note) => {
    e.stopPropagation()
    const updated = !note.isFavorite
    setNotes((prev) =>
      prev.map((n) =>
        n.id === note.id ? { ...n, isFavorite: updated, updatedAt: new Date().toISOString() } : n
      )
    )
    showToast(updated ? 'Added to favorites' : 'Removed from favorites')

    if (isCloud && note.id && !String(note.id).startsWith('temp-')) {
      try {
        await apiPut(`/notes/${note.id}/favorite`, token, {})
        setSyncStatus('synced')
      } catch (err) {
        console.warn('Failed to sync favorite status to cloud:', err)
      }
    }
  }

  // Move to trash (Sync with AWS DynamoDB)
  const handleTrashNote = async (note) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === note.id ? { ...n, isTrashed: true, updatedAt: new Date().toISOString() } : n
      )
    )
    if (editor?.id === note.id) setEditor(null)
    showToast('Note moved to trash')

    if (isCloud && note.id && !String(note.id).startsWith('temp-')) {
      try {
        await apiPut(`/notes/${note.id}/trash`, token, {})
        setSyncStatus('synced')
      } catch (err) {
        console.warn('Failed to sync trash status to cloud:', err)
      }
    }
  }

  // Restore from trash (Sync with AWS DynamoDB)
  const handleRestoreNote = async (e, note) => {
    e.stopPropagation()
    setNotes((prev) =>
      prev.map((n) =>
        n.id === note.id ? { ...n, isTrashed: false, updatedAt: new Date().toISOString() } : n
      )
    )
    showToast('Note restored from trash')

    if (isCloud && note.id && !String(note.id).startsWith('temp-')) {
      try {
        await apiPut(`/notes/${note.id}/restore`, token, {})
        setSyncStatus('synced')
      } catch (err) {
        console.warn('Failed to sync restore status to cloud:', err)
      }
    }
  }

  // Delete forever (Sync with AWS DynamoDB)
  const handleDeleteForever = async (e, note) => {
    e.stopPropagation()
    if (!window.confirm('Delete this note permanently? This cannot be undone.')) return
    setNotes((prev) => prev.filter((n) => n.id !== note.id))
    showToast('Note permanently deleted')

    if (isCloud && note.id && !String(note.id).startsWith('temp-')) {
      try {
        await apiDelete(`/notes/${note.id}`, token)
        setSyncStatus('synced')
      } catch (err) {
        console.warn('Failed to delete note from cloud:', err)
      }
    }
  }

  // Empty trash (Sync with AWS DynamoDB)
  const handleEmptyTrash = async () => {
    if (!window.confirm('Empty all trashed notes?')) return
    const trashedNotes = notes.filter((n) => n.isTrashed)
    setNotes((prev) => prev.filter((n) => !n.isTrashed))
    showToast('Trash emptied')

    if (isCloud) {
      for (const note of trashedNotes) {
        if (note.id && !String(note.id).startsWith('temp-')) {
          try {
            await apiDelete(`/notes/${note.id}`, token)
          } catch (err) {
            console.warn('Failed to delete trashed note from cloud:', err)
          }
        }
      }
      setSyncStatus('synced')
    }
  }

  // Task Actions (synced with AWS DynamoDB)
  const handleAddTask = async (e) => {
    if (e) e.preventDefault()
    if (!taskText.trim()) return
    const tempId = `temp-${Date.now()}`
    const newTask = {
      id: tempId,
      text: taskText.trim(),
      priority: taskPriority,
      done: false,
      createdAt: new Date().toISOString(),
    }
    setTasks((prev) => [newTask, ...prev])
    setTaskText('')
    showToast('Task added')

    if (isCloud) {
      try {
        const res = await apiPost('/tasks', token, { text: newTask.text, priority: newTask.priority })
        if (res?.task) {
          setTasks((prev) => prev.map((t) => t.id === tempId ? { ...t, id: res.task.taskId } : t))
        }
      } catch (err) {
        console.warn('Failed to sync task to cloud:', err)
      }
    }
  }

  const handleAddTaskFromModal = async (newTask) => {
    const tempId = newTask.id || `temp-${Date.now()}`
    setTasks((prev) => [{ ...newTask, id: tempId }, ...prev])
    showToast('Task added')

    if (isCloud) {
      try {
        const res = await apiPost('/tasks', token, { text: newTask.text, priority: newTask.priority })
        if (res?.task) {
          setTasks((prev) => prev.map((t) => t.id === tempId ? { ...t, id: res.task.taskId } : t))
        }
      } catch (err) {
        console.warn('Failed to sync task to cloud:', err)
      }
    }
  }

  const handleToggleTask = async (id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    )

    if (isCloud && id && !String(id).startsWith('temp-')) {
      try {
        await apiPut(`/tasks/${id}/toggle`, token, {})
      } catch (err) {
        console.warn('Failed to sync task toggle to cloud:', err)
      }
    }
  }

  const handleDeleteTask = async (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))

    if (isCloud && id && !String(id).startsWith('temp-')) {
      try {
        await apiDelete(`/tasks/${id}`, token)
      } catch (err) {
        console.warn('Failed to delete task from cloud:', err)
      }
    }
  }

  const handleClearCompleted = async () => {
    const doneTasks = tasks.filter((t) => t.done)
    setTasks((prev) => prev.filter((t) => !t.done))
    showToast('Completed tasks cleared')

    if (isCloud) {
      for (const task of doneTasks) {
        if (task.id && !String(task.id).startsWith('temp-')) {
          try {
            await apiDelete(`/tasks/${task.id}`, token)
          } catch (err) {
            console.warn('Failed to delete completed task from cloud:', err)
          }
        }
      }
    }
  }

  // Filter notes based on active navigation & category & query
  const filteredNotes = useMemo(() => {
    const term = query.trim().toLowerCase()

    return notes.filter((n) => {
      // Navigation filter
      if (activeNav === 'Trash') {
        if (!n.isTrashed) return false
      } else {
        if (n.isTrashed) return false
        if (activeNav === 'Favorites' && !n.isFavorite) return false
      }

      // Category filter (only when not in Trash)
      if (activeNav !== 'Trash' && selectedCategory !== 'All') {
        if (n.category !== selectedCategory) return false
      }

      // Search query
      if (term) {
        const titleMatch = n.title?.toLowerCase().includes(term)
        const contentMatch = plainText(n.content).toLowerCase().includes(term)
        const tagMatch = n.tags?.some((t) => t.toLowerCase().includes(term))
        const catMatch = n.category?.toLowerCase().includes(term)
        if (!titleMatch && !contentMatch && !tagMatch && !catMatch) return false
      }

      return true
    })
  }, [notes, activeNav, selectedCategory, query])

  // Filter tasks based on taskFilter
  const filteredTasks = useMemo(() => {
    if (taskFilter === 'active') return tasks.filter((t) => !t.done)
    if (taskFilter === 'done') return tasks.filter((t) => t.done)
    return tasks
  }, [tasks, taskFilter])

  // Count stats
  const activeCount = notes.filter((n) => !n.isTrashed).length
  const favoriteCount = notes.filter((n) => !n.isTrashed && n.isFavorite).length
  const trashedCount = notes.filter((n) => n.isTrashed).length
  const pendingTasksCount = tasks.filter((t) => !t.done).length

  // Nav items
  const navList = [
    { id: 'All Notes', label: 'All Notes', icon: FileText, count: activeCount },
    { id: 'Favorites', label: 'Favorites', icon: Star, count: favoriteCount },
    { id: 'Recent', label: 'Recent Notes', icon: Clock3 },
    { id: 'Trash', label: 'Trash', icon: Trash2, count: trashedCount },
  ]

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className={`dashboard-shell ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
      {/* MOBILE BACKDROP OVERLAY */}
      {mobileDrawerOpen && (
        <div
          className="dash-mobile-backdrop"
          onClick={() => setMobileDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* LEFT SIDEBAR (Desktop sticky + Mobile slide-over Drawer) */}
      <aside className={`dashboard-sidebar ${mobileDrawerOpen ? 'mobile-drawer-open' : ''}`}>
        <div className="dash-brand">
          <Logo />
          {/* Desktop collapse toggle */}
          <button
            className="sidebar-collapse desktop-only"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
            title="Toggle sidebar"
          >
            <PanelLeft size={16} />
          </button>
          {/* Mobile drawer close button */}
          <button
            className="mobile-drawer-close mobile-only"
            onClick={() => setMobileDrawerOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Primary Navigation */}
        <nav className="dash-nav">
          {navList.map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              className={activeNav === id ? 'active' : ''}
              onClick={() => {
                setActiveNav(id)
                setSelectedCategory('All')
                setMobileDrawerOpen(false)
              }}
            >
              <Icon size={17} />
              <span className="flex-1 text-left">{label}</span>
              {typeof count === 'number' && count > 0 && (
                <span className="nav-badge">{count}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Dynamic Categories List with Add Category Option */}
        <div className="tag-list">
          <div className="tag-list-title">
            <span>Categories</span>
            <button
              type="button"
              onClick={() => {
                setMobileDrawerOpen(false)
                setCategoryModalOpen(true)
              }}
              title="Add new category"
            >
              <Plus size={15} />
            </button>
          </div>
          {categories.map((cat) => {
            const catCount = notes.filter((n) => !n.isTrashed && n.category === cat.name).length
            return (
              <button
                key={cat.id || cat.name}
                className={selectedCategory === cat.name ? 'active-tag' : ''}
                onClick={() => {
                  setSelectedCategory(selectedCategory === cat.name ? 'All' : cat.name)
                  if (activeNav === 'Trash') setActiveNav('All Notes')
                  setMobileDrawerOpen(false)
                }}
              >
                <span style={{ backgroundColor: cat.color }} />
                <span className="flex-1">{cat.name}</span>
                <small className="tag-count">{catCount}</small>
              </button>
            )
          })}
          <button
            type="button"
            className="add-cat-sidebar-btn"
            onClick={() => {
              setMobileDrawerOpen(false)
              setCategoryModalOpen(true)
            }}
          >
            <Plus size={14} /> Add Category
          </button>
        </div>

        {/* User Profile & Logout at Bottom */}
        <div className="dash-sidebar-footer">
          <div className="user-profile-badge">
            <div className="profile-avatar">{firstName.slice(0, 2).toUpperCase()}</div>
            <div className="profile-info">
              <b>{user.fullName || 'Harapriya'}</b>
              <small>{user.email || 'Workspace'}</small>
            </div>
          </div>
          <button className="dash-logout" onClick={onLogout} title="Sign out to landing page">
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <section className="dashboard-content">
        {/* Top Header / Search */}
        <header className="dash-topbar">
          <div className="dash-topbar-left">
            <button
              type="button"
              className="dash-mobile-hamburger mobile-only"
              onClick={() => setMobileDrawerOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>

            <div className="dash-search">
              <Search size={16} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search notes, content, tags, or categories..."
              />
              {query ? (
                <button className="clear-search" onClick={() => setQuery('')} aria-label="Clear search">
                  <X size={14} />
                </button>
              ) : (
                <kbd className="desktop-only">⌘ K</kbd>
              )}
            </div>
          </div>

          <div className="top-actions">
            {isCloud ? (
              syncStatus === 'syncing' ? (
                <span className="cloud-sync-pill syncing" title="Syncing notes with AWS DynamoDB">
                  <RefreshCw size={13} className="spin" />
                  <span className="pill-text">Syncing...</span>
                </span>
              ) : syncStatus === 'synced' ? (
                <span className="cloud-sync-pill synced" title="All notes safely saved in AWS DynamoDB">
                  <Cloud size={14} />
                  <span className="pill-text">Synced</span>
                </span>
              ) : (
                <span className="cloud-sync-pill error" title="AWS API temporarily unreachable. Notes saved locally.">
                  <CloudOff size={14} />
                  <span className="pill-text">Offline</span>
                </span>
              )
            ) : (
              <span className="cloud-sync-pill local" title="Sign in with your email to enable automatic AWS cloud sync">
                <CloudOff size={14} />
                <span className="pill-text">Local</span>
              </span>
            )}
            <button
              className="new-task-btn desktop-only"
              onClick={() => setTaskModalOpen(true)}
              title="Add a new task"
            >
              <CheckSquare size={15} /> Add Task
            </button>
            <Button
              className="new-note-btn desktop-only"
              onClick={() =>
                setEditor({
                  category: selectedCategory !== 'All' ? selectedCategory : (categories[0]?.name || 'Personal'),
                })
              }
            >
              <Plus size={16} /> New Note
            </Button>

            {/* Mobile quick avatar button */}
            <button
              type="button"
              className="mobile-avatar-pill mobile-only"
              onClick={() => setMobileDrawerOpen(true)}
              title="Open profile menu"
            >
              {firstName.slice(0, 2).toUpperCase()}
            </button>
          </div>
        </header>

        {/* Toast alert */}
        {toast && (
          <div className="dash-toast">
            <CheckCircle2 size={15} />
            <span>{toast}</span>
            <button onClick={() => setToast(null)}><X size={14} /></button>
          </div>
        )}

        {/* Body Layout: Main Content + Right Sidebar */}
        <div className="dashboard-body">
          <main className="dashboard-main">
            {/* Header Greeting & Quick Stats */}
            <div className="dash-welcome">
              <div>
                <h1>
                  {greeting},<br />
                  <span>{firstName}</span> <Sparkles className="welcome-spark" size={24} />
                </h1>
                <p>
                  {activeNav === 'Trash'
                    ? 'Manage your deleted notes. Restore them or clear trash.'
                    : `You have ${activeCount} active notes and ${pendingTasksCount} pending tasks.`}
                </p>
              </div>

              {activeNav === 'Trash' && trashedCount > 0 && (
                <button className="empty-trash-btn" onClick={handleEmptyTrash}>
                  <Trash2 size={15} /> Empty Trash
                </button>
              )}
            </div>

            {/* Top Quick Stats Row */}
            <div className="stats-row">
              <button
                className={`stat-card ${activeNav === 'All Notes' ? 'selected' : ''}`}
                onClick={() => {
                  setActiveNav('All Notes')
                  setSelectedCategory('All')
                }}
              >
                <span className="stat-icon orange"><FileText size={18} /></span>
                <div>
                  <small>All Notes</small>
                  <b>{activeCount}</b>
                </div>
              </button>

              <button
                className={`stat-card ${activeNav === 'Favorites' ? 'selected' : ''}`}
                onClick={() => {
                  setActiveNav('Favorites')
                  setSelectedCategory('All')
                }}
              >
                <span className="stat-icon gold"><Star size={18} /></span>
                <div>
                  <small>Favorites</small>
                  <b>{favoriteCount}</b>
                </div>
              </button>

              <button
                className="stat-card"
                onClick={() => setCategoryModalOpen(true)}
                title="Manage categories"
              >
                <span className="stat-icon peach"><Folder size={18} /></span>
                <div>
                  <small>Categories</small>
                  <b>{categories.length}</b>
                </div>
              </button>

              <button
                className="stat-card"
                onClick={() => setTaskModalOpen(true)}
                title="View & Add Tasks"
              >
                <span className="stat-icon green"><CheckCircle2 size={18} /></span>
                <div>
                  <small>Tasks Completed</small>
                  <b>{tasks.filter((t) => t.done).length}/{tasks.length}</b>
                </div>
              </button>
            </div>

            {/* Note Section Header with Category Tabs & View Mode */}
            <div className="notes-header-bar">
              <div className="notes-tabs">
                {activeNav !== 'Trash' ? (
                  <>
                    <button
                      className={`tab-chip ${selectedCategory === 'All' ? 'active' : ''}`}
                      onClick={() => setSelectedCategory('All')}
                    >
                      All
                      <span className="chip-badge">{notes.filter((n) => !n.isTrashed).length}</span>
                    </button>
                    {categories.map((cat) => {
                      const count = notes.filter((n) => !n.isTrashed && n.category === cat.name).length
                      return (
                        <button
                          key={cat.id || cat.name}
                          className={`tab-chip ${selectedCategory === cat.name ? 'active' : ''}`}
                          onClick={() => setSelectedCategory(cat.name)}
                        >
                          <span
                            className="cat-dot"
                            style={{
                              backgroundColor: cat.color,
                              display: 'inline-block',
                              width: '7px',
                              height: '7px',
                              borderRadius: '50%',
                              marginRight: '3px',
                            }}
                          />
                          {cat.name}
                          {count > 0 && <span className="chip-badge">{count}</span>}
                        </button>
                      )
                    })}
                    <button
                      type="button"
                      className="tab-chip add-cat-tab-btn"
                      onClick={() => setCategoryModalOpen(true)}
                      title="Add a new category"
                    >
                      <Plus size={13} /> Add Category
                    </button>
                  </>
                ) : (
                  <div className="trash-title-label">
                    <Trash2 size={16} /> <b>Trash</b> ({trashedCount} items)
                  </div>
                )}
              </div>

              <div className="view-mode-toggle">
                <button
                  className={viewMode === 'grid' ? 'active' : ''}
                  onClick={() => setViewMode('grid')}
                  title="Grid view"
                  aria-label="Grid view"
                >
                  <LayoutGrid size={15} />
                </button>
                <button
                  className={viewMode === 'list' ? 'active' : ''}
                  onClick={() => setViewMode('list')}
                  title="List view"
                  aria-label="List view"
                >
                  <List size={15} />
                </button>
              </div>
            </div>

            {/* Notes Grid / List */}
            {filteredNotes.length === 0 ? (
              <div className="notes-empty-state">
                <div className="empty-icon-wrap">
                  {activeNav === 'Trash' ? (
                    <Trash2 size={32} />
                  ) : activeNav === 'Favorites' ? (
                    <Star size={32} />
                  ) : query ? (
                    <Search size={32} />
                  ) : (
                    <FileText size={32} />
                  )}
                </div>
                <h3>
                  {query
                    ? `No notes matching "${query}"`
                    : activeNav === 'Trash'
                    ? 'Trash is empty'
                    : activeNav === 'Favorites'
                    ? 'No favorite notes yet'
                    : 'No notes in this category'}
                </h3>
                <p>
                  {query
                    ? 'Try searching with different keywords or clear your filter.'
                    : activeNav === 'Favorites'
                    ? 'Click the star icon on any note card to pin it here.'
                    : activeNav === 'Trash'
                    ? 'Deleted notes will appear here.'
                    : 'Capture your thoughts and organize them beautifully.'}
                </p>
                {activeNav !== 'Trash' && !query && (
                  <Button
                    onClick={() =>
                      setEditor({
                        category: selectedCategory !== 'All' ? selectedCategory : (categories[0]?.name || 'Personal'),
                      })
                    }
                  >
                    <Plus size={15} /> Create a Note
                  </Button>
                )}
              </div>
            ) : (
              <div className={`notes-container ${viewMode === 'list' ? 'list-view' : 'grid-view'}`}>
                {filteredNotes.map((note) => {
                  const catColor = getCatColor(note.category)
                  return (
                    <div
                      key={note.id}
                      className="note-card"
                      onClick={() => setEditor(note)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="note-card-header">
                        <span
                          className="category-badge"
                          style={{
                            backgroundColor: `${catColor}15`,
                            color: catColor,
                            border: `1px solid ${catColor}30`,
                          }}
                        >
                          {note.category}
                        </span>
                        <span className="note-date">{dateLabel(note.updatedAt)}</span>

                        <div className="note-actions-inline" onClick={(e) => e.stopPropagation()}>
                          {!note.isTrashed ? (
                            <>
                              <button
                                className={`action-btn-star ${note.isFavorite ? 'starred' : ''}`}
                                onClick={(e) => handleToggleFavorite(e, note)}
                                title={note.isFavorite ? 'Unstar' : 'Star as favorite'}
                              >
                                <Star
                                  size={15}
                                  fill={note.isFavorite ? 'currentColor' : 'none'}
                                />
                              </button>
                              <button
                                className="action-btn-trash"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleTrashNote(note)
                                }}
                                title="Move to trash"
                              >
                                <Trash2 size={15} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="action-btn-restore"
                                onClick={(e) => handleRestoreNote(e, note)}
                                title="Restore note"
                              >
                                <RotateCcw size={14} /> Restore
                              </button>
                              <button
                                className="action-btn-delete"
                                onClick={(e) => handleDeleteForever(e, note)}
                                title="Delete permanently"
                              >
                                <X size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      <h3 className="note-title">{note.title || 'Untitled Note'}</h3>
                      <p className="note-body">{plainText(note.content) || 'No additional text'}</p>

                      {/* Attached Media & Documents Preview Strip */}
                      {note.attachments && note.attachments.length > 0 && (
                        <div className="card-attachments-wrap" onClick={(e) => e.stopPropagation()}>
                          {/* Image Thumbnails Strip */}
                          {note.attachments.filter((a) => a.type === 'image' || a.mimeType?.startsWith('image/')).length > 0 && (
                            <div className="card-images-strip">
                              {note.attachments
                                .filter((a) => a.type === 'image' || a.mimeType?.startsWith('image/'))
                                .slice(0, 3)
                                .map((img, i) => (
                                  <img
                                    key={img.id || img.key || i}
                                    src={img.url}
                                    alt={img.name || 'image'}
                                    className="card-thumb"
                                    onClick={() => setMediaPreview(img)}
                                    title={img.name || 'Click to view full image'}
                                  />
                                ))}
                              {note.attachments.filter((a) => a.type === 'image' || a.mimeType?.startsWith('image/')).length > 3 && (
                                <span
                                  className="card-more-thumbs"
                                  onClick={() => setEditor(note)}
                                  title="View all attached files"
                                >
                                  +{note.attachments.filter((a) => a.type === 'image' || a.mimeType?.startsWith('image/')).length - 3}
                                </span>
                              )}
                            </div>
                          )}

                          {/* PDF Document Badges */}
                          {note.attachments.filter((a) => a.type === 'pdf' || a.mimeType === 'application/pdf').length > 0 && (
                            <div className="card-pdfs-wrap">
                              {note.attachments
                                .filter((a) => a.type === 'pdf' || a.mimeType === 'application/pdf')
                                .map((pdf, i) => (
                                  <a
                                    key={pdf.id || pdf.key || i}
                                    href={pdf.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="card-pdf-pill"
                                    title={`Open ${pdf.name || pdf.fileName}`}
                                  >
                                    <FileText size={12} className="text-[#E05A47] flex-shrink-0" />
                                    <span className="truncate max-w-[130px]">{pdf.name || pdf.fileName}</span>
                                  </a>
                                ))}
                            </div>
                          )}
                        </div>
                      )}

                      {note.tags && note.tags.length > 0 && (
                        <div className="note-tags-wrap">
                          {note.tags.map((tag) => (
                            <span
                              key={tag}
                              className="tag-pill"
                              onClick={(e) => {
                                e.stopPropagation()
                                setQuery(tag.replace(/^#/, ''))
                              }}
                            >
                              {tag.startsWith('#') ? tag : `#${tag}`}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </main>

          {/* RIGHT SIDEBAR: Calendar & Dedicated Task Section */}
          <aside className="dashboard-right">
            {/* Interactive Calendar */}
            <CalendarWidget />

            {/* Dedicated Interactive Tasks Widget */}
            <section className="today-card">
              <div className="section-title">
                <h2>Today's Tasks</h2>
                <div className="today-header-actions">
                  <button
                    type="button"
                    className="add-task-pill-btn"
                    onClick={() => setTaskModalOpen(true)}
                    title="Add new task"
                  >
                    <Plus size={13} /> Add
                  </button>
                  <span className="tasks-count-pill">{pendingTasksCount} left</span>
                </div>
              </div>

              {/* Task Filter Tabs */}
              <div className="task-filter-pills">
                {['all', 'active', 'done'].map((f) => (
                  <button
                    key={f}
                    type="button"
                    className={`task-filter-btn ${taskFilter === f ? 'active' : ''}`}
                    onClick={() => setTaskFilter(f)}
                  >
                    {f === 'all' ? 'All' : f === 'active' ? 'To Do' : 'Completed'}
                  </button>
                ))}
              </div>

              {/* Task Items List */}
              <div className="task-list">
                {filteredTasks.map((task) => (
                  <div className={`task-item ${task.done ? 'done' : ''}`} key={task.id}>
                    <label className="task-label">
                      <input
                        type="checkbox"
                        checked={task.done}
                        onChange={() => handleToggleTask(task.id)}
                      />
                      <span>{task.text}</span>
                      {task.priority && (
                        <span className={`task-priority-badge ${task.priority}`}>
                          {task.priority}
                        </span>
                      )}
                    </label>
                    <button
                      className="task-del-btn"
                      type="button"
                      onClick={() => handleDeleteTask(task.id)}
                      title="Delete task"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
                {filteredTasks.length === 0 && (
                  <p className="no-tasks-msg">
                    {taskFilter === 'done' ? 'No completed tasks yet.' : 'No tasks in this list.'}
                  </p>
                )}
              </div>

              {/* Dedicated Task Adding Form */}
              <form className="add-task-card-form" onSubmit={handleAddTask}>
                <div className="add-task-input-wrap">
                  <Plus size={15} color="var(--brand-terracotta)" />
                  <input
                    value={taskText}
                    onChange={(e) => setTaskText(e.target.value)}
                    placeholder="Add a new task..."
                  />
                </div>
                <div className="add-task-meta-row">
                  <select
                    className="task-priority-select"
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    title="Task Priority"
                  >
                    <option value="Low">🟢 Low</option>
                    <option value="Medium">🟡 Medium</option>
                    <option value="High">🔴 High</option>
                  </select>
                  <button type="submit" className="submit-task-btn">
                    <Plus size={14} /> Add Task
                  </button>
                </div>
              </form>

              {tasks.some((t) => t.done) && (
                <button
                  type="button"
                  className="clear-tasks-btn"
                  onClick={handleClearCompleted}
                >
                  Clear completed tasks
                </button>
              )}
            </section>
          </aside>
        </div>
      </section>

      {/* Note Editor Modal */}
      {editor !== null && (
        <NoteEditor
          note={editor?.id ? editor : null}
          token={token}
          categories={categories}
          onOpenAddCategory={() => setCategoryModalOpen(true)}
          onClose={() => setEditor(null)}
          onSave={handleSaveNote}
          onTrash={handleTrashNote}
        />
      )}

      {/* Category Management Modal */}
      <CategoryModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        categories={categories}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      {/* Task Creation Modal */}
      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onAddTask={handleAddTaskFromModal}
      />

      {/* Lightbox Media Viewer Modal */}
      {mediaPreview && (
        <div
          className="lightbox-backdrop"
          onClick={() => setMediaPreview(null)}
        >
          <div
            className="lightbox-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="lightbox-topbar">
              <span className="lightbox-title truncate">
                {mediaPreview.name || mediaPreview.fileName}
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={mediaPreview.url}
                  download={mediaPreview.name || mediaPreview.fileName}
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
                  onClick={() => setMediaPreview(null)}
                  title="Close preview"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="lightbox-content">
              {mediaPreview.type === 'pdf' || mediaPreview.mimeType === 'application/pdf' ? (
                <iframe
                  src={mediaPreview.url}
                  title={mediaPreview.name}
                  className="lightbox-pdf-frame"
                />
              ) : (
                <img
                  src={mediaPreview.url}
                  alt={mediaPreview.name}
                  className="lightbox-img"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (Fixed bottom for phone users) */}
      <nav className="dash-mobile-bottom-nav mobile-only">
        <button
          type="button"
          className={`bottom-nav-item ${activeNav === 'All Notes' && selectedCategory === 'All' ? 'active' : ''}`}
          onClick={() => {
            setActiveNav('All Notes')
            setSelectedCategory('All')
          }}
        >
          <FileText size={18} />
          <span>Notes</span>
        </button>

        <button
          type="button"
          className={`bottom-nav-item ${activeNav === 'Favorites' ? 'active' : ''}`}
          onClick={() => {
            setActiveNav('Favorites')
            setSelectedCategory('All')
          }}
        >
          <Star size={18} />
          <span>Starred</span>
        </button>

        {/* Center elevated floating action button to create notes anytime */}
        <button
          type="button"
          className="bottom-nav-fab"
          onClick={() =>
            setEditor({
              category: selectedCategory !== 'All' ? selectedCategory : (categories[0]?.name || 'Personal'),
            })
          }
          aria-label="Create new note"
          title="Create new note"
        >
          <Plus size={22} />
        </button>

        <button
          type="button"
          className="bottom-nav-item"
          onClick={() => setTaskModalOpen(true)}
        >
          <CheckSquare size={18} />
          <span>Tasks</span>
        </button>

        <button
          type="button"
          className={`bottom-nav-item ${mobileDrawerOpen ? 'active' : ''}`}
          onClick={() => setMobileDrawerOpen(true)}
        >
          <Menu size={18} />
          <span>Menu</span>
        </button>
      </nav>
    </div>
  )
}
