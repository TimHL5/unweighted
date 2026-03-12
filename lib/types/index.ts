// Core user types
export interface Profile {
  id: string
  email?: string
  display_name: string
  avatar_url: string | null
  date_of_birth: string | null
  gender: 'male' | 'female' | 'non-binary' | 'prefer_not_to_say' | null
  height_cm: number | null
  current_weight_kg: number | null
  goal_weight_kg: number | null
  goal_type: 'lose' | 'gain' | 'maintain' | 'recomp' | null
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null
  daily_calorie_target: number | null
  protein_target_g: number | null
  carb_target_g: number | null
  fat_target_g: number | null
  fiber_target_g: number | null
  unit_system: 'imperial' | 'metric'
  onboarding_completed: boolean
  subscription_tier: 'free' | 'pro' | 'premium'
  stripe_customer_id: string | null
  subscription_status: string | null
  timezone: string
  bio: string | null
  created_at: string
  updated_at: string
}

export interface Food {
  id: string
  name: string
  brand: string | null
  barcode: string | null
  source: 'usda' | 'openfoodfacts' | 'user' | 'verified'
  source_id: string | null
  serving_size_g: number | null
  serving_unit: string | null
  calories_per_serving: number
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
  fiber_g: number | null
  sugar_g: number | null
  sodium_mg: number | null
  image_url: string | null
  is_verified: boolean
  created_by: string | null
  created_at: string
}

export interface FoodLog {
  id: string
  user_id: string
  food_id: string | null
  recipe_id: string | null
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  log_date: string
  servings: number
  calories: number
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
  fiber_g: number | null
  notes: string | null
  image_url: string | null
  logged_at: string
  food?: Food
}

export interface WaterLog {
  id: string
  user_id: string
  amount_ml: number
  log_date: string
  logged_at: string
}

export interface WeightLog {
  id: string
  user_id: string
  weight_kg: number
  body_fat_pct: number | null
  log_date: string
  notes: string | null
  created_at: string
}

export interface Recipe {
  id: string
  user_id: string
  name: string
  description: string | null
  servings: number
  prep_time_min: number | null
  cook_time_min: number | null
  instructions: string | null
  image_url: string | null
  is_public: boolean
  total_calories: number | null
  total_protein_g: number | null
  total_carbs_g: number | null
  total_fat_g: number | null
  created_at: string
  updated_at: string
  ingredients?: RecipeIngredient[]
}

export interface RecipeIngredient {
  id: string
  recipe_id: string
  food_id: string
  quantity: number
  unit: string | null
  order_index: number
  food?: Food
}

export interface Post {
  id: string
  user_id: string
  content: string | null
  post_type: 'meal' | 'workout' | 'progress' | 'milestone' | 'text'
  media_urls: string[]
  food_log_id: string | null
  visibility: 'public' | 'followers' | 'group_only'
  like_count: number
  comment_count: number
  created_at: string
  updated_at: string
  profile?: Profile
  liked_by_user?: boolean
}

export interface PostComment {
  id: string
  post_id: string
  user_id: string
  content: string
  parent_comment_id: string | null
  created_at: string
  profile?: Profile
}

export interface Group {
  id: string
  name: string
  description: string | null
  avatar_url: string | null
  max_members: number
  group_type: string
  goal_type: string | null
  is_active: boolean
  invite_code: string
  created_by: string
  created_at: string
  members?: GroupMember[]
  last_message?: GroupMessage
}

export interface GroupMember {
  group_id: string
  user_id: string
  role: 'admin' | 'member'
  joined_at: string
  profile?: Profile
}

export interface GroupMessage {
  id: string
  group_id: string
  user_id: string
  content: string
  message_type: 'text' | 'image' | 'system' | 'celebration'
  media_url: string | null
  created_at: string
  profile?: Profile
}

export interface GroupListItem extends Omit<Group, 'last_message'> {
  member_count: number
  last_message: GroupMessage | null
}

export interface GroupDetailResponse {
  group: Group & { members: (GroupMember & { profile: Pick<Profile, 'id' | 'display_name' | 'avatar_url'> })[] }
  is_member: boolean
  user_role: 'admin' | 'member' | null
}

export interface GroupStatsResponse {
  members: {
    user_id: string
    display_name: string
    avatar_url: string | null
    food_logs_this_week: number
    current_streak: number
    xp_total: number
  }[]
}

export interface GroupMessagesPage {
  messages: GroupMessage[]
  nextCursor: string | null
}

export interface Achievement {
  id: string
  slug: string
  name: string
  description: string
  icon: string
  category: 'logging' | 'workout' | 'progress' | 'social' | 'accountability' | 'gamification'
  requirement: Record<string, unknown>
  xp_reward: number
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
}

