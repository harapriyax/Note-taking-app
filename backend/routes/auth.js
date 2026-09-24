const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { readUsers, writeUsers } = require('../middleware/db.js');

const router = express.Router();

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: true, message: 'Email and password are required' });
  }

  const users = readUsers();
  const user = users.find(u => u.email === email);

  if (!user) {
    // Auto-create user for demo purposes
    const newUser = {
      id: uuidv4(),
      fullName: email.split('@')[0],
      email,
      password,
    };
    users.push(newUser);
    writeUsers(users);

    const { password: _, ...safeUser } = newUser;
    return res.json({ success: true, user: safeUser, token: `token_${newUser.id}` });
  }

  // For demo: accept any password
  const { password: _, ...safeUser } = user;
  res.json({ success: true, user: safeUser, token: `token_${user.id}` });
});

// POST /api/auth/signup
router.post('/signup', (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ error: true, message: 'All fields are required' });
  }

  const users = readUsers();
  const existing = users.find(u => u.email === email);

  if (existing) {
    return res.status(409).json({ error: true, message: 'Email already registered' });
  }

  const newUser = {
    id: uuidv4(),
    fullName,
    email,
    password,
  };
  users.push(newUser);
  writeUsers(users);

  const { password: _, ...safeUser } = newUser;
  res.status(201).json({ success: true, user: safeUser, token: `token_${newUser.id}` });
});

// GET /api/auth/me - Get current user (by token header)
router.get('/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: true, message: 'No token provided' });
  }

  const userId = token.replace('token_', '');
  const users = readUsers();
  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({ error: true, message: 'User not found' });
  }

  const { password: _, ...safeUser } = user;
  res.json({ success: true, user: safeUser });
});

// PUT /api/auth/profile - Update profile
router.put('/profile', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: true, message: 'No token provided' });
  }

  const userId = token.replace('token_', '');
  const users = readUsers();
  const index = users.findIndex(u => u.id === userId);

  if (index === -1) {
    return res.status(404).json({ error: true, message: 'User not found' });
  }

  const { fullName, email } = req.body;
  if (fullName) users[index].fullName = fullName;
  if (email) users[index].email = email;

  writeUsers(users);

  const { password: _, ...safeUser } = users[index];
  res.json({ success: true, user: safeUser });
});

module.exports = router;
