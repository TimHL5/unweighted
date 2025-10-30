const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { runQuery, getQuery, allQuery } = require('../db/database');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Workout plan generator helper
async function generateWorkoutPlan(userId, profile) {
  const { fitness_level, primary_goal, equipment_access, workout_duration_pref } = profile;

  // Determine workouts per week based on fitness level
  const workoutsPerWeek = {
    beginner: 4,
    intermediate: 5,
    advanced: 6
  }[fitness_level] || 4;

  // Create plan
  const planId = uuidv4();
  const planName = `${fitness_level.charAt(0).toUpperCase() + fitness_level.slice(1)} ${primary_goal.replace('_', ' ')} Plan`;

  await runQuery(
    `INSERT INTO workout_plans (plan_id, user_id, plan_name, plan_duration_weeks, workouts_per_week, difficulty_level, primary_goal, is_active)
     VALUES (?, ?, ?, 4, ?, ?, ?, 0)`,
    [planId, userId, planName, workoutsPerWeek, fitness_level, primary_goal]
  );

  // Generate workout templates based on fitness level and goal
  const workoutTemplates = getWorkoutTemplates(fitness_level, primary_goal, equipment_access);

  // Create weekly schedule (4 weeks)
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  for (let week = 1; week <= 4; week++) {
    let workoutCount = 0;
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const scheduleId = uuidv4();
      const day = days[dayIndex];

      // Distribute workouts throughout the week
      const shouldWorkout = workoutCount < workoutsPerWeek && (
        (fitness_level === 'beginner' && [0, 2, 4, 6].includes(dayIndex)) ||
        (fitness_level === 'intermediate' && [0, 1, 3, 4, 6].includes(dayIndex)) ||
        (fitness_level === 'advanced' && dayIndex < 6)
      );

      if (shouldWorkout && workoutTemplates.length > 0) {
        const workout = workoutTemplates[workoutCount % workoutTemplates.length];
        const workoutId = await createWorkout(workout);

        await runQuery(
          `INSERT INTO weekly_schedules (schedule_id, plan_id, week_number, day_of_week, workout_id, is_rest_day)
           VALUES (?, ?, ?, ?, ?, 0)`,
          [scheduleId, planId, week, day, workoutId]
        );

        workoutCount++;
      } else {
        // Rest day
        await runQuery(
          `INSERT INTO weekly_schedules (schedule_id, plan_id, week_number, day_of_week, workout_id, is_rest_day)
           VALUES (?, ?, ?, ?, NULL, 1)`,
          [scheduleId, planId, week, day]
        );
      }
    }
  }

  return planId;
}

// Create workout from template
async function createWorkout(template) {
  const workoutId = uuidv4();

  await runQuery(
    `INSERT INTO workouts (workout_id, workout_name, workout_type, description, estimated_duration_min, difficulty_level, equipment_needed)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [workoutId, template.name, template.type, template.description, template.duration, template.difficulty, JSON.stringify(template.equipment)]
  );

  // Add exercises
  for (let i = 0; i < template.exercises.length; i++) {
    const exercise = template.exercises[i];
    const exerciseId = uuidv4();

    await runQuery(
      `INSERT INTO workout_exercises (id, workout_id, exercise_order, exercise_name, sets, reps, duration_seconds, rest_seconds, form_tip, video_url, alternative_exercise)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [exerciseId, workoutId, i + 1, exercise.name, exercise.sets, exercise.reps, exercise.duration, exercise.rest, exercise.tip, exercise.video, exercise.alternative]
    );
  }

  return workoutId;
}

