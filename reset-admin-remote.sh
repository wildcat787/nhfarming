#!/bin/bash

echo "🔧 NHFarming Admin User Reset"
echo "============================="
echo ""

# Check if backend is accessible
echo "🔍 Checking backend health..."
if curl -s https://nhfarming-backend.onrender.com/health > /dev/null; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend is not accessible"
    echo "Please wait for deployment to complete or check the URL"
    exit 1
fi

echo ""
echo "🔄 Resetting admin user..."
echo ""

# Reset admin user
RESPONSE=$(curl -s -X POST https://nhfarming-backend.onrender.com/api/auth/reset-admin \
  -H "Content-Type: application/json" \
  -d '{"secret": "nhfarming-deploy-2024"}')

if echo "$RESPONSE" | grep -q "Admin user reset successfully"; then
    echo "✅ Admin user reset successfully!"
    echo ""
    echo "📋 Login Credentials:"
    echo "   Username: admin"
    echo "   Password: admin123"
    echo "   Email: admin@nhfarming.com"
    echo ""
    echo "🌐 Try logging in at: https://nhfarming-frontend.onrender.com"
    echo ""
    echo "🎉 You should now be able to log in successfully!"
else
    echo "❌ Failed to reset admin user"
    echo "Response: $RESPONSE"
    echo ""
    echo "🔧 Alternative solutions:"
    echo "1. Wait for the deployment to complete (may take 5-10 minutes)"
    echo "2. Check Render dashboard for deployment status"
    echo "3. Try the alternative deployment options in ALTERNATIVE_DEPLOYMENT.md"
fi
