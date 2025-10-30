const express = require('express');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { allQuery, getQuery } = require('../db/database');

const router = express.Router();

// GET /api/v1/feed - Get main feed posts
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    // Get posts from followed users and public posts
    const posts = await allQuery(
      `SELECT DISTINCT p.*, u.username, u.full_name, u.profile_photo_url,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.post_id) as like_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.post_id AND is_deleted = 0) as comment_count,
        EXISTS(SELECT 1 FROM likes WHERE post_id = p.post_id AND user_id = ?) as is_liked
       FROM posts p
       JOIN users u ON p.user_id = u.id
       LEFT JOIN follows f ON p.user_id = f.followed_user_id AND f.follower_user_id = ?
       WHERE p.is_deleted = 0
         AND (p.privacy = 'public' OR p.user_id = ? OR f.follower_user_id = ?)
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [req.user.id, req.user.id, req.user.id, req.user.id, parseInt(limit), parseInt(offset)]
    );

    // Parse JSON fields
    posts.forEach(post => {
      if (post.media_urls) post.media_urls = JSON.parse(post.media_urls);
      if (post.media_types) post.media_types = JSON.parse(post.media_types);
      if (post.hashtags) post.hashtags = JSON.parse(post.hashtags);
      if (post.mentions) post.mentions = JSON.parse(post.mentions);
    });

    res.json({ posts, count: posts.length });
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ error: { message: 'Failed to get feed' } });
  }
});

// GET /api/v1/feed/following - Get posts from followed users only
router.get('/following', authenticateToken, async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const posts = await allQuery(
      `SELECT p.*, u.username, u.full_name, u.profile_photo_url,
        EXISTS(SELECT 1 FROM likes WHERE post_id = p.post_id AND user_id = ?) as is_liked
       FROM posts p
       JOIN users u ON p.user_id = u.id
       JOIN follows f ON p.user_id = f.followed_user_id
       WHERE f.follower_user_id = ?
         AND p.is_deleted = 0
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [req.user.id, req.user.id, parseInt(limit), parseInt(offset)]
    );

    posts.forEach(post => {
      if (post.media_urls) post.media_urls = JSON.parse(post.media_urls);
      if (post.media_types) post.media_types = JSON.parse(post.media_types);
      if (post.hashtags) post.hashtags = JSON.parse(post.hashtags);
      if (post.mentions) post.mentions = JSON.parse(post.mentions);
    });

    res.json({ posts, count: posts.length });
  } catch (error) {
    console.error('Get following feed error:', error);
    res.status(500).json({ error: { message: 'Failed to get following feed' } });
  }
});

// GET /api/v1/feed/group/:groupId - Get posts from group members
router.get('/group/:groupId', authenticateToken, async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    // Verify user is a member of the group
    const membership = await getQuery(
      'SELECT * FROM group_members WHERE group_id = ? AND user_id = ? AND status = ?',
      [req.params.groupId, req.user.id, 'active']
    );

    if (!membership) {
      return res.status(403).json({ error: { message: 'Not a member of this group' } });
    }

    const posts = await allQuery(
      `SELECT p.*, u.username, u.full_name, u.profile_photo_url,
        EXISTS(SELECT 1 FROM likes WHERE post_id = p.post_id AND user_id = ?) as is_liked
       FROM posts p
       JOIN users u ON p.user_id = u.id
       JOIN group_members gm ON p.user_id = gm.user_id
       WHERE gm.group_id = ?
         AND gm.status = 'active'
         AND p.is_deleted = 0
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [req.user.id, req.params.groupId, parseInt(limit), parseInt(offset)]
    );

    posts.forEach(post => {
      if (post.media_urls) post.media_urls = JSON.parse(post.media_urls);
      if (post.media_types) post.media_types = JSON.parse(post.media_types);
      if (post.hashtags) post.hashtags = JSON.parse(post.hashtags);
      if (post.mentions) post.mentions = JSON.parse(post.mentions);
    });

    res.json({ posts, count: posts.length });
  } catch (error) {
    console.error('Get group feed error:', error);
    res.status(500).json({ error: { message: 'Failed to get group feed' } });
  }
});

// GET /api/v1/feed/explore - Get explore/trending posts
router.get('/explore', optionalAuth, async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    // Get public posts ordered by engagement (likes + comments)
    const posts = await allQuery(
      `SELECT p.*, u.username, u.full_name, u.profile_photo_url,
        (p.like_count + p.comment_count) as engagement_score
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.is_deleted = 0 AND p.privacy = 'public'
       ORDER BY engagement_score DESC, p.created_at DESC
       LIMIT ? OFFSET ?`,
      [parseInt(limit), parseInt(offset)]
    );

    posts.forEach(post => {
      if (post.media_urls) post.media_urls = JSON.parse(post.media_urls);
      if (post.media_types) post.media_types = JSON.parse(post.media_types);
      if (post.hashtags) post.hashtags = JSON.parse(post.hashtags);
      if (post.mentions) post.mentions = JSON.parse(post.mentions);

      // Check if current user liked (if authenticated)
      if (req.user) {
        getQuery('SELECT * FROM likes WHERE post_id = ? AND user_id = ?', [post.post_id, req.user.id])
          .then(liked => { post.is_liked = !!liked; });
      } else {
        post.is_liked = false;
      }
    });

    res.json({ posts, count: posts.length });
  } catch (error) {
    console.error('Get explore feed error:', error);
    res.status(500).json({ error: { message: 'Failed to get explore feed' } });
  }
});

// GET /api/v1/feed/user/:userId - Get user's posts
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const posts = await allQuery(
      `SELECT p.*, u.username, u.full_name, u.profile_photo_url,
        EXISTS(SELECT 1 FROM likes WHERE post_id = p.post_id AND user_id = ?) as is_liked
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.user_id = ?
         AND p.is_deleted = 0
         AND (p.privacy = 'public' OR p.user_id = ?)
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [req.user.id, req.params.userId, req.user.id, parseInt(limit), parseInt(offset)]
    );

    posts.forEach(post => {
      if (post.media_urls) post.media_urls = JSON.parse(post.media_urls);
      if (post.media_types) post.media_types = JSON.parse(post.media_types);
      if (post.hashtags) post.hashtags = JSON.parse(post.hashtags);
      if (post.mentions) post.mentions = JSON.parse(post.mentions);
    });

    res.json({ posts, count: posts.length });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ error: { message: 'Failed to get user posts' } });
  }
});

module.exports = router;