// Workout templates
function getWorkoutTemplates(fitness_level, primary_goal, equipment_access) {
  const templates = [];

  if (fitness_level === 'beginner') {
    templates.push({
      name: 'Full Body Strength',
      type: 'Strength',
      description: 'Complete full body workout focusing on major muscle groups',
      duration: 40,
      difficulty: 'beginner',
      equipment: equipment_access === 'bodyweight' ? [] : ['dumbbells'],
      exercises: [
        { name: 'Bodyweight Squats', sets: 3, reps: 12, rest: 60, tip: 'Keep chest up, knees tracking over toes', video: null, alternative: 'Wall Squats' },
        { name: 'Push-ups', sets: 3, reps: 10, rest: 60, tip: 'Keep core tight, elbows at 45 degrees', video: null, alternative: 'Knee Push-ups' },
        { name: 'Dumbbell Rows', sets: 3, reps: 12, rest: 60, tip: 'Pull elbow back, squeeze shoulder blade', video: null, alternative: 'Superman Holds' },
        { name: 'Plank', sets: 3, duration: 30, rest: 60, tip: 'Keep body in straight line', video: null, alternative: 'Knee Plank' },
        { name: 'Lunges', sets: 3, reps: 10, rest: 60, tip: 'Keep front knee over ankle', video: null, alternative: 'Split Squats' }
      ]
    });

    templates.push({
      name: 'Cardio & Core',
      type: 'Cardio',
      description: 'Heart rate boosting cardio with core strengthening',
      duration: 30,
      difficulty: 'beginner',
      equipment: [],
      exercises: [
        { name: 'Jumping Jacks', sets: 3, duration: 60, rest: 30, tip: 'Land softly', video: null, alternative: 'Step Jacks' },
        { name: 'High Knees', sets: 3, duration: 45, rest: 30, tip: 'Drive knees to chest height', video: null, alternative: 'Marching' },
        { name: 'Mountain Climbers', sets: 3, duration: 30, rest: 30, tip: 'Keep hips level', video: null, alternative: 'Slow Mountain Climbers' },
        { name: 'Bicycle Crunches', sets: 3, reps: 20, rest: 30, tip: 'Rotate torso, bring opposite elbow to knee', video: null, alternative: 'Regular Crunches' },
        { name: 'Burpees', sets: 3, reps: 8, rest: 60, tip: 'Pace yourself', video: null, alternative: 'Step-back Burpees' }
      ]
    });
  } else if (fitness_level === 'intermediate') {
    templates.push({
      name: 'Upper Body Power',
      type: 'Strength',
      description: 'Challenging upper body workout',
      duration: 50,
      difficulty: 'intermediate',
      equipment: equipment_access === 'bodyweight' ? [] : ['dumbbells', 'bench'],
      exercises: [
        { name: 'Dumbbell Bench Press', sets: 4, reps: 10, rest: 90, tip: 'Lower to chest level, press up explosively', video: null, alternative: 'Push-ups' },
        { name: 'Pull-ups', sets: 4, reps: 8, rest: 90, tip: 'Full range of motion', video: null, alternative: 'Assisted Pull-ups' },
        { name: 'Overhead Press', sets: 4, reps: 10, rest: 90, tip: 'Press straight overhead', video: null, alternative: 'Pike Push-ups' },
        { name: 'Dips', sets: 3, reps: 12, rest: 60, tip: 'Lean forward for chest emphasis', video: null, alternative: 'Bench Dips' },
        { name: 'Bicep Curls', sets: 3, reps: 12, rest: 60, tip: 'Control the weight', video: null, alternative: 'Resistance Band Curls' }
      ]
    });

    templates.push({
      name: 'Lower Body Blast',
      type: 'Strength',
      description: 'Intense lower body training',
      duration: 50,
      difficulty: 'intermediate',
      equipment: equipment_access === 'bodyweight' ? [] : ['dumbbells', 'barbell'],
      exercises: [
        { name: 'Goblet Squats', sets: 4, reps: 12, rest: 90, tip: 'Hold weight at chest', video: null, alternative: 'Bodyweight Squats' },
        { name: 'Romanian Deadlifts', sets: 4, reps: 10, rest: 90, tip: 'Hinge at hips, keep back straight', video: null, alternative: 'Single Leg RDL' },
        { name: 'Walking Lunges', sets: 3, reps: 20, rest: 60, tip: 'Take controlled steps', video: null, alternative: 'Static Lunges' },
        { name: 'Bulgarian Split Squats', sets: 3, reps: 10, rest: 60, tip: 'Rear foot elevated', video: null, alternative: 'Reverse Lunges' },
        { name: 'Calf Raises', sets: 3, reps: 15, rest: 60, tip: 'Full range of motion', video: null, alternative: 'Single Leg Calf Raises' }
      ]
    });
  } else { // advanced
    templates.push({
      name: 'Power & Strength',
      type: 'Strength',
      description: 'Advanced strength training protocol',
      duration: 60,
      difficulty: 'advanced',
      equipment: ['barbell', 'dumbbells', 'rack'],
      exercises: [
        { name: 'Barbell Squats', sets: 5, reps: 5, rest: 180, tip: 'Break parallel, drive through heels', video: null, alternative: 'Front Squats' },
        { name: 'Deadlifts', sets: 5, reps: 5, rest: 180, tip: 'Keep bar close to body', video: null, alternative: 'Trap Bar Deadlifts' },
        { name: 'Bench Press', sets: 5, reps: 5, rest: 180, tip: 'Arch back slightly, drive through feet', video: null, alternative: 'Dumbbell Press' },
        { name: 'Barbell Rows', sets: 4, reps: 8, rest: 120, tip: 'Pull to lower chest', video: null, alternative: 'Dumbbell Rows' },
        { name: 'Weighted Pull-ups', sets: 4, reps: 6, rest: 120, tip: 'Add weight with belt', video: null, alternative: 'Regular Pull-ups' }
      ]
    });
  }

  return templates;
}

