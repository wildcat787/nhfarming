# 🚀 NHFarming Render Deployment Guide (with Weather Integration)

## 🎯 **Complete Deployment Process**

Your code has been successfully pushed to GitHub! Now follow these steps to deploy to Render.

### **Step 1: Deploy Backend to Render**

1. **Go to Render:**
   - Visit [Render.com](https://render.com)
   - Sign up/Login with GitHub

2. **Create Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `wildcat787/nhfarming`
   - Select the repository

3. **Configure Backend Service:**
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
   
   **Optional Weather Station Variables:**
   ```
   # For local Ecowitt weather station (recommended)
   ECOWITT_LOCAL_URL=http://YOUR_STATION_IP
   
   # OR for cloud Ecowitt API
   ECOWITT_APP_KEY=your_application_key
   ECOWITT_USER_API_KEY=your_api_key
   ECOWITT_DEVICE_MAC=your_device_mac
   ```

5. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment (2-3 minutes)
   - Copy the URL (e.g., `https://nhfarming-backend.onrender.com`)

### **Step 2: Deploy Frontend to Render**

1. **Create Static Site:**
   - Click "New +" → "Static Site"
   - Connect the same GitHub repository: `wildcat787/nhfarming`

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

### **Step 3: Update Backend CORS**

1. **Go back to Backend service**
2. **Update Environment Variable:**
   - Change `FRONTEND_URL` to your actual frontend URL
   - Example: `https://nhfarming-frontend.onrender.com`

3. **Redeploy:**
   - Click "Manual Deploy" → "Deploy latest commit"

### **Step 4: Test Your Application**

1. **Visit your frontend URL**
2. **Register a new account**
3. **Test all features:**
   - ✅ Landing page with app introduction
   - ✅ User authentication (login/register)
   - ✅ Vehicle management
   - ✅ Crop management
   - ✅ Application tracking with weather integration
   - ✅ Maintenance records
   - ✅ Voice AI features
   - ✅ Weather station integration (if configured)

## 🌤️ **Weather Integration Setup**

### **Local Weather Station (Recommended)**

If you have an Ecowitt weather station on your local network:

1. **Find your weather station's IP address:**
   - Check your Ecowitt app or router settings
   - Note the IP address (e.g., 192.168.1.100)

2. **Add to Backend Environment Variables:**
   ```
   ECOWITT_LOCAL_URL=http://YOUR_STATION_IP
   ```

3. **Test the connection:**
   - Visit: `https://your-backend-url.onrender.com/api/ecowitt/config`
   - Should show: `{"localConfigured": true, "available": true}`

### **Cloud Weather API**

If you prefer to use Ecowitt's cloud service:

1. **Get API credentials from Ecowitt.net**
2. **Add to Backend Environment Variables:**
   ```
   ECOWITT_APP_KEY=your_application_key
   ECOWITT_USER_API_KEY=your_api_key
   ECOWITT_DEVICE_MAC=your_device_mac
   ```

## 🔧 **Environment Variables Reference**

### **Backend Variables (Required):**
```env
NODE_ENV=production
JWT_SECRET=your-super-secret-key-here
FRONTEND_URL=https://nhfarming-frontend.onrender.com
```

### **Backend Variables (Optional - Weather):**
```env
# Local connection (recommended)
ECOWITT_LOCAL_URL=http://192.168.1.100

# OR Cloud API connection
ECOWITT_APP_KEY=your_application_key
ECOWITT_USER_API_KEY=your_api_key
ECOWITT_DEVICE_MAC=your_device_mac
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
- **Weather Config**: `https://nhfarming-backend.onrender.com/api/ecowitt/config`

## 🧪 **Testing Weather Integration**

### **Test Weather Configuration:**
```bash
curl https://your-backend-url.onrender.com/api/ecowitt/config
```

### **Test Current Weather:**
```bash
curl https://your-backend-url.onrender.com/api/ecowitt/current
```

### **Test Historical Weather:**
```bash
curl https://your-backend-url.onrender.com/api/ecowitt/historical/2024-01-15
```

### **Test in Browser:**
1. Go to your frontend URL
2. Log in to your account
3. Navigate to Applications page
4. Look for the cloud download icon next to temperature field
5. Click it to fetch current weather
6. Select a date to test historical weather

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

### **Issue: "Weather station not found"**
**Solution:**
- Check if ECOWITT_LOCAL_URL is set correctly
- Verify your weather station is online
- Test direct access to your weather station IP

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
4. **Weather Station**: Local connection is more secure than cloud API

## 📊 **Monitoring**

### **Check Logs:**
- Go to your service in Render dashboard
- Click "Logs" tab
- Monitor for errors or issues

### **Health Check:**
- Visit: `https://your-backend-url.onrender.com/health`
- Should return: `{"status":"OK","environment":"production"}`

### **Weather Status:**
- Visit: `https://your-backend-url.onrender.com/api/ecowitt/config`
- Shows weather station configuration status

## 🎉 **Success!**

Your NHFarming application is now:
- ✅ **Live on the internet**
- ✅ **Accessible from any device**
- ✅ **Secure with HTTPS**
- ✅ **Free to use**
- ✅ **Weather integration ready**
- ✅ **Automatically backed up**

## 🆘 **Need Help?**

1. **Check Render logs** in the dashboard
2. **Verify environment variables** are set correctly
3. **Test health endpoint** for backend status
4. **Check weather configuration** endpoint
5. **Review GitHub repository** for code issues

---

**Your farm management app with weather integration is now live! 🌍🚜🌤️** 