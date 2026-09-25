const { v4: uuidv4 } = require('uuid');
const Note = require('../models/Note');
const { success, error, parseBody, getUserId } = require('../lib/response');

// GET /api/notes
module.exports.list = async (event) => {
  if (event.httpMethod === 'OPTIONS') return success({});

  const userId = getUserId(event);
  if (!userId) return error('Unauthorized', 401);

  const { category, search, favorites, trashed } = event.queryStringParameters || {};
  const notes = await Note.listByUser(userId, { category, search, favorites, trashed });

  return success({ success: true, notes });
};

// GET /api/notes/stats
module.exports.stats = async (event) => {
  if (event.httpMethod === 'OPTIONS') return success({});

  const userId = getUserId(event);
  if (!userId) return error('Unauthorized', 401);

  const stats = await Note.getStats(userId);
  return success({ success: true, stats });
};

// GET /api/notes/{id}
module.exports.getById = async (event) => {
  if (event.httpMethod === 'OPTIONS') return success({});

  const userId = getUserId(event);
  if (!userId) return error('Unauthorized', 401);

  const noteId = event.pathParameters?.id;
  const note = await Note.getById(userId, noteId);

  if (!note) return error('Note not found', 404);
  return success({ success: true, note });
};

// POST /api/notes
module.exports.create = async (event) => {
  if (event.httpMethod === 'OPTIONS') return success({});

  const userId = getUserId(event);
  if (!userId) return error('Unauthorized', 401);

  const { title, content, tags, category, color } = parseBody(event);

  const note = await Note.create({
    userId,
    noteId: uuidv4(),
    title,
    content,
    tags,
    category,
    color,
  });

  return success({ success: true, note }, 201);
};

// PUT /api/notes/{id}
module.exports.update = async (event) => {
  if (event.httpMethod === 'OPTIONS') return success({});

  const userId = getUserId(event);
  if (!userId) return error('Unauthorized', 401);

  const noteId = event.pathParameters?.id;
  const body = parseBody(event);

  const updates = {};
  if (body.title !== undefined) updates.title = body.title;
  if (body.content !== undefined) updates.content = body.content;
  if (body.tags !== undefined) updates.tags = body.tags;
  if (body.category !== undefined) updates.category = body.category;
  if (body.color !== undefined) updates.color = body.color;
  if (body.isFavorite !== undefined) updates.isFavorite = body.isFavorite;
  if (body.isTrashed !== undefined) updates.isTrashed = body.isTrashed;

  const note = await Note.update(userId, noteId, updates);
  if (!note) return error('Note not found', 404);

  return success({ success: true, note });
};

// PUT /api/notes/{id}/favorite
module.exports.toggleFavorite = async (event) => {
  if (event.httpMethod === 'OPTIONS') return success({});

  const userId = getUserId(event);
  if (!userId) return error('Unauthorized', 401);

  const noteId = event.pathParameters?.id;
  const existing = await Note.getById(userId, noteId);
  if (!existing) return error('Note not found', 404);

  const note = await Note.update(userId, noteId, { isFavorite: !existing.isFavorite });
  return success({ success: true, note });
};

// PUT /api/notes/{id}/trash
module.exports.trash = async (event) => {
  if (event.httpMethod === 'OPTIONS') return success({});

  const userId = getUserId(event);
  if (!userId) return error('Unauthorized', 401);

  const noteId = event.pathParameters?.id;
  const note = await Note.update(userId, noteId, { isTrashed: true });
  if (!note) return error('Note not found', 404);

  return success({ success: true, note });
};

// PUT /api/notes/{id}/restore
module.exports.restore = async (event) => {
  if (event.httpMethod === 'OPTIONS') return success({});

  const userId = getUserId(event);
  if (!userId) return error('Unauthorized', 401);

  const noteId = event.pathParameters?.id;
  const note = await Note.update(userId, noteId, { isTrashed: false });
  if (!note) return error('Note not found', 404);

  return success({ success: true, note });
};

// DELETE /api/notes/{id}
module.exports.remove = async (event) => {
  if (event.httpMethod === 'OPTIONS') return success({});

  const userId = getUserId(event);
  if (!userId) return error('Unauthorized', 401);

  const noteId = event.pathParameters?.id;
  const existing = await Note.getById(userId, noteId);
  if (!existing) return error('Note not found', 404);

  await Note.delete(userId, noteId);
  return success({ success: true, message: 'Note permanently deleted' });
};
