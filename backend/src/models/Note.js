const { dynamodb, TABLES } = require('../lib/dynamodb');
const { GetCommand, PutCommand, DeleteCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const Note = {
  async listByUser(userId, filters = {}) {
    const result = await dynamodb.send(new QueryCommand({
      TableName: TABLES.NOTES,
      KeyConditionExpression: 'userId = :uid',
      ExpressionAttributeValues: { ':uid': userId },
    }));

    let notes = result.Items || [];

    // Filter by trashed status
    if (filters.trashed === 'true') {
      notes = notes.filter(n => n.isTrashed);
    } else if (filters.trashed !== 'all') {
      notes = notes.filter(n => !n.isTrashed);
    }

    // Filter by category
    if (filters.category && filters.category !== 'All Notes') {
      notes = notes.filter(n => n.category === filters.category);
    }

    // Filter by favorites
    if (filters.favorites === 'true') {
      notes = notes.filter(n => n.isFavorite);
    }

    // Search
    if (filters.search) {
      const query = filters.search.toLowerCase();
      notes = notes.filter(n =>
        n.title.toLowerCase().includes(query) ||
        n.content.toLowerCase().includes(query) ||
        (n.tags || []).some(t => t.toLowerCase().includes(query))
      );
    }

    // Sort by isPinned descending, then updatedAt descending
    notes.sort((a, b) => {
      const pinA = a.isPinned ? 1 : 0;
      const pinB = b.isPinned ? 1 : 0;
      if (pinB !== pinA) return pinB - pinA;
      return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
    });

    return notes;
  },

  async search(userId, queryText, filters = {}) {
    if (!queryText || typeof queryText !== 'string' || !queryText.trim()) {
      return this.listByUser(userId, filters);
    }

    const result = await dynamodb.send(new QueryCommand({
      TableName: TABLES.NOTES,
      KeyConditionExpression: 'userId = :uid',
      ExpressionAttributeValues: { ':uid': userId },
    }));

    let notes = result.Items || [];
    const term = queryText.trim().toLowerCase();

    // Filter by trashed status
    if (filters.trashed === 'true') {
      notes = notes.filter(n => n.isTrashed);
    } else if (filters.trashed !== 'all') {
      notes = notes.filter(n => !n.isTrashed);
    }

    // Filter by category
    if (filters.category && filters.category !== 'All' && filters.category !== 'All Notes') {
      notes = notes.filter(n => n.category?.toLowerCase() === filters.category.toLowerCase());
    }

    // Backend Search by title, content, or tags
    notes = notes.filter(n => {
      const titleMatch = n.title && n.title.toLowerCase().includes(term);
      const contentMatch = n.content && n.content.toLowerCase().includes(term);
      const tagMatch = (n.tags || []).some(t => t.toLowerCase().includes(term));
      return Boolean(titleMatch || contentMatch || tagMatch);
    });

    // Sort by isPinned descending, then updatedAt descending
    notes.sort((a, b) => {
      const pinA = a.isPinned ? 1 : 0;
      const pinB = b.isPinned ? 1 : 0;
      if (pinB !== pinA) return pinB - pinA;
      return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
    });

    return notes;
  },

  async getById(userId, noteId) {
    const result = await dynamodb.send(new GetCommand({
      TableName: TABLES.NOTES,
      Key: { userId, noteId },
    }));
    return result.Item || null;
  },

  async create(noteData) {
    const note = {
      userId: noteData.userId,
      noteId: noteData.noteId,
      title: noteData.title || 'Untitled Note',
      content: noteData.content || '',
      tags: noteData.tags || [],
      category: noteData.category || 'Personal',
      color: noteData.color || '#6C63FF',
      attachments: noteData.attachments || [],
      isFavorite: Boolean(noteData.isFavorite) || false,
      isPinned: Boolean(noteData.isPinned) || false,
      isTrashed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await dynamodb.send(new PutCommand({
      TableName: TABLES.NOTES,
      Item: note,
    }));
    return note;
  },

  async update(userId, noteId, updates) {
    const note = await Note.getById(userId, noteId);
    if (!note) return null;

    const merged = { ...note, ...updates, updatedAt: new Date().toISOString() };
    // Don't allow userId/noteId to be overwritten
    merged.userId = userId;
    merged.noteId = noteId;

    await dynamodb.send(new PutCommand({
      TableName: TABLES.NOTES,
      Item: merged,
    }));
    return merged;
  },

  async delete(userId, noteId) {
    await dynamodb.send(new DeleteCommand({
      TableName: TABLES.NOTES,
      Key: { userId, noteId },
    }));
    return true;
  },

  async getStats(userId) {
    const allNotes = await Note.listByUser(userId, { trashed: 'all' });
    const activeNotes = allNotes.filter(n => !n.isTrashed);

    return {
      totalNotes: activeNotes.length,
      favorites: activeNotes.filter(n => n.isFavorite).length,
      tags: [...new Set(activeNotes.flatMap(n => n.tags || []))].length,
      trashed: allNotes.filter(n => n.isTrashed).length,
    };
  },
};

module.exports = Note;
