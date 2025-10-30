#!/bin/bash
# Quick deployment script for Heroku

echo "🚀 Deploying Unweighted to Heroku..."

# Check if heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo "❌ Heroku CLI not found. Please install it first:"
    echo "https://devcenter.heroku.com/articles/heroku-cli"
    exit 1
fi

# Login
echo "📝 Logging in to Heroku..."
heroku login

# Get app name
read -p "Enter your Heroku app name (e.g., unweighted-api): " APP_NAME

# Create app
echo "🔧 Creating Heroku app..."
heroku create $APP_NAME

# Set environment variables
echo "⚙️  Setting environment variables..."
heroku config:set NODE_ENV=production -a $APP_NAME
heroku config:set JWT_SECRET=$(openssl rand -hex 32) -a $APP_NAME
heroku config:set JWT_EXPIRES_IN=24h -a $APP_NAME
heroku config:set ALLOWED_ORIGINS=https://yourdomain.com -a $APP_NAME

# Deploy
echo "📦 Deploying to Heroku..."
git push heroku $(git branch --show-current):main

# Seed database
echo "🌱 Seeding database..."
heroku run "cd backend && npm run db:seed" -a $APP_NAME

echo "✅ Deployment complete!"
echo "🌐 Your API is available at: https://$APP_NAME.herokuapp.com"
echo ""
echo "Test it:"
echo "curl https://$APP_NAME.herokuapp.com/api/v1/health"
