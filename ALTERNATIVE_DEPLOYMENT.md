# 🌐 Alternative Deployment Options

## 🚀 Vercel + Railway Deployment

### Frontend on Vercel
1. **Go to Vercel**: https://vercel.com
2. **Sign in with GitHub**
3. **Import Repository**: `wildcat787/nhfarming`
4. **Configure**:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

### Backend on Railway
1. **Go to Railway**: https://railway.app
2. **Sign in with GitHub**
3. **Deploy from GitHub**: Select `wildcat787/nhfarming`
4. **Configure**:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && node init-db-with-data.js`
   - **Start Command**: `PORT=3001 npm start`

## 🐳 Docker Deployment

### Create Dockerfile for Backend
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install
COPY backend/ .
EXPOSE 3001
CMD ["npm", "start"]
```

### Create Dockerfile for Frontend
```dockerfile
FROM node:20-alpine as build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## ☁️ AWS Deployment

### AWS Amplify (Frontend)
1. **Go to AWS Amplify Console**
2. **Connect Repository**: `wildcat787/nhfarming`
3. **Configure Build**:
   - **App build specification**:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - cd frontend
           - npm install
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: frontend/build
       files:
         - '**/*'
   ```

### AWS Elastic Beanstalk (Backend)
1. **Create Elastic Beanstalk Environment**
2. **Upload Application**
3. **Configure Environment Variables**

## 🔧 Environment Variables

### For All Platforms
```
NODE_VERSION=20
NODE_ENV=production
JWT_SECRET=your-secret-key
FRONTEND_URL=https://your-frontend-url.com
```

### Frontend Environment
```
REACT_APP_API_URL=https://your-backend-url.com/api
```

## 📋 Quick Deploy Commands

### Vercel CLI
```bash
npm i -g vercel
cd frontend
vercel
```

### Railway CLI
```bash
npm i -g @railway/cli
railway login
railway init
railway up
```

## 🎯 Recommended Alternative: Vercel + Railway

**Why this combination:**
- ✅ Free tiers available
- ✅ Easy GitHub integration
- ✅ Automatic deployments
- ✅ Good performance
- ✅ Simple configuration

**Steps:**
1. Deploy frontend to Vercel
2. Deploy backend to Railway
3. Update environment variables
4. Test the application

## 🔗 Deployment URLs

After deployment:
- **Frontend**: https://your-app.vercel.app
- **Backend**: https://your-app.railway.app
- **Health Check**: https://your-app.railway.app/health

## 🛠️ Troubleshooting

### Common Issues:
1. **CORS Errors**: Update backend CORS settings
2. **Environment Variables**: Ensure all variables are set
3. **Database Issues**: Check database initialization
4. **Build Failures**: Verify Node.js version and dependencies

### Support:
- Vercel Documentation: https://vercel.com/docs
- Railway Documentation: https://docs.railway.app
- GitHub Issues: Check repository issues
