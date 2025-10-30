# Unweighted V1 - Prototype

A behavioral weight loss platform combining personalized workout plans, meal planning, and community accountability.

## 📋 Overview

Unweighted is a full-stack application built from the technical requirements document. This prototype implements the core features:

- ✅ User authentication and profile management
- ✅ Onboarding questionnaire with personalized data collection
- ✅ AI-powered workout plan generator
- ✅ Personalized meal plan generator with 15+ recipes
- ✅ Social feed (Instagram-style for health/fitness/food)
- ✅ Accountability groups for community support
- ✅ Progress tracking (weight, measurements, daily check-ins)
- ✅ Calendar integration for scheduling
- ✅ Real-time group chat (WebSocket ready)

## 🏗️ Architecture

```
unweighted/
├── backend/              # Express.js REST API
│   ├── src/
│   │   ├── db/          # Database setup and seed data
│   │   ├── middleware/  # Auth middleware
│   │   ├── routes/      # API route handlers
│   │   └── server.js    # Main server file
│   ├── database.sqlite  # SQLite database (created on first run)
│   └── package.json
├── mobile/              # React Native app (placeholder)
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd unweighted
   ```

2. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Seed the database with recipes and achievements:**
   ```bash
   npm run db:seed
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

   The API will be running at `http://localhost:3000`

### Test the API

1. **Health check:**
   ```bash
   curl http://localhost:3000/api/v1/health
   ```

2. **Register a new user:**
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "Password123!",
       "username": "testuser",
       "full_name": "Test User",
       "date_of_birth": "1995-01-01",
       "gender": "male"
     }'
   ```

3. **Use the returned token for authenticated requests:**
   ```bash
   curl http://localhost:3000/api/v1/users/me \
     -H "Authorization: Bearer <your-token>"
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Core Endpoints

#### Authentication
- `POST /auth/register` - Create new account
- `POST /auth/login` - Login with credentials
- `POST /auth/logout` - Logout

#### User Profile
- `GET /users/me` - Get current user profile
- `PUT /users/me` - Update user profile
- `GET /users/:userId` - Get another user's profile
- `POST /users/:userId/follow` - Follow user
- `DELETE /users/:userId/follow` - Unfollow user

#### Onboarding
- `POST /onboarding/profile` - Submit onboarding questionnaire
- `GET /onboarding/profile` - Get user's profile data

#### Workout Plans
- `POST /workouts/generate` - Generate new workout plan
- `GET /workouts/plans` - Get all user's workout plans
- `GET /workouts/plans/:planId` - Get specific workout plan details
- `POST /workouts/plans/:planId/activate` - Set as active plan
- `DELETE /workouts/plans/:planId` - Delete workout plan
- `POST /workouts/complete` - Log workout completion
- `GET /workouts/history` - Get workout completion history

#### Meal Plans
- `POST /meals/generate` - Generate new meal plan
  - Body: `{ "duration": 7 }` (optional, defaults to 7 days)
- `GET /meals/plans` - Get all user's meal plans
- `GET /meals/plans/:planId` - Get specific meal plan details
- `POST /meals/plans/:planId/activate` - Set as active plan
- `DELETE /meals/plans/:planId` - Delete meal plan
- `GET /meals/recipes/:recipeId` - Get recipe details
- `POST /meals/complete` - Log meal completion
- `GET /meals/shopping-list/:planId` - Get shopping list for plan

#### Social Feed
- `GET /feed` - Get main feed posts
- `GET /feed/following` - Get posts from followed users only
- `GET /feed/group/:groupId` - Get posts from group members
- `GET /feed/explore` - Get explore/trending posts
- `GET /feed/user/:userId` - Get user's posts

#### Posts
- `POST /posts` - Create new post
- `GET /posts/:postId` - Get specific post
- `DELETE /posts/:postId` - Delete post
- `POST /posts/:postId/like` - Like a post
- `DELETE /posts/:postId/like` - Unlike a post
- `GET /posts/:postId/likes` - Get list of users who liked
- `POST /posts/:postId/comments` - Add comment
- `GET /posts/:postId/comments` - Get comments
- `DELETE /comments/:commentId` - Delete comment

#### Accountability Groups
- `GET /groups/suggested` - Get suggested groups for matching
- `POST /groups/create` - Create custom group
- `POST /groups/join/:groupId` - Request to join group
- `GET /groups/my-groups` - Get user's groups
- `GET /groups/:groupId` - Get group details
- `DELETE /groups/:groupId/leave` - Leave group
- `GET /groups/:groupId/messages` - Get chat messages
- `POST /groups/:groupId/messages` - Send message
- `GET /groups/:groupId/checkins` - Get scheduled check-ins
- `POST /groups/:groupId/checkins` - Schedule new check-in

