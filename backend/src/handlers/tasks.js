const { v4: uuidv4 } = require('uuid');
const Task = require('../models/Task');
const { success, error, parseBody, getUserId } = require('../lib/response');

// GET /api/tasks
module.exports.list = async (event) => {
  if (event.httpMethod === 'OPTIONS') return success({});

  const userId = getUserId(event);
  if (!userId) return error('Unauthorized', 401);

  const tasks = await Task.listByUser(userId);
  return success({ success: true, tasks });
};

// POST /api/tasks
module.exports.create = async (event) => {
  if (event.httpMethod === 'OPTIONS') return success({});

  const userId = getUserId(event);
  if (!userId) return error('Unauthorized', 401);

  const { text, priority, done } = parseBody(event);

  if (!text || !text.trim()) {
    return error('Task text is required', 400);
  }

  const task = await Task.create({
    userId,
    taskId: uuidv4(),
    text: text.trim(),
    priority: priority || 'Medium',
    done: Boolean(done),
  });

  return success({ success: true, task }, 201);
};

// PUT /api/tasks/{id}
module.exports.update = async (event) => {
  if (event.httpMethod === 'OPTIONS') return success({});

  const userId = getUserId(event);
  if (!userId) return error('Unauthorized', 401);

  const taskId = event.pathParameters?.id;
  const body = parseBody(event);

  const updates = {};
  if (body.text !== undefined) updates.text = body.text;
  if (body.priority !== undefined) updates.priority = body.priority;
  if (body.done !== undefined) updates.done = Boolean(body.done);

  const task = await Task.update(userId, taskId, updates);
  if (!task) return error('Task not found', 404);

  return success({ success: true, task });
};

// PUT /api/tasks/{id}/toggle
module.exports.toggle = async (event) => {
  if (event.httpMethod === 'OPTIONS') return success({});

  const userId = getUserId(event);
  if (!userId) return error('Unauthorized', 401);

  const taskId = event.pathParameters?.id;
  const existing = await Task.getById(userId, taskId);
  if (!existing) return error('Task not found', 404);

  const task = await Task.update(userId, taskId, { done: !existing.done });
  return success({ success: true, task });
};

// DELETE /api/tasks/{id}
module.exports.remove = async (event) => {
  if (event.httpMethod === 'OPTIONS') return success({});

  const userId = getUserId(event);
  if (!userId) return error('Unauthorized', 401);

  const taskId = event.pathParameters?.id;
  await Task.remove(userId, taskId);

  return success({ success: true, message: 'Task deleted' });
};
