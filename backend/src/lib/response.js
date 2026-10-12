const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
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

/**
 * Extract cognitoId from REST API Gateway IAM Authorizer context.
 * 
 * With IAM auth + Cognito Identity Pool, the User Pool `sub` is embedded in
 * `event.requestContext.identity.cognitoAuthenticationProvider`:
 *   "cognito-idp.ap-south-1.amazonaws.com/ap-south-1_XXXXX,
 *    cognito-idp.ap-south-1.amazonaws.com/ap-south-1_XXXXX:CognitoSignIn:<USER_SUB>"
 *
 * We extract the sub and return "region:sub" to maintain DynamoDB key compatibility.
 */
function getCognitoId(event) {
  const authProvider = event.requestContext?.identity?.cognitoAuthenticationProvider;
  if (!authProvider) return null;

  // Extract User Pool sub from the authentication provider string
  // Format: ...CognitoSignIn:<sub-uuid>
  const parts = authProvider.split(':CognitoSignIn:');
  const sub = parts[parts.length - 1];
  if (!sub) return null;

  const region = process.env.AWS_REGION || 'ap-south-1';
  return `${region}:${sub}`;
}

/**
 * Get the Cognito Identity Pool identity ID (e.g. "ap-south-1:xxxx-xxxx")
 */
function getIdentityId(event) {
  return event.requestContext?.identity?.cognitoIdentityId || null;
}

module.exports = { success, error, parseBody, getCognitoId, getIdentityId, CORS_HEADERS };
