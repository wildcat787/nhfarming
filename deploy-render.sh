#!/bin/bash

# 🚜 NHFarming Render Deployment Script
echo "🚜 Starting NHFarming deployment to Render..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not initialized. Initializing..."
    git init
fi

# Add all files
echo "📁 Adding files to git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Deploy to Render - $(date)"

# Check if remote exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "🔗 Please add your GitHub repository as remote origin:"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git"
    echo "   git push -u origin main"
    echo ""
    echo "Then follow these steps:"
    echo "1. Go to https://render.com"
    echo "2. Sign up/Login with GitHub"
    echo "3. Click 'New +' → 'Web Service'"
    echo "4. Connect your GitHub repository"
    echo "5. Configure:"
    echo "   - Name: nhfarming-backend"
    echo "   - Root Directory: backend"
    echo "   - Build Command: npm install"
    echo "   - Start Command: npm start"
    echo "6. Add Environment Variables:"
    echo "   - NODE_ENV=production"
    echo "   - JWT_SECRET=your-secret-key"
    echo "   - FRONTEND_URL=https://your-frontend-url.onrender.com"
    echo "7. Deploy!"
    echo ""
    echo "For Frontend:"
    echo "1. Create another 'Static Site'"
    echo "2. Same repository, root directory: frontend"
    echo "3. Build Command: npm install && npm run build"
    echo "4. Publish Directory: build"
    echo "5. Add Environment Variable:"
    echo "   - REACT_APP_API_URL=https://your-backend-url.onrender.com/api"
else
    echo "✅ Remote origin exists"
    echo "📤 Pushing to GitHub..."
    git push origin main
    echo "✅ Code pushed to GitHub!"
    echo ""
    echo "🎯 Next steps:"
    echo "1. Go to https://render.com"
    echo "2. Create new Web Service for backend"
    echo "3. Create new Static Site for frontend"
    echo "4. Follow the configuration steps above"
fi

echo ""
echo "🌐 Your app will be live at:"
echo "   Frontend: https://your-app-name.onrender.com"
echo "   Backend: https://your-backend-name.onrender.com"
echo ""
echo "📱 Access from any device with internet!" 