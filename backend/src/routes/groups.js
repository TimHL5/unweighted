const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { runQuery, getQuery, allQuery } = require('../db/database');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// GET /api/v1/groups/suggested - Get suggested groups for matching
router.get('/suggested', authenticateToken, async (req, res) => {
  try {
    // Get user profile
    const profile = await getQuery('SELECT * FROM user_profiles WHERE user_id = ?', [req.user.id]);

    if (!profile) {
      return res.status(404).json({ error: { message: 'Please complete onboarding first' } });
    }

    // Find groups with similar goals and fitness levels that aren't full
    const groups = await allQuery(
      `SELECT g.*, COUNT(gm.membership_id) as member_count
       FROM groups g
       LEFT JOIN group_members gm ON g.group_id = gm.group_id AND gm.status = 'active'
       WHERE g.is_active = 1
         AND g.group_id NOT IN (SELECT group_id FROM group_members WHERE user_id = ?)
       GROUP BY g.group_id
       HAVING member_count < g.max_members
       LIMIT 10`,
      [req.user.id]
    );

    // Get member details for each group
    for (let group of groups) {
      const members = await allQuery(
        `SELECT u.id, u.username, u.full_name, u.profile_photo_url
         FROM group_members gm
         JOIN users u ON gm.user_id = u.id
         WHERE gm.group_id = ? AND gm.status = 'active'`,
        [group.group_id]
      );
      group.members = members;
    }

    res.json({ groups });
  } catch (error) {
    console.error('Get suggested groups error:', error);
    res.status(500).json({ error: { message: 'Failed to get suggested groups' } });
  }
});

// POST /api/v1/groups/create - Create custom group
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { group_name, group_type, max_members } = req.body;

    const groupId = uuidv4();
    await runQuery(
      `INSERT INTO groups (group_id, group_name, created_by_user_id, group_type, max_members)
       VALUES (?, ?, ?, ?, ?)`,
      [groupId, group_name, req.user.id, group_type || 'custom', max_members || 4]
    );

    // Add creator as admin member
    const membershipId = uuidv4();
    await runQuery(
      `INSERT INTO group_members (membership_id, group_id, user_id, role)
       VALUES (?, ?, ?, 'admin')`,
      [membershipId, groupId, req.user.id]
    );

    const group = await getQuery('SELECT * FROM groups WHERE group_id = ?', [groupId]);
    res.status(201).json({ message: 'Group created', group });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ error: { message: 'Failed to create group' } });
  }
});

// POST /api/v1/groups/join/:groupId - Request to join group
router.post('/join/:groupId', authenticateToken, async (req, res) => {
  try {
    // Check if group exists and has space
    const group = await getQuery('SELECT * FROM groups WHERE group_id = ? AND is_active = 1', [req.params.groupId]);

    if (!group) {
      return res.status(404).json({ error: { message: 'Group not found' } });
    }

    const memberCount = await getQuery('SELECT COUNT(*) as count FROM group_members WHERE group_id = ? AND status = ?', [req.params.groupId, 'active']);

    if (memberCount.count >= group.max_members) {
      return res.status(400).json({ error: { message: 'Group is full' } });
    }

    // Add user to group (auto-approve for prototype)
    const membershipId = uuidv4();
    await runQuery(
      `INSERT INTO group_members (membership_id, group_id, user_id, status, role)
       VALUES (?, ?, ?, 'active', 'member')`,
      [membershipId, req.params.groupId, req.user.id]
    );

    res.json({ message: 'Joined group successfully' });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint')) {
      return res.status(409).json({ error: { message: 'Already a member of this group' } });
    }
    console.error('Join group error:', error);
    res.status(500).json({ error: { message: 'Failed to join group' } });
  }
});

// GET /api/v1/groups/my-groups - Get user's groups
router.get('/my-groups', authenticateToken, async (req, res) => {
  try {
    const groups = await allQuery(
      `SELECT g.*, gm.role
       FROM groups g
       JOIN group_members gm ON g.group_id = gm.group_id
       WHERE gm.user_id = ? AND gm.status = 'active' AND g.is_active = 1`,
      [req.user.id]
    );

    // Get members for each group
    for (let group of groups) {
      const members = await allQuery(
        `SELECT u.id, u.username, u.full_name, u.profile_photo_url, gm.role
         FROM group_members gm
         JOIN users u ON gm.user_id = u.id
         WHERE gm.group_id = ? AND gm.status = 'active'`,
        [group.group_id]
      );
      group.members = members;
    }

    res.json({ groups });
  } catch (error) {
    console.error('Get my groups error:', error);
    res.status(500).json({ error: { message: 'Failed to get groups' } });
  }
});

