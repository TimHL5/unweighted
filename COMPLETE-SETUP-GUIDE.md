# 🚀 Complete Setup & Deployment Guide

## ✅ What's Already Built

Your backend is **100% complete** and ready to deploy:

### Backend Status: ✅ DONE
- [x] Express + TypeScript API server
- [x] Prisma schema (5 models)
- [x] Workout generation algorithm (350+ lines, production-ready)
- [x] 4 API routes (survey, plan, waitlist, analytics)
- [x] 50+ exercises seeded
- [x] Full validation and error handling

**Location**: `/api/` directory

---

## 🎯 Quick Deploy Path (Choose One)

### Path A: Deploy Backend First, Build Frontend Later ⭐ RECOMMENDED
1. Deploy backend to Railway (20 min)
2. Configure your domain (10 min)
3. Test API with Postman
4. Build frontend at your own pace

### Path B: Complete Everything Locally First
1. Set up PostgreSQL locally
2. Build Next.js frontend
3. Test full stack locally
4. Deploy everything

**I recommend Path A** - Get the backend live first, verify it works with your domain, then build frontend.

---

## 📦 Path A: Deploy Backend to Railway

### Step 1: Create Railway Account & Database

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project"
4. Select "Provision PostgreSQL" (creates a database)
5. Note your database URL (you'll need this)

### Step 2: Prepare Code for Deployment

Your code is ready! Just need to create one production config file:

Create `/api/.env.production`:
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=<Railway will inject this automatically>
CORS_ORIGINS=https://unweighted.app,https://api.unweighted.app,https://www.unweighted.app
FRONTEND_URL=https://unweighted.app
```

### Step 3: Deploy to Railway

**Option A: Deploy from GitHub** (Recommended):
1. Push your code to GitHub (already done!)
2. In Railway, click "New" → "Deploy from GitHub repo"
3. Select your `unweighted` repository
4. Railway will detect Node.js

**Configuration in Railway**:
- **Root Directory**: `api`
- **Build Command**: `npm install && npx prisma generate && npm run build`
- **Start Command**: `npm start`
- **Install Command**: `npm install`

**Environment Variables** (Railway dashboard):
```
NODE_ENV=production
PORT=3001
CORS_ORIGINS=https://unweighted.app,https://api.unweighted.app
FRONTEND_URL=https://unweighted.app
```

Note: `DATABASE_URL` is auto-injected by Railway

### Step 4: Run Database Migrations

In Railway dashboard → your service:

1. Click "Settings" → "Deploy"
2. Add "Deploy Command":
   ```
   npx prisma migrate deploy && npx prisma db seed
   ```

Or use Railway CLI:
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and link
railway login
railway link

# Run migrations and seed
railway run npx prisma migrate deploy
railway run npm run seed
```

### Step 5: Get Your API URL

Railway gives you a URL like:
```
https://unweighted-production.up.railway.app
```

**Test it**:
```bash
curl https://your-app.up.railway.app/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2025-10-30T...",
  "database": "connected"
}
```

---

## 🌐 Configure Your Namecheap Domain

### Step 1: Login to Namecheap

1. Go to [namecheap.com](https://namecheap.com)
2. Dashboard → Domain List
3. Click "Manage" on your domain
4. Go to "Advanced DNS" tab

### Step 2: Add DNS Records

**For API Subdomain** (api.yourdomain.com):
```
Type: CNAME Record
Host: api
Value: unweighted-production.up.railway.app
TTL: Automatic
```

**For Root Domain** (@.yourdomain.com):
```
Type: CNAME Record
Host: @
Value: unweighted-production.up.railway.app
TTL: Automatic
```

**For WWW**:
```
Type: CNAME Record
Host: www
Value: unweighted-production.up.railway.app
TTL: Automatic
```

### Step 3: Add Custom Domain in Railway

1. Railway dashboard → Your service → "Settings"
2. Click "Networking" → "Custom Domain"
3. Add domain: `api.yourdomain.com`
4. Railway will automatically provision SSL certificate

### Step 4: Wait for DNS Propagation (5-30 minutes)

**Check DNS status**:
```bash
# Check if DNS is propagated
nslookup api.yourdomain.com

# Test API with your custom domain
curl https://api.yourdomain.com/health
```

---

## 🧪 Test Your Deployed Backend

### Test 1: Health Check
```bash
curl https://api.yourdomain.com/health
```

Expected: `{"status":"ok",...}`

### Test 2: Submit Survey (Generate Plan)
```bash
curl -X POST https://api.yourdomain.com/v1/survey/submit \
  -H "Content-Type: application/json" \
  -d '{
    "age": 28,
    "gender": "male",
    "currentWeight": 200,
    "goalWeight": 175,
    "height": 70,
    "fitnessLevel": "beginner",
    "primaryGoal": "lose_weight",
    "targetTimeline": "6_months",
    "attemptsCount": "3-5_times",
    "pastBarriers": ["lack_of_motivation"],
    "workoutTypes": ["strength", "cardio"],
    "equipmentAccess": "home_gym",
    "workoutDurationPref": "30-45",
    "workoutsPerWeek": 4,
    "wakeTime": "6-7",
    "bedTime": "10-11",
    "preferredWorkoutTime": "morning",
    "workSchedule": "9-5",
    "email": "test@example.com"
  }'
```

Expected: JSON with generated workout plan + share token

### Test 3: Retrieve Plan
```bash
# Use shareToken from previous response
curl https://api.yourdomain.com/v1/plan/[SHARE_TOKEN]
```

### Test 4: Join Waitlist
```bash
curl -X POST https://api.yourdomain.com/v1/waitlist/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "waitlist@example.com",
    "source": "landing_page",
    "interestedIn": ["meal_plans", "community"]
  }'
```

---

## 🎨 Build the Frontend (Next Steps)

Once your backend is live and tested, you can build the frontend.

### Quick Frontend Setup

```bash
cd /home/user/unweighted

# Create Next.js app
npx create-next-app@latest web \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*"

cd web

# Install dependencies
npm install react-hook-form zod @hookform/resolvers framer-motion
```

### Frontend Structure

Create these key files:

**1. API Integration** (`lib/api.ts`):
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/v1';

export interface SurveyData {
  age: number;
  gender: string;
  currentWeight: number;
  goalWeight: number;
  height: number;
  fitnessLevel: string;
  primaryGoal: string;
  targetTimeline: string;
  attemptsCount: string;
  pastBarriers: string[];
  workoutTypes: string[];
  equipmentAccess: string;
  workoutDurationPref: string;
  workoutsPerWeek: number;
  wakeTime: string;
  bedTime: string;
  preferredWorkoutTime: string;
  workSchedule: string;
  email: string;
}

export async function submitSurvey(data: SurveyData) {
  const response = await fetch(`${API_URL}/survey/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Session-Id': getSessionId()
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error('Survey submission failed');
  }

  return response.json();
}

export async function getPlan(shareToken: string) {
  const response = await fetch(`${API_URL}/plan/${shareToken}`, {
    headers: {
      'X-Session-Id': getSessionId()
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch plan');
  }

  return response.json();
}

export async function joinWaitlist(email: string, source: string, interestedIn: string[]) {
  const response = await fetch(`${API_URL}/waitlist/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Session-Id': getSessionId()
    },
    body: JSON.stringify({ email, source, interestedIn })
  });

  return response.json();
}

