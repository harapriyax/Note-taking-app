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
  // Extracted from JWT by API Gateway HTTP API authorizer (claims.sub is standard Cognito ID)
  const authContext = event.requestContext?.authorizer;
  if (authContext?.jwt?.claims?.sub) return authContext.jwt.claims.sub;
  if (authContext?.claims?.sub) return authContext.claims.sub;
  if (authContext?.sub) return authContext.sub;
  if (authContext?.userId) return authContext.userId;

  // Fallback: parse from Authorization header directly
  const rawHeader = event.headers?.Authorization || event.headers?.authorization;
  if (!rawHeader) return null;

  const token = rawHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;

  const { decodeToken } = require('./jwt');
  const decoded = decodeToken(token);
  return decoded?.userId || decoded?.sub || null;
}

function getUserEmail(event) {
  const authContext = event.requestContext?.authorizer;
  if (authContext?.jwt?.claims?.email) return authContext.jwt.claims.email;
  if (authContext?.claims?.email) return authContext.claims.email;
  if (authContext?.email) return authContext.email;

  const rawHeader = event.headers?.Authorization || event.headers?.authorization;
  if (!rawHeader) return null;
  const token = rawHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;

  const { decodeToken } = require('./jwt');
  const decoded = decodeToken(token);
  return decoded?.email || null;
}

module.exports = { success, error, parseBody, getUserId, getUserEmail, CORS_HEADERS };
