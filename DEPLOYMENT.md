# Deployment Guide - Unweighted API

This guide covers deploying the Unweighted backend API to production with your custom domain.

## Table of Contents
1. [Option 1: Railway (Recommended - Easiest)](#option-1-railway)
2. [Option 2: Heroku](#option-2-heroku)
3. [Option 3: DigitalOcean](#option-3-digitalocean)
4. [Configure Namecheap Domain](#configure-domain)
5. [Post-Deployment Setup](#post-deployment)

---

## Option 1: Railway (Recommended - Easiest) ⭐

Railway is the fastest way to deploy with automatic HTTPS and easy environment management.

### Step 1: Prepare for Deployment

First, let's add a production start script and ensure the app works with dynamic ports:

1. **Install Railway CLI** (optional but helpful):
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**:
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub
   - Create a new project

### Step 2: Deploy to Railway

**Option A: Using Railway CLI**

```bash
cd /home/user/unweighted/backend

# Login
railway login

# Link to your project
railway link

# Add environment variables
railway variables set JWT_SECRET=$(openssl rand -hex 32)
railway variables set NODE_ENV=production
railway variables set ALLOWED_ORIGINS=https://yourdomain.com

# Deploy
railway up
```

**Option B: Using GitHub (Recommended)**

1. Go to [railway.app](https://railway.app) dashboard
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `unweighted` repository
5. Railway will auto-detect Node.js

### Step 3: Configure Railway

1. **Set Environment Variables** in Railway dashboard:
   ```
   NODE_ENV=production
   PORT=3000
   JWT_SECRET=<generate-random-32-char-string>
   JWT_EXPIRES_IN=24h
   ALLOWED_ORIGINS=https://yourdomain.com,https://api.yourdomain.com
   ```

2. **Set Root Directory** (important!):
   - In Railway settings → Set root directory to: `backend`

3. **Set Start Command**:
   - Railway auto-detects `npm start`
   - Or manually set: `node src/server.js`

4. **Generate Domain**:
   - Railway provides a free domain like: `yourapp.up.railway.app`
   - Note this URL for testing

### Step 4: Test Deployment

```bash
curl https://yourapp.up.railway.app/api/v1/health
```

Should return: `{"status":"ok","message":"Unweighted API is running"}`

### Step 5: Seed Production Database

```bash
# Option 1: Using Railway CLI
railway run npm run db:seed

# Option 2: SSH into Railway container
railway shell
npm run db:seed
exit
```

**Railway Pricing**:
- Free tier: $5 credit/month (enough for small apps)
- Pro: $20/month for more resources

---

## Option 2: Heroku

Heroku is reliable and has a free tier (with some limitations).

### Step 1: Install Heroku CLI

```bash
# macOS
brew tap heroku/brew && brew install heroku

# Ubuntu/Debian
curl https://cli-assets.heroku.com/install.sh | sh

# Windows
# Download from: https://devcenter.heroku.com/articles/heroku-cli
```

### Step 2: Create Heroku App

```bash
cd /home/user/unweighted

# Login
heroku login

# Create app (choose your app name)
heroku create unweighted-api

# Note: Heroku gives you a URL like: https://unweighted-api.herokuapp.com
```

### Step 3: Configure Heroku

```bash
# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=$(openssl rand -hex 32)
heroku config:set ALLOWED_ORIGINS=https://yourdomain.com

# Add buildpack (if not auto-detected)
heroku buildpacks:set heroku/nodejs
```

### Step 4: Create Procfile

Create a file in the root directory:

```bash
echo "web: cd backend && node src/server.js" > Procfile
git add Procfile
git commit -m "Add Procfile for Heroku"
```

### Step 5: Deploy

```bash
git push heroku claude/prototype-from-requirements-011CUdCh4SMJPiWMC9AmrL2a:main
```

### Step 6: Seed Database

```bash
heroku run "cd backend && npm run db:seed"
```

### Step 7: Test

```bash
curl https://unweighted-api.herokuapp.com/api/v1/health
```

**Heroku Pricing**:
- Eco Dynos: $5/month (basic apps)
- Basic: $7/month
- Professional: $25-50/month

---

## Option 3: DigitalOcean (Most Control)

DigitalOcean gives you full control with a VPS (Virtual Private Server).

### Step 1: Create Droplet

1. Go to [digitalocean.com](https://digitalocean.com)
2. Create account (get $200 credit with GitHub Student Pack)
3. Click "Create" → "Droplets"
4. Choose:
   - **Image**: Ubuntu 22.04 LTS
   - **Plan**: Basic ($4-6/month)
   - **Datacenter**: Closest to your users
   - **Authentication**: SSH Key (create one if needed)

### Step 2: SSH into Server

```bash
ssh root@your-droplet-ip
```

### Step 3: Install Dependencies

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install Nginx (reverse proxy)
apt install -y nginx

# Install Git
apt install -y git

# Install PM2 (process manager)
npm install -g pm2
```

### Step 4: Clone Repository

```bash
# Create app directory
mkdir -p /var/www
cd /var/www

# Clone your repo (replace with your repo URL)
git clone https://github.com/yourusername/unweighted.git
cd unweighted/backend

# Install dependencies
npm install --production
```

### Step 5: Configure Environment

```bash
# Create production .env file
cat > .env << 'EOF'
NODE_ENV=production
PORT=3000
DB_PATH=/var/www/unweighted/backend/database.sqlite
JWT_SECRET=REPLACE_WITH_RANDOM_STRING_32_CHARS
JWT_EXPIRES_IN=24h
ALLOWED_ORIGINS=https://api.yourdomain.com,https://yourdomain.com
EOF

# Generate secure JWT secret
sed -i "s/REPLACE_WITH_RANDOM_STRING_32_CHARS/$(openssl rand -hex 32)/" .env

# Seed database
npm run db:seed
```

### Step 6: Start with PM2

```bash
# Start application
pm2 start src/server.js --name unweighted-api

# Save PM2 config
pm2 save

# Setup PM2 to start on boot
pm2 startup systemd
# Run the command it outputs
```

### Step 7: Configure Nginx

```bash
# Create Nginx config
cat > /etc/nginx/sites-available/unweighted << 'EOF'
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable site
ln -s /etc/nginx/sites-available/unweighted /etc/nginx/sites-enabled/

# Test Nginx config
nginx -t

# Restart Nginx
systemctl restart nginx
```

### Step 8: Setup SSL with Certbot

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
certbot --nginx -d api.yourdomain.com

# Certbot will automatically:
# 1. Get SSL certificate from Let's Encrypt
# 2. Configure Nginx for HTTPS
# 3. Setup auto-renewal
```

### Step 9: Configure Firewall

```bash
# Setup UFW firewall
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

---

## Configure Domain (Namecheap) 🌐

Now let's point your Namecheap domain to your deployment.

### For Railway or Heroku:

1. **Get your deployment URL**:
   - Railway: `yourapp.up.railway.app`
   - Heroku: `yourapp.herokuapp.com`

2. **Login to Namecheap**:
   - Go to [namecheap.com](https://namecheap.com)
   - Go to Dashboard → Domain List

3. **Manage DNS**:
   - Click "Manage" next to your domain
   - Go to "Advanced DNS" tab

4. **Add DNS Records**:

   For **api.yourdomain.com** (recommended for API):
   ```
   Type: CNAME Record
   Host: api
   Value: yourapp.up.railway.app (or herokuapp.com)
   TTL: Automatic
   ```

   For **root domain** (yourdomain.com):
   ```
   Type: ALIAS or ANAME Record (if available)
   Host: @
   Value: yourapp.up.railway.app
   TTL: Automatic
   ```

   If ALIAS not available, use A records with IP:
   ```
   Type: A Record
   Host: @
   Value: <get-ip-from-railway/heroku>
   TTL: Automatic
   ```

### For DigitalOcean:

1. **Get your Droplet IP**:
   - Found in DigitalOcean dashboard
   - Example: `167.99.241.1`

2. **Add DNS Records in Namecheap**:

   ```
   Type: A Record
   Host: api
   Value: YOUR_DROPLET_IP
   TTL: Automatic
   ```

   ```
   Type: A Record
   Host: @
   Value: YOUR_DROPLET_IP
   TTL: Automatic
   ```

   ```
   Type: A Record
   Host: www
   Value: YOUR_DROPLET_IP
   TTL: Automatic
   ```

### DNS Propagation

- DNS changes take 5-30 minutes to propagate
- Check status: `nslookup api.yourdomain.com`
- Or use: [dnschecker.org](https://dnschecker.org)

---

## Post-Deployment Setup ✅

### 1. Test Your API

```bash
# Health check
curl https://api.yourdomain.com/api/v1/health

# Register test user
curl -X POST https://api.yourdomain.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"TestPass123","username":"testuser","full_name":"Test User","date_of_birth":"1995-01-01","gender":"male"}'
```

### 2. Setup Monitoring

**For Railway**: Built-in monitoring in dashboard

**For Heroku**:
```bash
heroku logs --tail
```

**For DigitalOcean**:
```bash
# View PM2 logs
pm2 logs unweighted-api

# View Nginx logs
tail -f /var/log/nginx/error.log
```

### 3. Setup Database Backups

**For SQLite on VPS**:
```bash
# Create backup script
cat > /root/backup-db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
cp /var/www/unweighted/backend/database.sqlite /root/backups/db_backup_$DATE.sqlite
# Keep only last 7 days
find /root/backups -name "db_backup_*.sqlite" -mtime +7 -delete
EOF

chmod +x /root/backup-db.sh

# Create backups directory
mkdir -p /root/backups

# Add to crontab (daily at 2 AM)
echo "0 2 * * * /root/backup-db.sh" | crontab -
```

### 4. Update Environment Variables

Make sure to update in production:
- `ALLOWED_ORIGINS` - Add your actual domain
- `JWT_SECRET` - Use a strong random string
- Consider adding: `UPLOAD_DIR`, `MAX_FILE_SIZE`, etc.

### 5. Performance Optimization

**Enable Gzip** (Nginx):
```nginx
gzip on;
gzip_types application/json;
```

**Set up CDN** (optional):
- Cloudflare (free) for caching and DDoS protection
- Point Namecheap nameservers to Cloudflare

### 6. Security Checklist

- ✅ HTTPS enabled
- ✅ Strong JWT secret
- ✅ Firewall configured
- ✅ Regular backups
- ✅ Keep dependencies updated: `npm audit fix`
- ✅ Rate limiting (add `express-rate-limit` package)

---

## Troubleshooting

### API not responding:
```bash
# Check if process is running
pm2 status  # DigitalOcean
heroku ps  # Heroku

# Check logs
pm2 logs  # DigitalOcean
heroku logs --tail  # Heroku
```

### Database issues:
```bash
# Re-seed database
npm run db:seed
```

### Domain not resolving:
```bash
# Check DNS
nslookup api.yourdomain.com

# Wait 30 minutes for propagation
# Clear your DNS cache:
# macOS: sudo dscacheutil -flushcache
# Windows: ipconfig /flushdns
```

### SSL certificate issues:
```bash
# Renew certificate (DigitalOcean)
certbot renew --dry-run
```

---

## Next Steps

1. **Mobile App**: Update API base URL in mobile app to `https://api.yourdomain.com`
2. **File Uploads**: Setup S3 or Cloudinary for images
3. **Email**: Setup SendGrid for transactional emails
4. **Analytics**: Add Mixpanel or Amplitude
5. **Monitoring**: Setup error tracking (Sentry)

---

## Quick Reference

### Railway
- Dashboard: https://railway.app
- Logs: Railway dashboard → "Logs" tab
- Deploy: `git push` (auto-deploys)

### Heroku
- Dashboard: https://dashboard.heroku.com
- Logs: `heroku logs --tail`
- Deploy: `git push heroku main`

### DigitalOcean
- Dashboard: https://cloud.digitalocean.com
- SSH: `ssh root@your-ip`
- Logs: `pm2 logs`
- Restart: `pm2 restart unweighted-api`

---

**Need help?** Let me know which deployment option you chose and I can provide more specific guidance!
