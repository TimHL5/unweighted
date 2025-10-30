const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../database.sqlite');

// Ensure directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Create database connection
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('📦 Connected to SQLite database');
    initializeDatabase();
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Initialize database schema
function initializeDatabase() {
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        date_of_birth DATE NOT NULL,
        gender TEXT NOT NULL,
        profile_photo_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME,
        email_verified INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1
      )
    `);

    // User profiles table (onboarding data)
    db.run(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        user_id TEXT PRIMARY KEY,
        current_weight REAL NOT NULL,
        goal_weight REAL NOT NULL,
        height REAL NOT NULL,
        weight_unit TEXT DEFAULT 'lbs',
        height_unit TEXT DEFAULT 'ft',
        fitness_level TEXT NOT NULL,
        primary_goal TEXT NOT NULL,
        target_timeline TEXT NOT NULL,
        workout_types TEXT,
        equipment_access TEXT NOT NULL,
        workout_duration_pref TEXT NOT NULL,
        dietary_restrictions TEXT,
        food_allergies TEXT,
        meals_per_day TEXT NOT NULL,
        cooking_skill TEXT NOT NULL,
        meal_prep_time TEXT NOT NULL,
        wake_time TEXT NOT NULL,
        bed_time TEXT NOT NULL,
        preferred_workout_time TEXT NOT NULL,
        work_schedule TEXT NOT NULL,
        attempts_count TEXT NOT NULL,
        past_barriers TEXT,
        motivation_note TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Workout plans table
    db.run(`
      CREATE TABLE IF NOT EXISTS workout_plans (
        plan_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        plan_name TEXT NOT NULL,
        plan_duration_weeks INTEGER NOT NULL,
        workouts_per_week INTEGER NOT NULL,
        difficulty_level TEXT NOT NULL,
        primary_goal TEXT NOT NULL,
        is_active INTEGER DEFAULT 0,
        is_favorite INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Workouts table
    db.run(`
      CREATE TABLE IF NOT EXISTS workouts (
        workout_id TEXT PRIMARY KEY,
        workout_name TEXT NOT NULL,
        workout_type TEXT NOT NULL,
        description TEXT,
        estimated_duration_min INTEGER NOT NULL,
        difficulty_level TEXT NOT NULL,
        equipment_needed TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Weekly schedules table
    db.run(`
      CREATE TABLE IF NOT EXISTS weekly_schedules (
        schedule_id TEXT PRIMARY KEY,
        plan_id TEXT NOT NULL,
        week_number INTEGER NOT NULL,
        day_of_week TEXT NOT NULL,
        workout_id TEXT,
        is_rest_day INTEGER DEFAULT 0,
        FOREIGN KEY (plan_id) REFERENCES workout_plans(plan_id) ON DELETE CASCADE,
        FOREIGN KEY (workout_id) REFERENCES workouts(workout_id)
      )
    `);

    // Workout exercises table
    db.run(`
      CREATE TABLE IF NOT EXISTS workout_exercises (
        id TEXT PRIMARY KEY,
        workout_id TEXT NOT NULL,
        exercise_order INTEGER NOT NULL,
        exercise_name TEXT NOT NULL,
        sets INTEGER,
        reps INTEGER,
        duration_seconds INTEGER,
        rest_seconds INTEGER,
        form_tip TEXT,
        video_url TEXT,
        alternative_exercise TEXT,
        FOREIGN KEY (workout_id) REFERENCES workouts(workout_id) ON DELETE CASCADE
      )
    `);

    // Workout completions table
    db.run(`
      CREATE TABLE IF NOT EXISTS workout_completions (
        completion_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        workout_id TEXT NOT NULL,
        plan_id TEXT,
        completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        duration_minutes INTEGER,
        notes TEXT,
        exercises_completed TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (workout_id) REFERENCES workouts(workout_id),
        FOREIGN KEY (plan_id) REFERENCES workout_plans(plan_id)
      )
    `);

    // Meal plans table
    db.run(`
      CREATE TABLE IF NOT EXISTS meal_plans (
        plan_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        plan_name TEXT NOT NULL,
        plan_duration_days INTEGER NOT NULL,
        daily_calorie_target INTEGER NOT NULL,
        daily_protein_g INTEGER NOT NULL,
        daily_carbs_g INTEGER NOT NULL,
        daily_fats_g INTEGER NOT NULL,
        is_active INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Recipes table
    db.run(`
      CREATE TABLE IF NOT EXISTS recipes (
        recipe_id TEXT PRIMARY KEY,
        recipe_name TEXT NOT NULL,
        meal_type TEXT NOT NULL,
        description TEXT,
        prep_time_min INTEGER NOT NULL,
        cook_time_min INTEGER NOT NULL,
        servings INTEGER NOT NULL,
        difficulty TEXT NOT NULL,
        calories_per_serving INTEGER NOT NULL,
        protein_g REAL NOT NULL,
        carbs_g REAL NOT NULL,
        fats_g REAL NOT NULL,
        fiber_g REAL,
        image_url TEXT,
        is_meal_prep_friendly INTEGER DEFAULT 0,
        dietary_labels TEXT,
        allergens TEXT,
        ingredients TEXT NOT NULL,
        instructions TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Daily meals table
    db.run(`
      CREATE TABLE IF NOT EXISTS daily_meals (
        id TEXT PRIMARY KEY,
        plan_id TEXT NOT NULL,
        day_number INTEGER NOT NULL,
        day_of_week TEXT NOT NULL,
        breakfast_recipe_id TEXT,
        lunch_recipe_id TEXT,
        dinner_recipe_id TEXT,
        snack1_recipe_id TEXT,
        snack2_recipe_id TEXT,
        FOREIGN KEY (plan_id) REFERENCES meal_plans(plan_id) ON DELETE CASCADE,
        FOREIGN KEY (breakfast_recipe_id) REFERENCES recipes(recipe_id),
        FOREIGN KEY (lunch_recipe_id) REFERENCES recipes(recipe_id),
        FOREIGN KEY (dinner_recipe_id) REFERENCES recipes(recipe_id),
        FOREIGN KEY (snack1_recipe_id) REFERENCES recipes(recipe_id),
        FOREIGN KEY (snack2_recipe_id) REFERENCES recipes(recipe_id)
      )
    `);

    // Meal completions table
    db.run(`
      CREATE TABLE IF NOT EXISTS meal_completions (
        completion_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        recipe_id TEXT NOT NULL,
        plan_id TEXT,
        meal_type TEXT NOT NULL,
        completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        actual_servings REAL DEFAULT 1.0,
        rating INTEGER,
        notes TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id),
        FOREIGN KEY (plan_id) REFERENCES meal_plans(plan_id)
      )
    `);

    // Posts table
    db.run(`
      CREATE TABLE IF NOT EXISTS posts (
        post_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        post_type TEXT NOT NULL,
        caption TEXT,
        media_urls TEXT,
        media_types TEXT,
        hashtags TEXT,
        mentions TEXT,
        tagged_recipe_id TEXT,
        tagged_workout_id TEXT,
        location TEXT,
        privacy TEXT DEFAULT 'public',
        like_count INTEGER DEFAULT 0,
        comment_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_deleted INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (tagged_recipe_id) REFERENCES recipes(recipe_id),
        FOREIGN KEY (tagged_workout_id) REFERENCES workouts(workout_id)
      )
    `);

    // Likes table
    db.run(`
      CREATE TABLE IF NOT EXISTS likes (
        like_id TEXT PRIMARY KEY,
        post_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(post_id, user_id)
      )
    `);

    // Comments table
    db.run(`
      CREATE TABLE IF NOT EXISTS comments (
        comment_id TEXT PRIMARY KEY,
        post_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        parent_comment_id TEXT,
        comment_text TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_deleted INTEGER DEFAULT 0,
        FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (parent_comment_id) REFERENCES comments(comment_id)
      )
    `);

    // Follows table
    db.run(`
      CREATE TABLE IF NOT EXISTS follows (
        follow_id TEXT PRIMARY KEY,
        follower_user_id TEXT NOT NULL,
        followed_user_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (follower_user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (followed_user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(follower_user_id, followed_user_id)
      )
    `);

    // Groups table
    db.run(`
      CREATE TABLE IF NOT EXISTS groups (
        group_id TEXT PRIMARY KEY,
        group_name TEXT NOT NULL,
        group_avatar_url TEXT,
        created_by_user_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_active INTEGER DEFAULT 1,
        group_type TEXT DEFAULT 'matched',
        max_members INTEGER DEFAULT 4,
        FOREIGN KEY (created_by_user_id) REFERENCES users(id)
      )
    `);

    // Group members table
    db.run(`
      CREATE TABLE IF NOT EXISTS group_members (
        membership_id TEXT PRIMARY KEY,
        group_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'active',
        role TEXT DEFAULT 'member',
        FOREIGN KEY (group_id) REFERENCES groups(group_id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(group_id, user_id)
      )
    `);

    // Group chat messages table
    db.run(`
      CREATE TABLE IF NOT EXISTS group_chat_messages (
        message_id TEXT PRIMARY KEY,
        group_id TEXT NOT NULL,
        sender_user_id TEXT NOT NULL,
        message_text TEXT,
        media_url TEXT,
        replied_to_message_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_deleted INTEGER DEFAULT 0,
        FOREIGN KEY (group_id) REFERENCES groups(group_id) ON DELETE CASCADE,
        FOREIGN KEY (sender_user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (replied_to_message_id) REFERENCES group_chat_messages(message_id)
      )
    `);

    // Group check-ins table
    db.run(`
      CREATE TABLE IF NOT EXISTS group_checkins (
        checkin_id TEXT PRIMARY KEY,
        group_id TEXT NOT NULL,
        scheduled_at DATETIME NOT NULL,
        duration_minutes INTEGER DEFAULT 30,
        video_call_link TEXT,
        status TEXT DEFAULT 'scheduled',
        attendees TEXT,
        recording_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (group_id) REFERENCES groups(group_id) ON DELETE CASCADE
      )
    `);

    // Weight logs table
    db.run(`
      CREATE TABLE IF NOT EXISTS weight_logs (
        log_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        weight_value REAL NOT NULL,
        weight_unit TEXT DEFAULT 'lbs',
        log_date DATE NOT NULL,
        note TEXT,
        photo_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Body measurements table
    db.run(`
      CREATE TABLE IF NOT EXISTS body_measurements (
        measurement_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        measurement_date DATE NOT NULL,
        neck_inches REAL,
        chest_inches REAL,
        waist_inches REAL,
        hips_inches REAL,
        thigh_inches REAL,
        arm_inches REAL,
        body_fat_percent REAL,
        front_photo_url TEXT,
        side_photo_url TEXT,
        back_photo_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Daily check-ins table
    db.run(`
      CREATE TABLE IF NOT EXISTS daily_checkins (
        checkin_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        checkin_date DATE NOT NULL,
        energy_level INTEGER,
        mood TEXT,
        sleep_hours REAL,
        sleep_quality INTEGER,
        stress_level INTEGER,
        journal_entry TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(user_id, checkin_date)
      )
    `);

    // Achievements table
    db.run(`
      CREATE TABLE IF NOT EXISTS achievements (
        achievement_id TEXT PRIMARY KEY,
        achievement_name TEXT NOT NULL,
        achievement_description TEXT,
        badge_icon_url TEXT,
        criteria_type TEXT NOT NULL,
        criteria_value INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // User achievements table
    db.run(`
      CREATE TABLE IF NOT EXISTS user_achievements (
        user_achievement_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        achievement_id TEXT NOT NULL,
        earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (achievement_id) REFERENCES achievements(achievement_id),
        UNIQUE(user_id, achievement_id)
      )
    `);

    console.log('✅ Database schema initialized');
  });
}

// Helper function to run queries with promises
function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function getQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function allQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

module.exports = {
  db,
  runQuery,
  getQuery,
  allQuery
};
