# Quick Start Guide - Running Unweighted Locally

Get the full-stack Unweighted MVP running on your local machine in under 5 minutes.

## Prerequisites

- **Node.js 18+** installed ([download](https://nodejs.org/))
- **npm** or **yarn** package manager
- Terminal/command line access

## Step 1: Clone & Install

```bash
# Clone the repository
git clone https://github.com/yourusername/unweighted.git
cd unweighted

# OR if you're already in the directory
cd /home/user/unweighted
```

## Step 2: Setup Backend

```bash
# Navigate to backend
cd api

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Create database and run migrations
npx prisma migrate dev

# Seed the database with exercises
npm run seed

# Start backend server
npm run dev
```

Backend will be running at: **http://localhost:3001**

Test it:
```bash
curl http://localhost:3001/health
# Should return: {"status":"ok"}
```

## Step 3: Setup Frontend (New Terminal)

```bash
# Navigate to frontend (open new terminal)
cd /home/user/unweighted/frontend

# Install dependencies
npm install

# Start frontend server
npm run dev
```

Frontend will be running at: **http://localhost:3000**

## Step 4: Test the Application

1. Open your browser to: **http://localhost:3000**
2. You should see the landing page
3. Click "Get Started" or "Create Your Plan"
4. Fill out the 10-step survey
5. Get your personalized workout plan!
6. Try sharing the plan with the share button

## Project Structure

```
unweighted/
├── api/                          # Backend (Express + Prisma + PostgreSQL)
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   └── migrations/          # Database migrations
│   ├── src/
│   │   ├── routes/              # API endpoints
│   │   │   ├── survey.ts       # Survey submission
│   │   │   ├── plan.ts         # Plan retrieval
│   │   │   ├── waitlist.ts     # Waitlist signup
│   │   │   └── analytics.ts    # Event tracking
│   │   ├── lib/
│   │   │   ├── prisma.ts       # Database client
│   │   │   └── workoutGenerator.ts  # Plan generation logic
│   │   ├── seed.ts             # Exercise database seeder
│   │   └── index.ts            # Server entry point
│   ├── package.json
│   └── .env                     # Environment variables
│
└── frontend/                     # Frontend (Next.js 14 + TypeScript)
    ├── app/
    │   ├── page.tsx             # Landing page
    │   ├── survey/
    │   │   └── page.tsx         # Multi-step survey
    │   ├── plan/
    │   │   └── [shareToken]/
    │   │       └── page.tsx     # Plan display
    │   ├── layout.tsx           # Root layout
    │   └── globals.css          # Global styles
    ├── lib/
    │   └── api.ts               # API client
    ├── package.json
    └── .env.local               # Environment variables
```

## Environment Variables

### Backend (.env in `/api`)

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/unweighted?schema=public"

# Server
NODE_ENV=development
PORT=3001

# CORS
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env.local in `/frontend`)

```env
# API endpoint
NEXT_PUBLIC_API_URL=http://localhost:3001

# Frontend URL (for sharing)
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

## Common Commands

### Backend

```bash
cd api/

# Development
npm run dev                    # Start dev server with hot reload

# Database
npx prisma migrate dev        # Create and run new migration
npx prisma migrate deploy     # Apply migrations (production)
npx prisma studio            # Open database GUI
npm run seed                 # Seed exercise database

# Production
npm run build                # Build TypeScript
npm start                    # Start production server

# Prisma
npx prisma generate          # Generate Prisma client
npx prisma db push           # Push schema changes (dev only)
```

### Frontend

```bash
cd frontend/

# Development
npm run dev                  # Start dev server with hot reload

# Production
npm run build               # Build for production
npm start                   # Start production server

# Linting
npm run lint                # Run ESLint
```

## API Endpoints

Base URL: `http://localhost:3001`

### Survey
- `POST /survey/submit` - Submit survey and generate plan

### Plans
- `GET /plan/:shareToken` - Get plan by share token

### Waitlist
- `POST /waitlist/signup` - Join waitlist

### Analytics
- `POST /analytics/event` - Track event
- `GET /analytics/stats` - Get statistics

### Health
- `GET /health` - Health check

## Testing Manually

### Submit Survey (via cURL)

```bash
curl -X POST http://localhost:3001/survey/submit \
  -H "Content-Type: application/json" \
  -d '{
    "age": 28,
    "gender": "male",
    "currentWeight": 180,
    "goalWeight": 170,
    "height": 70,
    "weightUnit": "lbs",
    "heightUnit": "inches",
    "fitnessLevel": "intermediate",
    "primaryGoal": "lose_weight",
    "targetTimeline": "3_months",
    "attemptsCount": "2_times",
    "pastBarriers": ["Lack of time", "Lost motivation"],
    "workoutTypes": ["Strength training", "HIIT"],
    "equipmentAccess": "home_gym",
    "workoutDurationPref": "30-45",
    "workoutsPerWeek": 4,
    "wakeTime": "06:00",
    "bedTime": "22:00",
    "preferredWorkoutTime": "morning",
    "workSchedule": "9-5 desk job",
    "email": "test@example.com"
  }'
```

Response will include:
```json
{
  "success": true,
  "data": {
    "shareToken": "abc123...",
    "planUrl": "http://localhost:3000/plan/abc123...",
    "plan": { ... }
  }
}
```

### Get Plan

```bash
# Use shareToken from above
curl http://localhost:3001/plan/abc123...
```

### Join Waitlist

```bash
curl -X POST http://localhost:3001/waitlist/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "source": "landing_page",
    "interestedIn": ["Progress tracking", "Meal planning"]
  }'
```

## Database Management

### View Database with Prisma Studio

```bash
cd api/
npx prisma studio
```

Opens at: **http://localhost:5555**

You can browse and edit:
- Survey responses
- Workout plans
- Waitlist signups
- Analytics events
- Exercises

### Reset Database

```bash
cd api/

# Delete database
npx prisma migrate reset

# Will ask for confirmation, then:
# 1. Drop database
# 2. Recreate it
# 3. Run all migrations
# 4. Run seed script automatically
```

### Backup Database

```bash
# PostgreSQL
pg_dump -U postgres unweighted > backup.sql

# Restore
psql -U postgres unweighted < backup.sql
```

## Troubleshooting

### Port Already in Use

**Backend (3001)**:
```bash
# macOS/Linux
lsof -ti:3001 | xargs kill -9

# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

**Frontend (3000)**:
```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Database Connection Error

1. Make sure PostgreSQL is running:
   ```bash
   # macOS
   brew services start postgresql

   # Ubuntu
   sudo service postgresql start

   # Windows
   # Start PostgreSQL service from Services panel
   ```

2. Verify connection:
   ```bash
   psql -U postgres -c "SELECT version();"
   ```

3. Check DATABASE_URL in `.env`

### Prisma Client Not Generated

```bash
cd api/
npx prisma generate
```

### Frontend Can't Connect to Backend

1. Verify backend is running:
   ```bash
   curl http://localhost:3001/health
   ```

2. Check `.env.local` in frontend:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

3. Check browser console for CORS errors

4. Verify CORS settings in backend `api/src/index.ts`

### Build Errors

**Backend**:
```bash
cd api/
rm -rf node_modules package-lock.json
npm install
npx prisma generate
npm run build
```

**Frontend**:
```bash
cd frontend/
rm -rf node_modules package-lock.json .next
npm install
npm run build
```

## Development Tips

### Hot Reload

Both backend and frontend have hot reload enabled:
- Backend: Changes to `.ts` files auto-restart server
- Frontend: Changes to React components auto-refresh browser

### Debugging

**Backend**:
Add `console.log()` statements in `api/src/` files
View in terminal where `npm run dev` is running

**Frontend**:
- Use browser DevTools (F12)
- Check Console tab for errors
- Use React DevTools extension

### Code Formatting

Install recommended VS Code extensions:
- ESLint
- Prettier
- Prisma
- Tailwind CSS IntelliSense

### Database Queries

Monitor all database queries:
```bash
cd api/
# In .env, add:
DEBUG=prisma:query

npm run dev
```

## What's Next?

1. **Deploy to Production**: See [FULLSTACK-DEPLOYMENT-GUIDE.md](./FULLSTACK-DEPLOYMENT-GUIDE.md)
2. **Customize Design**: Edit Tailwind colors in `frontend/tailwind.config.ts`
3. **Add Features**: Follow the modular structure in `api/src/routes/`
4. **Configure Domain**: See DNS setup in deployment guide

## Need Help?

- **Backend Issues**: Check `api/src/` files
- **Frontend Issues**: Check `frontend/app/` files
- **Database Issues**: Run `npx prisma studio` to inspect data
- **Deployment**: See [FULLSTACK-DEPLOYMENT-GUIDE.md](./FULLSTACK-DEPLOYMENT-GUIDE.md)

---

**Happy coding! 🚀**