export interface UserAchievement {
  user_id: string
  achievement_id: string
  unlocked_at: string
  achievement?: Achievement
}

export interface UserStreak {
  id: string
  user_id: string
  streak_type: 'food_log' | 'workout' | 'weigh_in' | 'water' | 'check_in'
  current_count: number
  longest_count: number
  last_activity_date: string | null
  updated_at: string
}

export interface UserXP {
  user_id: string
  total_xp: number
  current_level: number
  updated_at: string
}

export interface DailyCheckIn {
  id: string
  user_id: string
  check_in_date: string
  mood: number | null
  energy: number | null
  sleep_hours: number | null
  sleep_quality: number | null
  stress_level: number | null
  hunger_level: number | null
  notes: string | null
  created_at: string
}

export interface ProgressPhoto {
  id: string
  user_id: string
  image_url: string
  photo_type: 'front' | 'side' | 'back'
  weight_at_time: number | null
  log_date: string
  created_at: string
}

export type PhotoType = 'front' | 'side' | 'back'

export interface Challenge {
  id: string
  name: string
  description: string | null
  challenge_type: 'individual' | 'group' | 'global'
  metric: string
  target_value: number
  duration_days: number
  xp_reward: number
  start_date: string
  end_date: string
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  body: string | null
  data: Record<string, unknown> | null
  read: boolean
  created_at: string
}

export interface ChallengeWithStatus extends Challenge {
  joined: boolean
  current_progress: number
  completed: boolean
  participant_count: number
}

export interface ChallengeLeaderboardEntry {
  user_id: string
  display_name: string
  avatar_url: string | null
  current_progress: number
  completed: boolean
  rank: number
}

export interface GamificationResult {
  achievements_unlocked: { slug: string; name: string; icon: string; xp_reward: number; rarity: string }[]
  challenges_completed: { name: string; xp_reward: number }[]
}

// Social/Feed response types
export interface FeedPage {
  posts: Post[]
  nextCursor: string | null
}

export interface NotificationsPage {
  notifications: Notification[]
  nextCursor: string | null
  unreadCount: number
}

export interface UserProfileResponse {
  profile: Pick<Profile, 'id' | 'display_name' | 'avatar_url' | 'bio' | 'created_at'>
  followers_count: number
  following_count: number
  post_count: number
  is_following: boolean
  xp: UserXP | null
  streaks: UserStreak[]
  achievements: UserAchievement[]
  posts: Post[]
}

// Onboarding form data
export interface OnboardingData {
  goal_type: 'lose' | 'gain' | 'maintain' | 'recomp'
  gender: 'male' | 'female' | 'non-binary' | 'prefer_not_to_say'
  date_of_birth: string
  height_cm: number
  current_weight_kg: number
  goal_weight_kg: number
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
  diet_preferences: string[]
  challenges: string[]
  pace_kg_per_week: number
  unit_system: 'imperial' | 'metric'
}

// Nutrition calculation result
export interface NutritionTargets {
  bmr: number
  tdee: number
  daily_calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  fiber_g: number
  projected_goal_date: string
}

// Meal type alias
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

// Food log response grouped by date
export interface DailyFoodLogResponse {
  date: string
  meals: {
    breakfast: FoodLog[]
    lunch: FoodLog[]
    dinner: FoodLog[]
    snack: FoodLog[]
  }
  totals: {
    calories: number
    protein_g: number
    carbs_g: number
    fat_g: number
    fiber_g: number
  }
  targets: {
    calories: number
    protein_g: number
    carbs_g: number
    fat_g: number
    fiber_g: number
  }
}

// Water log response
export interface WaterLogResponse {
  total_ml: number
  entries: WaterLog[]
}

// USDA FoodData Central types
export interface USDAFoodSearchResult {
  fdcId: number
  description: string
  brandName?: string
  foodNutrients: USDAFoodNutrient[]
  servingSize?: number
  servingSizeUnit?: string
}

export interface USDAFoodNutrient {
  nutrientId: number
  nutrientName: string
  value: number
  unitName: string
}

// Dashboard data
export interface DashboardData {
  daily_totals: {
    calories: number
    protein_g: number
    carbs_g: number
    fat_g: number
    fiber_g: number
  }
  meals: {
    breakfast: FoodLog[]
    lunch: FoodLog[]
    dinner: FoodLog[]
    snack: FoodLog[]
  }
  water_total_ml: number
  streaks: UserStreak[]
  weekly_calories: { date: string; calories: number }[]
  profile: Profile
}
