# 🚜 Offline Development Guide

## Overview
This guide explains how to work with the NHFarming application using the offline development workflow.

## 📁 Directory Structure
```
/Users/user/Documents/
├── NHFarming/                    # Main repo (for deployment)
│   ├── backend/
│   ├── frontend/
│   ├── deploy-changes.sh         # Deployment script
│   └── render.yaml              # Render configuration
└── NHFarming-offline-backup/     # Offline development copy
    ├── backend/
    ├── frontend/
    └── ... (all project files)
```

## 🔄 Development Workflow

### 1. **Development Phase** (Offline)
```bash
# Work in the offline backup
cd /Users/user/Documents/NHFarming-offline-backup

# Start backend development server
cd backend
npm install
npm start

# Start frontend development server (in new terminal)
cd frontend
npm install
npm start
```

### 2. **Testing Phase** (Local)
- Test all features locally
- Backend: http://localhost:3001
- Frontend: http://localhost:3000
- Database: Local SQLite

### 3. **Deployment Phase** (Online)
```bash
# Copy changes to main repo
cp -r /Users/user/Documents/NHFarming-offline-backup/* /Users/user/Documents/NHFarming/

# Deploy using the script
cd /Users/user/Documents/NHFarming
./deploy-changes.sh
```

## 🛠️ Available Scripts

### Deployment Script
```bash
# Deploy changes to GitHub and Render
./deploy-changes.sh
```

### Development Scripts
```bash
# Start both backend and frontend
./start-dev.sh

# Start local development
./start-local.sh
```

## 🌐 Online URLs
- **Frontend**: https://nhfarming-frontend.onrender.com
- **Backend API**: https://nhfarming-backend.onrender.com/api
- **Health Check**: https://nhfarming-backend.onrender.com/health

## 📋 Best Practices

### 1. **Always work in the offline backup**
- Keep the main repo clean for deployment
- Use offline backup for all development

### 2. **Test thoroughly before deployment**
- Test all features locally
- Check for errors in console
- Verify database operations

### 3. **Use meaningful commit messages**
```bash
git commit -m "🚀 Add new feature: user dashboard"
git commit -m "🔧 Fix bug: crop deletion not working"
git commit -m "📱 Improve mobile responsiveness"
```

### 4. **Check deployment status**
- Monitor Render dashboard
- Test online URLs after deployment
- Check health endpoints

## 🚨 Troubleshooting

### Deployment Issues
1. **Check git status**: Ensure no uncommitted changes
2. **Verify offline backup**: Ensure it exists and is up to date
3. **Check Render logs**: Monitor deployment progress
4. **Test health endpoints**: Verify services are running

### Development Issues
1. **Database issues**: Check local SQLite file
2. **Port conflicts**: Ensure ports 3000 and 3001 are free
3. **Dependencies**: Run `npm install` in both backend and frontend
4. **Environment variables**: Check `.env` files

## 📞 Quick Commands

```bash
# Start development
cd /Users/user/Documents/NHFarming-offline-backup
./start-dev.sh

# Deploy changes
cd /Users/user/Documents/NHFarming
./deploy-changes.sh

# Check status
curl https://nhfarming-backend.onrender.com/health
```

## ✅ Success Checklist
- [ ] Offline backup exists and is working
- [ ] Local development servers running
- [ ] All features tested locally
- [ ] Changes copied to main repo
- [ ] Deployment script executed successfully
- [ ] Online application tested and working
- [ ] Health endpoints responding correctly

**Happy Farming! 🚜✨**
