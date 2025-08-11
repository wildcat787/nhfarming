# 🚜 NHFarming Development Guide

## Quick Start

### Option 1: Use the Development Script (Recommended)
```bash
# From the NHFarming root directory
./start-dev.sh
```

This will start both backend and frontend servers automatically.

### Option 2: Manual Start
```bash
# Terminal 1 - Backend (port 3001)
cd backend
npm run dev

# Terminal 2 - Frontend (port 3000)
cd frontend
npm start
```

## 🔧 Development Features

### Backend Auto-Restart
- **nodemon** is configured to automatically restart the server when you make changes
- No need to manually restart the server after code changes
- Ignores test files, database files, and logs to prevent unnecessary restarts

### Frontend Hot Reload
- React development server automatically reloads when you make changes
- Fast refresh for React components

## 🌐 Server URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/health

## 🔑 Default Login

- **Username**: `admin`
- **Password**: `admin123`

## 🛠️ Troubleshooting

### Can't Log In?
1. **Check if both servers are running**:
   - Backend should show: "🚜 NHFarming API Server running on port 3001"
   - Frontend should show: "Local: http://localhost:3000"

2. **Check API connection**:
   - Visit: http://localhost:3001/health
   - Should return: `{"status":"ok","timestamp":"..."}`

3. **Check browser console** for API errors

### Server Won't Start?
1. **Check if ports are in use**:
   ```bash
   lsof -i :3000  # Check frontend port
   lsof -i :3001  # Check backend port
   ```

2. **Kill existing processes**:
   ```bash
   kill -9 $(lsof -t -i:3000)  # Kill frontend
   kill -9 $(lsof -t -i:3001)  # Kill backend
   ```

### Files Not Updating?
1. **Backend changes**: Server should auto-restart with nodemon
2. **Frontend changes**: Should auto-reload in browser
3. **If not working**: Restart the development script

## 📁 File Structure

```
NHFarming/
├── backend/           # Node.js API server
│   ├── index.js      # Main server file
│   ├── *.js          # API route handlers
│   └── __tests__/    # Backend tests
├── frontend/         # React application
│   ├── src/          # React source code
│   └── public/       # Static assets
└── start-dev.sh      # Development startup script
```

## 🔄 Development Workflow

1. **Start development environment**: `./start-dev.sh`
2. **Make changes** to backend or frontend code
3. **See changes immediately** - no manual restart needed
4. **Test functionality** in browser
5. **Stop servers**: Press `Ctrl+C` in the terminal

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests (if any)
cd frontend
npm test
```

## 🚀 Production Build

```bash
# Build frontend for production
cd frontend
npm run build

# Start backend in production mode
cd backend
npm start
``` 