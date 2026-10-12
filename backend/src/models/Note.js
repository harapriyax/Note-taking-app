const { dynamodb, TABLES } = require('../lib/dynamodb');
const { GetCommand, PutCommand, DeleteCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const Note = {
  async listByUser(cognitoId, filters = {}) {
    const result = await dynamodb.send(new QueryCommand({
      TableName: TABLES.NOTES,
      KeyConditionExpression: 'cognitoId = :uid',
      ExpressionAttributeValues: { ':uid': cognitoId },
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

  async search(cognitoId, queryText, filters = {}) {
    if (!queryText || typeof queryText !== 'string' || !queryText.trim()) {
      return this.listByUser(cognitoId, filters);
    }

    const result = await dynamodb.send(new QueryCommand({
      TableName: TABLES.NOTES,
      KeyConditionExpression: 'cognitoId = :uid',
      ExpressionAttributeValues: { ':uid': cognitoId },
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

  async getById(cognitoId, noteId) {
    const result = await dynamodb.send(new GetCommand({
      TableName: TABLES.NOTES,
      Key: { cognitoId, noteId },
    }));
    return result.Item || null;
  },

  async create(noteData) {
    const note = {
      cognitoId: noteData.cognitoId,
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

  async update(cognitoId, noteId, updates) {
    const note = await Note.getById(cognitoId, noteId);
    if (!note) return null;

    // Only bump updatedAt for actual content edits, not metadata toggles (pin/favorite/trash)
    const metadataOnlyKeys = ['isPinned', 'isFavorite', 'isTrashed'];
    const isContentEdit = Object.keys(updates).some(key => !metadataOnlyKeys.includes(key));

    const merged = {
      ...note,
      ...updates,
      updatedAt: isContentEdit ? new Date().toISOString() : note.updatedAt,
    };
    // Don't allow cognitoId/noteId to be overwritten
    merged.cognitoId = cognitoId;
    merged.noteId = noteId;

    await dynamodb.send(new PutCommand({
      TableName: TABLES.NOTES,
      Item: merged,
    }));
    return merged;
  },

  async delete(cognitoId, noteId) {
    await dynamodb.send(new DeleteCommand({
      TableName: TABLES.NOTES,
      Key: { cognitoId, noteId },
    }));
    return true;
  },

  async getStats(cognitoId) {
    const allNotes = await Note.listByUser(cognitoId, { trashed: 'all' });
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
