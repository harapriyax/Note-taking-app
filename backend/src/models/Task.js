const { dynamodb, TABLES } = require('../lib/dynamodb');
const { GetCommand, PutCommand, DeleteCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const Task = {
  async listByUser(cognitoId) {
    const result = await dynamodb.send(new QueryCommand({
      TableName: TABLES.TASKS,
      KeyConditionExpression: 'cognitoId = :uid',
      ExpressionAttributeValues: { ':uid': cognitoId },
    }));

    let tasks = result.Items || [];
    // Sort by createdAt descending (newest first)
    tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return tasks;
  },

  async getById(cognitoId, taskId) {
    const result = await dynamodb.send(new GetCommand({
      TableName: TABLES.TASKS,
      Key: { cognitoId, taskId },
    }));
    return result.Item || null;
  },

  async create(taskData) {
    const task = {
      cognitoId: taskData.cognitoId,
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

  async update(cognitoId, taskId, updates) {
    const existing = await Task.getById(cognitoId, taskId);
    if (!existing) return null;

    const merged = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    await dynamodb.send(new PutCommand({
      TableName: TABLES.TASKS,
      Item: merged,
    }));
    return merged;
  },

  async remove(cognitoId, taskId) {
    await dynamodb.send(new DeleteCommand({
      TableName: TABLES.TASKS,
      Key: { cognitoId, taskId },
    }));
    return true;
  },
};

module.exports = Task;
