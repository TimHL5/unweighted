-- ============================================================================
-- Unweighted App - Complete PostgreSQL Migration for Supabase
-- Calorie tracking + social accountability platform
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

CREATE TYPE gender_type AS ENUM ('male', 'female', 'non-binary', 'prefer_not_to_say');
CREATE TYPE goal_type AS ENUM ('lose', 'gain', 'maintain', 'recomp');
CREATE TYPE activity_level AS ENUM ('sedentary', 'light', 'moderate', 'active', 'very_active');
CREATE TYPE unit_system AS ENUM ('imperial', 'metric');
CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'premium');
CREATE TYPE food_source AS ENUM ('usda', 'openfoodfacts', 'user', 'verified');
CREATE TYPE meal_type AS ENUM ('breakfast', 'lunch', 'dinner', 'snack');
CREATE TYPE photo_type AS ENUM ('front', 'side', 'back');
CREATE TYPE post_type AS ENUM ('meal', 'workout', 'progress', 'milestone', 'text');
CREATE TYPE post_visibility AS ENUM ('public', 'followers', 'group_only');
CREATE TYPE group_member_role AS ENUM ('admin', 'member');
CREATE TYPE message_type AS ENUM ('text', 'image', 'system', 'celebration');
CREATE TYPE achievement_category AS ENUM ('logging', 'workout', 'progress', 'social', 'accountability', 'gamification');
CREATE TYPE achievement_rarity AS ENUM ('common', 'uncommon', 'rare', 'epic', 'legendary');
CREATE TYPE challenge_type AS ENUM ('individual', 'group', 'global');

-- ============================================================================
-- 1. PROFILES (extends auth.users)
-- ============================================================================

