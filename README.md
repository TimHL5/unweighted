# Unweighted - Personalized Workout Planning MVP

A modern web application that generates personalized workout plans based on your goals, schedule, and fitness level.

## 🎯 What is Unweighted?

Unweighted helps people start their fitness journey with confidence by providing:

- **Personalized Workout Plans**: Custom 4-week plans tailored to your goals
- **Smart Exercise Selection**: Based on your equipment, fitness level, and preferences
- **Progressive Overload**: Built-in progression to keep you improving
- **Shareable Plans**: Every plan gets a unique URL to share with friends or trainers
- **No Guesswork**: Clear instructions, sets, reps, and form tips for every exercise

## 🚀 Quick Start

### Running Locally

See [QUICKSTART.md](./QUICKSTART.md) for detailed local development instructions.

**TL;DR**:
```bash
# Backend
cd api
npm install
npx prisma generate
npx prisma migrate dev
npm run seed
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

Visit: http://localhost:3000

### Deploying to Production

See [FULLSTACK-DEPLOYMENT-GUIDE.md](./FULLSTACK-DEPLOYMENT-GUIDE.md) for complete deployment instructions.

**Platforms**:
- Backend: Railway (Express + Prisma + PostgreSQL)
- Frontend: Vercel (Next.js 14)
- Domain: Namecheap (DNS configuration included)

## 📁 Project Structure

```
unweighted/
├── api/                              # Backend (Express + Prisma + PostgreSQL)
│   ├── prisma/
│   │   ├── schema.prisma            # Database schema (5 models)
│   │   └── migrations/              # Database migrations
│   ├── src/
│   │   ├── routes/                  # API endpoints
│   │   │   ├── survey.ts           # POST /survey/submit
│   │   │   ├── plan.ts             # GET /plan/:shareToken
│   │   │   ├── waitlist.ts         # POST /waitlist/signup
│   │   │   └── analytics.ts        # Event tracking
│   │   ├── lib/
│   │   │   ├── prisma.ts           # Database client
│   │   │   └── workoutGenerator.ts # 350+ line plan generation algorithm
│   │   ├── seed.ts                 # 50+ exercises with form tips
│   │   └── index.ts                # Express server
│   └── package.json
│
├── frontend/                         # Frontend (Next.js 14 + TypeScript)
│   ├── app/
│   │   ├── page.tsx                # Landing page
│   │   ├── survey/
│   │   │   └── page.tsx            # Multi-step survey (10 steps)
│   │   └── plan/
│   │       └── [shareToken]/
│   │           └── page.tsx        # Plan display with workout breakdown
│   ├── lib/
│   │   └── api.ts                  # API client with error handling
│   └── package.json
│
├── FULLSTACK-DEPLOYMENT-GUIDE.md    # Complete deployment instructions
├── QUICKSTART.md                     # Local development guide
└── README.md                         # This file
```

## 🎨 Features

### Landing Page
- Hero section with clear value proposition
- Features showcase
- "How It Works" section
- FAQ with expandable questions
- Waitlist signup form

### Multi-Step Survey
- 10-step questionnaire with progress bar
- Collects: age, gender, body metrics, fitness level, goals, schedule
- Real-time validation
- Session-based analytics tracking

### Workout Plan Generation
- Custom 4-week progressive plans
- 50+ exercise database with alternatives
- Adapts to equipment access (gym, home, bodyweight)
- Personalized workout split based on goals
- Form tips and video suggestions
- Progression built-in (weekly intensity increase)

### Plan Display
- Beautiful workout breakdown by week
- Exercise details with sets/reps/rest
- Warmup and cooldown instructions
- Share plan via unique URL
- Track view count
- Waitlist CTA after viewing plan

### Analytics
- Session-based event tracking
- Tracks: survey completion, plan generation, waitlist signups
- View counts per plan

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL (Railway) / SQLite (local dev)
- **Validation**: Zod
- **Language**: TypeScript

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **State**: React Hooks (useState, useRouter)
- **API Client**: Fetch API with custom wrapper

### DevOps
- **Backend Hosting**: Railway
- **Frontend Hosting**: Vercel
- **DNS**: Namecheap
- **SSL**: Automatic (Railway + Vercel)

## 📊 Database Schema

### Core Models

**SurveyResponse**: User survey data
- Demographics (age, gender, height, weight)
- Goals (primary goal, target weight, timeline)
- Preferences (workout types, equipment, schedule)
- Email for waitlist

**WorkoutPlan**: Generated plans
- Plan name, description, difficulty
- Duration (4 weeks), workouts per week
- Weekly schedule (JSON with full workout breakdown)
- Share token (unique URL)
- View count

**Exercise**: Exercise database
- Name, category, muscle groups
- Equipment required
- Difficulty level
- Form tips, alternatives

**WaitlistSignup**: Email capture
- Email, source (landing_page/after_plan_generated)
- Interests, referral code

**Analytics**: Event tracking
- Event type, session ID
- Metadata (JSON)
- Timestamp

## 🧠 How the Algorithm Works

The workout generation algorithm (`api/src/lib/workoutGenerator.ts`) is a 350+ line intelligent system that:

1. **Analyzes User Profile**:
   - Calculates BMI and weight change needed
   - Determines appropriate intensity based on fitness level
   - Selects workout split based on frequency (3x/week = Full Body, 4-5x = Upper/Lower, 6x = Push/Pull/Legs)

2. **Filters Exercise Database**:
   - Filters 50+ exercises by equipment availability
   - Prioritizes compound movements for beginners
   - Includes isolation work for intermediate/advanced

3. **Builds Workouts**:
   - Assigns exercises to muscle groups
   - Determines sets/reps based on goals:
     - Weight loss: 3-4 sets × 12-15 reps
     - Muscle building: 4-5 sets × 6-10 reps
     - Fitness: 3 sets × 10-12 reps
   - Sets appropriate rest periods (30s-90s based on intensity)

4. **Implements Progressive Overload**:
   - Week 1: Baseline intensity
   - Week 2: +5% volume (more reps or sets)
   - Week 3: +10% volume or +5% intensity
   - Week 4: Deload (maintain performance, reduce fatigue)

5. **Personalizes Schedule**:
   - Aligns workouts with preferred workout time
   - Accounts for work schedule
   - Suggests optimal training days

## 🔗 API Endpoints

Base URL: `/` (routes are mounted at root)

### Survey
```
POST /survey/submit
Body: { age, gender, weights, goals, preferences, email }
Returns: { shareToken, planUrl, plan }
```

### Plans
```
GET /plan/:shareToken
Returns: { plan with full weekly schedule }
```

### Waitlist
```
POST /waitlist/signup
Body: { email, source, interestedIn?, referralCode? }
Returns: { id }
```

### Analytics
```
POST /analytics/event
Body: { eventType, metadata }
Returns: success
```

### Health Check
```
GET /health
Returns: { status: "ok" }
```

## 🎓 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - Run locally in 5 minutes
- **[FULLSTACK-DEPLOYMENT-GUIDE.md](./FULLSTACK-DEPLOYMENT-GUIDE.md)** - Deploy to Railway + Vercel
- **[frontend/README.md](./frontend/README.md)** - Frontend-specific documentation
- **[api/README.md](./api/README.md)** - Backend API documentation

## 🧪 Testing

### Test Locally

```bash
# Start backend
cd api && npm run dev