#### Progress Tracking
- `POST /progress/weight` - Log weight
- `GET /progress/weight` - Get weight history
- `POST /progress/measurements` - Log body measurements
- `GET /progress/measurements` - Get measurement history
- `POST /progress/checkin` - Daily check-in (energy, mood, sleep)
- `GET /progress/checkin` - Get check-in history
- `GET /progress/dashboard` - Get progress dashboard data
- `GET /progress/insights` - Get auto-generated insights

#### Calendar
- `GET /calendar/events` - Get scheduled events

## 🔄 Complete User Flow Example

### 1. Register and Login
```bash
# Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alex@example.com",
    "password": "SecurePass123!",
    "username": "alexfit",
    "full_name": "Alex Johnson",
    "date_of_birth": "1995-03-15",
    "gender": "male"
  }'

# Save the token from the response
TOKEN="<your-token-here>"
```

### 2. Complete Onboarding
```bash
curl -X POST http://localhost:3000/api/v1/onboarding/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "current_weight": 210,
    "goal_weight": 180,
    "height": 72,
    "weight_unit": "lbs",
    "height_unit": "ft",
    "fitness_level": "beginner",
    "primary_goal": "lose_weight",
    "target_timeline": "6_months",
    "workout_types": ["strength", "cardio"],
    "equipment_access": "home_gym",
    "workout_duration_pref": "30-45",
    "dietary_restrictions": [],
    "food_allergies": "",
    "meals_per_day": "3",
    "cooking_skill": "intermediate",
    "meal_prep_time": "30-60",
    "wake_time": "6-8",
    "bed_time": "10-12",
    "preferred_workout_time": "morning",
    "work_schedule": "9-5",
    "attempts_count": "3-5",
    "past_barriers": ["lack_of_motivation", "no_accountability"],
    "motivation_note": "This time I have a support system!"
  }'
```

### 3. Generate Workout Plan
```bash
curl -X POST http://localhost:3000/api/v1/workouts/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# Activate the plan
curl -X POST http://localhost:3000/api/v1/workouts/plans/<plan-id>/activate \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Generate Meal Plan
```bash
curl -X POST http://localhost:3000/api/v1/meals/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "duration": 7 }'

# Get shopping list
curl http://localhost:3000/api/v1/meals/shopping-list/<plan-id> \
  -H "Authorization: Bearer $TOKEN"
```

### 5. Join an Accountability Group
```bash
# Get suggested groups
curl http://localhost:3000/api/v1/groups/suggested \
  -H "Authorization: Bearer $TOKEN"

# Join a group
curl -X POST http://localhost:3000/api/v1/groups/join/<group-id> \
  -H "Authorization: Bearer $TOKEN"
```

### 6. Create a Post
```bash
curl -X POST http://localhost:3000/api/v1/posts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "post_type": "meal",
    "caption": "Day 1 - High protein breakfast! 💪 #healthyeating #weightloss",
    "media_urls": ["https://example.com/breakfast.jpg"],
    "media_types": ["image"],
    "hashtags": ["healthyeating", "weightloss"],
    "privacy": "public"
  }'
```

### 7. Log Progress
```bash
# Log weight
curl -X POST http://localhost:3000/api/v1/progress/weight \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "weight_value": 208,
    "weight_unit": "lbs",
    "log_date": "2025-11-01",
    "note": "Feeling good, down 2 lbs!"
  }'

# View dashboard
curl http://localhost:3000/api/v1/progress/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

## 🎯 Core Features Explained

### Workout Plan Generator

The workout generator creates personalized 4-week plans based on:
- **Fitness Level**: Beginner (4 workouts/week), Intermediate (5/week), Advanced (6/week)
- **Primary Goal**: Adjusts rep ranges, rest periods, and workout types
- **Equipment Access**: Provides alternatives for bodyweight-only options
- **Duration Preference**: Scales workout length accordingly

Each workout includes:
- Exercise name, sets, reps/duration
- Rest periods
- Form tips
- Alternative exercises

### Meal Plan Generator

The meal plan generator creates nutritionally balanced plans:
- **Calorie Calculation**: Uses Mifflin-St Jeor equation for TDEE
- **Goal Adjustment**: 500 cal deficit for weight loss, surplus for muscle gain
- **Macro Targets**: Customized protein/carbs/fats based on goal
- **Dietary Filters**: Respects restrictions (vegetarian, vegan, gluten-free, etc.)
- **Recipe Database**: 15+ recipes across breakfast, lunch, dinner, snacks
- **Shopping List**: Auto-generated from weekly meal plan, organized by category

