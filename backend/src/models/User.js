const { dynamodb, TABLES } = require('../lib/dynamodb');
const { GetCommand, PutCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const User = {
  async findByEmail(email) {
    const result = await dynamodb.send(new QueryCommand({
      TableName: TABLES.USERS,
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: { ':email': email.toLowerCase().trim() },
      Limit: 1,
    }));
    return result.Items?.[0] || null;
  },

  async findById(cognitoId) {
    const result = await dynamodb.send(new GetCommand({
      TableName: TABLES.USERS,
      Key: { cognitoId },
    }));
    return result.Item || null;
  },

  async create({ cognitoId, fullName, email }) {
    const user = {
      cognitoId,
      fullName: fullName || email.split('@')[0],
      email: email.toLowerCase().trim(),
      userType: 'member',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await dynamodb.send(new PutCommand({
      TableName: TABLES.USERS,
      Item: user,
    }));
    return user;
  },

  async update(cognitoId, updates) {
    const user = await User.findById(cognitoId);
    if (!user) return null;

    const merged = { ...user, ...updates, updatedAt: new Date().toISOString() };
    await dynamodb.send(new PutCommand({
      TableName: TABLES.USERS,
      Item: merged,
    }));
    return merged;
  },

  // Return only safe, client-facing fields
  safe(user) {
    if (!user) return null;
    return {
      cognitoId: user.cognitoId,
      fullName: user.fullName,
      email: user.email,
      userType: user.userType,
      displayName: user.fullName || user.email?.split('@')[0] || 'User',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  },
};

module.exports = User;
