const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Simple database test endpoint
app.get('/test-db', (req, res) => {
  try {
    console.log('🔍 Testing database connection...');
    
    const { db } = require('./db');
    
    // Simple test query
    db.get('SELECT 1 as test', (err, result) => {
      if (err) {
        console.error('Database test error:', err);
        return res.status(500).json({ 
          error: 'Database connection failed', 
          details: err.message,
          code: err.code
        });
      }
      
      res.json({ 
        message: 'Database connection successful',
        test: result.test,
        timestamp: new Date().toISOString()
      });
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ error: 'Database test failed', details: error.message });
  }
});

// Simple admin user creation endpoint
app.get('/create-admin', (req, res) => {
  try {
    console.log('🔧 Creating admin user...');
    
    const bcrypt = require('bcryptjs');
    const { db } = require('./db');
    
    bcrypt.hash('admin123', 10).then(hashedPassword => {
      db.run(`
        INSERT OR REPLACE INTO users (username, password, email, role, email_verified)
        VALUES (?, ?, ?, ?, ?)
      `, ['admin', hashedPassword, 'admin@nhfarming.com', 'admin', 1], function(err) {
        if (err) {
          console.error('Error creating admin user:', err);
          return res.status(500).json({ error: 'Database error', details: err.message });
        }
        
        console.log('Admin user created successfully');
        res.json({ 
          message: 'Admin user created successfully',
          credentials: {
            username: 'admin',
            password: 'admin123',
            email: 'admin@nhfarming.com'
          },
          timestamp: new Date().toISOString()
        });
      });
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    res.status(500).json({ error: 'Failed to create admin user', details: error.message });
  }
});

// Import auth functions
const { 
  register, 
  login, 
  requestPasswordReset, 
  resetPassword, 
  changePassword, 
  getCurrentUser,
  getUserProfile,
  updateUserProfile,
  resetAdminUser
} = require('./auth');

// Import auth middleware
const { authMiddleware } = require('./auth');

// Auth routes
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.post('/api/auth/forgot-password', requestPasswordReset);
app.post('/api/auth/reset-password', resetPassword);
app.post('/api/auth/change-password', changePassword);
app.get('/api/auth/me', authMiddleware, getCurrentUser);
app.get('/api/auth/profile', authMiddleware, getUserProfile);
app.put('/api/auth/profile', authMiddleware, updateUserProfile);
app.post('/api/auth/reset-admin', resetAdminUser);

// Routes - Start with essential ones only
app.use('/api/crops', require('./crops'));
app.use('/api/fields', require('./fields'));
app.use('/api/farms', require('./farms'));
app.use('/api/vehicles', require('./vehicles'));
app.use('/api/observations', require('./observations'));
app.use('/api/weather', require('./weather'));
app.use('/api/applications', require('./applications'));
app.use('/api/inputs', require('./inputs'));
app.use('/api/maintenance', require('./maintenance'));
app.use('/api/reminders', require('./reminders'));

// Admin routes
app.get('/api/admin/users', authMiddleware, (req, res) => {
  // Only allow admin users
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const { db } = require('./db');
  db.all('SELECT id, username, email, role, email_verified FROM users ORDER BY username', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Farm Record Keeping API is running',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Initialize database on startup
const initializeDatabase = () => {
  console.log('🔧 Initializing database on startup...');
  
  // Wait a bit for the database to be ready
  setTimeout(() => {
    try {
      const { db } = require('./db');
      const bcrypt = require('bcryptjs');
      
      // Create a test user if database is working
      bcrypt.hash('admin123', 10).then(hashedPassword => {
        db.run(`
          INSERT OR REPLACE INTO users (username, password, email, role, email_verified)
          VALUES (?, ?, ?, ?, ?)
        `, ['admin', hashedPassword, 'admin@nhfarming.com', 'admin', 1], function(err) {
          if (err) {
            console.error('Database initialization error:', err);
          } else {
            console.log('Database initialized successfully - admin user created');
          }
        });
      });
    } catch (error) {
      console.error('Database initialization error:', error);
    }
  }, 3000); // Wait 3 seconds for database to be ready
};

// Start server
app.listen(PORT, () => {
  console.log(`🚜 NHFarming API Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🕐 Server started at: ${new Date().toISOString()}`);

  // Initialize database after server starts
  setTimeout(initializeDatabase, 2000);
}); 