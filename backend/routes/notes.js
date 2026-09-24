const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { readNotes, writeNotes } = require('../middleware/db.js');

const router = express.Router();

// Helper: extract userId from token
function getUserId(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  return token ? token.replace('token_', '') : null;
}

// GET /api/notes - Get all notes (with optional filters)
router.get('/', (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: true, message: 'Unauthorized' });

  const { category, search, favorites, trashed } = req.query;
  let notes = readNotes().filter(n => n.userId === userId);

  // Filter by trashed status
  if (trashed === 'true') {
    notes = notes.filter(n => n.isTrashed);
  } else if (trashed !== 'all') {
    notes = notes.filter(n => !n.isTrashed);
  }

  // Filter by category
  if (category && category !== 'All Notes') {
    notes = notes.filter(n => n.category === category);
  }

  // Filter by favorites
  if (favorites === 'true') {
    notes = notes.filter(n => n.isFavorite);
  }

  // Search
  if (search) {
    const query = search.toLowerCase();
    notes = notes.filter(n =>
      n.title.toLowerCase().includes(query) ||
      n.content.toLowerCase().includes(query) ||
      n.tags.some(t => t.toLowerCase().includes(query))
    );
  }

  // Sort by updatedAt descending
  notes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  res.json({ success: true, notes });
});

// GET /api/notes/stats - Get note statistics
router.get('/stats', (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: true, message: 'Unauthorized' });

  const notes = readNotes().filter(n => n.userId === userId);
  const activeNotes = notes.filter(n => !n.isTrashed);

  res.json({
    success: true,
    stats: {
      totalNotes: activeNotes.length,
      favorites: activeNotes.filter(n => n.isFavorite).length,
      tags: [...new Set(activeNotes.flatMap(n => n.tags))].length,
      trashed: notes.filter(n => n.isTrashed).length,
    },
  });
});

// GET /api/notes/:id - Get a single note
router.get('/:id', (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: true, message: 'Unauthorized' });

  const notes = readNotes();
  const note = notes.find(n => n.id === req.params.id && n.userId === userId);

  if (!note) {
    return res.status(404).json({ error: true, message: 'Note not found' });
  }

  res.json({ success: true, note });
});

// POST /api/notes - Create a new note
router.post('/', (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: true, message: 'Unauthorized' });

  const { title, content, tags, category, color } = req.body;

  const newNote = {
    id: uuidv4(),
    userId,
    title: title || 'Untitled Note',
    content: content || '',
    tags: tags || [],
    category: category || 'Personal',
    isFavorite: false,
    isTrashed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    color: color || '#6C63FF',
  };

  const notes = readNotes();
  notes.unshift(newNote);
  writeNotes(notes);

  res.status(201).json({ success: true, note: newNote });
});

// PUT /api/notes/:id - Update a note
router.put('/:id', (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: true, message: 'Unauthorized' });

  const notes = readNotes();
  const index = notes.findIndex(n => n.id === req.params.id && n.userId === userId);

  if (index === -1) {
    return res.status(404).json({ error: true, message: 'Note not found' });
  }

  const { title, content, tags, category, color, isFavorite, isTrashed } = req.body;

  if (title !== undefined) notes[index].title = title;
  if (content !== undefined) notes[index].content = content;
  if (tags !== undefined) notes[index].tags = tags;
  if (category !== undefined) notes[index].category = category;
  if (color !== undefined) notes[index].color = color;
  if (isFavorite !== undefined) notes[index].isFavorite = isFavorite;
  if (isTrashed !== undefined) notes[index].isTrashed = isTrashed;
  notes[index].updatedAt = new Date().toISOString();

  writeNotes(notes);

  res.json({ success: true, note: notes[index] });
});

// PUT /api/notes/:id/favorite - Toggle favorite
router.put('/:id/favorite', (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: true, message: 'Unauthorized' });

  const notes = readNotes();
  const index = notes.findIndex(n => n.id === req.params.id && n.userId === userId);

  if (index === -1) {
    return res.status(404).json({ error: true, message: 'Note not found' });
  }

  notes[index].isFavorite = !notes[index].isFavorite;
  notes[index].updatedAt = new Date().toISOString();
  writeNotes(notes);

  res.json({ success: true, note: notes[index] });
});

// PUT /api/notes/:id/trash - Move to trash
router.put('/:id/trash', (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: true, message: 'Unauthorized' });

  const notes = readNotes();
  const index = notes.findIndex(n => n.id === req.params.id && n.userId === userId);

  if (index === -1) {
    return res.status(404).json({ error: true, message: 'Note not found' });
  }

  notes[index].isTrashed = true;
  notes[index].updatedAt = new Date().toISOString();
  writeNotes(notes);

  res.json({ success: true, note: notes[index] });
});

// PUT /api/notes/:id/restore - Restore from trash
router.put('/:id/restore', (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: true, message: 'Unauthorized' });

  const notes = readNotes();
  const index = notes.findIndex(n => n.id === req.params.id && n.userId === userId);

  if (index === -1) {
    return res.status(404).json({ error: true, message: 'Note not found' });
  }

  notes[index].isTrashed = false;
  notes[index].updatedAt = new Date().toISOString();
  writeNotes(notes);

  res.json({ success: true, note: notes[index] });
});

// DELETE /api/notes/:id - Permanently delete a note
router.delete('/:id', (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: true, message: 'Unauthorized' });

  let notes = readNotes();
  const noteIndex = notes.findIndex(n => n.id === req.params.id && n.userId === userId);

  if (noteIndex === -1) {
    return res.status(404).json({ error: true, message: 'Note not found' });
  }

  notes = notes.filter(n => !(n.id === req.params.id && n.userId === userId));
  writeNotes(notes);

  res.json({ success: true, message: 'Note permanently deleted' });
});

module.exports = router;
