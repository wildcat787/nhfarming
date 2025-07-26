# 🚀 Render Deployment - Quick Start

## 📋 **What You Need to Do**

### **1. Create GitHub Repository**
```bash
# Go to GitHub.com and create new repo named "nhfarming"
# Then run:
git remote add origin https://github.com/YOUR_USERNAME/nhfarming.git
git branch -M main
git push -u origin main
```

### **2. Deploy Backend**
1. Go to [Render.com](https://render.com)
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your `nhfarming` repository
5. Configure:
   - **Name**: `nhfarming-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
6. Add Environment Variables:
   ```
   NODE_ENV=production
   JWT_SECRET=your-secret-key-here
   FRONTEND_URL=https://nhfarming-frontend.onrender.com
   ```
7. Deploy and copy the URL

### **3. Deploy Frontend**
1. Click "New +" → "Static Site"
2. Connect same repository
3. Configure:
   - **Name**: `nhfarming-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`
   - **Plan**: `Free`
4. Add Environment Variable:
   ```
   REACT_APP_API_URL=https://nhfarming-backend.onrender.com/api
   ```
5. Deploy

### **4. Update Backend CORS**
1. Go back to backend service
2. Update `FRONTEND_URL` with actual frontend URL
3. Redeploy

## 🔗 **Your URLs Will Be**
- **Frontend**: `https://nhfarming-frontend.onrender.com`
- **Backend**: `https://nhfarming-backend.onrender.com`
- **Health Check**: `https://nhfarming-backend.onrender.com/health`

## ✅ **Test Your App**
1. Visit frontend URL
2. Register account
3. Test all features
4. Access from any device!

## 💰 **Cost: FREE**
- Backend: 750 hours/month free
- Frontend: 100GB bandwidth/month free
- Perfect for personal/small farm use

## 🆘 **Need Help?**
- Check Render logs in dashboard
- Verify environment variables
- Test health endpoint
- See `RENDER_DEPLOYMENT.md` for detailed guide

---

**Your farm app will be live in 10 minutes! 🚜** 