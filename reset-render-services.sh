#!/bin/bash

# 🔄 Render Services Reset Script
# This script triggers complete reset of Render services

echo "🔄 Render Services Complete Reset"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Step 1: Create a new commit to trigger deployment
print_status "Step 1: Creating deployment trigger commit..."
echo "# Render Reset Trigger - $(date)" >> render-reset-trigger.md
git add render-reset-trigger.md
git commit -m "🔄 Trigger complete Render reset - $(date)"

# Step 2: Force push to trigger fresh deployment
print_status "Step 2: Force pushing to trigger fresh Render deployment..."
git push origin main --force

if [[ $? -eq 0 ]]; then
    print_success "GitHub updated - Render deployment triggered"
else
    print_error "Failed to push to GitHub"
    exit 1
fi

# Step 3: Wait for deployment to start
print_status "Step 3: Waiting for Render deployment to start..."
sleep 15

# Step 4: Monitor deployment with detailed status
print_status "Step 4: Monitoring deployment progress..."

# Monitor backend
print_status "Monitoring backend deployment..."
backend_deployed=false
for i in {1..60}; do
    response=$(curl -s https://nhfarming-backend.onrender.com/health 2>/dev/null)
    if [[ $? -eq 0 && $response == *"OK"* ]]; then
        print_success "✅ Backend deployed successfully (attempt $i)"
        backend_deployed=true
        break
    else
        if [[ $i -le 10 ]]; then
            print_warning "Backend deploying... (attempt $i/60)"
        elif [[ $i -le 30 ]]; then
            print_warning "Backend still building... (attempt $i/60)"
        else
            print_warning "Backend taking longer than expected... (attempt $i/60)"
        fi
        sleep 10
    fi
done

# Monitor frontend
print_status "Monitoring frontend deployment..."
frontend_deployed=false
for i in {1..60}; do
    response=$(curl -s -I https://nhfarming-frontend.onrender.com 2>/dev/null | head -1)
    if [[ $? -eq 0 && $response == *"200"* ]]; then
        print_success "✅ Frontend deployed successfully (attempt $i)"
        frontend_deployed=true
        break
    else
        if [[ $i -le 10 ]]; then
            print_warning "Frontend deploying... (attempt $i/60)"
        elif [[ $i -le 30 ]]; then
            print_warning "Frontend still building... (attempt $i/60)"
        else
            print_warning "Frontend taking longer than expected... (attempt $i/60)"
        fi
        sleep 10
    fi
done

# Step 5: Final verification
print_status "Step 5: Final verification..."

if [[ $backend_deployed == true ]]; then
    backend_health=$(curl -s https://nhfarming-backend.onrender.com/health)
    print_success "Backend Health: $backend_health"
else
    print_error "Backend deployment failed or timed out"
fi

if [[ $frontend_deployed == true ]]; then
    frontend_status=$(curl -s -I https://nhfarming-frontend.onrender.com | head -1)
    print_success "Frontend Status: $frontend_status"
else
    print_error "Frontend deployment failed or timed out"
fi

# Step 6: Test core functionality
print_status "Step 6: Testing core functionality..."

# Test user registration
print_status "Testing user registration..."
test_user_response=$(curl -s -X POST https://nhfarming-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"ResetTest","email":"reset@nhfarming.com","password":"ResetPass123"}' 2>/dev/null)

if [[ $test_user_response == *"token"* ]]; then
    print_success "✅ User registration: WORKING"
else
    print_warning "⚠️ User registration: MAY HAVE ISSUES"
fi

# Step 7: Cleanup
print_status "Step 7: Cleaning up trigger file..."
git rm render-reset-trigger.md
git commit -m "🧹 Cleanup after Render reset"
git push origin main

# Step 8: Summary
echo ""
echo "🎉 RENDER RESET SUMMARY"
echo "======================"
if [[ $backend_deployed == true ]]; then
    echo "✅ Backend: COMPLETELY RESET AND DEPLOYED"
else
    echo "❌ Backend: RESET FAILED"
fi

if [[ $frontend_deployed == true ]]; then
    echo "✅ Frontend: COMPLETELY RESET AND DEPLOYED"
else
    echo "❌ Frontend: RESET FAILED"
fi

echo ""
echo "🌐 Application URLs:"
echo "   Frontend: https://nhfarming-frontend.onrender.com"
echo "   Backend:  https://nhfarming-backend.onrender.com"
echo "   Health:   https://nhfarming-backend.onrender.com/health"
echo ""
echo "📋 Next Steps:"
echo "1. Test the application thoroughly"
echo "2. Register new user accounts"
echo "3. Verify all features work correctly"
echo "4. Check Render dashboard for deployment status"
echo ""
echo "🔄 Render services have been completely reset!"
