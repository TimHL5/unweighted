const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { runQuery, getQuery, allQuery } = require('../db/database');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// POST /api/v1/progress/weight - Log weight
router.post('/weight', authenticateToken, async (req, res) => {
  try {
    const { weight_value, weight_unit, log_date, note, photo_url } = req.body;

    const logId = uuidv4();
    await runQuery(
      `INSERT INTO weight_logs (log_id, user_id, weight_value, weight_unit, log_date, note, photo_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [logId, req.user.id, weight_value, weight_unit || 'lbs', log_date || new Date().toISOString().split('T')[0], note, photo_url]
    );

    const log = await getQuery('SELECT * FROM weight_logs WHERE log_id = ?', [logId]);
    res.status(201).json({ message: 'Weight logged', log });
  } catch (error) {
    console.error('Log weight error:', error);
    res.status(500).json({ error: { message: 'Failed to log weight' } });
  }
});

// GET /api/v1/progress/weight - Get weight history
router.get('/weight', authenticateToken, async (req, res) => {
  try {
    const { limit = 100 } = req.query;

    const logs = await allQuery(
      'SELECT * FROM weight_logs WHERE user_id = ? ORDER BY log_date DESC, created_at DESC LIMIT ?',
      [req.user.id, parseInt(limit)]
    );

    res.json({ logs });
  } catch (error) {
    console.error('Get weight logs error:', error);
    res.status(500).json({ error: { message: 'Failed to get weight logs' } });
  }
});

// POST /api/v1/progress/measurements - Log body measurements
router.post('/measurements', authenticateToken, async (req, res) => {
  try {
    const {
      measurement_date, neck_inches, chest_inches, waist_inches,
      hips_inches, thigh_inches, arm_inches, body_fat_percent,
      front_photo_url, side_photo_url, back_photo_url
    } = req.body;

    const measurementId = uuidv4();
    await runQuery(
      `INSERT INTO body_measurements (
        measurement_id, user_id, measurement_date, neck_inches, chest_inches,
        waist_inches, hips_inches, thigh_inches, arm_inches, body_fat_percent,
        front_photo_url, side_photo_url, back_photo_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        measurementId, req.user.id, measurement_date || new Date().toISOString().split('T')[0],
        neck_inches, chest_inches, waist_inches, hips_inches, thigh_inches,
        arm_inches, body_fat_percent, front_photo_url, side_photo_url, back_photo_url
      ]
    );

    const measurement = await getQuery('SELECT * FROM body_measurements WHERE measurement_id = ?', [measurementId]);
    res.status(201).json({ message: 'Measurements logged', measurement });
  } catch (error) {
    console.error('Log measurements error:', error);
    res.status(500).json({ error: { message: 'Failed to log measurements' } });
  }
});

// GET /api/v1/progress/measurements - Get measurement history
router.get('/measurements', authenticateToken, async (req, res) => {
  try {
    const measurements = await allQuery(
      'SELECT * FROM body_measurements WHERE user_id = ? ORDER BY measurement_date DESC',
      [req.user.id]
    );

    res.json({ measurements });
  } catch (error) {
    console.error('Get measurements error:', error);
    res.status(500).json({ error: { message: 'Failed to get measurements' } });
  }
});

