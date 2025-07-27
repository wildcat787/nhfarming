#!/bin/bash

# NHFarming Weather Integration Setup Script
# This script helps you set up and test the Ecowitt weather station integration

echo "🌤️  NHFarming Weather Integration Setup"
echo "======================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo ""
    echo "Please install Node.js first:"
    echo "1. Visit https://nodejs.org and download the LTS version"
    echo "2. Or use Homebrew: brew install node"
    echo "3. Or use nvm: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    echo ""
    echo "After installing Node.js, run this script again."
    exit 1
fi

echo "✅ Node.js is installed: $(node --version)"
echo "✅ npm is available: $(npm --version)"
echo ""

# Check if we're in the right directory
if [ ! -f "backend/package.json" ]; then
    echo "❌ Please run this script from the NHFarming root directory"
    echo "   Current directory: $(pwd)"
    echo "   Expected: NHFarming/"
    exit 1
fi

echo "✅ Found NHFarming project structure"
echo ""

# Install dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi
echo "✅ Backend dependencies installed"
echo ""

# Check environment variables
echo "🔧 Checking environment variables..."
echo ""

if [ -z "$ECOWITT_LOCAL_URL" ] && [ -z "$ECOWITT_APP_KEY" ]; then
    echo "⚠️  No weather station configuration found"
    echo ""
    echo "To configure your Ecowitt weather station:"
    echo ""
    echo "Option 1: Local Network Connection (Recommended)"
    echo "  export ECOWITT_LOCAL_URL=\"http://YOUR_STATION_IP\""
    echo "  Example: export ECOWITT_LOCAL_URL=\"http://192.168.1.100\""
    echo ""
    echo "Option 2: Cloud API Connection"
    echo "  export ECOWITT_APP_KEY=\"your_application_key\""
    echo "  export ECOWITT_USER_API_KEY=\"your_api_key\""
    echo "  export ECOWITT_DEVICE_MAC=\"your_device_mac\""
    echo ""
    echo "After setting the variables, run this script again."
    echo ""
    echo "For detailed instructions, see: ECOWITT_SETUP.md"
    echo ""
    
    # Ask if user wants to set up now
    read -p "Would you like to set up a local connection now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter your weather station IP address: " station_ip
        if [ ! -z "$station_ip" ]; then
            export ECOWITT_LOCAL_URL="http://$station_ip"
            echo "✅ Set ECOWITT_LOCAL_URL=http://$station_ip"
            echo "   (This will only persist for this session)"
        fi
    fi
else
    echo "✅ Weather station configuration found:"
    if [ ! -z "$ECOWITT_LOCAL_URL" ]; then
        echo "   Local URL: $ECOWITT_LOCAL_URL"
    fi
    if [ ! -z "$ECOWITT_APP_KEY" ]; then
        echo "   Cloud API: Configured"
    fi
    echo ""
fi

# Test the integration
echo "🧪 Testing weather integration..."
node test-weather-simple.js
echo ""

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi
echo "✅ Frontend dependencies installed"
echo ""

# Summary
echo "🎉 Setup completed!"
echo ""
echo "Next steps:"
echo "1. Start the backend server:"
echo "   cd backend && npm start"
echo ""
echo "2. Start the frontend (in a new terminal):"
echo "   cd frontend && npm start"
echo ""
echo "3. Test the weather integration:"
echo "   - Open http://localhost:3000"
echo "   - Log in to your account"
echo "   - Go to Applications page"
echo "   - Look for the cloud download icon next to temperature field"
echo "   - Click it to fetch current weather"
echo "   - Select a date to test historical weather"
echo ""
echo "For troubleshooting, see: backend/test-weather-manual.md"
echo "" 