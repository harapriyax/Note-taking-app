const { v4: uuidv4 } = require('uuid');
const Category = require('../models/Category');
const { success, error, parseBody, getUserId } = require('../lib/response');

// GET /api/categories
module.exports.list = async (event) => {
  if (event.httpMethod === 'OPTIONS') return success({});

  const userId = getUserId(event);
  if (!userId) return error('Unauthorized', 401);

  const categories = await Category.listByUser(userId);
  return success({ success: true, categories });
};

// POST /api/categories
module.exports.create = async (event) => {
  if (event.httpMethod === 'OPTIONS') return success({});

  const userId = getUserId(event);
  if (!userId) return error('Unauthorized', 401);

  const { name, color } = parseBody(event);

  if (!name || !name.trim()) {
    return error('Category name is required', 400);
  }

  const category = await Category.create({
    userId,
    categoryId: uuidv4(),
    name: name.trim(),
    color: color || '#e07a4a',
  });

  return success({ success: true, category }, 201);
};

// DELETE /api/categories/{id}
module.exports.remove = async (event) => {
  if (event.httpMethod === 'OPTIONS') return success({});

  const userId = getUserId(event);
  if (!userId) return error('Unauthorized', 401);

  const categoryId = event.pathParameters?.id;
  await Category.remove(userId, categoryId);

  return success({ success: true, message: 'Category deleted' });
};
