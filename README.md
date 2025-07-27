# 🚜 NHFarming - Agricultural Management System

A comprehensive farming management application with voice input capabilities, weather integration, and real-time data tracking.

## ✨ Features


- **Weather Integration**: Real-time weather data from Ecowitt sensors
- **Crop Management**: Track crops, applications, and yields
- **Vehicle Management**: Monitor farm vehicles and maintenance
- **Input Tracking**: Manage fertilizers, pesticides, and other inputs
- **User Management**: Secure authentication with role-based access
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 8+

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd NHFarming
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Start the Application**
   ```bash
   # Terminal 1 - Backend (port 3001)
   cd backend
   PORT=3001 node index.js
   
   # Terminal 2 - Frontend (port 3000)
   cd frontend
   npm start
   ```

5. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/api
   - Health Check: http://localhost:3001/health

## 🔧 Configuration

### Environment Variables (.env)
```env
# Database
DB_PATH=./farm.db

# JWT Secret
JWT_SECRET=your-secret-key



# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```



## 📱 Usage

### Default Admin Account
- **Username**: `admin`
- **Password**: `admin123`

### Key Features
- **Weather Data**: Real-time weather information from connected sensors
- **Data Management**: Add, edit, and track all farming activities
- **Mobile Friendly**: Responsive design works on all devices

## 🛠️ Development

### Project Structure
```
NHFarming/
├── backend/          # Node.js API server
│   ├── index.js      # Main server file
│   ├── auth.js       # Authentication logic
│   ├── db.js         # Database setup
│   ├── whisper.js    # Voice transcription
│   └── *.js          # API route handlers
├── frontend/         # React application
│   ├── src/
│   │   ├── App.js    # Main app component
│   │   ├── api.js    # API client
│   │   └── *.js      # Page components
│   └── public/       # Static assets
└── README.md         # This file
```

### API Endpoints
- `POST /api/auth/login` - User authentication
- `GET /api/crops` - Crop management
- `GET /api/vehicles` - Vehicle management
- `GET /api/weather` - Weather data
- And more...

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Input validation
- SQL injection prevention

## 📊 Database

SQLite database with tables for:
- Users and authentication
- Crops and applications
- Vehicles and maintenance
- Weather data
- Input tracking

## 🚀 Deployment

The application is configured for deployment on:
- **Render**: Use `render.yaml` for automatic deployment
- **Railway**: Use the Railway CLI
- **Heroku**: Use the Procfile

## 📞 Support

For issues or questions:
1. Check the browser console for errors
2. Verify your environment configuration
3. Ensure all dependencies are installed
4. Check that both servers are running

## 📄 License

ISC License - see LICENSE file for details. 

## ✅ Successfully Synced with GitHub and Ready for Render!

### ✅ GitHub Sync Complete

Your streamlined NHFarming app has been successfully synced to GitHub:

- ✅ 49 files changed (40+ removed, 9 modified/added)
- ✅ 5,357 lines removed from unnecessary files
- ✅ 317 lines added for essential functionality
- ✅ Repository size: ~73MB (excluding node_modules)
- ✅ All changes committed and pushed to `main` branch

### 🚀 Ready for Render Deployment

Your app is now optimized for deployment with:

#### Updated Configuration:
- Backend port: Set to 3001 (avoiding Apple AirTunes conflict)
- Frontend API: Updated to connect to port 3001
- Render config: Updated `render.yaml` with correct port
- Dependencies: Streamlined package.json

#### Deployment Files:
- `render.yaml`: Automatic deployment configuration
- `RENDER_DEPLOYMENT_GUIDE.md`: Step-by-step deployment guide
- `start.sh`: Local development startup script
- `README.md`: Comprehensive documentation

### 🌐 Deploy to Render Now

1. **Go to [Render Dashboard](https://dashboard.render.com)**
2. **Click "New +"** → **"Web Service"**
3. **Connect repository**: `wildcat787/nhfarming`
4. **The `render.yaml` will automatically configure everything!**

### 📱 Your App URLs (After Deployment):
- Frontend: `https://nhfarming-frontend.onrender.com`
- Backend API: `https://nhfarming-backend.onrender.com/api`
- Health Check: `https://nhfarming-backend.onrender.com/health`



### 🔧 Environment Variables Needed:
```env
NODE_ENV=production
JWT_SECRET=your-secret-key
FRONTEND_URL=https://nhfarming-frontend.onrender.com

REACT_APP_API_URL=https://nhfarming-backend.onrender.com/api
```

### 🎉 Benefits of Streamlined Deployment:
- Faster builds (fewer files to process)
- Cleaner logs (no unnecessary files)
- Better performance (optimized dependencies)
- Easier maintenance (essential files only)

Your NHFarming application is now production-ready and optimized for deployment! 🚜✨ 