import React from 'react'
import { Archive, BookOpen, FileText, Folder, MoreHorizontal, Plus, Search, Sparkles, Star } from 'lucide-react'

const tinyNotes = [
  { title: 'Product Ideas', text: 'A grounded note organization, collaboration tool, and more.', tag: 'Work', time: '1h ago' },
  { title: 'Meeting Notes', text: 'Discussion Q1 roadmap and feature prioritization.', tag: 'Work', time: '4h ago' },
  { title: 'Personal Goals', text: 'Build better habits, learn new skills, and stay consistent.', tag: 'Personal', time: '1d ago' },
  { title: 'Design Inspiration', text: 'Collection of design ideas and UI references.', tag: 'Ideas', time: '2d ago' },
]

function MiniNote({ note, index }) {
  return (
    <article className={`mini-note mini-note-${index}`}>
      <div className="mb-2 flex items-center justify-between">
        <h4>{note.title}</h4>
        <MoreHorizontal size={13} />
      </div>
      <p>{note.text}</p>
      <div className="mt-auto flex items-center justify-between text-[8px]">
        <span className="rounded bg-[#F0ECFD] px-1.5 py-0.5 text-[#7C5CFC] font-semibold">{note.tag}</span>
        <span>{note.time}</span>
      </div>
    </article>
  )
}

export default function ProductMockup({ compact = false }) {
  return (
    <div
      className={`product-mockup ${compact ? 'product-mockup-compact' : ''}`}
      aria-label="NoteFlow application preview"
    >
      <div className="mockup-bar">
        <span className="dot bg-[#dc8160]" />
        <span className="dot bg-[#eab85f]" />
        <span className="dot bg-[#9cbf91]" />
        <div className="mockup-profile">
          <span>N</span> NoteFlow
        </div>
        <div className="mockup-ghost" />
      </div>
      <div className="mockup-body">
        <aside className="mockup-side">
          <div className="side-brand">
            <span>N</span> <b>NoteFlow</b>
          </div>
          {[
            [FileText, 'All Notes'],
            [Star, 'Favorites'],
            [Folder, 'Work'],
            [BookOpen, 'Personal'],
            [Sparkles, 'Ideas'],
            [Archive, 'Archive'],
          ].map(([Icon, label]) => (
            <div key={label} className="side-link">
              <Icon size={compact ? 8 : 10} />
              {label}
            </div>
          ))}
        </aside>
        <section className="mockup-main">
          <div className="mockup-actions">
            <div className="mockup-search">
              <Search size={compact ? 8 : 11} /> Search notes, tags, or content...
            </div>
            <button>
              <Plus size={compact ? 9 : 12} /> New Note
            </button>
          </div>
          <div className="note-grid">
            {tinyNotes.map((note, index) => (
              <MiniNote key={note.title} note={note} index={index} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