CREATE TABLE profiles (
    id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email           TEXT,
    display_name    TEXT,
    avatar_url      TEXT,
    date_of_birth   DATE,
    gender          gender_type,
    height_cm       NUMERIC(5, 1),
    current_weight_kg NUMERIC(5, 1),
    goal_weight_kg  NUMERIC(5, 1),
    goal_type       goal_type,
    activity_level  activity_level,
    daily_calorie_target INT,
    protein_target_g INT,
    carb_target_g   INT,
    fat_target_g    INT,
    fiber_target_g  INT,
    unit_system     unit_system NOT NULL DEFAULT 'imperial',
    onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
    subscription_tier subscription_tier NOT NULL DEFAULT 'free',
    timezone        TEXT NOT NULL DEFAULT 'America/New_York',
    bio             TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. FOODS
-- ============================================================================

CREATE TABLE foods (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                TEXT NOT NULL,
    brand               TEXT,
    barcode             TEXT,
    source              food_source NOT NULL DEFAULT 'user',
    source_id           TEXT,
    serving_size_g      NUMERIC(8, 2),
    serving_unit        TEXT,
    calories_per_serving NUMERIC(8, 2) NOT NULL,
    protein_g           NUMERIC(8, 2),
    carbs_g             NUMERIC(8, 2),
    fat_g               NUMERIC(8, 2),
    fiber_g             NUMERIC(8, 2),
    sugar_g             NUMERIC(8, 2),
    sodium_mg           NUMERIC(8, 2),
    image_url           TEXT,
    is_verified         BOOLEAN NOT NULL DEFAULT FALSE,
    created_by          UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_foods_barcode ON foods (barcode) WHERE barcode IS NOT NULL;
CREATE INDEX idx_foods_name_fts ON foods USING GIN (to_tsvector('english', name));

ALTER TABLE foods ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 3. RECIPES
-- ============================================================================

CREATE TABLE recipes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    description     TEXT,
    servings        INT NOT NULL DEFAULT 1,
    prep_time_min   INT,
    cook_time_min   INT,
    instructions    TEXT,
    image_url       TEXT,
    is_public       BOOLEAN NOT NULL DEFAULT FALSE,
    total_calories  NUMERIC(8, 2),
    total_protein_g NUMERIC(8, 2),
    total_carbs_g   NUMERIC(8, 2),
    total_fat_g     NUMERIC(8, 2),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 4. RECIPE INGREDIENTS
-- ============================================================================

CREATE TABLE recipe_ingredients (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id   UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    food_id     UUID NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
    quantity    NUMERIC(8, 2) NOT NULL,
    unit        TEXT,
    order_index INT NOT NULL DEFAULT 0
);

ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 5. FOOD LOG
-- ============================================================================

CREATE TABLE food_log (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    food_id     UUID REFERENCES foods(id) ON DELETE SET NULL,
    recipe_id   UUID REFERENCES recipes(id) ON DELETE SET NULL,
    meal_type   meal_type NOT NULL,
    log_date    DATE NOT NULL DEFAULT CURRENT_DATE,
    servings    NUMERIC(6, 2) NOT NULL DEFAULT 1,
    calories    NUMERIC(8, 2),
    protein_g   NUMERIC(8, 2),
    carbs_g     NUMERIC(8, 2),
    fat_g       NUMERIC(8, 2),
    fiber_g     NUMERIC(8, 2),
    notes       TEXT,
    image_url   TEXT,
    logged_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_food_log_user_date ON food_log (user_id, log_date);

ALTER TABLE food_log ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 6. WATER LOG
-- ============================================================================

CREATE TABLE water_log (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    amount_ml   INT NOT NULL,
    log_date    DATE NOT NULL DEFAULT CURRENT_DATE,
    logged_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE water_log ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 7. WEIGHT LOG
-- ============================================================================

CREATE TABLE weight_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    weight_kg       NUMERIC(5, 1) NOT NULL,
    body_fat_pct    NUMERIC(4, 1),
    log_date        DATE NOT NULL DEFAULT CURRENT_DATE,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_weight_log_user_date ON weight_log (user_id, log_date);

ALTER TABLE weight_log ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 8. PROGRESS PHOTOS
-- ============================================================================

CREATE TABLE progress_photos (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    image_url       TEXT NOT NULL,
    photo_type      photo_type NOT NULL,
    weight_at_time  NUMERIC(5, 1),
    log_date        DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE progress_photos ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 9. DAILY CHECK-INS
-- ============================================================================

CREATE TABLE daily_check_ins (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    check_in_date   DATE NOT NULL DEFAULT CURRENT_DATE,
    mood            INT CHECK (mood >= 1 AND mood <= 5),
    energy          INT CHECK (energy >= 1 AND energy <= 5),
    sleep_hours     NUMERIC(3, 1),
    sleep_quality   INT CHECK (sleep_quality >= 1 AND sleep_quality <= 5),
    stress_level    INT CHECK (stress_level >= 1 AND stress_level <= 5),
    hunger_level    INT CHECK (hunger_level >= 1 AND hunger_level <= 5),
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, check_in_date)
);

ALTER TABLE daily_check_ins ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 10. EXERCISES
-- ============================================================================

CREATE TABLE exercises (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    category        TEXT,
    muscle_groups   TEXT[],
    equipment       TEXT,
    met_value       NUMERIC(4, 1),
    instructions    TEXT,
    image_url       TEXT,
    is_custom       BOOLEAN NOT NULL DEFAULT FALSE,
    created_by      UUID REFERENCES profiles(id) ON DELETE SET NULL
);

ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 11. WORKOUT PLANS
-- ============================================================================

CREATE TABLE workout_plans (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    description     TEXT,
    goal            TEXT,
    days_per_week   INT,
    duration_weeks  INT,
    is_active       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 12. WORKOUT PLAN DAYS
-- ============================================================================

CREATE TABLE workout_plan_days (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id         UUID NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
    day_number      INT NOT NULL,
    day_name        TEXT,
    exercises       JSONB
);

ALTER TABLE workout_plan_days ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 13. WORKOUT LOG
-- ============================================================================

CREATE TABLE workout_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    plan_day_id     UUID REFERENCES workout_plan_days(id) ON DELETE SET NULL,
    workout_date    DATE NOT NULL DEFAULT CURRENT_DATE,
    duration_min    INT,
    calories_burned INT,
    notes           TEXT,
    rating          INT CHECK (rating >= 1 AND rating <= 5),
    completed       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE workout_log ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 14. WORKOUT SET LOG
-- ============================================================================

CREATE TABLE workout_set_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_log_id  UUID NOT NULL REFERENCES workout_log(id) ON DELETE CASCADE,
    exercise_id     UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    set_number      INT NOT NULL,
    reps            INT,
    weight_kg       NUMERIC(6, 2),
    duration_seconds INT,
    distance_m      NUMERIC(10, 2),
    completed       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE workout_set_log ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 15. POSTS
-- ============================================================================

CREATE TABLE posts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content         TEXT,
    post_type       post_type NOT NULL DEFAULT 'text',
    media_urls      TEXT[],
    food_log_id     UUID REFERENCES food_log(id) ON DELETE SET NULL,
    visibility      post_visibility NOT NULL DEFAULT 'public',
    like_count      INT NOT NULL DEFAULT 0,
    comment_count   INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_posts_user_created ON posts (user_id, created_at DESC);
CREATE INDEX idx_posts_public_feed ON posts (created_at DESC) WHERE visibility = 'public';

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 16. POST LIKES
-- ============================================================================

CREATE TABLE post_likes (
    user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    post_id     UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, post_id)
);

ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 17. POST COMMENTS
-- ============================================================================

CREATE TABLE post_comments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id             UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content             TEXT NOT NULL,
    parent_comment_id   UUID REFERENCES post_comments(id) ON DELETE CASCADE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 18. FOLLOWS
-- ============================================================================

CREATE TABLE follows (
    follower_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    following_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (follower_id, following_id),
    CHECK (follower_id != following_id)
);

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 19. GROUPS
-- ============================================================================

CREATE TABLE groups (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    description     TEXT,
    avatar_url      TEXT,
    max_members     INT NOT NULL DEFAULT 4,
    group_type      TEXT NOT NULL DEFAULT 'accountability',
    goal_type       TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    invite_code     TEXT UNIQUE,
    created_by      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 20. GROUP MEMBERS
-- ============================================================================

CREATE TABLE group_members (
    group_id    UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role        group_member_role NOT NULL DEFAULT 'member',
    joined_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (group_id, user_id)
);

ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 21. GROUP MESSAGES
-- ============================================================================

CREATE TABLE group_messages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id        UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content         TEXT NOT NULL,
    message_type    message_type NOT NULL DEFAULT 'text',
    media_url       TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_group_messages_group_created ON group_messages (group_id, created_at DESC);

ALTER TABLE group_messages ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 22. ACHIEVEMENTS
-- ============================================================================

CREATE TABLE achievements (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug            TEXT NOT NULL UNIQUE,
    name            TEXT NOT NULL,
    description     TEXT,
    icon            TEXT,
    category        achievement_category NOT NULL,
    requirement     JSONB,
    xp_reward       INT NOT NULL DEFAULT 0,
    rarity          achievement_rarity NOT NULL DEFAULT 'common'
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 23. USER ACHIEVEMENTS
-- ============================================================================

CREATE TABLE user_achievements (
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    achievement_id  UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, achievement_id)
);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 24. USER STREAKS
-- ============================================================================

CREATE TABLE user_streaks (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    streak_type         TEXT NOT NULL,
    current_count       INT NOT NULL DEFAULT 0,
    longest_count       INT NOT NULL DEFAULT 0,
    last_activity_date  DATE,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, streak_type)
);

ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 25. USER XP
-- ============================================================================

CREATE TABLE user_xp (
    user_id         UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    total_xp        INT NOT NULL DEFAULT 0,
    current_level   INT NOT NULL DEFAULT 1,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE user_xp ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 26. CHALLENGES
-- ============================================================================

CREATE TABLE challenges (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    description     TEXT,
    challenge_type  challenge_type NOT NULL,
    metric          TEXT,
    target_value    INT,
    duration_days   INT,
    xp_reward       INT NOT NULL DEFAULT 0,
    start_date      DATE,
    end_date        DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 27. CHALLENGE PARTICIPANTS
-- ============================================================================

CREATE TABLE challenge_participants (
    challenge_id    UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    current_progress INT NOT NULL DEFAULT 0,
    completed       BOOLEAN NOT NULL DEFAULT FALSE,
    joined_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (challenge_id, user_id)
);

ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 28. NOTIFICATIONS
-- ============================================================================

CREATE TABLE notifications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type        TEXT NOT NULL,
    title       TEXT NOT NULL,
    body        TEXT,
    data        JSONB,
    read        BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_created ON notifications (user_id, created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- TRIGGER: Auto-create profile on auth.users insert
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, display_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
        COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NEW.raw_user_meta_data ->> 'picture')
    );
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- TRIGGER: Auto-update updated_at on modification
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_recipes_updated_at
    BEFORE UPDATE ON recipes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- --------------------------------------------------------------------------
-- PROFILES
-- --------------------------------------------------------------------------

CREATE POLICY "Profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (TRUE);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Allow the trigger function to insert profiles
CREATE POLICY "Service role can insert profiles"
    ON profiles FOR INSERT
    WITH CHECK (TRUE);

-- --------------------------------------------------------------------------
-- FOODS
-- --------------------------------------------------------------------------

CREATE POLICY "Foods are viewable by everyone"
    ON foods FOR SELECT
    USING (TRUE);

CREATE POLICY "Authenticated users can insert foods"
    ON foods FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own foods"
    ON foods FOR UPDATE
    USING (auth.uid() = created_by)
    WITH CHECK (auth.uid() = created_by);

-- --------------------------------------------------------------------------
-- RECIPES
-- --------------------------------------------------------------------------

CREATE POLICY "Users can view their own recipes"
    ON recipes FOR SELECT
    USING (auth.uid() = user_id OR is_public = TRUE);

CREATE POLICY "Users can insert their own recipes"
    ON recipes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recipes"
    ON recipes FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recipes"
    ON recipes FOR DELETE
    USING (auth.uid() = user_id);

-- --------------------------------------------------------------------------
-- RECIPE INGREDIENTS
-- --------------------------------------------------------------------------

CREATE POLICY "Users can view recipe ingredients for accessible recipes"
    ON recipe_ingredients FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM recipes
            WHERE recipes.id = recipe_ingredients.recipe_id
            AND (recipes.user_id = auth.uid() OR recipes.is_public = TRUE)
        )
    );

CREATE POLICY "Users can insert ingredients for their own recipes"
    ON recipe_ingredients FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM recipes
            WHERE recipes.id = recipe_ingredients.recipe_id
            AND recipes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update ingredients for their own recipes"
    ON recipe_ingredients FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM recipes
            WHERE recipes.id = recipe_ingredients.recipe_id
            AND recipes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete ingredients for their own recipes"
    ON recipe_ingredients FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM recipes
            WHERE recipes.id = recipe_ingredients.recipe_id
            AND recipes.user_id = auth.uid()
        )
    );

-- --------------------------------------------------------------------------
-- FOOD LOG
-- --------------------------------------------------------------------------

CREATE POLICY "Users can view their own food log"
    ON food_log FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own food log"
    ON food_log FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own food log"
    ON food_log FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own food log"
    ON food_log FOR DELETE
    USING (auth.uid() = user_id);

-- --------------------------------------------------------------------------
-- WATER LOG
-- --------------------------------------------------------------------------

CREATE POLICY "Users can view their own water log"
    ON water_log FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own water log"
    ON water_log FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own water log"
    ON water_log FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own water log"
    ON water_log FOR DELETE
    USING (auth.uid() = user_id);

-- --------------------------------------------------------------------------
-- WEIGHT LOG
-- --------------------------------------------------------------------------

CREATE POLICY "Users can view their own weight log"
    ON weight_log FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weight log"
    ON weight_log FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weight log"
    ON weight_log FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own weight log"
    ON weight_log FOR DELETE
    USING (auth.uid() = user_id);

-- --------------------------------------------------------------------------
-- PROGRESS PHOTOS
-- --------------------------------------------------------------------------

CREATE POLICY "Users can view their own progress photos"
    ON progress_photos FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress photos"
    ON progress_photos FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress photos"
    ON progress_photos FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress photos"
    ON progress_photos FOR DELETE
    USING (auth.uid() = user_id);

-- --------------------------------------------------------------------------
-- DAILY CHECK-INS
-- --------------------------------------------------------------------------

CREATE POLICY "Users can view their own check-ins"
    ON daily_check_ins FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own check-ins"
    ON daily_check_ins FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own check-ins"
    ON daily_check_ins FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own check-ins"
    ON daily_check_ins FOR DELETE
    USING (auth.uid() = user_id);

-- --------------------------------------------------------------------------
-- EXERCISES
-- --------------------------------------------------------------------------

CREATE POLICY "Exercises are viewable by everyone"
    ON exercises FOR SELECT
    USING (TRUE);

CREATE POLICY "Authenticated users can insert exercises"
    ON exercises FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own custom exercises"
    ON exercises FOR UPDATE
    USING (auth.uid() = created_by AND is_custom = TRUE)
    WITH CHECK (auth.uid() = created_by AND is_custom = TRUE);

CREATE POLICY "Users can delete their own custom exercises"
    ON exercises FOR DELETE
    USING (auth.uid() = created_by AND is_custom = TRUE);

-- --------------------------------------------------------------------------
-- WORKOUT PLANS
-- --------------------------------------------------------------------------

CREATE POLICY "Users can view their own workout plans"
    ON workout_plans FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workout plans"
    ON workout_plans FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout plans"
    ON workout_plans FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workout plans"
    ON workout_plans FOR DELETE
    USING (auth.uid() = user_id);

-- --------------------------------------------------------------------------
-- WORKOUT PLAN DAYS
-- --------------------------------------------------------------------------

CREATE POLICY "Users can view their own workout plan days"
    ON workout_plan_days FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM workout_plans
            WHERE workout_plans.id = workout_plan_days.plan_id
            AND workout_plans.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own workout plan days"
    ON workout_plan_days FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM workout_plans
            WHERE workout_plans.id = workout_plan_days.plan_id
            AND workout_plans.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own workout plan days"
    ON workout_plan_days FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM workout_plans
            WHERE workout_plans.id = workout_plan_days.plan_id
            AND workout_plans.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own workout plan days"
    ON workout_plan_days FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM workout_plans
            WHERE workout_plans.id = workout_plan_days.plan_id
            AND workout_plans.user_id = auth.uid()
        )
    );

