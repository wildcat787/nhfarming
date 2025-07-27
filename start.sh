#!/bin/bash

echo "🚜 Starting NHFarming Application..."
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm 8+ first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

echo ""
echo "🎯 Starting servers..."
echo "===================="
echo "• Backend will run on: http://localhost:3001"
echo "• Frontend will run on: http://localhost:3000"
echo "• Health check: http://localhost:3001/health"
echo ""

# Start backend in background
echo "🚀 Starting backend server..."
cd ../backend
PORT=3001 node index.js &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend in background
echo "🚀 Starting frontend server..."
cd ../frontend
npm start &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers are starting..."
echo "📱 Open your browser to: http://localhost:3000"
echo "🔑 Login with: admin / admin123"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
trap "echo ''; echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait 