const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { runQuery, getQuery } = require('../db/database');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// POST /api/v1/onboarding/profile - Submit onboarding questionnaire
router.post('/profile', authenticateToken, [
  body('current_weight').isFloat({ min: 50 }),
  body('goal_weight').isFloat({ min: 50 }),
  body('height').isFloat({ min: 48 }),
  body('fitness_level').isIn(['beginner', 'intermediate', 'advanced']),
  body('primary_goal').isIn(['lose_weight', 'build_muscle', 'improve_fitness', 'maintain']),
  body('equipment_access').isIn(['full_gym', 'home_gym', 'bodyweight'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: { message: 'Validation failed', errors: errors.array() } });
    }

    const {
      current_weight, goal_weight, height, weight_unit, height_unit,
      fitness_level, primary_goal, target_timeline, workout_types,
      equipment_access, workout_duration_pref, dietary_restrictions,
      food_allergies, meals_per_day, cooking_skill, meal_prep_time,
      wake_time, bed_time, preferred_workout_time, work_schedule,
      attempts_count, past_barriers, motivation_note
    } = req.body;

    // Check if profile already exists
    const existing = await getQuery('SELECT user_id FROM user_profiles WHERE user_id = ?', [req.user.id]);

    if (existing) {
      // Update existing profile
      await runQuery(
        `UPDATE user_profiles SET
          current_weight = ?, goal_weight = ?, height = ?, weight_unit = ?, height_unit = ?,
          fitness_level = ?, primary_goal = ?, target_timeline = ?, workout_types = ?,
          equipment_access = ?, workout_duration_pref = ?, dietary_restrictions = ?,
          food_allergies = ?, meals_per_day = ?, cooking_skill = ?, meal_prep_time = ?,
          wake_time = ?, bed_time = ?, preferred_workout_time = ?, work_schedule = ?,
          attempts_count = ?, past_barriers = ?, motivation_note = ?, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ?`,
        [
          current_weight, goal_weight, height, weight_unit || 'lbs', height_unit || 'ft',
          fitness_level, primary_goal, target_timeline, JSON.stringify(workout_types),
          equipment_access, workout_duration_pref, JSON.stringify(dietary_restrictions),
          food_allergies, meals_per_day, cooking_skill, meal_prep_time,
          wake_time, bed_time, preferred_workout_time, work_schedule,
          attempts_count, JSON.stringify(past_barriers), motivation_note,
          req.user.id
        ]
      );
    } else {
      // Create new profile
      await runQuery(
        `INSERT INTO user_profiles (
          user_id, current_weight, goal_weight, height, weight_unit, height_unit,
          fitness_level, primary_goal, target_timeline, workout_types,
          equipment_access, workout_duration_pref, dietary_restrictions,
          food_allergies, meals_per_day, cooking_skill, meal_prep_time,
          wake_time, bed_time, preferred_workout_time, work_schedule,
          attempts_count, past_barriers, motivation_note
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.user.id, current_weight, goal_weight, height, weight_unit || 'lbs', height_unit || 'ft',
          fitness_level, primary_goal, target_timeline, JSON.stringify(workout_types),
          equipment_access, workout_duration_pref, JSON.stringify(dietary_restrictions),
          food_allergies, meals_per_day, cooking_skill, meal_prep_time,
          wake_time, bed_time, preferred_workout_time, work_schedule,
          attempts_count, JSON.stringify(past_barriers), motivation_note
        ]
      );
    }

    const profile = await getQuery('SELECT * FROM user_profiles WHERE user_id = ?', [req.user.id]);

    // Parse JSON fields
    if (profile.workout_types) profile.workout_types = JSON.parse(profile.workout_types);
    if (profile.dietary_restrictions) profile.dietary_restrictions = JSON.parse(profile.dietary_restrictions);
    if (profile.past_barriers) profile.past_barriers = JSON.parse(profile.past_barriers);

    res.json({ message: 'Profile saved successfully', profile });
  } catch (error) {
    console.error('Onboarding error:', error);
    res.status(500).json({ error: { message: 'Failed to save profile' } });
  }
});

// GET /api/v1/onboarding/profile - Get user's profile data
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const profile = await getQuery('SELECT * FROM user_profiles WHERE user_id = ?', [req.user.id]);

    if (!profile) {
      return res.status(404).json({ error: { message: 'Profile not found' } });
    }

    // Parse JSON fields
    if (profile.workout_types) profile.workout_types = JSON.parse(profile.workout_types);
    if (profile.dietary_restrictions) profile.dietary_restrictions = JSON.parse(profile.dietary_restrictions);
    if (profile.past_barriers) profile.past_barriers = JSON.parse(profile.past_barriers);

    res.json({ profile });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: { message: 'Failed to get profile' } });
  }
});

module.exports = router;
