# 🚀 NHFarming Render Deployment Guide

## 🎯 **Complete Step-by-Step Process**

### **Step 1: Prepare Your Code**

1. **Run the deployment script:**
   ```bash
   ./deploy-render.sh
   ```

2. **Create GitHub Repository:**

        2
   - Go to [GitHub.com](https://github.com)
   - Click "New repository"
   - Name it: `nhfarming`
   - Make it public or private
   - Don't initialize with README (we already have one)

3. **Connect to GitHub:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/nhfarming.git
   git branch -M main
   git push -u origin main
   ```

### **Step 2: Deploy Backend to Render**

1. **Go to Render:**
   - Visit [Render.com](https://render.com)
   - Sign up/Login with GitHub

2. **Create Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `nhfarming` repository

3. **Configure Backend:**
   - **Name**: `nhfarming-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

4. **Add Environment Variables:**
   - Click "Environment" tab
   - Add these variables:
   ```
   NODE_ENV=production
   JWT_SECRET=your-super-secret-key-here
   FRONTEND_URL=https://nhfarming-frontend.onrender.com
   ```

5. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment (2-3 minutes)
   - Copy the URL (e.g., `https://nhfarming-backend.onrender.com`)

### **Step 3: Deploy Frontend to Render**

1. **Create Static Site:**
   - Click "New +" → "Static Site"
   - Connect the same GitHub repository

2. **Configure Frontend:**
   - **Name**: `nhfarming-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`
   - **Plan**: `Free`

3. **Add Environment Variable:**
   - Click "Environment" tab
   - Add this variable:
   ```
   REACT_APP_API_URL=https://nhfarming-backend.onrender.com/api
   ```

4. **Deploy:**
   - Click "Create Static Site"
   - Wait for deployment (1-2 minutes)
   - Copy the URL (e.g., `https://nhfarming-frontend.onrender.com`)

### **Step 4: Update Backend CORS**

1. **Go back to Backend service**
2. **Update Environment Variable:**
   - Change `FRONTEND_URL` to your actual frontend URL
   - Example: `https://nhfarming-frontend.onrender.com`

3. **Redeploy:**
   - Click "Manual Deploy" → "Deploy latest commit"

### **Step 5: Test Your Application**

1. **Visit your frontend URL**
2. **Register a new account**
3. **Test all features:**
   - ✅ Add vehicles
   - ✅ Add crops
   - ✅ Add applications
   - ✅ View maintenance
   - ✅ Voice AI features

## 🔧 **Environment Variables Reference**

### **Backend Variables:**
```env
NODE_ENV=production
JWT_SECRET=your-super-secret-key-here
FRONTEND_URL=https://nhfarming-frontend.onrender.com
```

### **Frontend Variables:**
```env
REACT_APP_API_URL=https://nhfarming-backend.onrender.com/api
```

## 📱 **Access Your App**

Once deployed, your app will be available at:
- **Frontend**: `https://nhfarming-frontend.onrender.com`
- **Backend API**: `https://nhfarming-backend.onrender.com`
- **Health Check**: `https://nhfarming-backend.onrender.com/health`

## 🚨 **Common Issues & Solutions**

### **Issue: "Build failed"**
**Solution:**
- Check Node.js version (requires 18+)
- Verify all dependencies are in package.json
- Check build logs in Render dashboard

### **Issue: "CORS error"**
**Solution:**
- Ensure FRONTEND_URL is set correctly
- Redeploy backend after updating environment variable

### **Issue: "Database error"**
**Solution:**
- SQLite database will be created automatically
- Check if database file is writable

### **Issue: "Module not found"**
**Solution:**
- Verify all dependencies are listed in package.json
- Check that node_modules is not in .gitignore

## 💰 **Cost Information**

### **Free Tier Limits:**
- **Backend**: 750 hours/month
- **Frontend**: 100GB bandwidth/month
- **Perfect for**: Personal use, small farms, testing

### **Paid Plans (if needed):**
- **Starter**: $7/month per service
- **Standard**: $25/month per service
- **Professional**: $50/month per service

## 🔐 **Security Notes**

1. **Change JWT_SECRET**: Use a strong, unique secret
2. **HTTPS**: All traffic is automatically encrypted
3. **Environment Variables**: Keep secrets secure
4. **Regular Updates**: Monitor for security updates

## 📊 **Monitoring**

### **Check Logs:**
- Go to your service in Render dashboard
- Click "Logs" tab
- Monitor for errors or issues

### **Health Check:**
- Visit: `https://your-backend-url.onrender.com/health`
- Should return: `{"status":"OK","environment":"production"}`

## 🎉 **Success!**

Your NHFarming application is now:
- ✅ **Live on the internet**
- ✅ **Accessible from any device**
- ✅ **Secure with HTTPS**
- ✅ **Free to use**
- ✅ **Automatically backed up**

## 🆘 **Need Help?**

1. **Check Render logs** in the dashboard
2. **Verify environment variables** are set correctly
3. **Test health endpoint** for backend status
4. **Check GitHub repository** for code issues

---

**Your farm management app is now live and accessible from anywhere! 🌍🚜** 