-- --------------------------------------------------------------------------
-- WORKOUT LOG
-- --------------------------------------------------------------------------

CREATE POLICY "Users can view their own workout log"
    ON workout_log FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workout log"
    ON workout_log FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout log"
    ON workout_log FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workout log"
    ON workout_log FOR DELETE
    USING (auth.uid() = user_id);

-- --------------------------------------------------------------------------
-- WORKOUT SET LOG
-- --------------------------------------------------------------------------

CREATE POLICY "Users can view their own workout set log"
    ON workout_set_log FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM workout_log
            WHERE workout_log.id = workout_set_log.workout_log_id
            AND workout_log.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own workout set log"
    ON workout_set_log FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM workout_log
            WHERE workout_log.id = workout_set_log.workout_log_id
            AND workout_log.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own workout set log"
    ON workout_set_log FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM workout_log
            WHERE workout_log.id = workout_set_log.workout_log_id
            AND workout_log.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own workout set log"
    ON workout_set_log FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM workout_log
            WHERE workout_log.id = workout_set_log.workout_log_id
            AND workout_log.user_id = auth.uid()
        )
    );

-- --------------------------------------------------------------------------
-- POSTS
-- --------------------------------------------------------------------------

CREATE POLICY "Public posts are viewable by everyone"
    ON posts FOR SELECT
    USING (
        visibility = 'public'
        OR auth.uid() = user_id
        OR (
            visibility = 'followers'
            AND EXISTS (
                SELECT 1 FROM follows
                WHERE follows.follower_id = auth.uid()
                AND follows.following_id = posts.user_id
            )
        )
        OR (
            visibility = 'group_only'
            AND EXISTS (
                SELECT 1 FROM group_members gm1
                JOIN group_members gm2 ON gm1.group_id = gm2.group_id
                WHERE gm1.user_id = auth.uid()
                AND gm2.user_id = posts.user_id
            )
        )
    );

