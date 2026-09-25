const { dynamodb, TABLES } = require('../lib/dynamodb');
const { GetCommand, PutCommand, DeleteCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const Category = {
  async listByUser(userId) {
    const result = await dynamodb.send(new QueryCommand({
      TableName: TABLES.CATEGORIES,
      KeyConditionExpression: 'userId = :uid',
      ExpressionAttributeValues: { ':uid': userId },
    }));

    let cats = result.Items || [];
    cats.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    return cats;
  },

  async create(catData) {
    const cat = {
      userId: catData.userId,
      categoryId: catData.categoryId,
      name: catData.name,
      color: catData.color || '#e07a4a',
      createdAt: new Date().toISOString(),
    };
    await dynamodb.send(new PutCommand({
      TableName: TABLES.CATEGORIES,
      Item: cat,
    }));
    return cat;
  },

  async remove(userId, categoryId) {
    await dynamodb.send(new DeleteCommand({
      TableName: TABLES.CATEGORIES,
      Key: { userId, categoryId },
    }));
    return true;
  },
};

module.exports = Category;
