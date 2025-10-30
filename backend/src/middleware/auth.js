const jwt = require('jsonwebtoken');
const { getQuery } = require('../db/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Middleware to verify JWT token
async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: { message: 'Access token required', status: 401 } });
    }

    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: { message: 'Invalid or expired token', status: 403 } });
      }

      // Get user from database
      const user = await getQuery('SELECT id, email, username, full_name, profile_photo_url FROM users WHERE id = ? AND is_active = 1', [decoded.userId]);

      if (!user) {
        return res.status(404).json({ error: { message: 'User not found', status: 404 } });
      }

      req.user = user;
      next();
    });
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: { message: 'Authentication error', status: 500 } });
  }
}

// Optional authentication (doesn't fail if no token)
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      return next();
    }

    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
      if (err) {
        req.user = null;
        return next();
      }

      const user = await getQuery('SELECT id, email, username, full_name, profile_photo_url FROM users WHERE id = ? AND is_active = 1', [decoded.userId]);
      req.user = user || null;
      next();
    });
  } catch (error) {
    req.user = null;
    next();
  }
}

module.exports = {
  authenticateToken,
  optionalAuth
};
