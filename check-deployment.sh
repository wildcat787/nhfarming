#!/bin/bash

# 🔍 NHFarming Deployment Status Checker
# This script checks the status of your deployed services

set -e

echo "🔍 NHFarming Deployment Status Check"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check URL
check_url() {
    local url=$1
    local name=$2
    
    echo -n "Checking $name ($url)... "
    
    if curl -s -f "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ ONLINE${NC}"
        return 0
    else
        echo -e "${RED}❌ OFFLINE${NC}"
        return 1
    fi
}

# Function to check API endpoint
check_api() {
    local url=$1
    local name=$2
    
    echo -n "Checking $name ($url)... "
    
    response=$(curl -s -w "%{http_code}" "$url" -o /dev/null)
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✅ HEALTHY (200)${NC}"
        return 0
    else
        echo -e "${RED}❌ UNHEALTHY ($response)${NC}"
        return 1
    fi
}

# Check backend health
echo ""
echo "🌐 Backend Services:"
check_api "https://nhfarming-backend.onrender.com/health" "Backend Health"

# Check frontend
echo ""
echo "🎨 Frontend Services:"
check_url "https://nhfarming-frontend.onrender.com" "Frontend"

# Check API endpoints (these will fail without auth, but we can check if they respond)
echo ""
echo "🔌 API Endpoints:"
echo -n "Checking API Base (https://nhfarming-backend.onrender.com/api)... "
response=$(curl -s -w "%{http_code}" "https://nhfarming-backend.onrender.com/api" -o /dev/null)
if [ "$response" = "404" ] || [ "$response" = "401" ] || [ "$response" = "200" ]; then
    echo -e "${GREEN}✅ RESPONDING ($response)${NC}"
else
    echo -e "${RED}❌ OFFLINE ($response)${NC}"
fi

# Summary
echo ""
echo "📊 Deployment Summary:"
echo "====================="
echo "• Backend: https://nhfarming-backend.onrender.com"
echo "• Frontend: https://nhfarming-frontend.onrender.com"
echo "• Health Check: https://nhfarming-backend.onrender.com/health"
echo ""
echo "📖 For detailed deployment instructions, see: RENDER_DEPLOYMENT_STEPS.md"
echo "🚀 To deploy manually, run: ./deploy-render.sh" 