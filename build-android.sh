#!/bin/bash

# 🚀 NHFarming Android Build Script
# This script builds and deploys the NHFarming Android app with Google Drive integration

set -e

echo "🚀 NHFarming Android Build & Deploy"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "frontend/package.json" ]; then
    print_error "Please run this script from the NHFarming root directory"
    exit 1
fi

# Check prerequisites
print_status "Checking prerequisites..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 20+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

# Check if Capacitor CLI is installed
if ! command -v npx cap &> /dev/null; then
    print_warning "Capacitor CLI not found. Installing..."
    npm install -g @capacitor/cli
fi

# Check if Android Studio and Android SDK are available
if [ ! -d "$ANDROID_HOME" ] && [ ! -d "$HOME/Android/Sdk" ]; then
    print_warning "Android SDK not found. Please install Android Studio and set ANDROID_HOME."
    print_status "You can continue with the build, but you'll need Android Studio for final deployment."
fi

print_success "Prerequisites check completed"

# Navigate to frontend directory
cd frontend

print_status "Installing frontend dependencies..."
npm install

print_status "Building React app for production..."
npm run build

print_success "React app built successfully"

# Check if Capacitor is initialized
if [ ! -d "android" ]; then
    print_status "Initializing Capacitor..."
    npx cap init NHFarming com.nhfarming.app --web-dir=build
    npx cap add android
else
    print_status "Capacitor already initialized"
fi

print_status "Syncing web assets to Android..."
npx cap sync android

print_status "Opening Android Studio..."
npx cap open android

print_success "Android project opened in Android Studio"
echo ""
echo "📱 Next steps in Android Studio:"
echo "1. Wait for the project to sync"
echo "2. Connect your Android device or start an emulator"
echo "3. Click the 'Run' button (green play icon)"
echo "4. Select your target device"
echo "5. Wait for the app to build and install"
echo ""
echo "🔧 Build Configuration:"
echo "- App ID: com.nhfarming.app"
echo "- App Name: NHFarming"
echo "- Target SDK: API 34 (Android 14)"
echo "- Minimum SDK: API 24 (Android 7.0)"
echo ""
echo "📋 Additional Configuration:"
echo "- The app will connect to your backend API"
echo "- Google Drive sync is available in the app settings"
echo "- Make sure your backend is running and accessible"
echo ""
echo "🌐 Backend Configuration:"
echo "- Ensure your backend is deployed and accessible"
echo "- Update the API base URL in the app if needed"
echo "- Configure Google Drive integration following GOOGLE_DRIVE_SETUP.md"
echo ""
print_success "Android build process completed!"
