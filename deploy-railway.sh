#!/bin/bash

# 🚜 NHFarming Railway Deployment Script
echo "🚜 Starting NHFarming deployment to Railway..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Login to Railway
echo "🔐 Logging into Railway..."
railway login

# Deploy Backend
echo "🚀 Deploying Backend..."
cd backend
railway init
railway up

# Get backend URL
BACKEND_URL=$(railway status --json | grep -o '"url":"[^"]*"' | cut -d'"' -f4)
echo "✅ Backend deployed at: $BACKEND_URL"

# Deploy Frontend
echo "🚀 Deploying Frontend..."
cd ../frontend

# Create .env file for frontend
echo "REACT_APP_API_URL=$BACKEND_URL/api" > .env

railway init
railway up

# Get frontend URL
FRONTEND_URL=$(railway status --json | grep -o '"url":"[^"]*"' | cut -d'"' -f4)
echo "✅ Frontend deployed at: $FRONTEND_URL"

echo "🎉 Deployment complete!"
echo "📱 Frontend: $FRONTEND_URL"
echo "🔧 Backend: $BACKEND_URL"
echo "🔗 Health Check: $BACKEND_URL/health" 