// POST /api/v1/progress/checkin - Daily check-in
router.post('/checkin', authenticateToken, async (req, res) => {
  try {
    const { checkin_date, energy_level, mood, sleep_hours, sleep_quality, stress_level, journal_entry } = req.body;

    const checkinId = uuidv4();
    await runQuery(
      `INSERT INTO daily_checkins (checkin_id, user_id, checkin_date, energy_level, mood, sleep_hours, sleep_quality, stress_level, journal_entry)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [checkinId, req.user.id, checkin_date || new Date().toISOString().split('T')[0], energy_level, mood, sleep_hours, sleep_quality, stress_level, journal_entry]
    );

    const checkin = await getQuery('SELECT * FROM daily_checkins WHERE checkin_id = ?', [checkinId]);
    res.status(201).json({ message: 'Check-in logged', checkin });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint')) {
      // Update existing check-in for today
      await runQuery(
        `UPDATE daily_checkins SET energy_level = ?, mood = ?, sleep_hours = ?, sleep_quality = ?, stress_level = ?, journal_entry = ?
         WHERE user_id = ? AND checkin_date = ?`,
        [energy_level, mood, sleep_hours, sleep_quality, stress_level, journal_entry, req.user.id, checkin_date || new Date().toISOString().split('T')[0]]
      );

      const checkin = await getQuery('SELECT * FROM daily_checkins WHERE user_id = ? AND checkin_date = ?', [req.user.id, checkin_date || new Date().toISOString().split('T')[0]]);
      return res.json({ message: 'Check-in updated', checkin });
    }

    console.error('Log checkin error:', error);
    res.status(500).json({ error: { message: 'Failed to log check-in' } });
  }
});

// GET /api/v1/progress/checkin - Get check-in history
router.get('/checkin', authenticateToken, async (req, res) => {
  try {
    const { limit = 30 } = req.query;

    const checkins = await allQuery(
      'SELECT * FROM daily_checkins WHERE user_id = ? ORDER BY checkin_date DESC LIMIT ?',
      [req.user.id, parseInt(limit)]
    );

    res.json({ checkins });
  } catch (error) {
    console.error('Get checkins error:', error);
    res.status(500).json({ error: { message: 'Failed to get check-ins' } });
  }
});

// GET /api/v1/progress/dashboard - Get progress dashboard data
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    // Get user profile for goal weight
    const profile = await getQuery('SELECT * FROM user_profiles WHERE user_id = ?', [req.user.id]);

    // Get latest weight
    const latestWeight = await getQuery(
      'SELECT * FROM weight_logs WHERE user_id = ? ORDER BY log_date DESC, created_at DESC LIMIT 1',
      [req.user.id]
    );

    // Get weight progress (all logs)
    const weightHistory = await allQuery(
      'SELECT weight_value, log_date FROM weight_logs WHERE user_id = ? ORDER BY log_date ASC',
      [req.user.id]
    );

    // Get workout stats
    const workoutStats = await getQuery(
      `SELECT COUNT(*) as total_workouts,
        SUM(duration_minutes) as total_minutes
       FROM workout_completions
       WHERE user_id = ?`,
      [req.user.id]
    );

    // Get this week's workout count
    const thisWeekWorkouts = await getQuery(
      `SELECT COUNT(*) as count
       FROM workout_completions
       WHERE user_id = ?
         AND completed_at >= date('now', '-7 days')`,
      [req.user.id]
    );

    // Get meal completion count
    const mealStats = await getQuery(
      'SELECT COUNT(*) as total_meals FROM meal_completions WHERE user_id = ?',
      [req.user.id]
    );

    // Get achievements count
    const achievementCount = await getQuery(
      'SELECT COUNT(*) as count FROM user_achievements WHERE user_id = ?',
      [req.user.id]
    );

    // Calculate weight lost
    let weightLost = 0;
    if (profile && latestWeight && weightHistory.length > 0) {
      const startWeight = weightHistory[0].weight_value;
      const currentWeight = latestWeight.weight_value;
      weightLost = startWeight - currentWeight;
    }

    res.json({
      profile: {
        current_weight: latestWeight?.weight_value,
        goal_weight: profile?.goal_weight,
        weight_lost: weightLost
      },
      weight_history: weightHistory,
      workouts: {
        total: workoutStats?.total_workouts || 0,
        this_week: thisWeekWorkouts?.count || 0,
        total_minutes: workoutStats?.total_minutes || 0
      },
      meals: {
        total: mealStats?.total_meals || 0
      },
      achievements: achievementCount?.count || 0
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: { message: 'Failed to get dashboard data' } });
  }
});

// GET /api/v1/progress/insights - Get auto-generated insights
router.get('/insights', authenticateToken, async (req, res) => {
  try {
    const insights = [];

    // Get user profile
    const profile = await getQuery('SELECT * FROM user_profiles WHERE user_id = ?', [req.user.id]);

    // Get workout count
    const workoutCount = await getQuery(
      'SELECT COUNT(*) as count FROM workout_completions WHERE user_id = ?',
      [req.user.id]
    );

    if (workoutCount.count >= 10) {
      insights.push({
        type: 'achievement',
        message: `You've completed ${workoutCount.count} workouts! Keep up the amazing work! 💪`
      });
    }

    // Get weight progress
    const weightLogs = await allQuery(
      'SELECT * FROM weight_logs WHERE user_id = ? ORDER BY log_date ASC',
      [req.user.id]
    );

    if (weightLogs.length >= 2) {
      const startWeight = weightLogs[0].weight_value;
      const latestWeight = weightLogs[weightLogs.length - 1].weight_value;
      const weightLost = startWeight - latestWeight;

      if (weightLost > 0) {
        const percentageToGoal = profile ? ((startWeight - latestWeight) / (startWeight - profile.goal_weight) * 100) : 0;
        insights.push({
          type: 'progress',
          message: `You've lost ${weightLost.toFixed(1)} lbs! That's ${percentageToGoal.toFixed(0)}% towards your goal! 🎯`
        });
      }
    }

    // Check consistency
    const recentWorkouts = await getQuery(
      'SELECT COUNT(*) as count FROM workout_completions WHERE user_id = ? AND completed_at >= date(\'now\', \'-30 days\')',
      [req.user.id]
    );

    if (recentWorkouts.count >= 12) {
      insights.push({
        type: 'consistency',
        message: 'Your consistency this month is outstanding! You completed ' + recentWorkouts.count + ' workouts. 🔥'
      });
    }

    res.json({ insights });
  } catch (error) {
    console.error('Get insights error:', error);
    res.status(500).json({ error: { message: 'Failed to get insights' } });
  }
});

module.exports = router;
