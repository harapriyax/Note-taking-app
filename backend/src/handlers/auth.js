const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const Cognito = require('../lib/cognito');
const { decodeToken, signToken } = require('../lib/jwt');
const { success, error, parseBody, getUserId, getUserEmail } = require('../lib/response');

function mapCognitoError(err) {
  const code = err.name || err.code || '';
  switch (code) {
    case 'UsernameExistsException':
      return { status: 409, message: 'An account with this email already exists.' };
    case 'NotAuthorizedException':
      return { status: 401, message: 'Incorrect email or password.' };
    case 'UserNotConfirmedException':
      return {
        status: 403,
        message: 'Account not verified yet. Please enter the verification code sent to your email.',
        code: 'UserNotConfirmedException',
      };
    case 'CodeMismatchException':
      return { status: 400, message: 'Invalid verification code. Please check your email and try again.' };
    case 'ExpiredCodeException':
      return { status: 400, message: 'Verification code has expired. Please request a new one.' };
    case 'InvalidPasswordException':
      return { status: 400, message: 'Password must be at least 8 characters and include uppercase, lowercase, and numbers.' };
    case 'InvalidParameterException':
      return { status: 400, message: err.message || 'Invalid parameters provided.' };
    case 'UserNotFoundException':
      return { status: 404, message: 'No account found with this email address.' };
    case 'LimitExceededException':
      return { status: 429, message: 'Attempt limit exceeded. Please wait a few moments and try again.' };
    default:
      return { status: 400, message: err.message || 'Authentication operation failed.' };
  }
}

// POST /api/auth/signup
module.exports.signup = async (event) => {
  if (event.httpMethod === 'OPTIONS') return success({});

  const { fullName, email, password } = parseBody(event);

  if (!fullName || !email || !password) {
    return error('Full name, email, and password are required', 400);
  }

  if (password.length < 8) {
    return error('Password must be at least 8 characters long', 400);
  }

  if (!email.includes('@')) {
    return error('Please enter a valid email address', 400);
  }

  const cleanEmail = email.toLowerCase().trim();
  const cleanName = fullName.trim();

  try {
    const cognitoResult = await Cognito.signUp({
      email: cleanEmail,
      password,
      fullName: cleanName,
    });

    const userId = cognitoResult.userSub;

    // Create profile in DynamoDB
    let user = await User.findById(userId);
    if (!user) {
      user = await User.create({
        userId,
        fullName: cleanName,
        email: cleanEmail,
      });
    }

    return success({
      success: true,
      requiresConfirmation: !cognitoResult.userConfirmed,
      userId,
      email: cleanEmail,
      message: 'Account registered! Please check your email for the confirmation code.',
    }, 201);
  } catch (err) {
    const mapped = mapCognitoError(err);
    return error(mapped.message, mapped.status);
  }
};

// POST /api/auth/confirm-signup
module.exports.confirmSignup = async (event) => {
  if (event.httpMethod === 'OPTIONS') return success({});

  const { email, code } = parseBody(event);

  if (!email || !code) {
    return error('Email and confirmation code are required', 400);
  }

  try {
    await Cognito.confirmSignUp({ email, code });
    return success({
      success: true,
      message: 'Account verified successfully! You can now log in.',
    });
  } catch (err) {
    const mapped = mapCognitoError(err);
    return error(mapped.message, mapped.status);
  }
};

// POST /api/auth/resend-code
module.exports.resendCode = async (event) => {
  if (event.httpMethod === 'OPTIONS') return success({});

  const { email } = parseBody(event);
  if (!email) {
    return error('Email is required', 400);
  }

  try {
    const delivery = await Cognito.resendConfirmationCode({ email });
    return success({
      success: true,
      message: 'A fresh verification code has been sent to your email.',
      delivery,
    });
  } catch (err) {
    const mapped = mapCognitoError(err);
    return error(mapped.message, mapped.status);
  }
};