CREATE POLICY "Users can insert their own posts"
    ON posts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
    ON posts FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
    ON posts FOR DELETE
    USING (auth.uid() = user_id);

-- --------------------------------------------------------------------------
-- POST LIKES
-- --------------------------------------------------------------------------

CREATE POLICY "Post likes are viewable by everyone"
    ON post_likes FOR SELECT
    USING (TRUE);

CREATE POLICY "Users can insert their own likes"
    ON post_likes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
    ON post_likes FOR DELETE
    USING (auth.uid() = user_id);

-- --------------------------------------------------------------------------
-- POST COMMENTS
-- --------------------------------------------------------------------------

CREATE POLICY "Post comments are viewable by everyone"
    ON post_comments FOR SELECT
    USING (TRUE);

CREATE POLICY "Authenticated users can insert comments"
    ON post_comments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
    ON post_comments FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
    ON post_comments FOR DELETE
    USING (auth.uid() = user_id);

-- --------------------------------------------------------------------------
-- FOLLOWS
-- --------------------------------------------------------------------------

CREATE POLICY "Follows are viewable by everyone"
    ON follows FOR SELECT
    USING (TRUE);

CREATE POLICY "Users can insert their own follows"
    ON follows FOR INSERT
    WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own follows"
    ON follows FOR DELETE
    USING (auth.uid() = follower_id);

