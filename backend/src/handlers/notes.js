const { v4: uuidv4 } = require('uuid');
const Note = require('../models/Note');
const { success, error, parseBody, getCognitoId } = require('../lib/response');

// GET /api/notes
module.exports.list = async (event) => {
  if (event.httpMethod === 'OPTIONS') return success({});

  const cognitoId = getCognitoId(event);
  if (!cognitoId) return error('Unauthorized', 401);

  const { category, search, favorites, trashed } = event.queryStringParameters || {};
  const notes = await Note.listByUser(cognitoId, { category, search, favorites, trashed });

  return success({ success: true, notes });
};

// GET /api/notes/search
module.exports.search = async (event) => {
  if (event.httpMethod === 'OPTIONS') return success({});

  const cognitoId = getCognitoId(event);
  if (!cognitoId) return error('Unauthorized', 401);

  const params = event.queryStringParameters || {};
  const queryText = params.q || params.query || params.search || '';
  const { category, trashed } = params;

  const notes = await Note.search(cognitoId, queryText, { category, trashed });

  return success({
    success: true,
    query: queryText,
    count: notes.length,
    notes,
  });
};

// GET /api/notes/stats
module.exports.stats = async (event) => {
  if (event.httpMethod === 'OPTIONS') return success({});

  const cognitoId = getCognitoId(event);
  if (!cognitoId) return error('Unauthorized', 401);

  const stats = await Note.getStats(cognitoId);
  return success({ success: true, stats });
};

// GET /api/notes/{id}
module.exports.getById = async (event) => {
  if (event.httpMethod === 'OPTIONS') return success({});

  const cognitoId = getCognitoId(event);
  if (!cognitoId) return error('Unauthorized', 401);

  const noteId = event.pathParameters?.id;
  const note = await Note.getById(cognitoId, noteId);

  if (!note) return error('Note not found', 404);
  return success({ success: true, note });
};

// POST /api/notes
module.exports.create = async (event) => {
  if (event.httpMethod === 'OPTIONS') return success({});

  const cognitoId = getCognitoId(event);
  if (!cognitoId) return error('Unauthorized', 401);

  const { title, content, tags, category, color, attachments, isFavorite, isPinned } = parseBody(event);

  const note = await Note.create({
    cognitoId,
    noteId: uuidv4(),
    title,
    content,
    tags,
    category,
    color,
    attachments: Array.isArray(attachments) ? attachments : [],
    isFavorite,
    isPinned,
  });

  return success({ success: true, note }, 201);
};

// PUT /api/notes/{id}
module.exports.update = async (event) => {
  if (event.httpMethod === 'OPTIONS') return success({});

  const cognitoId = getCognitoId(event);
  if (!cognitoId) return error('Unauthorized', 401);

  const noteId = event.pathParameters?.id;
  const body = parseBody(event);

  const updates = {};
  if (body.title !== undefined) updates.title = body.title;
  if (body.content !== undefined) updates.content = body.content;
  if (body.tags !== undefined) updates.tags = body.tags;
  if (body.category !== undefined) updates.category = body.category;
  if (body.color !== undefined) updates.color = body.color;
  if (body.attachments !== undefined) updates.attachments = body.attachments;
  if (body.isFavorite !== undefined) updates.isFavorite = body.isFavorite;
  if (body.isPinned !== undefined) updates.isPinned = body.isPinned;
  if (body.isTrashed !== undefined) updates.isTrashed = body.isTrashed;

  const note = await Note.update(cognitoId, noteId, updates);
  if (!note) return error('Note not found', 404);

  return success({ success: true, note });
};

// PUT /api/notes/{id}/pin
module.exports.togglePin = async (event) => {
  if (event.httpMethod === 'OPTIONS') return success({});

  const cognitoId = getCognitoId(event);
  if (!cognitoId) return error('Unauthorized', 401);

  const noteId = event.pathParameters?.id;
  const existing = await Note.getById(cognitoId, noteId);
  if (!existing) return error('Note not found', 404);

  const note = await Note.update(cognitoId, noteId, { isPinned: !existing.isPinned });
  return success({ success: true, note });
};

// PUT /api/notes/{id}/favorite
module.exports.toggleFavorite = async (event) => {
  if (event.httpMethod === 'OPTIONS') return success({});

  const cognitoId = getCognitoId(event);
  if (!cognitoId) return error('Unauthorized', 401);

  const noteId = event.pathParameters?.id;
  const existing = await Note.getById(cognitoId, noteId);
  if (!existing) return error('Note not found', 404);

  const note = await Note.update(cognitoId, noteId, { isFavorite: !existing.isFavorite });
  return success({ success: true, note });
};

// PUT /api/notes/{id}/trash
module.exports.trash = async (event) => {
  if (event.httpMethod === 'OPTIONS') return success({});

  const cognitoId = getCognitoId(event);
  if (!cognitoId) return error('Unauthorized', 401);

  const noteId = event.pathParameters?.id;
  const note = await Note.update(cognitoId, noteId, { isTrashed: true });
  if (!note) return error('Note not found', 404);

  return success({ success: true, note });
};

// PUT /api/notes/{id}/restore
module.exports.restore = async (event) => {
  if (event.httpMethod === 'OPTIONS') return success({});

  const cognitoId = getCognitoId(event);
  if (!cognitoId) return error('Unauthorized', 401);

  const noteId = event.pathParameters?.id;
  const note = await Note.update(cognitoId, noteId, { isTrashed: false });
  if (!note) return error('Note not found', 404);

  return success({ success: true, note });
};

// DELETE /api/notes/{id}
module.exports.remove = async (event) => {
  if (event.httpMethod === 'OPTIONS') return success({});

  const cognitoId = getCognitoId(event);
  if (!cognitoId) return error('Unauthorized', 401);

  const noteId = event.pathParameters?.id;
  const existing = await Note.getById(cognitoId, noteId);
  if (!existing) return error('Note not found', 404);

  await Note.delete(cognitoId, noteId);
  return success({ success: true, message: 'Note permanently deleted' });
};
