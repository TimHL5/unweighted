const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { runQuery, getQuery, allQuery } = require('../db/database');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// POST /api/v1/posts - Create new post
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      post_type, caption, media_urls, media_types,
      hashtags, mentions, tagged_recipe_id, tagged_workout_id,
      location, privacy
    } = req.body;

    const postId = uuidv4();

    await runQuery(
      `INSERT INTO posts (post_id, user_id, post_type, caption, media_urls, media_types, hashtags, mentions, tagged_recipe_id, tagged_workout_id, location, privacy)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        postId, req.user.id, post_type, caption,
        JSON.stringify(media_urls || []),
        JSON.stringify(media_types || []),
        JSON.stringify(hashtags || []),
        JSON.stringify(mentions || []),
        tagged_recipe_id, tagged_workout_id, location,
        privacy || 'public'
      ]
    );

    const post = await getQuery('SELECT * FROM posts WHERE post_id = ?', [postId]);
    res.status(201).json({ message: 'Post created', post });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: { message: 'Failed to create post' } });
  }
});

// GET /api/v1/posts/:postId - Get specific post
router.get('/:postId', authenticateToken, async (req, res) => {
  try {
    const post = await getQuery(
      `SELECT p.*, u.username, u.full_name, u.profile_photo_url
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.post_id = ? AND p.is_deleted = 0`,
      [req.params.postId]
    );

    if (!post) {
      return res.status(404).json({ error: { message: 'Post not found' } });
    }

    // Parse JSON fields
    if (post.media_urls) post.media_urls = JSON.parse(post.media_urls);
    if (post.media_types) post.media_types = JSON.parse(post.media_types);
    if (post.hashtags) post.hashtags = JSON.parse(post.hashtags);
    if (post.mentions) post.mentions = JSON.parse(post.mentions);

    // Check if current user liked this post
    const liked = await getQuery('SELECT * FROM likes WHERE post_id = ? AND user_id = ?', [post.post_id, req.user.id]);
    post.is_liked = !!liked;

    res.json({ post });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: { message: 'Failed to get post' } });
  }
});

// DELETE /api/v1/posts/:postId - Delete post
router.delete('/:postId', authenticateToken, async (req, res) => {
  try {
    const post = await getQuery('SELECT * FROM posts WHERE post_id = ? AND user_id = ?', [req.params.postId, req.user.id]);

    if (!post) {
      return res.status(404).json({ error: { message: 'Post not found or unauthorized' } });
    }

    await runQuery('UPDATE posts SET is_deleted = 1 WHERE post_id = ?', [req.params.postId]);
    res.json({ message: 'Post deleted' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: { message: 'Failed to delete post' } });
  }
});

// POST /api/v1/posts/:postId/like - Like a post
router.post('/:postId/like', authenticateToken, async (req, res) => {
  try {
    const likeId = uuidv4();

    await runQuery(
      'INSERT INTO likes (like_id, post_id, user_id) VALUES (?, ?, ?)',
      [likeId, req.params.postId, req.user.id]
    );

    // Increment like count
    await runQuery('UPDATE posts SET like_count = like_count + 1 WHERE post_id = ?', [req.params.postId]);

    res.json({ message: 'Post liked' });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint')) {
      return res.status(409).json({ error: { message: 'Already liked this post' } });
    }
    console.error('Like post error:', error);
    res.status(500).json({ error: { message: 'Failed to like post' } });
  }
});

// DELETE /api/v1/posts/:postId/like - Unlike a post
router.delete('/:postId/like', authenticateToken, async (req, res) => {
  try {
    await runQuery('DELETE FROM likes WHERE post_id = ? AND user_id = ?', [req.params.postId, req.user.id]);

    // Decrement like count
    await runQuery('UPDATE posts SET like_count = like_count - 1 WHERE post_id = ? AND like_count > 0', [req.params.postId]);

    res.json({ message: 'Post unliked' });
  } catch (error) {
    console.error('Unlike post error:', error);
    res.status(500).json({ error: { message: 'Failed to unlike post' } });
  }
});

// GET /api/v1/posts/:postId/likes - Get list of users who liked
router.get('/:postId/likes', authenticateToken, async (req, res) => {
  try {
    const likes = await allQuery(
      `SELECT l.*, u.username, u.full_name, u.profile_photo_url
       FROM likes l
       JOIN users u ON l.user_id = u.id
       WHERE l.post_id = ?
       ORDER BY l.created_at DESC`,
      [req.params.postId]
    );

    res.json({ likes });
  } catch (error) {
    console.error('Get likes error:', error);
    res.status(500).json({ error: { message: 'Failed to get likes' } });
  }
});

// POST /api/v1/posts/:postId/comments - Add comment
router.post('/:postId/comments', authenticateToken, async (req, res) => {
  try {
    const { comment_text, parent_comment_id } = req.body;

    if (!comment_text || comment_text.trim().length === 0) {
      return res.status(400).json({ error: { message: 'Comment text is required' } });
    }

    const commentId = uuidv4();

    await runQuery(
      'INSERT INTO comments (comment_id, post_id, user_id, parent_comment_id, comment_text) VALUES (?, ?, ?, ?, ?)',
      [commentId, req.params.postId, req.user.id, parent_comment_id, comment_text]
    );

    // Increment comment count
    await runQuery('UPDATE posts SET comment_count = comment_count + 1 WHERE post_id = ?', [req.params.postId]);

    const comment = await getQuery(
      `SELECT c.*, u.username, u.full_name, u.profile_photo_url
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.comment_id = ?`,
      [commentId]
    );

    res.status(201).json({ message: 'Comment added', comment });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: { message: 'Failed to add comment' } });
  }
});

// GET /api/v1/posts/:postId/comments - Get comments
router.get('/:postId/comments', authenticateToken, async (req, res) => {
  try {
    const comments = await allQuery(
      `SELECT c.*, u.username, u.full_name, u.profile_photo_url
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.post_id = ? AND c.is_deleted = 0
       ORDER BY c.created_at ASC`,
      [req.params.postId]
    );

    res.json({ comments });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: { message: 'Failed to get comments' } });
  }
});

// DELETE /api/v1/comments/:commentId - Delete comment
router.delete('/comments/:commentId', authenticateToken, async (req, res) => {
  try {
    const comment = await getQuery('SELECT * FROM comments WHERE comment_id = ? AND user_id = ?', [req.params.commentId, req.user.id]);

    if (!comment) {
      return res.status(404).json({ error: { message: 'Comment not found or unauthorized' } });
    }

    await runQuery('UPDATE comments SET is_deleted = 1 WHERE comment_id = ?', [req.params.commentId]);

    // Decrement comment count
    await runQuery('UPDATE posts SET comment_count = comment_count - 1 WHERE post_id = ? AND comment_count > 0', [comment.post_id]);

    res.json({ message: 'Comment deleted' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: { message: 'Failed to delete comment' } });
  }
});

module.exports = router;
