# 🚜 NHFarming - Agricultural Management System

A comprehensive farming management application with voice input capabilities, weather integration, and real-time data tracking.

## ✨ Features


- **Field Management**: Track paddocks with area, location, and map boundaries
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
- **Field Mapping**: Visualize paddocks with Google Maps integration
- **Weather Data**: Real-time weather information from connected sensors
- **Data Management**: Add, edit, and track all farming activities
- **Mobile Friendly**: Responsive design works on all devices

## 🛠️ Development

### Project Structure
```
NHFarming/
├── backend/                    # Node.js API server
│   ├── index.js               # Main server file
│   ├── auth.js                # Authentication logic
│   ├── db.js                  # Database setup
│   ├── crops.js               # Crop management API
│   ├── applications.js        # Application tracking API
│   ├── fields.js              # Field management API
│   ├── vehicles.js            # Vehicle management API
│   ├── inputs.js              # Input management API
│   ├── maintenance.js         # Maintenance tracking API
│   ├── permissions.js         # Permission middleware
│   ├── ecowitt.js             # Weather station integration
│   ├── emailService.js        # Email functionality
│   ├── __tests__/             # Backend tests
│   └── *.js                   # Other API route handlers
├── frontend/                  # React application
│   ├── src/
│   │   ├── App.js             # Main app component
│   │   ├── api.js             # API client
│   │   ├── AuthContext.js     # Authentication context
│   │   ├── CropsPage.js       # Crop management page
│   │   ├── ApplicationsPage.js # Application tracking page
│   │   ├── FieldsPage.js      # Field management page
│   │   ├── VehiclesPage.js    # Vehicle management page
│   │   ├── InputsPage.js      # Input management page
│   │   ├── MaintenancePage.js # Maintenance tracking page
│   │   ├── UsersPage.js       # User management page
│   │   ├── components/        # Reusable components
│   │   └── *.test.js          # Frontend tests
│   └── public/                # Static assets
├── scripts/                   # Deployment and setup scripts
├── docs/                      # Documentation
└── README.md                  # This file
```

### API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset
- `POST /api/auth/verify-email` - Email verification

#### Data Management
- `GET /api/fields` - Get all fields
- `POST /api/fields` - Create new field
- `PUT /api/fields/:id` - Update field
- `DELETE /api/fields/:id` - Delete field

- `GET /api/crops` - Get all crops
- `POST /api/crops` - Create new crop
- `PUT /api/crops/:id` - Update crop
- `DELETE /api/crops/:id` - Delete crop

- `GET /api/applications` - Get all applications
- `POST /api/applications` - Create new application
- `PUT /api/applications/:id` - Update application
- `DELETE /api/applications/:id` - Delete application

- `GET /api/vehicles` - Get all vehicles
- `POST /api/vehicles` - Create new vehicle
- `PUT /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Delete vehicle

- `GET /api/inputs` - Get all inputs
- `POST /api/inputs` - Create new input
- `PUT /api/inputs/:id` - Update input
- `DELETE /api/inputs/:id` - Delete input

- `GET /api/maintenance` - Get all maintenance records
- `POST /api/maintenance` - Create new maintenance record
- `PUT /api/maintenance/:id` - Update maintenance record
- `DELETE /api/maintenance/:id` - Delete maintenance record

#### Weather & External Services
- `GET /api/weather` - Get weather data
- `GET /api/ecowitt/config` - Get Ecowitt configuration
- `GET /api/ecowitt/current` - Get current weather from Ecowitt
- `GET /api/ecowitt/historical` - Get historical weather data

#### User Management
- `GET /api/users` - Get all users (admin only)
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Input validation
- SQL injection prevention

## 📊 Database

SQLite database with the following schema:

### Core Tables
- **users** - User accounts and authentication
- **fields** - Field/paddock information with area and location
- **crops** - Crop records linked to fields
- **applications** - Input applications (fertilizer, pesticide, etc.)
- **vehicles** - Farm vehicle inventory
- **maintenance** - Vehicle maintenance records
- **inputs** - Input inventory (fertilizers, pesticides, etc.)
- **parts** - Vehicle parts inventory

### Weather & External Data
- **weather** - Weather data storage
- **ecowitt_data** - Ecowitt weather station data

### Relationships
- Crops belong to fields and users
- Applications are linked to crops, inputs, and vehicles
- Maintenance records are linked to vehicles
- All records track creation and modification timestamps

## 🚀 Deployment

The application is configured for deployment on:
- **Render**: Use `render.yaml` for automatic deployment
- **Railway**: Use the Railway CLI
- **Heroku**: Use the Procfile

## 🧪 Testing

### Frontend Testing
```bash
cd frontend
npm test
```

### Backend Testing
```bash
cd backend
npm test
```

### Test Coverage
- Frontend: React Testing Library for component testing
- Backend: Jest with Supertest for API testing
- Database: In-memory SQLite for isolated testing

## 📞 Support

For issues or questions:
1. Check the browser console for errors
2. Verify your environment configuration
3. Ensure all dependencies are installed
4. Check that both servers are running
5. Run tests to identify issues: `npm test`

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