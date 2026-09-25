const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { signToken } = require('../lib/jwt');
const { success, error, parseBody, getUserId } = require('../lib/response');

const SALT_ROUNDS = 10;

// POST /api/auth/signup
module.exports.signup = async (event) => {
  if (event.httpMethod === 'OPTIONS') return success({});

  const { fullName, email, password } = parseBody(event);

  if (!fullName || !email || !password) {
    return error('Full name, email, and password are required', 400);
  }

  if (password.length < 4) {
    return error('Password must be at least 4 characters', 400);
  }

  if (!email.includes('@')) {
    return error('Please enter a valid email address', 400);
  }

  // Check if email already exists
  const existing = await User.findByEmail(email.toLowerCase().trim());
  if (existing) {
    return error('Email already registered', 409);
  }

  const userId = uuidv4();
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({
    userId,
    fullName: fullName.trim(),
    email: email.toLowerCase().trim(),
    passwordHash,
  });

  const token = signToken({ userId: user.userId, email: user.email });

  return success({
    success: true,
    user: User.safe(user),
    token,
  }, 201);
};

// POST /api/auth/login
module.exports.login = async (event) => {
  if (event.httpMethod === 'OPTIONS') return success({});

  const { email, password } = parseBody(event);

  if (!email || !password) {
    return error('Email and password are required', 400);
  }

  const user = await User.findByEmail(email.toLowerCase().trim());
  if (!user) {
    return error('Invalid email or password', 401);
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return error('Invalid email or password', 401);
  }

  const token = signToken({ userId: user.userId, email: user.email });

  return success({
    success: true,
    user: User.safe(user),
    token,
  });
};

// GET /api/auth/me
module.exports.getMe = async (event) => {
  if (event.httpMethod === 'OPTIONS') return success({});

  const userId = getUserId(event);
  if (!userId) return error('Unauthorized', 401);

  const user = await User.findById(userId);
  if (!user) return error('User not found', 404);

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
