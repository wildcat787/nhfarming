#!/bin/bash

# 🚀 NHFarming Render Deployment Script
# This script helps deploy the NHFarming application to Render

set -e

echo "🚀 NHFarming Render Deployment"
echo "================================"

# Check if render CLI is installed
if ! command -v render &> /dev/null; then
    echo "❌ Render CLI not found. Installing..."
    
    # Install Render CLI
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew install render
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        curl -s https://api.render.com/download/linux | bash
    else
        echo "❌ Unsupported OS. Please install Render CLI manually:"
        echo "   https://render.com/docs/deploy-create-render-cli"
        exit 1
    fi
fi

echo "✅ Render CLI installed"

# Check if logged in
if ! render whoami &> /dev/null; then
    echo "🔐 Please login to Render:"
    render login
fi

echo "✅ Logged in to Render"

# Deploy backend
echo "🌐 Deploying backend service..."
render blueprint apply

echo "✅ Deployment initiated!"
echo ""
echo "📋 Next steps:"
echo "1. Wait for deployment to complete (check Render dashboard)"
echo "2. Update environment variables if needed"
echo "3. Test the application endpoints"
echo ""
echo "🔗 Your services will be available at:"
echo "   Frontend: https://nhfarming-frontend.onrender.com"
echo "   Backend:  https://nhfarming-backend.onrender.com"
echo ""
echo "📖 For detailed instructions, see: RENDER_DEPLOYMENT_STEPS.md" 