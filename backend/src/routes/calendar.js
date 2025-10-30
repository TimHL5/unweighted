const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { runQuery, getQuery, allQuery } = require('../db/database');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Note: In a real implementation, this would integrate with Google Calendar API and Apple Calendar
// For the prototype, we're creating a simple internal calendar system

// GET /api/v1/calendar/events - Get scheduled events
router.get('/events', authenticateToken, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    // Get workout schedule from active plan
    const activePlan = await getQuery(
      'SELECT * FROM workout_plans WHERE user_id = ? AND is_active = 1',
      [req.user.id]
    );

    const events = [];

    if (activePlan) {
      const schedule = await allQuery(
        `SELECT ws.*, w.workout_name, w.estimated_duration_min
         FROM weekly_schedules ws
         LEFT JOIN workouts w ON ws.workout_id = w.workout_id
         WHERE ws.plan_id = ?`,
        [activePlan.plan_id]
      );

      // Convert schedule to calendar events
      const today = new Date();
      schedule.forEach(item => {
        const eventDate = new Date(today);
        // Simple date calculation based on week and day
        const daysToAdd = (item.week_number - 1) * 7 + getDayNumber(item.day_of_week);
        eventDate.setDate(today.getDate() + daysToAdd);

        events.push({
          event_id: `workout_${item.schedule_id}`,
          event_type: item.is_rest_day ? 'rest' : 'workout',
          event_title: item.is_rest_day ? 'Rest Day' : item.workout_name,
          scheduled_at: eventDate.toISOString(),
          duration_minutes: item.estimated_duration_min || 45,
          related_workout_id: item.workout_id
        });
      });
    }

    // Get group check-ins
    const checkins = await allQuery(
      `SELECT gc.*, g.group_name
       FROM group_checkins gc
       JOIN groups g ON gc.group_id = g.group_id
       JOIN group_members gm ON g.group_id = gm.group_id
       WHERE gm.user_id = ? AND gm.status = 'active'`,
      [req.user.id]
    );

    checkins.forEach(checkin => {
      events.push({
        event_id: `checkin_${checkin.checkin_id}`,
        event_type: 'group_checkin',
        event_title: `${checkin.group_name} Check-in`,
        scheduled_at: checkin.scheduled_at,
        duration_minutes: checkin.duration_minutes,
        related_group_id: checkin.group_id
      });
    });

    // Sort events by date
    events.sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));

    res.json({ events });
  } catch (error) {
    console.error('Get calendar events error:', error);
    res.status(500).json({ error: { message: 'Failed to get calendar events' } });
  }
});

// Helper function to convert day name to number
function getDayNumber(dayName) {
  const days = { monday: 0, tuesday: 1, wednesday: 2, thursday: 3, friday: 4, saturday: 5, sunday: 6 };
  return days[dayName.toLowerCase()] || 0;
}

module.exports = router;
