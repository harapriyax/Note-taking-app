const { dynamodb, TABLES } = require('../lib/dynamodb');
const { GetCommand, PutCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const User = {
  async findByEmail(email) {
    const result = await dynamodb.send(new QueryCommand({
      TableName: TABLES.USERS,
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: { ':email': email },
      Limit: 1,
    }));
    return result.Items?.[0] || null;
  },

  async findById(userId) {
    const result = await dynamodb.send(new GetCommand({
      TableName: TABLES.USERS,
      Key: { userId },
    }));
    return result.Item || null;
  },

  async create({ userId, fullName, email, passwordHash }) {
    const user = {
      userId,
      fullName,
      email: email.toLowerCase().trim(),
      passwordHash,
      createdAt: new Date().toISOString(),
    };
    await dynamodb.send(new PutCommand({
      TableName: TABLES.USERS,
      Item: user,
      ConditionExpression: 'attribute_not_exists(userId)',
    }));
    return user;
  },

  async update(userId, updates) {
    const user = await User.findById(userId);
    if (!user) return null;

    const merged = { ...user, ...updates, updatedAt: new Date().toISOString() };
    await dynamodb.send(new PutCommand({
      TableName: TABLES.USERS,
      Item: merged,
    }));
    return merged;
  },

  // Strip sensitive fields before returning to client
  safe(user) {
    if (!user) return null;
    const { passwordHash, ...safe } = user;
    return safe;
  },
};

module.exports = User;