// GET /api/v1/groups/:groupId - Get group details
router.get('/:groupId', authenticateToken, async (req, res) => {
  try {
    const group = await getQuery('SELECT * FROM groups WHERE group_id = ? AND is_active = 1', [req.params.groupId]);

    if (!group) {
      return res.status(404).json({ error: { message: 'Group not found' } });
    }

    // Check if user is a member
    const membership = await getQuery(
      'SELECT * FROM group_members WHERE group_id = ? AND user_id = ? AND status = ?',
      [req.params.groupId, req.user.id, 'active']
    );

    if (!membership) {
      return res.status(403).json({ error: { message: 'Not a member of this group' } });
    }

    // Get all members
    const members = await allQuery(
      `SELECT u.id, u.username, u.full_name, u.profile_photo_url, gm.role, gm.joined_at
       FROM group_members gm
       JOIN users u ON gm.user_id = u.id
       WHERE gm.group_id = ? AND gm.status = 'active'`,
      [req.params.groupId]
    );

    group.members = members;
    group.user_role = membership.role;

    res.json({ group });
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({ error: { message: 'Failed to get group' } });
  }
});

// DELETE /api/v1/groups/:groupId/leave - Leave group
router.delete('/:groupId/leave', authenticateToken, async (req, res) => {
  try {
    await runQuery(
      'UPDATE group_members SET status = ? WHERE group_id = ? AND user_id = ?',
      ['left', req.params.groupId, req.user.id]
    );

    res.json({ message: 'Left group successfully' });
  } catch (error) {
    console.error('Leave group error:', error);
    res.status(500).json({ error: { message: 'Failed to leave group' } });
  }
});

// GET /api/v1/groups/:groupId/messages - Get chat messages
router.get('/:groupId/messages', authenticateToken, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    // Verify membership
    const membership = await getQuery(
      'SELECT * FROM group_members WHERE group_id = ? AND user_id = ? AND status = ?',
      [req.params.groupId, req.user.id, 'active']
    );

    if (!membership) {
      return res.status(403).json({ error: { message: 'Not a member of this group' } });
    }

    const messages = await allQuery(
      `SELECT m.*, u.username, u.full_name, u.profile_photo_url
       FROM group_chat_messages m
       JOIN users u ON m.sender_user_id = u.id
       WHERE m.group_id = ? AND m.is_deleted = 0
       ORDER BY m.created_at DESC
       LIMIT ? OFFSET ?`,
      [req.params.groupId, parseInt(limit), parseInt(offset)]
    );

    res.json({ messages: messages.reverse() });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: { message: 'Failed to get messages' } });
  }
});

// POST /api/v1/groups/:groupId/messages - Send message
router.post('/:groupId/messages', authenticateToken, async (req, res) => {
  try {
    const { message_text, media_url, replied_to_message_id } = req.body;

    // Verify membership
    const membership = await getQuery(
      'SELECT * FROM group_members WHERE group_id = ? AND user_id = ? AND status = ?',
      [req.params.groupId, req.user.id, 'active']
    );

    if (!membership) {
      return res.status(403).json({ error: { message: 'Not a member of this group' } });
    }

    const messageId = uuidv4();
    await runQuery(
      `INSERT INTO group_chat_messages (message_id, group_id, sender_user_id, message_text, media_url, replied_to_message_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [messageId, req.params.groupId, req.user.id, message_text, media_url, replied_to_message_id]
    );

    const message = await getQuery(
      `SELECT m.*, u.username, u.full_name, u.profile_photo_url
       FROM group_chat_messages m
       JOIN users u ON m.sender_user_id = u.id
       WHERE m.message_id = ?`,
      [messageId]
    );

    res.status(201).json({ message: 'Message sent', data: message });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: { message: 'Failed to send message' } });
  }
});

// GET /api/v1/groups/:groupId/checkins - Get scheduled check-ins
router.get('/:groupId/checkins', authenticateToken, async (req, res) => {
  try {
    const checkins = await allQuery(
      'SELECT * FROM group_checkins WHERE group_id = ? ORDER BY scheduled_at DESC',
      [req.params.groupId]
    );

    res.json({ checkins });
  } catch (error) {
    console.error('Get checkins error:', error);
    res.status(500).json({ error: { message: 'Failed to get check-ins' } });
  }
});

// POST /api/v1/groups/:groupId/checkins - Schedule new check-in
router.post('/:groupId/checkins', authenticateToken, async (req, res) => {
  try {
    const { scheduled_at, duration_minutes } = req.body;

    const checkinId = uuidv4();
    await runQuery(
      `INSERT INTO group_checkins (checkin_id, group_id, scheduled_at, duration_minutes)
       VALUES (?, ?, ?, ?)`,
      [checkinId, req.params.groupId, scheduled_at, duration_minutes || 30]
    );

    const checkin = await getQuery('SELECT * FROM group_checkins WHERE checkin_id = ?', [checkinId]);
    res.status(201).json({ message: 'Check-in scheduled', checkin });
  } catch (error) {
    console.error('Schedule checkin error:', error);
    res.status(500).json({ error: { message: 'Failed to schedule check-in' } });
  }
});

module.exports = router;
