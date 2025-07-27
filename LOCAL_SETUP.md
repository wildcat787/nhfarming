# 🏠 NHFarming Local Project Setup

## 🎯 Overview
This guide will help you convert NHFarming from a cloud-deployed application to a fully local project that runs entirely on your machine.

## 📋 Prerequisites

### **Required Software:**
- **Node.js 20+**: [Download here](https://nodejs.org/)
- **Git**: [Download here](https://git-scm.com/)
- **SQLite3**: Usually comes with Node.js, or install separately

### **Optional (for development):**
- **VS Code**: [Download here](https://code.visualstudio.com/)
- **SQLite Browser**: [Download here](https://sqlitebrowser.org/)

## 🚀 Quick Start

### **1. Clone and Setup**
```bash
# Clone the repository (if not already done)
git clone https://github.com/wildcat787/nhfarming.git
cd nhfarming

# Install dependencies for both backend and frontend
cd backend && npm install
cd ../frontend && npm install
cd ..
```

### **2. Start the Application**
```bash
# Use the provided startup script
chmod +x start-local.sh
./start-local.sh
```

**Or start manually:**
```bash
# Terminal 1: Start Backend
cd backend
PORT=3001 npm start

# Terminal 2: Start Frontend
cd frontend
npm start
```

## 🌐 Local URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health
- **API Base**: http://localhost:3001/api

## 🗄️ Database Setup

### **Automatic Setup (Recommended)**
The database will be created automatically when you first start the backend. Run these migration scripts to set up the initial data:

```bash
cd backend

# Create fields table and sample data
node migrate-fields.js

# Associate existing data with fields
node migrate-field-associations.js

# Convert to name-based field IDs
node migrate-field-names-as-ids.js

# Add user permissions
node migrate-user-permissions.js
```

### **Manual Database Setup**
If you prefer manual setup:

```bash
cd backend

# Create the database
sqlite3 farm.db

# Run the migration scripts
.node migrate-fields.js
.node migrate-field-associations.js
.node migrate-field-names-as-ids.js
.node migrate-user-permissions.js
```

## 🔧 Configuration

### **Backend Configuration**
Create a `.env` file in the `backend` directory:

```bash
cd backend
touch .env
```

Add the following content to `.env`:
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Database (SQLite - local file)
DB_PATH=./farm.db

# Optional: Google Maps API Key (for field mapping)
# GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### **Frontend Configuration**
The frontend is already configured to use `http://localhost:3001/api` for local development.

## 🗺️ Google Maps Setup (Optional)

If you want to use the field mapping features:

### **1. Get Google Maps API Key**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Maps JavaScript API"
4. Create credentials (API Key)
5. Restrict the key to your domain/localhost

### **2. Add to Environment**
Add to your `backend/.env` file:
```env
GOOGLE_MAPS_API_KEY=your-actual-api-key-here
```

### **3. Update Frontend**
Add to your `frontend/.env` file:
```env
REACT_APP_GOOGLE_MAPS_API_KEY=your-actual-api-key-here
```

## 📁 Project Structure

```
NHFarming/
├── backend/                 # Node.js API server
│   ├── index.js            # Main server file
│   ├── farm.db             # SQLite database (created automatically)
│   ├── migrate-*.js        # Database migration scripts
│   ├── package.json        # Backend dependencies
│   └── .env                # Backend environment variables
├── frontend/               # React application
│   ├── src/                # React source code
│   ├── public/             # Static files
│   ├── package.json        # Frontend dependencies
│   └── .env                # Frontend environment variables
├── start-local.sh          # Local startup script
├── render.yaml             # (Can be ignored for local)
└── README.md               # Project documentation
```

## 🔍 Development Workflow

### **1. Starting Development**
```bash
# Start both services
./start-local.sh

# Or start individually
cd backend && npm start
cd frontend && npm start
```

### **2. Making Changes**
- **Backend**: Edit files in `backend/` - server restarts automatically
- **Frontend**: Edit files in `frontend/src/` - hot reload enabled
- **Database**: Use migration scripts or SQLite browser

### **3. Database Management**
```bash
# View database
cd backend
sqlite3 farm.db

# Common SQLite commands:
.tables                    # Show all tables
.schema                    # Show table schemas
SELECT * FROM users;       # View users
SELECT * FROM fields;      # View fields
.quit                      # Exit SQLite
```

### **4. Testing**
```bash
# Test backend health
curl http://localhost:3001/health

# Test API endpoints (after authentication)
curl http://localhost:3001/api/fields
```

## 🛠️ Troubleshooting

### **Port Already in Use**
```bash
# Check what's using the port
lsof -i :3001
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### **Database Issues**
```bash
# Reset database (WARNING: This deletes all data)
cd backend
rm farm.db
node migrate-fields.js
node migrate-field-associations.js
node migrate-field-names-as-ids.js
node migrate-user-permissions.js
```

### **Node Modules Issues**
```bash
# Clean install
cd backend && rm -rf node_modules package-lock.json && npm install
cd frontend && rm -rf node_modules package-lock.json && npm install
```

### **Build Issues**
```bash
# Clear build cache
cd frontend
rm -rf build
npm run build
```

## 📊 Local Features

### **✅ All Features Available Locally:**
- **User Authentication**: Register, login, password reset
- **Field Management**: Create, edit, delete fields with maps
- **Crop Tracking**: Plant crops in specific fields
- **Application Management**: Record input applications
- **Vehicle Management**: Track equipment and maintenance
- **Permission System**: Creator + admin access control
- **Responsive Design**: Works on all screen sizes

### **🔧 Development Features:**
- **Hot Reload**: Frontend changes appear instantly
- **Auto-restart**: Backend restarts on file changes
- **Local Database**: SQLite file-based database
- **Debug Logging**: Detailed console output
- **Error Handling**: Clear error messages

## 🚀 Production vs Local

### **Local Development:**
- ✅ Faster development cycle
- ✅ No internet dependency
- ✅ Full control over data
- ✅ Easy debugging
- ✅ No deployment delays

### **Cloud Deployment:**
- ✅ Accessible from anywhere
- ✅ Automatic backups
- ✅ Scalability
- ✅ Professional hosting
- ✅ SSL certificates

## 📝 Next Steps

1. **Start the application** using `./start-local.sh`
2. **Register your first user** (becomes admin)
3. **Create some fields** to test the mapping
4. **Add crops and applications** to test the workflow
5. **Customize the application** for your needs

## 🎉 Success!

Your NHFarming application is now running completely locally! You have full control over the data, can develop offline, and can customize everything to your specific needs.

**Happy farming! 🚜✨** 