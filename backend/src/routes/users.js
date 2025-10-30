const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { getQuery, allQuery, runQuery } = require('../db/database');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// GET /api/v1/users/me - Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await getQuery(
      `SELECT u.*, p.* FROM users u
       LEFT JOIN user_profiles p ON u.id = p.user_id
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({ error: { message: 'User not found' } });
    }

    delete user.password_hash;
    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: { message: 'Failed to get user' } });
  }
});

// PUT /api/v1/users/me - Update user profile
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const { full_name, profile_photo_url } = req.body;

    await runQuery(
      'UPDATE users SET full_name = ?, profile_photo_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [full_name, profile_photo_url, req.user.id]
    );

    const user = await getQuery('SELECT id, email, username, full_name, profile_photo_url FROM users WHERE id = ?', [req.user.id]);
    res.json({ message: 'Profile updated', user });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: { message: 'Failed to update profile' } });
  }
});

// GET /api/v1/users/:userId - Get another user's profile
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const user = await getQuery(
      'SELECT id, username, full_name, profile_photo_url, created_at FROM users WHERE id = ? AND is_active = 1',
      [req.params.userId]
    );

    if (!user) {
      return res.status(404).json({ error: { message: 'User not found' } });
    }

    // Get post count, follower count, following count
    const [postCount, followerCount, followingCount, isFollowing] = await Promise.all([
      getQuery('SELECT COUNT(*) as count FROM posts WHERE user_id = ? AND is_deleted = 0', [user.id]),
      getQuery('SELECT COUNT(*) as count FROM follows WHERE followed_user_id = ?', [user.id]),
      getQuery('SELECT COUNT(*) as count FROM follows WHERE follower_user_id = ?', [user.id]),
      getQuery('SELECT * FROM follows WHERE follower_user_id = ? AND followed_user_id = ?', [req.user.id, user.id])
    ]);

    user.stats = {
      posts: postCount.count,
      followers: followerCount.count,
      following: followingCount.count
    };
    user.is_following = !!isFollowing;

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: { message: 'Failed to get user' } });
  }
});

// POST /api/v1/users/:userId/follow - Follow user
router.post('/:userId/follow', authenticateToken, async (req, res) => {
  try {
    if (req.user.id === req.params.userId) {
      return res.status(400).json({ error: { message: 'Cannot follow yourself' } });
    }

    const followId = uuidv4();
    await runQuery(
      'INSERT INTO follows (follow_id, follower_user_id, followed_user_id) VALUES (?, ?, ?)',
      [followId, req.user.id, req.params.userId]
    );

    res.json({ message: 'User followed successfully' });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint')) {
      return res.status(409).json({ error: { message: 'Already following this user' } });
    }
    console.error('Follow error:', error);
    res.status(500).json({ error: { message: 'Failed to follow user' } });
  }
});

// DELETE /api/v1/users/:userId/follow - Unfollow user
router.delete('/:userId/follow', authenticateToken, async (req, res) => {
  try {
    await runQuery(
      'DELETE FROM follows WHERE follower_user_id = ? AND followed_user_id = ?',
      [req.user.id, req.params.userId]
    );

    res.json({ message: 'User unfollowed successfully' });
  } catch (error) {
    console.error('Unfollow error:', error);
    res.status(500).json({ error: { message: 'Failed to unfollow user' } });
  }
});

module.exports = router;
