const User = require('../models/User');
const Cognito = require('../lib/cognito');
const { success, error, parseBody, getCognitoId, CORS_HEADERS } = require('../lib/response');

const REGION = process.env.AWS_REGION || 'ap-south-1';

/**
 * PostConfirmation trigger — Cognito invokes this Lambda after a user verifies email.
 * Creates the user profile in DynamoDB automatically.
 */
module.exports.postConfirmation = async (event) => {
  console.log('PostConfirmation trigger:', JSON.stringify(event, null, 2));

  const { sub, email, name } = event.request.userAttributes;
  const cognitoId = `${REGION}:${sub}`;

  try {
    // Check if user already exists (idempotent)
    let user = await User.findById(cognitoId);
    if (!user) {
      user = await User.create({
        cognitoId,
        fullName: name || email.split('@')[0],
        email: email.toLowerCase().trim(),
      });
      console.log('Created user record:', cognitoId);
    }
  } catch (err) {
    console.error('PostConfirmation error:', err);
    // Don't throw — Cognito will retry and block the user flow
  }

  // Must return the event object for Cognito triggers
  return event;
};

/**
 * GET /api/auth/me — Returns user profile from DynamoDB.
 * With IAM auth, JWT claims are not directly available.
 * Uses cognitoId (extracted from IAM context) to look up the user.
 * Falls back to adminGetUser if the user record is missing.
 */
module.exports.getMe = async (event) => {
  if (event.httpMethod === 'OPTIONS') return success({});

  const cognitoId = getCognitoId(event);
  if (!cognitoId) return error('Unauthorized', 401);

  let user = await User.findById(cognitoId);

  if (!user) {
    // Extract the sub from cognitoId (format: "region:sub")
    const sub = cognitoId.split(':').slice(1).join(':');

    // Try to get user info from Cognito Admin API as fallback
    try {
      const cognitoUser = await Cognito.adminGetUserBySub(sub);
      if (cognitoUser) {
        const attrs = {};
        for (const attr of cognitoUser.UserAttributes || []) {
          attrs[attr.Name] = attr.Value;
        }
        user = await User.create({
          cognitoId,
          fullName: attrs.name || attrs.email?.split('@')[0] || 'User',
          email: attrs.email || '',
        });
      }
    } catch (err) {
      console.error('getMe fallback error:', err);
    }

    if (!user) return error('User not found', 404);
  }

  return success({ success: true, user: User.safe(user) });
};

/**
 * PUT /api/auth/profile — Update user profile
 */
module.exports.updateProfile = async (event) => {
  if (event.httpMethod === 'OPTIONS') return success({});

  const cognitoId = getCognitoId(event);
  if (!cognitoId) return error('Unauthorized', 401);

  const { fullName, email } = parseBody(event);
  const updates = {};
  if (fullName) updates.fullName = fullName.trim();
  if (email) updates.email = email.toLowerCase().trim();

  const user = await User.update(cognitoId, updates);
  if (!user) return error('User not found', 404);

  return success({ success: true, user: User.safe(user) });
};
