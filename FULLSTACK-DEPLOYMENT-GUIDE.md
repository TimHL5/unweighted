# Full-Stack Deployment Guide - Unweighted MVP

Complete guide to deploy both the backend API and Next.js frontend to production.

## Overview

**Architecture**:
- Backend: Express + Prisma + PostgreSQL (Railway)
- Frontend: Next.js 14 (Vercel)
- Domain: Namecheap DNS configuration

**Total Time**: ~30 minutes
**Cost**: Free tier available on both platforms

---

## Part 1: Deploy Backend to Railway

### Step 1: Prepare Backend

1. **Verify your backend is ready**:
   ```bash
   cd /home/user/unweighted/api
   ls -la
   # Should see: src/, prisma/, package.json
   ```

2. **Test locally** (optional):
   ```bash
   npm install
   npm run dev
   # Should start on port 3001
   ```

### Step 2: Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Click "Sign Up" → Sign in with GitHub
3. Authorize Railway to access your repository

### Step 3: Deploy Backend

1. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `unweighted` repository
   - Railway will detect Node.js automatically

2. **Add PostgreSQL Database**:
   - In your project dashboard, click "+ New"
   - Select "Database" → "PostgreSQL"
   - Railway will create a PostgreSQL instance
   - Click on PostgreSQL → "Variables" tab
   - Copy the `DATABASE_URL` value

3. **Configure Backend Service**:
   - Click on your service (the one from GitHub)
   - Go to "Settings" tab
   - **Set Root Directory**: `api`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm start`

4. **Set Environment Variables**:
   - Click "Variables" tab
   - Add the following variables:

   ```env
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   FRONTEND_URL=https://unweighted.vercel.app
   CORS_ORIGIN=https://unweighted.vercel.app
   ```

   Note: Replace `unweighted.vercel.app` with your actual frontend domain once deployed.

5. **Generate Domain**:
   - Go to "Settings" → "Networking"
   - Click "Generate Domain"
   - You'll get a URL like: `unweighted-api-production.up.railway.app`
   - Copy this URL - you'll need it for frontend configuration

### Step 4: Run Database Migrations

1. **In Railway dashboard**:
   - Click on your service
   - Go to "Deployments" tab
   - Once deployed, click on latest deployment
   - Click "View Logs" to monitor

2. **Run migrations via Railway CLI** (recommended):
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli

   # Login
   railway login

   # Link to your project
   railway link

   # Run migrations
   railway run npx prisma migrate deploy

   # Seed database
   railway run npm run seed
   ```

   **Alternative: Using web terminal**:
   - In Railway dashboard, click "Shell" icon
   - Run commands:
     ```bash
     cd api
     npx prisma migrate deploy
     npm run seed
     ```

### Step 5: Test Backend

```bash
# Replace with your Railway domain
curl https://unweighted-api-production.up.railway.app/health

# Test survey endpoint
curl -X POST https://unweighted-api-production.up.railway.app/survey/submit \
  -H "Content-Type: application/json" \
  -d '{"age":25,"gender":"male","currentWeight":180,"goalWeight":170,"height":70,"weightUnit":"lbs","heightUnit":"inches","fitnessLevel":"intermediate","primaryGoal":"lose_weight","targetTimeline":"3_months","attemptsCount":"2_times","pastBarriers":["Lack of time"],"workoutTypes":["Strength training"],"equipmentAccess":"home_gym","workoutDurationPref":"30-45","workoutsPerWeek":3,"wakeTime":"06:00","bedTime":"22:00","preferredWorkoutTime":"morning","workSchedule":"9-5 desk job","email":"test@example.com"}'
```

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Prepare Frontend

1. **Create Vercel account**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Sign Up" → Sign in with GitHub

2. **Push frontend to GitHub** (if not already):
   ```bash
   cd /home/user/unweighted
   git add frontend/
   git commit -m "Add frontend for deployment"
   git push -u origin claude/prototype-from-requirements-011CUdCh4SMJPiWMC9AmrL2a
   ```

### Step 2: Deploy to Vercel

1. **Import Project**:
   - In Vercel dashboard, click "Add New..." → "Project"
   - Select your GitHub repository
   - Vercel will detect Next.js automatically

2. **Configure Build Settings**:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

3. **Set Environment Variables**:
   - Click "Environment Variables"
   - Add the following:

   ```env
   NEXT_PUBLIC_API_URL=https://unweighted-api-production.up.railway.app
   NEXT_PUBLIC_FRONTEND_URL=https://unweighted.vercel.app
   ```

   Note: Replace with your actual Railway backend URL.

4. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete
   - You'll get a URL like: `unweighted-abc123.vercel.app`

### Step 3: Update Backend CORS

Now that you have your frontend URL, update Railway backend:

1. Go to Railway dashboard
2. Click on your backend service
3. Go to "Variables" tab
4. Update these variables:
   ```env
   FRONTEND_URL=https://unweighted-abc123.vercel.app
   CORS_ORIGIN=https://unweighted-abc123.vercel.app
   ```
5. Service will automatically redeploy

### Step 4: Test Full Stack

1. Visit your Vercel URL: `https://unweighted-abc123.vercel.app`
2. You should see the landing page
3. Click "Create Your Plan" → Fill out survey
4. Verify plan generation works
5. Test sharing a plan by copying the URL

---

## Part 3: Configure Custom Domain (Namecheap)

### Option A: Use Vercel Domain for Frontend

1. **Add Custom Domain in Vercel**:
   - In Vercel project settings → "Domains"
   - Click "Add" → Enter `yourdomain.com`
   - Vercel will show you DNS records to add

2. **Configure Namecheap DNS**:
   - Login to [namecheap.com](https://namecheap.com)
   - Go to Domain List → Manage → Advanced DNS

   Add these records:
   ```
   Type: A Record
   Host: @
   Value: 76.76.21.21
   TTL: Automatic
   ```

   ```
   Type: CNAME Record
   Host: www
   Value: cname.vercel-dns.com
   TTL: Automatic
   ```

3. **Add API Subdomain**:
   ```
   Type: CNAME Record
   Host: api
   Value: unweighted-api-production.up.railway.app
   TTL: Automatic
   ```

4. **Wait for DNS propagation** (5-30 minutes):
   ```bash
   # Check status
   nslookup yourdomain.com
   nslookup api.yourdomain.com
   ```

### Option B: Use Railway Domain for Backend

If you want `api.yourdomain.com`:

1. **Add Custom Domain in Railway**:
   - Go to Railway service → Settings → Networking
   - Click "Custom Domain"
   - Enter: `api.yourdomain.com`
   - Railway will show you a CNAME target

2. **Add DNS Record in Namecheap**:
   ```
   Type: CNAME Record
   Host: api
   Value: [Railway provided value]
   TTL: Automatic
   ```

### Step 5: Update Environment Variables for Custom Domain

**In Railway**:
```env
FRONTEND_URL=https://yourdomain.com
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
```

**In Vercel**:
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_FRONTEND_URL=https://yourdomain.com
```

---

## Part 4: Post-Deployment Checklist

### 1. Verify All Endpoints

```bash
# Backend health
curl https://api.yourdomain.com/health

# Frontend
curl -I https://yourdomain.com

# Test full flow
# 1. Visit https://yourdomain.com
# 2. Fill out survey
# 3. Verify plan generation
# 4. Test plan sharing
```

### 2. Monitor Logs

**Railway Logs**:
- Dashboard → Service → Deployments → View Logs
- Look for any errors or warnings

**Vercel Logs**:
- Dashboard → Project → Deployments → View Function Logs
- Check for any build or runtime errors

### 3. Setup Monitoring (Optional)

**Railway**:
- Built-in metrics in dashboard
- Set up alerts for downtime

**Vercel**:
- Built-in analytics
- Enable Web Vitals monitoring

### 4. Database Backups

Railway PostgreSQL backups:
- Automatic daily backups on Pro plan
- Manual backups: Railway dashboard → Database → Backups

### 5. Security Checklist

- ✅ HTTPS enabled on both frontend and backend
- ✅ CORS configured correctly
- ✅ Environment variables secured
- ✅ Database password strong
- ✅ No sensitive data in git

---

## Troubleshooting

### Frontend can't connect to backend

**Symptoms**: Survey submission fails, plans don't load

**Solutions**:
1. Check CORS configuration in Railway:
   ```env
   CORS_ORIGIN=https://yourdomain.com
   ```

2. Verify API URL in Vercel:
   ```env
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com
   ```

3. Check Railway logs for CORS errors

4. Test backend directly:
   ```bash
   curl -H "Origin: https://yourdomain.com" -I https://api.yourdomain.com/health
   ```

### Backend deployment fails

**Symptoms**: Railway build fails

**Solutions**:
1. Check build logs in Railway dashboard
2. Verify root directory is set to `api`
3. Ensure `package.json` has correct scripts:
   ```json
   {
     "scripts": {
       "build": "tsc",
       "start": "node dist/index.js"
     }
   }
   ```

### Database migration fails

**Symptoms**: Prisma errors in logs

**Solutions**:
1. Verify `DATABASE_URL` is set correctly
2. Run migrations manually:
   ```bash
   railway run npx prisma migrate deploy
   ```
3. Check PostgreSQL service is running in Railway

### Frontend build fails on Vercel

**Symptoms**: Build errors in Vercel

**Solutions**:
1. Check build logs in Vercel dashboard
2. Verify root directory is set to `frontend`
3. Test build locally:
   ```bash
   cd frontend
   npm run build
   ```
4. Check for TypeScript errors

### DNS not resolving

**Symptoms**: Domain doesn't load

**Solutions**:
1. Wait 30-60 minutes for DNS propagation
2. Clear DNS cache:
   - macOS: `sudo dscacheutil -flushcache`
   - Windows: `ipconfig /flushdns`
   - Linux: `sudo systemd-resolve --flush-caches`
3. Verify DNS records:
   ```bash
   nslookup yourdomain.com
   nslookup api.yourdomain.com
   ```
4. Use [dnschecker.org](https://dnschecker.org) to check global propagation

---

## Costs

### Free Tier (Perfect for MVP)

**Railway**:
- $5 credit/month
- 500 hours/month
- Sufficient for MVP traffic

**Vercel**:
- 100GB bandwidth/month
- Unlimited deployments
- Free custom domain

**Total**: $0/month for MVP, ~$10-15/month as you scale

### Paid Tier (For Growth)

**Railway Pro**: $20/month
- More resources
- Priority support
- Advanced monitoring

**Vercel Pro**: $20/month
- More bandwidth
- Advanced analytics
- Team collaboration

---

## Development Workflow

### Making Changes

**Backend changes**:
```bash
cd api/
# Make changes
git add .
git commit -m "Update backend"
git push
# Railway auto-deploys
```

**Frontend changes**:
```bash
cd frontend/
# Make changes
git add .
git commit -m "Update frontend"
git push
# Vercel auto-deploys
```

### Testing Locally with Production Backend

```bash
# In frontend/.env.local
NEXT_PUBLIC_API_URL=https://api.yourdomain.com

# Run frontend
npm run dev
```

### Rolling Back Deployments

**Railway**:
- Dashboard → Deployments → Click previous deployment → "Rollback"

**Vercel**:
- Dashboard → Deployments → Previous deployment → "Promote to Production"

---

## Next Steps

### Phase 2 Features (After MVP Validation)

1. **User Authentication**
   - Allow users to save plans
   - Track progress over time

2. **Progress Tracking**
   - Log workouts
   - Track weight/measurements
   - View progress charts

3. **Meal Planning**
   - Nutrition calculator
   - Meal suggestions
   - Macro tracking

4. **Social Features**
   - Share workouts
   - Accountability groups
   - Workout feed

5. **Mobile App**
   - React Native or Flutter
   - Use same backend API

### Scaling Considerations

**When to upgrade**:
- 1,000+ active users
- High API request volume
- Need faster database queries

**Upgrade path**:
- Railway Pro with larger PostgreSQL instance
- Add Redis for caching (Railway add-on)
- Vercel Pro for more bandwidth
- Consider CDN for static assets (Cloudflare)

---

## Quick Reference

### Important URLs

- **Frontend**: https://yourdomain.com
- **Backend**: https://api.yourdomain.com
- **Railway Dashboard**: https://railway.app
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Namecheap DNS**: https://namecheap.com/account/domain-list

### Key Commands

```bash
# Railway CLI
railway login
railway link
railway run npm run seed
railway logs

# Vercel CLI
vercel login
vercel --prod
vercel logs

# Test endpoints
curl https://api.yourdomain.com/health
curl https://yourdomain.com
```

### Support

- **Railway**: [railway.app/help](https://railway.app/help)
- **Vercel**: [vercel.com/support](https://vercel.com/support)
- **Namecheap**: [namecheap.com/support](https://namecheap.com/support)

---

**You're all set! 🎉**

Your Unweighted MVP is now live and ready to help people get personalized workout plans.

Share your landing page on social media and start getting users!
