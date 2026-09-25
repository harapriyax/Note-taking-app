const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'ap-south-1',
});

const dynamodb = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertEmptyValues: true,
  },
});

const TABLES = {
  USERS: process.env.USERS_TABLE || 'NoteFlow-Users',
  NOTES: process.env.NOTES_TABLE || 'NoteFlow-Notes',
  TASKS: process.env.TASKS_TABLE || 'NoteFlow-Tasks',
  CATEGORIES: process.env.CATEGORIES_TABLE || 'NoteFlow-Categories',
};

module.exports = { dynamodb, TABLES };
