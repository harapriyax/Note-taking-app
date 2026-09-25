const { dynamodb, TABLES } = require('../lib/dynamodb');
const { GetCommand, PutCommand, DeleteCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const Task = {
  async listByUser(userId) {
    const result = await dynamodb.send(new QueryCommand({
      TableName: TABLES.TASKS,
      KeyConditionExpression: 'userId = :uid',
      ExpressionAttributeValues: { ':uid': userId },
    }));

    let tasks = result.Items || [];
    // Sort by createdAt descending (newest first)
    tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return tasks;
  },

  async getById(userId, taskId) {
    const result = await dynamodb.send(new GetCommand({
      TableName: TABLES.TASKS,
      Key: { userId, taskId },
    }));
    return result.Item || null;
  },

  async create(taskData) {
    const task = {
      userId: taskData.userId,
      taskId: taskData.taskId,
      text: taskData.text || '',
      priority: taskData.priority || 'Medium',
      done: Boolean(taskData.done),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await dynamodb.send(new PutCommand({
      TableName: TABLES.TASKS,
      Item: task,
    }));
    return task;
  },

  async update(userId, taskId, updates) {
    const existing = await Task.getById(userId, taskId);
    if (!existing) return null;

    const merged = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    await dynamodb.send(new PutCommand({
      TableName: TABLES.TASKS,
      Item: merged,
    }));
    return merged;
  },

  async remove(userId, taskId) {
    await dynamodb.send(new DeleteCommand({
      TableName: TABLES.TASKS,
      Key: { userId, taskId },
    }));
    return true;
  },
};

module.exports = Task;