// POST /api/v1/workouts/generate - Generate new workout plan
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    // Get user profile
    const profile = await getQuery('SELECT * FROM user_profiles WHERE user_id = ?', [req.user.id]);

    if (!profile) {
      return res.status(404).json({ error: { message: 'Please complete onboarding first' } });
    }

    // Parse JSON fields
    if (profile.workout_types) profile.workout_types = JSON.parse(profile.workout_types);

    // Generate plan
    const planId = await generateWorkoutPlan(req.user.id, profile);

    // Get the generated plan with workouts
    const plan = await getQuery('SELECT * FROM workout_plans WHERE plan_id = ?', [planId]);
    const schedule = await allQuery(
      `SELECT ws.*, w.* FROM weekly_schedules ws
       LEFT JOIN workouts w ON ws.workout_id = w.workout_id
       WHERE ws.plan_id = ?
       ORDER BY ws.week_number,
       CASE ws.day_of_week
         WHEN 'monday' THEN 1
         WHEN 'tuesday' THEN 2
         WHEN 'wednesday' THEN 3
         WHEN 'thursday' THEN 4
         WHEN 'friday' THEN 5
         WHEN 'saturday' THEN 6
         WHEN 'sunday' THEN 7
       END`,
      [planId]
    );

    res.json({
      message: 'Workout plan generated successfully',
      plan,
      schedule
    });
  } catch (error) {
    console.error('Generate workout plan error:', error);
    res.status(500).json({ error: { message: 'Failed to generate workout plan' } });
  }
});

