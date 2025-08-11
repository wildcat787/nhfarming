#!/bin/bash

# NHFarming Development Startup Script
echo "🚜 Starting NHFarming Development Environment..."

# Function to cleanup background processes on exit
cleanup() {
    echo "🛑 Shutting down development servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start backend server in development mode
echo "🔧 Starting backend server on port 3001..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend server
echo "🎨 Starting frontend server on port 3000..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo "✅ Development servers started!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔗 Backend API: http://localhost:3001/api"
echo "💚 Health Check: http://localhost:3001/health"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for background processes
wait 