### Social Feed & Community

Instagram-style feed with health/fitness focus:
- **Post Types**: Meal, workout, progress, achievement, motivation
- **Engagement**: Likes, comments, saves
- **Privacy Controls**: Public, friends-only, or private posts
- **Feed Algorithms**: Main feed, following, group-only, explore

### Accountability Groups

Small groups (2-4 people) for support:
- **Matching System**: Based on goals, fitness level, age, timezone
- **Group Chat**: Real-time messaging (WebSocket ready)
- **Weekly Check-ins**: Video call scheduling
- **Group Feed**: Posts visible only to group members

### Progress Tracking

Comprehensive tracking across multiple dimensions:
- **Weight Logs**: Track weight over time with graphs
- **Body Measurements**: Track neck, chest, waist, hips, arms, etc.
- **Daily Check-ins**: Energy, mood, sleep quality, stress levels
- **Workout History**: All completed workouts with notes
- **Insights**: Auto-generated based on progress

## 🗄️ Database Schema

The application uses SQLite for simplicity in the prototype. Key tables:

- **users** - User accounts and authentication
- **user_profiles** - Onboarding data (goals, preferences)
- **workout_plans** - Generated workout plans
- **workouts** - Workout templates
- **workout_exercises** - Individual exercises in workouts
- **weekly_schedules** - Weekly workout schedule mapping
- **workout_completions** - Logged workout sessions
- **meal_plans** - Generated meal plans
- **recipes** - Recipe database (15+ pre-seeded)
- **daily_meals** - Daily meal schedule
- **meal_completions** - Logged meals
- **posts** - Social feed posts
- **likes** - Post likes
- **comments** - Post comments
- **follows** - User follow relationships
- **groups** - Accountability groups
- **group_members** - Group membership
- **group_chat_messages** - Group chat messages
- **group_checkins** - Scheduled video check-ins
- **weight_logs** - Weight tracking
- **body_measurements** - Body measurement tracking
- **daily_checkins** - Daily wellness check-ins
- **achievements** - Achievement definitions
- **user_achievements** - Earned achievements

## 🔐 Security Features

- **Password Hashing**: bcrypt with 12 rounds
- **JWT Authentication**: 24-hour token expiration
- **Input Validation**: express-validator for all inputs
- **SQL Injection Protection**: Parameterized queries
- **CORS**: Configured for allowed origins
- **Age Verification**: 18+ requirement

## 🧪 Testing

### Manual Testing

Start the server and use the provided curl commands above, or use Postman/Insomnia with the Postman collection (if provided).

### Example Test Flow

1. Register a user
2. Complete onboarding
3. Generate workout and meal plans
4. Create a post
5. Log weight
6. View progress dashboard

## 📱 Mobile App (Placeholder)

The `mobile/` directory is a placeholder for the React Native app. The API is fully implemented and ready to be consumed by a mobile frontend.

### Recommended Tech Stack for Mobile:
- **Framework**: React Native (Expo)
- **State Management**: Redux Toolkit or Zustand
- **API Client**: Axios or React Query
- **Navigation**: React Navigation
- **UI Components**: React Native Paper or NativeBase

## 🚧 Future Enhancements

Based on the PRD, future versions could include:

- **AI Chatbot Coaching**: Real-time AI support (GPT-4 integration)
- **Video Calling**: Integrated WebRTC for group check-ins
- **External Calendar Sync**: Google Calendar, Apple Calendar
- **Wearable Integration**: Apple Watch, Fitbit, Whoop
- **Push Notifications**: Firebase Cloud Messaging
- **Image Upload**: S3 or Cloudinary for user photos
- **Advanced Analytics**: Detailed insights and correlations
- **Payment Processing**: Stripe for premium subscriptions
- **Recipe Builder**: User-created recipes
- **Advanced Workout Tracking**: Weight progression tracking

## 🤝 Contributing

This is a prototype built from a technical requirements document. To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 👥 Team

- **Product Manager**: Tim
- **Target Launch**: Q1 2026
- **Current Version**: V1 Prototype

## 📞 Support

For questions or issues:
- Create an issue in the GitHub repository
- Contact: support@unweighted.com (placeholder)

---

**Built with ❤️ for the Unweighted community**

## Quick Reference

### Environment Variables
```bash
# Backend .env
PORT=3000
DB_PATH=./database.sqlite
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=24h
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:19006
```

### NPM Scripts
```bash
npm run dev        # Start development server
npm start          # Start production server
npm run db:seed    # Seed database with recipes
```

### Default Port
The API runs on **port 3000** by default.
