#!/bin/bash

# 🚀 NHFarming Local Development Startup Script
# This script starts both backend and frontend services

set -e

echo "🚀 Starting NHFarming Application Locally"
echo "=========================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if port is available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${YELLOW}⚠️  Port $port is already in use${NC}"
        return 1
    else
        echo -e "${GREEN}✅ Port $port is available${NC}"
        return 0
    fi
}

# Check ports
echo "🔍 Checking port availability..."
check_port 3001
check_port 3000

# Start backend
echo ""
echo "🌐 Starting Backend Server..."
cd backend
echo "📁 Working directory: $(pwd)"
echo "🔧 Installing dependencies..."
npm install

echo "🚀 Starting backend on port 3001..."
PORT=3001 node index.js &
BACKEND_PID=$!
echo "✅ Backend started with PID: $BACKEND_PID"

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 5

# Test backend health
echo "🔍 Testing backend health..."
if curl -s http://localhost:3001/health > /dev/null; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  Backend health check failed${NC}"
fi

# Start frontend
echo ""
echo "🎨 Starting Frontend Server..."
cd ../frontend
echo "📁 Working directory: $(pwd)"
echo "🔧 Installing dependencies..."
npm install

echo "🚀 Starting frontend on port 3000..."
npm start &
FRONTEND_PID=$!
echo "✅ Frontend started with PID: $FRONTEND_PID"

# Wait for frontend to start
echo "⏳ Waiting for frontend to start..."
sleep 10

# Test frontend
echo "🔍 Testing frontend..."
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✅ Frontend is running${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend check failed${NC}"
fi

echo ""
echo "🎉 NHFarming Application Started Successfully!"
echo "=============================================="
echo "🌐 Backend:  http://localhost:3001"
echo "🎨 Frontend: http://localhost:3000"
echo "🔗 Health:   http://localhost:3001/health"
echo ""
echo "📋 Process IDs:"
echo "   Backend:  $BACKEND_PID"
echo "   Frontend: $FRONTEND_PID"
echo ""
echo "🛑 To stop the application, run:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "📖 For deployment instructions, see: RENDER_DEPLOYMENT_STEPS.md" 