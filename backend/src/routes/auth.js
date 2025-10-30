const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const { runQuery, getQuery } = require('../db/database');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Helper function to generate JWT
function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// POST /api/v1/auth/register - Create new account
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('username').isLength({ min: 3, max: 20 }).matches(/^[a-zA-Z0-9_]+$/),
  body('full_name').notEmpty().trim(),
  body('date_of_birth').isISO8601(),
  body('gender').isIn(['male', 'female', 'non-binary', 'other'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: { message: 'Validation failed', errors: errors.array() } });
    }

    const { email, password, username, full_name, date_of_birth, gender } = req.body;

    // Check if user already exists
    const existingUser = await getQuery('SELECT id FROM users WHERE email = ? OR username = ?', [email, username]);
    if (existingUser) {
      return res.status(409).json({ error: { message: 'Email or username already exists' } });
    }

    // Check if user is 18+
    const birthDate = new Date(date_of_birth);
    const age = Math.floor((new Date() - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
    if (age < 18) {
      return res.status(400).json({ error: { message: 'You must be 18 or older to register' } });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 12);

    // Create user
    const userId = uuidv4();
    await runQuery(
      `INSERT INTO users (id, email, username, password_hash, full_name, date_of_birth, gender, email_verified)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [userId, email, username, password_hash, full_name, date_of_birth, gender]
    );

    // Generate token
    const token = generateToken(userId);

    // Get created user
    const user = await getQuery('SELECT id, email, username, full_name, date_of_birth, gender, profile_photo_url, created_at FROM users WHERE id = ?', [userId]);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: { message: 'Registration failed' } });
  }
});

// POST /api/v1/auth/login - Login with credentials
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: { message: 'Validation failed', errors: errors.array() } });
    }

    const { email, password } = req.body;

    // Get user
    const user = await getQuery('SELECT * FROM users WHERE email = ? AND is_active = 1', [email]);
    if (!user) {
      return res.status(401).json({ error: { message: 'Invalid email or password' } });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: { message: 'Invalid email or password' } });
    }

    // Update last login
    await runQuery('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

    // Generate token
    const token = generateToken(user.id);

    // Remove password hash from response
    delete user.password_hash;

    res.json({
      message: 'Login successful',
      token,
      user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: { message: 'Login failed' } });
  }
});

// POST /api/v1/auth/logout - Logout (client-side token removal mainly)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
