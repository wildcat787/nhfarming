# 🚀 Render Deployment Guide

## Overview
This guide will help you deploy the NHFarming application to Render using the web interface.

## Prerequisites
- GitHub repository: `https://github.com/wildcat787/nhfarming.git`
- Render account: [render.com](https://render.com)

## Step 1: Deploy Backend Service

### 1.1 Create New Web Service
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account if not already connected
4. Select repository: `wildcat787/nhfarming`

### 1.2 Configure Backend Service
- **Name**: `nhfarming-backend`
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `PORT=3001 npm start`

### 1.3 Environment Variables
Add these environment variables:

| Key | Value | Description |
|-----|-------|-------------|
| `NODE_ENV` | `production` | Production environment |
| `JWT_SECRET` | `[Generate]` | Click "Generate" for secure JWT secret |
| `FRONTEND_URL` | `https://nhfarming-frontend.onrender.com` | Frontend URL (will be created next) |

### 1.4 Advanced Settings
- **Health Check Path**: `/health`
- **Auto-Deploy**: ✅ Enabled
- **Plan**: Free

### 1.5 Deploy
Click **"Create Web Service"** and wait for deployment to complete.

## Step 2: Deploy Frontend Service

### 2.1 Create New Static Site
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Static Site"**
3. Select repository: `wildcat787/nhfarming`

### 2.2 Configure Frontend Service
- **Name**: `nhfarming-frontend`
- **Branch**: `main`
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `build`

### 2.3 Environment Variables
Add this environment variable:

| Key | Value | Description |
|-----|-------|-------------|
| `REACT_APP_API_URL` | `https://nhfarming-backend.onrender.com/api` | Backend API URL |

### 2.4 Deploy
Click **"Create Static Site"** and wait for deployment to complete.

## Step 3: Update Environment Variables

### 3.1 Update Backend FRONTEND_URL
1. Go to your backend service in Render
2. Navigate to **"Environment"** tab
3. Update `FRONTEND_URL` to your actual frontend URL
4. Click **"Save Changes"**
5. Trigger a manual deploy

### 3.2 Update Frontend API URL
1. Go to your frontend service in Render
2. Navigate to **"Environment"** tab
3. Verify `REACT_APP_API_URL` points to your backend
4. Click **"Save Changes"**
5. Trigger a manual deploy

## Step 4: Database Setup

### 4.1 SQLite Database
The application uses SQLite which is included in the deployment. The database will be created automatically on first run.

### 4.2 Optional: PostgreSQL (Recommended for Production)
For better performance and data persistence, consider upgrading to PostgreSQL:

1. Create a new **PostgreSQL** service in Render
2. Update the backend to use PostgreSQL instead of SQLite
3. Update environment variables with database connection string

## Step 5: Verify Deployment

### 5.1 Health Check
- Backend: `https://nhfarming-backend.onrender.com/health`
- Should return: `{"status":"ok","timestamp":"..."}`

### 5.2 Frontend Access
- Frontend: `https://nhfarming-frontend.onrender.com`
- Should load the NHFarming application

### 5.3 API Endpoints
Test these endpoints:
- `GET /api/health` - Health check
- `GET /api/fields` - Fields (requires authentication)
- `GET /api/crops` - Crops (requires authentication)

## Step 6: Create Admin User

### 6.1 Register First User
1. Go to your frontend URL
2. Click **"Register"**
3. Create your first account
4. This user will automatically become an admin

### 6.2 Verify Admin Access
1. Login with your account
2. You should have access to all features
3. Check that you can create, edit, and delete entries

## Troubleshooting

### Common Issues

#### 1. Build Failures
- Check build logs in Render dashboard
- Verify all dependencies are in package.json
- Ensure Node.js version compatibility

#### 2. Environment Variables
- Verify all required environment variables are set
- Check for typos in variable names
- Ensure JWT_SECRET is generated

#### 3. Database Issues
- SQLite database is created automatically
- Check file permissions if using SQLite
- Consider PostgreSQL for production

#### 4. CORS Issues
- Verify FRONTEND_URL is set correctly
- Check that frontend and backend URLs match
- Ensure CORS middleware is configured

### Logs and Debugging
1. Go to your service in Render dashboard
2. Click **"Logs"** tab
3. Check for error messages
4. Use **"Manual Deploy"** to restart services

## Security Considerations

### 1. JWT Secret
- Always use a strong, randomly generated JWT secret
- Never commit secrets to version control
- Use Render's "Generate" feature for secrets

### 2. Environment Variables
- Keep sensitive data in environment variables
- Use Render's secure environment variable storage
- Regularly rotate secrets

### 3. HTTPS
- Render automatically provides HTTPS
- All communication is encrypted
- No additional SSL configuration needed

## Monitoring and Maintenance

### 1. Health Checks
- Monitor health check endpoints
- Set up alerts for service failures
- Check logs regularly

### 2. Performance
- Monitor response times
- Check resource usage
- Consider upgrading plan if needed

### 3. Updates
- Enable auto-deploy for automatic updates
- Test changes in development first
- Monitor deployments for issues

## Support

If you encounter issues:
1. Check Render documentation: [docs.render.com](https://docs.render.com)
2. Review application logs in Render dashboard
3. Verify all configuration steps were followed
4. Check GitHub repository for latest updates

## Success!
Once deployed, your NHFarming application will be available at:
- **Frontend**: `https://nhfarming-frontend.onrender.com`
- **Backend API**: `https://nhfarming-backend.onrender.com`

The application includes:
- ✅ User authentication and authorization
- ✅ Field management with Google Maps
- ✅ Crop and application tracking
- ✅ Vehicle and input management
- ✅ Permission system (creators + admins only)
- ✅ Responsive design for all devices 