// GET /api/v1/workouts/plans - Get all user's workout plans
router.get('/plans', authenticateToken, async (req, res) => {
  try {
    const plans = await allQuery(
      'SELECT * FROM workout_plans WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    res.json({ plans });
  } catch (error) {
    console.error('Get workout plans error:', error);
    res.status(500).json({ error: { message: 'Failed to get workout plans' } });
  }
});

// GET /api/v1/workouts/plans/:planId - Get specific workout plan details
router.get('/plans/:planId', authenticateToken, async (req, res) => {
  try {
    const plan = await getQuery('SELECT * FROM workout_plans WHERE plan_id = ? AND user_id = ?', [req.params.planId, req.user.id]);

    if (!plan) {
      return res.status(404).json({ error: { message: 'Workout plan not found' } });
    }

    const schedule = await allQuery(
      `SELECT ws.*, w.* FROM weekly_schedules ws
       LEFT JOIN workouts w ON ws.workout_id = w.workout_id
       WHERE ws.plan_id = ?
       ORDER BY ws.week_number,
       CASE ws.day_of_week
         WHEN 'monday' THEN 1
         WHEN 'tuesday' THEN 2
         WHEN 'wednesday' THEN 3
         WHEN 'thursday' THEN 4
         WHEN 'friday' THEN 5
         WHEN 'saturday' THEN 6
         WHEN 'sunday' THEN 7
       END`,
      [req.params.planId]
    );

    // Get exercises for each workout
    for (let item of schedule) {
      if (item.workout_id) {
        const exercises = await allQuery(
          'SELECT * FROM workout_exercises WHERE workout_id = ? ORDER BY exercise_order',
          [item.workout_id]
        );
        item.exercises = exercises;
      }
    }

    res.json({ plan, schedule });
  } catch (error) {
    console.error('Get workout plan error:', error);
    res.status(500).json({ error: { message: 'Failed to get workout plan' } });
  }
});

// POST /api/v1/workouts/plans/:planId/activate - Set as active plan
router.post('/plans/:planId/activate', authenticateToken, async (req, res) => {
  try {
    // Deactivate all other plans
    await runQuery('UPDATE workout_plans SET is_active = 0 WHERE user_id = ?', [req.user.id]);

    // Activate this plan
    await runQuery('UPDATE workout_plans SET is_active = 1 WHERE plan_id = ? AND user_id = ?', [req.params.planId, req.user.id]);

    res.json({ message: 'Workout plan activated' });
  } catch (error) {
    console.error('Activate workout plan error:', error);
    res.status(500).json({ error: { message: 'Failed to activate workout plan' } });
  }
});

// DELETE /api/v1/workouts/plans/:planId - Delete workout plan
router.delete('/plans/:planId', authenticateToken, async (req, res) => {
  try {
    await runQuery('DELETE FROM workout_plans WHERE plan_id = ? AND user_id = ?', [req.params.planId, req.user.id]);
    res.json({ message: 'Workout plan deleted' });
  } catch (error) {
    console.error('Delete workout plan error:', error);
    res.status(500).json({ error: { message: 'Failed to delete workout plan' } });
  }
});

// POST /api/v1/workouts/complete - Log workout completion
router.post('/complete', authenticateToken, async (req, res) => {
  try {
    const { workout_id, plan_id, duration_minutes, notes, exercises_completed } = req.body;

    const completionId = uuidv4();
    await runQuery(
      `INSERT INTO workout_completions (completion_id, user_id, workout_id, plan_id, duration_minutes, notes, exercises_completed)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [completionId, req.user.id, workout_id, plan_id, duration_minutes, notes, JSON.stringify(exercises_completed)]
    );

    res.json({ message: 'Workout logged successfully', completion_id: completionId });
  } catch (error) {
    console.error('Log workout error:', error);
    res.status(500).json({ error: { message: 'Failed to log workout' } });
  }
});

// GET /api/v1/workouts/history - Get workout completion history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const history = await allQuery(
      `SELECT wc.*, w.workout_name, w.workout_type FROM workout_completions wc
       JOIN workouts w ON wc.workout_id = w.workout_id
       WHERE wc.user_id = ?
       ORDER BY wc.completed_at DESC
       LIMIT 50`,
      [req.user.id]
    );

    res.json({ history });
  } catch (error) {
    console.error('Get workout history error:', error);
    res.status(500).json({ error: { message: 'Failed to get workout history' } });
  }
});

module.exports = router;