-- --------------------------------------------------------------------------
-- GROUPS
-- --------------------------------------------------------------------------

CREATE POLICY "Group members can view their groups"
    ON groups FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM group_members
            WHERE group_members.group_id = groups.id
            AND group_members.user_id = auth.uid()
        )
        OR created_by = auth.uid()
    );

CREATE POLICY "Authenticated users can create groups"
    ON groups FOR INSERT
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group creator or admin can update group"
    ON groups FOR UPDATE
    USING (
        auth.uid() = created_by
        OR EXISTS (
            SELECT 1 FROM group_members
            WHERE group_members.group_id = groups.id
            AND group_members.user_id = auth.uid()
            AND group_members.role = 'admin'
        )
    )
    WITH CHECK (
        auth.uid() = created_by
        OR EXISTS (
            SELECT 1 FROM group_members
            WHERE group_members.group_id = groups.id
            AND group_members.user_id = auth.uid()
            AND group_members.role = 'admin'
        )
    );

CREATE POLICY "Group creator can delete group"
    ON groups FOR DELETE
    USING (auth.uid() = created_by);

-- --------------------------------------------------------------------------
-- GROUP MEMBERS
-- --------------------------------------------------------------------------

CREATE POLICY "Group members can view other members"
    ON group_members FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM group_members AS gm
            WHERE gm.group_id = group_members.group_id
            AND gm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can join groups"
    ON group_members FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups"
    ON group_members FOR DELETE
    USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM groups
            WHERE groups.id = group_members.group_id
            AND groups.created_by = auth.uid()
        )
    );

