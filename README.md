# 🚜 NHFarming - Farm Record Keeping System

A comprehensive farm management application with voice AI assistance, weather integration, and vehicle tracking.

## ✨ Features

- **🌱 Crop Management** - Track crops, fields, and harvests
- **🚜 Vehicle Management** - Monitor vehicles and their applications
- **🔧 Maintenance Tracking** - Keep maintenance records with parts
- **🌤️ Weather Integration** - Historical weather data for applications
- **🏠 Local Weather Station** - Ecowitt weather station integration for real-time local weather
- **🎤 Voice AI Assistant** - OpenAI Whisper integration for voice input
- **📱 PWA Support** - Installable as mobile app
- **🔐 Secure Authentication** - JWT-based user authentication
- **📊 Application Tracking** - Record input applications with rates and weather

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 8+

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd NHFarming
   ```

2. **Start Backend**
   ```bash
   cd backend
   npm install
   npm start
   ```

3. **Start Frontend** (in new terminal)
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🌐 Deployment Options

### Option 1: Railway (Recommended)

**Backend Deployment:**
1. Go to [Railway](https://railway.app)
2. Connect your GitHub repository
3. Create new project from GitHub repo
4. Set root directory to `backend`
5. Add environment variables:
   ```
   NODE_ENV=production
   JWT_SECRET=your-secret-key
   FRONTEND_URL=https://your-frontend-url.com
   ```
6. Deploy

**Frontend Deployment:**
1. Create new project in Railway
2. Set root directory to `frontend`
3. Add environment variables:
   ```
   REACT_APP_API_URL=https://your-backend-url.com/api
   ```
4. Deploy

### Option 2: Render

**Backend Deployment:**
1. Go to [Render](https://render.com)
2. Create new Web Service
3. Connect GitHub repository
4. Configure:
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
   - Environment: Node
5. Add environment variables
6. Deploy

**Frontend Deployment:**
1. Create new Static Site
2. Connect GitHub repository
3. Configure:
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/build`
4. Add environment variables
5. Deploy

### Option 3: Vercel + Railway

**Frontend (Vercel):**
1. Go to [Vercel](https://vercel.com)
2. Import GitHub repository
3. Set root directory to `frontend`
4. Add environment variable:
   ```
   REACT_APP_API_URL=https://your-railway-backend-url.com/api
   ```
5. Deploy

**Backend (Railway):**
Follow Railway backend deployment steps above.

## 🔧 Environment Variables

### Backend (.env)
```env
NODE_ENV=production
PORT=5000
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=https://your-frontend-url.com
OPENAI_API_KEY=your-openai-api-key
```

### Frontend (.env)
```env
REACT_APP_API_URL=https://your-backend-url.com/api
```

## 📁 Project Structure

```
NHFarming/
├── backend/                 # Node.js API server
│   ├── index.js            # Main server file
│   ├── auth.js             # Authentication routes
│   ├── vehicles.js         # Vehicle management
│   ├── applications.js     # Application tracking
│   ├── maintenance.js      # Maintenance records
│   ├── crops.js            # Crop management
│   ├── inputs.js           # Input management
│   ├── weather.js          # Weather API integration
│   ├── whisper.js          # Voice AI integration
│   ├── db.js               # Database setup
│   └── package.json        # Backend dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── App.js          # Main app component
│   │   ├── api.js          # API configuration
│   │   ├── AuthContext.js  # Authentication context
│   │   ├── VehiclesPage.js # Vehicle management
│   │   ├── ApplicationsPage.js # Application tracking
│   │   ├── MaintenancePage.js  # Maintenance records
│   │   ├── AIVoiceAssistantModal.js # Voice AI modal
│   │   └── ...             # Other components
│   └── package.json        # Frontend dependencies
└── README.md               # This file
```

## 🗄️ Database

The application uses SQLite for data storage with the following tables:
- `users` - User accounts and authentication
- `vehicles` - Vehicle information and types
- `crops` - Crop types and field information
- `inputs` - Input types and units
- `applications` - Application records with weather data
- `maintenance` - Vehicle maintenance records
- `parts` - Parts used in maintenance

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Input validation
- SQL injection prevention
- User data isolation

## 🎤 Voice AI Features

- OpenAI Whisper integration
- Real-time voice transcription
- Multiple voice input methods
- Text insertion into forms
- Voice command suggestions

## 🏠 Local Weather Station Integration

NHFarming supports integration with Ecowitt weather stations for real-time local weather data:

### Features
- **Real-time Weather**: Fetch current conditions from your local weather station
- **Historical Data**: Automatically retrieve weather data for past dates
- **Dual Connection**: Support for both local network and cloud API connections
- **Automatic Integration**: Weather data automatically populates application records

### Setup
See [ECOWITT_SETUP.md](./ECOWITT_SETUP.md) for detailed configuration instructions.

### Environment Variables
```bash
# Local connection (recommended)
ECOWITT_LOCAL_URL=http://192.168.1.100

# Cloud API connection
ECOWITT_APP_KEY=your_application_key
ECOWITT_USER_API_KEY=your_api_key
ECOWITT_DEVICE_MAC=your_device_mac
```

## 📱 PWA Features

- Service worker for offline support
- Installable as mobile app
- Responsive design
- Fast loading with caching

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the deployment logs for errors
- Verify environment variables are set correctly

## 🚀 Deployment Checklist

Before deploying, ensure:

- [ ] Environment variables are configured
- [ ] Database is properly initialized
- [ ] CORS settings match your frontend URL
- [ ] API endpoints are accessible
- [ ] Frontend builds successfully
- [ ] Health check endpoint responds
- [ ] SSL certificates are configured (for production)

---

**Happy Farming! 🌾** 