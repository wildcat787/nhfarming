# 🚜 NHFarming - Agricultural Management System

A comprehensive farming management application with voice input capabilities, weather integration, and real-time data tracking.

## ✨ Features

- **Voice Input**: AI-powered voice transcription for hands-free data entry
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

# OpenAI API (for voice transcription)
OPENAI_API_KEY=your-openai-api-key

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

## 🎤 Voice Input Setup

1. **Get OpenAI API Key**
   - Sign up at https://platform.openai.com
   - Create an API key
   - Add to your `.env` file

2. **Test Voice Input**
   - Log in to the application
   - Look for the purple floating button (bottom-right)
   - Click to start recording
   - Speak clearly and click again to stop
   - Text will appear in the active input field

## 📱 Usage

### Default Admin Account
- **Username**: `admin`
- **Password**: `admin123`

### Key Features
- **Voice Input**: Use the purple microphone button for hands-free data entry
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
- `POST /api/whisper` - Voice transcription
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