// POST /api/auth/login
module.exports.login = async (event) => {
  if (event.httpMethod === 'OPTIONS') return success({});

  const { email, password } = parseBody(event);

  if (!email || !password) {
    return error('Email and password are required', 400);
  }

  const cleanEmail = email.toLowerCase().trim();

  try {
    const authResult = await Cognito.login({ email: cleanEmail, password });
    const decoded = decodeToken(authResult.idToken);
    const userId = decoded?.userId || decoded?.sub;

    // Retrieve or populate user record in DynamoDB
    let user = await User.findById(userId);
    if (!user) {
      user = await User.findByEmail(cleanEmail);
    }
    if (!user) {
      user = await User.create({
        userId,
        fullName: decoded?.name || cleanEmail.split('@')[0],
        email: cleanEmail,
      });
    }

    return success({
      success: true,
      token: authResult.idToken,
      idToken: authResult.idToken,
      accessToken: authResult.accessToken,
      refreshToken: authResult.refreshToken,
      expiresIn: authResult.expiresIn,
      user: User.safe(user),
    });
  } catch (err) {
    const mapped = mapCognitoError(err);
    if (mapped.code === 'UserNotConfirmedException') {
      return {
        statusCode: 403,
        headers: require('../lib/response').CORS_HEADERS,
        body: JSON.stringify({
          error: true,
          message: mapped.message,
          code: 'UserNotConfirmedException',
          email: cleanEmail,
        }),
      };
    }
    return error(mapped.message, mapped.status);
  }
};

// POST /api/auth/forgot-password
module.exports.forgotPassword = async (event) => {
  if (event.httpMethod === 'OPTIONS') return success({});

  const { email } = parseBody(event);
  if (!email || !email.includes('@')) {
    return error('A valid email address is required', 400);
  }

  try {
    const delivery = await Cognito.forgotPassword({ email });
    return success({
      success: true,
      message: 'Password reset code has been sent to your email.',
      delivery,
    });
  } catch (err) {
    const mapped = mapCognitoError(err);
    return error(mapped.message, mapped.status);
  }
};

// POST /api/auth/reset-password
module.exports.resetPassword = async (event) => {
  if (event.httpMethod === 'OPTIONS') return success({});

  const { email, code, newPassword } = parseBody(event);

  if (!email || !code || !newPassword) {
    return error('Email, verification code, and new password are required', 400);
  }

  if (newPassword.length < 8) {
    return error('New password must be at least 8 characters long', 400);
  }

  try {
    await Cognito.confirmForgotPassword({
      email,
      code,
      newPassword,
    });

    return success({
      success: true,
      message: 'Password has been reset successfully. You can now sign in with your new password.',
    });
  } catch (err) {
    const mapped = mapCognitoError(err);
    return error(mapped.message, mapped.status);
  }
};

// GET /api/auth/me
module.exports.getMe = async (event) => {
  if (event.httpMethod === 'OPTIONS') return success({});

  const userId = getUserId(event);
  if (!userId) return error('Unauthorized', 401);

  let user = await User.findById(userId);
  if (!user) {
    const email = getUserEmail(event);
    if (email) {
      user = await User.findByEmail(email);
    }
  }

  if (!user) {
    const email = getUserEmail(event);
    if (email) {
      user = await User.create({
        userId,
        fullName: email.split('@')[0],
        email,
      });
    } else {
      return error('User not found', 404);
    }
  }

  return success({ success: true, user: User.safe(user) });
};

// PUT /api/auth/profile
module.exports.updateProfile = async (event) => {
  if (event.httpMethod === 'OPTIONS') return success({});

  const userId = getUserId(event);
  if (!userId) return error('Unauthorized', 401);

  const { fullName, email } = parseBody(event);
  const updates = {};
  if (fullName) updates.fullName = fullName.trim();
  if (email) updates.email = email.toLowerCase().trim();

  const user = await User.update(userId, updates);
  if (!user) return error('User not found', 404);

  return success({ success: true, user: User.safe(user) });
};
