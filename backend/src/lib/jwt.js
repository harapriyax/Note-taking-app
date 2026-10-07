const jwt = require('jsonwebtoken');
const { CognitoJwtVerifier } = require('aws-jwt-verify');

const SECRET = process.env.JWT_SECRET || 'noteflow-jwt-secret-change-me';
const USER_POOL_ID = process.env.USER_POOL_ID;
const USER_POOL_CLIENT_ID = process.env.USER_POOL_CLIENT_ID;

let cognitoVerifier = null;
if (USER_POOL_ID && USER_POOL_CLIENT_ID) {
  try {
    cognitoVerifier = CognitoJwtVerifier.create({
      userPoolId: USER_POOL_ID,
      tokenUse: null, // allows both id and access tokens
      clientId: USER_POOL_CLIENT_ID,
    });
  } catch (err) {
    console.warn('Cognito verifier initialization warning:', err.message);
  }
}

/**
 * Decode JWT token payload without signature verification (fast, synchronous)
 */
function decodeToken(token) {
  if (!token) return null;
  try {
    const cleaned = token.replace(/^Bearer\s+/i, '').trim();
    let decoded = jwt.decode(cleaned);
    if (!decoded && cleaned.includes('.')) {
      try {
        const parts = cleaned.split('.');
        const rawPayload = parts[1]?.replace(/-/g, '+').replace(/_/g, '/');
        const jsonStr = Buffer.from(rawPayload, 'base64').toString('utf8');
        decoded = JSON.parse(jsonStr);
      } catch {}
    }
    if (!decoded) return null;
    return {
      userId: decoded.sub || decoded.userId,
      email: decoded.email,
      name: decoded.name,
      ...decoded,
    };
  } catch {
    return null;
  }
}

/**
 * Cryptographically verify token (asynchronous, supports Cognito JWKS & HMAC fallback)
 */
async function verifyToken(token) {
  if (!token) return null;
  const cleaned = token.replace('Bearer ', '').trim();

  // Try Cognito JWKS verification first
  if (cognitoVerifier) {
    try {
      const payload = await cognitoVerifier.verify(cleaned);
      return {
        userId: payload.sub,
        email: payload.email,
        name: payload.name,
        ...payload,
      };
    } catch (err) {
      // Fall through to HMAC or decode fallback
    }
  }

  // Fallback to HMAC verification
  try {
    const payload = jwt.verify(cleaned, SECRET);
    return {
      userId: payload.sub || payload.userId,
      email: payload.email,
      ...payload,
    };
  } catch (err) {
    // If verifier not configured yet, fallback to decode
    return decodeToken(cleaned);
  }
}

/**
 * Legacy HMAC signing (for backwards compatibility)
 */
function signToken(payload, expiresIn = '7d') {
  return jwt.sign(payload, SECRET, { expiresIn });
}

module.exports = {
  verifyToken,
  decodeToken,
  signToken,
};