-- --------------------------------------------------------------------------
-- GROUP MESSAGES
-- --------------------------------------------------------------------------

CREATE POLICY "Group members can view messages"
    ON group_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM group_members
            WHERE group_members.group_id = group_messages.group_id
            AND group_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Group members can insert messages"
    ON group_messages FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM group_members
            WHERE group_members.group_id = group_messages.group_id
            AND group_members.user_id = auth.uid()
        )
    );

-- --------------------------------------------------------------------------
-- ACHIEVEMENTS
-- --------------------------------------------------------------------------

CREATE POLICY "Achievements are viewable by everyone"
    ON achievements FOR SELECT
    USING (TRUE);

-- --------------------------------------------------------------------------
-- USER ACHIEVEMENTS
-- --------------------------------------------------------------------------

CREATE POLICY "User achievements are viewable by everyone"
    ON user_achievements FOR SELECT
    USING (TRUE);

CREATE POLICY "Users can insert their own achievements"
    ON user_achievements FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own achievements"
    ON user_achievements FOR DELETE
    USING (auth.uid() = user_id);

-- --------------------------------------------------------------------------
-- USER STREAKS
-- --------------------------------------------------------------------------

CREATE POLICY "Users can view their own streaks"
    ON user_streaks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own streaks"
    ON user_streaks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streaks"
    ON user_streaks FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own streaks"
    ON user_streaks FOR DELETE
    USING (auth.uid() = user_id);

-- --------------------------------------------------------------------------
-- USER XP
-- --------------------------------------------------------------------------

CREATE POLICY "User XP is viewable by everyone"
    ON user_xp FOR SELECT
    USING (TRUE);

CREATE POLICY "Users can insert their own XP"
    ON user_xp FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own XP"
    ON user_xp FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- --------------------------------------------------------------------------
-- CHALLENGES
-- --------------------------------------------------------------------------

CREATE POLICY "Challenges are viewable by everyone"
    ON challenges FOR SELECT
    USING (TRUE);

-- --------------------------------------------------------------------------
-- CHALLENGE PARTICIPANTS
-- --------------------------------------------------------------------------

CREATE POLICY "Challenge participants are viewable by everyone"
    ON challenge_participants FOR SELECT
    USING (TRUE);

CREATE POLICY "Users can join challenges"
    ON challenge_participants FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenge progress"
    ON challenge_participants FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave challenges"
    ON challenge_participants FOR DELETE
    USING (auth.uid() = user_id);

-- --------------------------------------------------------------------------
-- NOTIFICATIONS
-- --------------------------------------------------------------------------

CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Allow system/service role to insert notifications
CREATE POLICY "Service can insert notifications"
    ON notifications FOR INSERT
    WITH CHECK (TRUE);

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
