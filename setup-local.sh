#!/bin/bash

# 🏠 NHFarming Local Setup Script
# This script converts the project to run completely locally

set -e

echo "🏠 NHFarming Local Project Setup"
echo "================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js not found. Please install Node.js 20+ first.${NC}"
    echo "Download from: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo -e "${YELLOW}⚠️  Node.js version $NODE_VERSION detected. Version 20+ is required.${NC}"
    echo "Please upgrade Node.js from: https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) detected${NC}"

# Install backend dependencies
echo -e "\n${BLUE}📦 Installing backend dependencies...${NC}"
cd backend
npm install
echo -e "${GREEN}✅ Backend dependencies installed${NC}"

# Install frontend dependencies
echo -e "\n${BLUE}📦 Installing frontend dependencies...${NC}"
cd ../frontend
npm install
echo -e "${GREEN}✅ Frontend dependencies installed${NC}"

# Go back to root
cd ..

# Create environment files if they don't exist
echo -e "\n${BLUE}⚙️  Setting up environment files...${NC}"

# Backend environment
if [ ! -f "backend/.env" ]; then
    if [ -f "backend/env.example" ]; then
        cp backend/env.example backend/.env
        echo -e "${GREEN}✅ Created backend/.env from template${NC}"
    else
        echo -e "${YELLOW}⚠️  backend/env.example not found, creating basic .env${NC}"
        cat > backend/.env << EOF
# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Database (SQLite - local file)
DB_PATH=./farm.db
EOF
        echo -e "${GREEN}✅ Created basic backend/.env${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  backend/.env already exists${NC}"
fi

# Frontend environment
if [ ! -f "frontend/.env" ]; then
    if [ -f "frontend/env.example" ]; then
        cp frontend/env.example frontend/.env
        echo -e "${GREEN}✅ Created frontend/.env from template${NC}"
    else
        echo -e "${YELLOW}⚠️  frontend/env.example not found, creating basic .env${NC}"
        cat > frontend/.env << EOF
# API Configuration (Backend URL)
REACT_APP_API_URL=http://localhost:3001/api
EOF
        echo -e "${GREEN}✅ Created basic frontend/.env${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  frontend/.env already exists${NC}"
fi

# Initialize database
echo -e "\n${BLUE}🗄️  Setting up local database...${NC}"
if [ -f "backend/init-local-db.js" ]; then
    cd backend
    node init-local-db.js
    cd ..
    echo -e "${GREEN}✅ Database initialized${NC}"
else
    echo -e "${YELLOW}⚠️  Database initialization script not found${NC}"
    echo "You may need to run the migration scripts manually:"
    echo "  cd backend"
    echo "  node migrate-fields.js"
    echo "  node migrate-field-associations.js"
    echo "  node migrate-field-names-as-ids.js"
    echo "  node migrate-user-permissions.js"
fi

# Make startup script executable
echo -e "\n${BLUE}🚀 Setting up startup script...${NC}"
if [ -f "start-local.sh" ]; then
    chmod +x start-local.sh
    echo -e "${GREEN}✅ Made start-local.sh executable${NC}"
else
    echo -e "${YELLOW}⚠️  start-local.sh not found${NC}"
fi

# Summary
echo -e "\n${GREEN}🎉 Local setup completed successfully!${NC}"
echo -e "\n${BLUE}📋 Next steps:${NC}"
echo "1. Start the application:"
echo "   ${GREEN}./start-local.sh${NC}"
echo ""
echo "2. Or start manually:"
echo "   ${GREEN}cd backend && PORT=3001 npm start${NC}"
echo "   ${GREEN}cd frontend && npm start${NC}"
echo ""
echo "3. Access the application:"
echo "   ${GREEN}Frontend: http://localhost:3000${NC}"
echo "   ${GREEN}Backend:  http://localhost:3001${NC}"
echo "   ${GREEN}Health:   http://localhost:3001/health${NC}"
echo ""
echo "4. Register your first user (becomes admin)"
echo ""
echo "5. Start using NHFarming locally! 🚜"
echo ""
echo -e "${YELLOW}📖 For detailed instructions, see: LOCAL_SETUP.md${NC}" 