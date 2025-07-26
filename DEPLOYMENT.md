# 🚀 NHFarming Deployment Guide

## Quick Deploy Options

### 🎯 **Option 1: Railway (Easiest - 5 minutes)**

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Run Deployment Script**
   ```bash
   ./deploy-railway.sh
   ```

3. **Follow the prompts** - Login to Railway when asked

### 🎯 **Option 2: Manual Railway Deployment**

#### Backend Deployment:
1. Go to [Railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Set root directory to `backend`
5. Add environment variables:
   ```
   NODE_ENV=production
   JWT_SECRET=your-super-secret-key-here
   ```
6. Deploy and copy the URL

#### Frontend Deployment:
1. Create another Railway project
2. Set root directory to `frontend`
3. Add environment variable:
   ```
   REACT_APP_API_URL=https://your-backend-url.railway.app/api
   ```
4. Deploy

### 🎯 **Option 3: Render (Alternative)**

#### Backend:
1. Go to [Render.com](https://render.com)
2. Create "Web Service"
3. Connect GitHub repo
4. Configure:
   - Build: `cd backend && npm install`
   - Start: `cd backend && npm start`
5. Add environment variables
6. Deploy

#### Frontend:
1. Create "Static Site"
2. Build: `cd frontend && npm install && npm run build`
3. Publish: `frontend/build`
4. Add environment variable for API URL
5. Deploy

## 🔧 Environment Variables

### Backend Required:
```env
NODE_ENV=production
JWT_SECRET=your-secret-key-here
FRONTEND_URL=https://your-frontend-url.com
```

### Frontend Required:
```env
REACT_APP_API_URL=https://your-backend-url.com/api
```

### Optional (for Voice AI):
```env
OPENAI_API_KEY=your-openai-api-key
```

## 📋 Pre-Deployment Checklist

- [ ] Git repository is up to date
- [ ] All environment variables are set
- [ ] Database will be created automatically
- [ ] CORS settings are configured
- [ ] Health check endpoint works

## 🚨 Common Issues & Solutions

### Issue: "Module not found"
**Solution:** Ensure all dependencies are in package.json

### Issue: "CORS error"
**Solution:** Set FRONTEND_URL environment variable correctly

### Issue: "Database error"
**Solution:** SQLite database will be created automatically

### Issue: "Build failed"
**Solution:** Check Node.js version (requires 18+)

## 🔗 Post-Deployment

1. **Test the application:**
   - Visit your frontend URL
   - Register a new account
   - Test all features

2. **Monitor logs:**
   - Railway: `railway logs`
   - Render: Dashboard → Logs

3. **Set up custom domain (optional):**
   - Railway: Settings → Domains
   - Render: Settings → Custom Domains

## 📱 Access from Any Device

Once deployed, you can access your application from:
- ✅ Desktop computers
- ✅ Laptops
- ✅ Tablets
- ✅ Smartphones
- ✅ Any device with a web browser

## 🔐 Security Notes

- Change the default JWT_SECRET
- Use HTTPS in production
- Regularly update dependencies
- Monitor application logs

## 🆘 Need Help?

1. Check the deployment logs
2. Verify environment variables
3. Test the health endpoint: `https://your-backend-url.com/health`
4. Create an issue in the GitHub repository

---

**Your farm management app will be live in minutes! 🌾** 