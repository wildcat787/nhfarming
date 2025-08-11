#!/bin/bash

# 🚀 NHFarming Deployment Script
# This script helps deploy changes from offline development to online testing

echo "🚜 NHFarming Deployment Script"
echo "================================"

# Check if we're in the main NHFarming directory
if [[ ! -f "render.yaml" ]]; then
    echo "❌ Error: This script must be run from the main NHFarming directory"
    echo "   Current directory: $(pwd)"
    echo "   Expected: /Users/user/Documents/NHFarming"
    exit 1
fi

# Check if offline backup exists
if [[ ! -d "/Users/user/Documents/NHFarming-offline-backup" ]]; then
    echo "❌ Error: Offline backup not found at /Users/user/Documents/NHFarming-offline-backup"
    echo "   Please ensure you have the offline backup for development"
    exit 1
fi

echo "✅ Current directory: $(pwd)"
echo "✅ Offline backup found: /Users/user/Documents/NHFarming-offline-backup"

# Check git status
echo ""
echo "📊 Git Status:"
git status --porcelain

if [[ -z $(git status --porcelain) ]]; then
    echo "✅ Working directory is clean"
else
    echo "⚠️  You have uncommitted changes"
    echo "   Please commit your changes first:"
    echo "   git add . && git commit -m 'your message'"
    exit 1
fi

# Deploy to GitHub and Render
echo ""
echo "🚀 Deploying to GitHub and Render..."
echo "   This will trigger automatic deployment on Render"

git push origin main

if [[ $? -eq 0 ]]; then
    echo ""
    echo "✅ SUCCESS: Changes deployed!"
    echo ""
    echo "🌐 Your application is now live at:"
    echo "   Frontend: https://nhfarming-frontend.onrender.com"
    echo "   Backend:  https://nhfarming-backend.onrender.com/api"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Test the application at the frontend URL"
    echo "   2. Continue development in the offline backup"
    echo "   3. Run this script again when ready to deploy"
else
    echo "❌ Error: Failed to push to GitHub"
    exit 1
fi