# Test survey submission
curl -X POST http://localhost:3001/survey/submit \
  -H "Content-Type: application/json" \
  -d @test-survey.json

# Get plan
curl http://localhost:3001/plan/SHARE_TOKEN
```

### Test Production

```bash
# Test backend
curl https://api.yourdomain.com/health

# Test full flow in browser
open https://yourdomain.com
```

## 🚦 Roadmap

### ✅ Phase 1: MVP (Current)
- Landing page
- Survey flow
- Plan generation
- Plan display
- Waitlist capture

### 🔜 Phase 2: User Accounts
- Authentication (JWT)
- Save plans to account
- Plan history
- Edit/regenerate plans

### 🔮 Phase 3: Progress Tracking
- Log workouts
- Track weight progress
- Upload progress photos
- View analytics dashboard

### 💭 Phase 4: Social & Community
- Share progress updates
- Accountability groups
- Comments and likes
- Workout challenges

### 🍽️ Phase 5: Meal Planning
- Personalized meal plans
- Recipe database
- Shopping lists
- Macro tracking

## 💰 Costs

### Free Tier (MVP)
- Railway: $5 credit/month
- Vercel: 100GB bandwidth/month
- **Total**: $0/month

### Paid Tier (Growth)
- Railway Pro: $20/month
- Vercel Pro: $20/month
- **Total**: $40/month

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test locally: `npm run dev` in both `api/` and `frontend/`
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📝 License

MIT License - see [LICENSE](./LICENSE) for details

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Database ORM by [Prisma](https://www.prisma.io/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Hosted on [Railway](https://railway.app/) & [Vercel](https://vercel.com/)

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/unweighted/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/unweighted/discussions)
- **Email**: support@unweighted.com

---

**Ready to get started?** See [QUICKSTART.md](./QUICKSTART.md) to run locally or [FULLSTACK-DEPLOYMENT-GUIDE.md](./FULLSTACK-DEPLOYMENT-GUIDE.md) to deploy to production.

Built with ❤️ for people who want real results.