function getSessionId() {
  if (typeof window === 'undefined') return 'server';

  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
}
```

**2. Landing Page** (`app/page.tsx`):
```typescript
export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Get Your Personalized Workout Plan in 5 Minutes
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            No more guessing. Answer a quick survey and receive a science-backed
            4-week workout plan tailored to your goals and lifestyle.
          </p>
          <a
            href="/survey"
            className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition inline-block"
          >
            Start Your Free Plan →
          </a>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="font-semibold mb-2">1. Answer Questions</h3>
              <p className="text-gray-600">
                Tell us about your goals and lifestyle (5 min)
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-semibold mb-2">2. Get Your Plan</h3>
              <p className="text-gray-600">
                Receive a personalized 4-week workout program
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💪</span>
              </div>
              <h3 className="font-semibold mb-2">3. Start Training</h3>
              <p className="text-gray-600">
                Follow your plan and see results
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What You'll Get</h2>
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex items-start">
              <span className="text-green-500 mr-3">✓</span>
              <p>Personalized 4-week workout plan based on your goals</p>
            </div>
            <div className="flex items-start">
              <span className="text-green-500 mr-3">✓</span>
              <p>Exercises tailored to your equipment access (gym, home, or bodyweight)</p>
            </div>
            <div className="flex items-start">
              <span className="text-green-500 mr-3">✓</span>
              <p>Weekly progression structure to ensure continuous improvement</p>
            </div>
            <div className="flex items-start">
              <span className="text-green-500 mr-3">✓</span>
              <p>Form tips and alternatives for every exercise</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform?</h2>
          <a
            href="/survey"
            className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition inline-block"
          >
            Get Started
          </a>
        </div>
      </section>
    </main>
  );
}
```

**3. Survey Page** (`app/survey/page.tsx`):
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitSurvey, SurveyData } from '@/lib/api';

export default function Survey() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<SurveyData>>({});

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await submitSurvey(formData as SurveyData);
      router.push(`/plan/${result.data.shareToken}`);
    } catch (error) {
      alert('Failed to generate plan. Please try again.');
      setLoading(false);
    }
  };

  // Implement multi-step form here
  // Use react-hook-form for validation
  // See full implementation in NEXT-STEPS.md

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-blue-600 rounded-full transition-all"
              style={{ width: `${(step / 10) * 100}%` }}
            />
          </div>
          <p className="text-center mt-2 text-sm text-gray-600">
            Step {step} of 10
          </p>
        </div>

        {/* Survey steps here */}
        {/* See full implementation guide */}
      </div>
    </div>
  );
}
```

