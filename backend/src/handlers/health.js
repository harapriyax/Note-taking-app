const { success } = require('../lib/response');

module.exports.check = async (event) => {
  return success({
    status: 'ok',
    message: 'NoteFlow API is running (serverless)',
    timestamp: new Date().toISOString(),
    region: process.env.AWS_REGION || 'ap-south-1',
  });
};
