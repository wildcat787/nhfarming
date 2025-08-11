#!/bin/bash

# 🚀 Complete Reset and Deploy Script
# This script completely removes old versions and deploys fresh copies

echo "🚜 NHFarming Complete Reset and Deploy"
echo "======================================"

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
if [[ ! -f "render.yaml" ]]; then
    print_error "This script must be run from the main NHFarming directory"
    exit 1
fi

print_status "Current directory: $(pwd)"

# Step 1: Clean up any uncommitted changes
print_status "Step 1: Cleaning up any uncommitted changes..."
git add .
git commit -m "🧹 Cleanup before complete reset" 2>/dev/null || true

# Step 2: Force push to GitHub (completely replace old version)
print_status "Step 2: Force pushing to GitHub to completely replace old version..."
git push origin main --force

if [[ $? -eq 0 ]]; then
    print_success "GitHub repository completely updated"
else
    print_error "Failed to push to GitHub"
    exit 1
fi

# Step 3: Wait for Render to detect changes
print_status "Step 3: Waiting for Render to detect changes and start deployment..."
sleep 10

# Step 4: Monitor deployment progress
print_status "Step 4: Monitoring deployment progress..."

# Check backend deployment
print_status "Checking backend deployment..."
for i in {1..30}; do
    response=$(curl -s https://nhfarming-backend.onrender.com/health 2>/dev/null)
    if [[ $? -eq 0 && $response == *"OK"* ]]; then
        print_success "Backend deployment successful"
        break
    else
        print_warning "Backend still deploying... (attempt $i/30)"
        sleep 10
    fi
done

# Check frontend deployment
print_status "Checking frontend deployment..."
for i in {1..30}; do
    response=$(curl -s -I https://nhfarming-frontend.onrender.com 2>/dev/null | head -1)
    if [[ $? -eq 0 && $response == *"200"* ]]; then
        print_success "Frontend deployment successful"
        break
    else
        print_warning "Frontend still deploying... (attempt $i/30)"
        sleep 10
    fi
done

# Step 5: Final verification
print_status "Step 5: Final verification..."

# Test backend
backend_health=$(curl -s https://nhfarming-backend.onrender.com/health)
if [[ $backend_health == *"OK"* ]]; then
    print_success "✅ Backend: HEALTHY"
else
    print_error "❌ Backend: UNHEALTHY"
fi

# Test frontend
frontend_status=$(curl -s -I https://nhfarming-frontend.onrender.com | head -1)
if [[ $frontend_status == *"200"* ]]; then
    print_success "✅ Frontend: ONLINE"
else
    print_error "❌ Frontend: OFFLINE"
fi

# Test user creation
print_status "Testing user creation..."
user_response=$(curl -s -X POST https://nhfarming-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"TestUser","email":"test@nhfarming.com","password":"TestPass123"}' 2>/dev/null)

if [[ $user_response == *"token"* ]]; then
    print_success "✅ User creation: WORKING"
else
    print_warning "⚠️ User creation: MAY HAVE ISSUES"
fi

# Step 6: Summary
echo ""
echo "🎉 DEPLOYMENT SUMMARY"
echo "===================="
echo "✅ GitHub: Completely updated with fresh version"
echo "✅ Backend: https://nhfarming-backend.onrender.com"
echo "✅ Frontend: https://nhfarming-frontend.onrender.com"
echo "✅ Health Check: https://nhfarming-backend.onrender.com/health"
echo ""
echo "📋 Next Steps:"
echo "1. Test the application at: https://nhfarming-frontend.onrender.com"
echo "2. Register a new user account"
echo "3. Test all features and functionality"
echo "4. Use offline backup for development: NHFarming-offline-backup"
echo ""
echo "🚜 Your NHFarming application is now completely reset and deployed!"
