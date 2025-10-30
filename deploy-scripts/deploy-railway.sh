#!/bin/bash
# Quick deployment script for Railway

echo "🚀 Deploying Unweighted to Railway..."

# Check if railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Login
echo "📝 Logging in to Railway..."
railway login

# Link project (if not already linked)
echo "🔗 Linking to Railway project..."
railway link

# Set environment variables
echo "⚙️  Setting environment variables..."
railway variables set NODE_ENV=production
railway variables set PORT=3000
railway variables set JWT_SECRET=$(openssl rand -hex 32)
railway variables set JWT_EXPIRES_IN=24h
railway variables set ALLOWED_ORIGINS=https://yourdomain.com

echo "📦 Deploying..."
railway up

echo "✅ Deployment complete!"
echo "🌐 Your API will be available at your Railway-provided URL"
echo ""
echo "Next steps:"
echo "1. Go to railway.app dashboard to see your deployment"
echo "2. Note your deployment URL"
echo "3. Seed the database: railway run npm run db:seed"
echo "4. Configure your Namecheap domain to point to Railway URL"