**4. Plan Page** (`app/plan/[shareToken]/page.tsx`):
```typescript
import { getPlan } from '@/lib/api';

export default async function PlanPage({ params }: { params: { shareToken: string } }) {
  const { data } = await getPlan(params.shareToken);
  const plan = data.plan;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-4">
          Your Personalized Workout Plan
        </h1>
        <p className="text-xl text-gray-600 mb-8">{plan.description}</p>

        {/* Display weeks and workouts */}
        <div className="space-y-8">
          {Object.entries(JSON.parse(JSON.stringify(plan.weeklySchedule))).map(([week, workouts]) => (
            <div key={week} className="bg-white rounded-lg p-6 shadow">
              <h2 className="text-2xl font-bold mb-4 capitalize">
                {week.replace('week', 'Week ')}
              </h2>
              {/* Display workouts for the week */}
              {/* See full implementation guide */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Deploy Frontend to Vercel

```bash
# From the web directory
cd web

# Connect to Vercel
npx vercel login
npx vercel link

# Add environment variable
npx vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://api.yourdomain.com/v1

# Deploy
npx vercel --prod
```

Or use Vercel dashboard:
1. Go to [vercel.com](https://vercel.com)
2. Import GitHub repository
3. Set root directory: `web`
4. Add env var: `NEXT_PUBLIC_API_URL=https://api.yourdomain.com/v1`
5. Deploy

### Add Frontend Domain to Namecheap

```
Type: CNAME Record
Host: @
Value: cname.vercel-dns.com
TTL: Automatic
```

Then in Vercel: Add custom domain `yourdomain.com`

---

## ✅ Final Checklist

Backend Deployment:
- [ ] Railway project created
- [ ] PostgreSQL database provisioned
- [ ] Code deployed from GitHub
- [ ] Database migrated (`prisma migrate deploy`)
- [ ] Exercises seeded (`npm run seed`)
- [ ] Health check returns 200
- [ ] Custom domain added in Railway
- [ ] DNS configured in Namecheap
- [ ] API accessible at `api.yourdomain.com`

Frontend Development:
- [ ] Next.js app created
- [ ] Landing page built
- [ ] Survey form implemented
- [ ] Plan display page created
- [ ] API integration tested
- [ ] Deployed to Vercel
- [ ] Custom domain configured

---

## 🆘 Troubleshooting

**Backend won't start:**
- Check Railway logs
- Verify DATABASE_URL is set
- Ensure migrations ran successfully

**DNS not working:**
- Wait 30 minutes for propagation
- Check DNS: `nslookup api.yourdomain.com`
- Verify CNAME record in Namecheap

**Database errors:**
- Run migrations: `railway run npx prisma migrate deploy`
- Check database connection
- Verify Prisma schema matches database

**Frontend can't reach API:**
- Check CORS_ORIGINS includes your domain
- Verify NEXT_PUBLIC_API_URL is correct
- Check browser console for errors

---

## 🎉 You're Done!

Your backend is complete and ready to deploy. Once deployed:

1. Backend will be live at: `https://api.yourdomain.com`
2. Can generate workout plans via API
3. All 50+ exercises seeded and ready
4. Waitlist capture working

Next: Build frontend at your own pace or hire a developer!

---

## 📊 What You Have

**Backend API** (Production Ready):
- POST `/v1/survey/submit` - Generate plans
- GET `/v1/plan/:token` - View plans
- POST `/v1/waitlist/signup` - Capture emails
- GET `/v1/analytics/stats` - View stats

**Database**:
- 50+ exercises covering all muscle groups
- Beginner to advanced difficulty
- All equipment types
- Form tips and alternatives

**Algorithm**:
- Personalized 4-week plans
- Progressive overload
- Goal-specific programming
- Equipment filtering
- Smart exercise selection

---

**Questions?**
- Backend code: `/api/` directory
- All working and tested locally
- Ready to deploy to Railway
- Deploy = 20 minutes + DNS = 30 minutes total

Let's deploy! 🚀
