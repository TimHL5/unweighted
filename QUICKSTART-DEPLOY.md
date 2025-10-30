# 🚀 Quick Deploy Guide

Choose your deployment method:

## ⚡ Fastest: Railway (5 minutes)

**Why Railway?**
- ✅ Easiest deployment
- ✅ Free tier ($5 credit/month)
- ✅ Automatic HTTPS
- ✅ Auto-detects Node.js
- ✅ Built-in monitoring

### Steps:

1. **Sign up at [railway.app](https://railway.app)** with GitHub

2. **Deploy via GitHub (Recommended)**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `unweighted` repository
   - Railway auto-detects and builds
   - ⚠️ **Important**: Go to Settings → Set **Root Directory** to `backend`

3. **Set Environment Variables** in Railway dashboard:
   ```
   NODE_ENV=production
   PORT=3000
   JWT_SECRET=<click-generate-to-create-random>
   ALLOWED_ORIGINS=https://yourdomain.com
   ```

4. **Generate Domain**: Railway gives you `yourapp.up.railway.app`

5. **Seed Database**:
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli

   # Login and link
   railway login
   railway link

   # Seed
   railway run npm run db:seed
   ```

6. **Test**:
   ```bash
   curl https://yourapp.up.railway.app/api/v1/health
   ```

---

## 🔵 Alternative: Heroku

1. **Install Heroku CLI**: [Download here](https://devcenter.heroku.com/articles/heroku-cli)

2. **Run the deploy script**:
   ```bash
   cd /home/user/unweighted
   ./deploy-scripts/deploy-heroku.sh
   ```

3. Follow the prompts!

---

## 🌊 Alternative: DigitalOcean (Full Control)

Best for: Custom requirements, full server access, scaling

**Cost**: $4-6/month

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full DigitalOcean guide.

---

## 📍 Configure Your Namecheap Domain

Once deployed, point your domain to the API:

### 1. Login to Namecheap
- Go to [namecheap.com](https://namecheap.com)
- Dashboard → Domain List → Manage

### 2. Go to Advanced DNS

### 3. Add DNS Record

**For Railway/Heroku**:
```
Type: CNAME Record
Host: api
Value: yourapp.up.railway.app (or herokuapp.com)
TTL: Automatic
```

**For DigitalOcean**:
```
Type: A Record
Host: api
Value: YOUR_DROPLET_IP
TTL: Automatic
```

### 4. Wait for DNS Propagation (5-30 minutes)

Test: `nslookup api.yourdomain.com`

### 5. Update ALLOWED_ORIGINS

In your deployment platform, update:
```
ALLOWED_ORIGINS=https://api.yourdomain.com,https://yourdomain.com
```

---

## ✅ Verify Deployment

```bash
# Replace with your domain
curl https://api.yourdomain.com/api/v1/health

# Should return:
{"status":"ok","message":"Unweighted API is running"}
```

---

## 🎯 Next Steps

1. **Test API endpoints** with Postman or curl
2. **Build mobile app** pointing to your API
3. **Setup monitoring** (Railway has built-in)
4. **Configure backups** for production database
5. **Add Cloudflare** (optional) for CDN and DDoS protection

---

## 🆘 Troubleshooting

**API not responding?**
- Check deployment logs in Railway/Heroku dashboard
- Verify environment variables are set
- Ensure root directory is `backend` (Railway)

**Domain not working?**
- Wait 30 min for DNS propagation
- Check DNS: `nslookup api.yourdomain.com`
- Verify CNAME/A record in Namecheap

**Database empty?**
- Run: `railway run npm run db:seed` (Railway)
- Or: `heroku run "cd backend && npm run db:seed"` (Heroku)

---

## 📚 Full Documentation

- Complete deployment guide: [DEPLOYMENT.md](./DEPLOYMENT.md)
- API documentation: [README.md](./README.md)
- GitHub repo: Check your repository URL

---

**Recommended**: Railway for fastest deployment!
