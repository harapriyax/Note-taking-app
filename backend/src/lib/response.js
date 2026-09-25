const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Content-Type': 'application/json',
};

function success(body, statusCode = 200) {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(body),
  };
}

function error(message, statusCode = 400) {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify({ error: true, message }),
  };
}

function parseBody(event) {
  try {
    return typeof event.body === 'string' ? JSON.parse(event.body) : event.body || {};
  } catch {
    return {};
  }
}

function getUserId(event) {
  // Extracted from JWT by the auth middleware or API Gateway authorizer
  const authContext = event.requestContext?.authorizer;
  if (authContext?.userId) return authContext.userId;

  // Fallback: parse from Authorization header directly
  const token = event.headers?.Authorization?.replace('Bearer ', '')
    || event.headers?.authorization?.replace('Bearer ', '');

  if (!token) return null;

  const { verifyToken } = require('./jwt');
  const decoded = verifyToken(token);
  return decoded?.userId || null;
}

module.exports = { success, error, parseBody, getUserId, CORS_HEADERS };
