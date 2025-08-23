// Load environment variables first
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 5001;

// CORS configuration for production
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Import auth functions
const { 
  authMiddleware, 
  adminMiddleware, 
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

// Import routes
const cropsRouter = require('./crops');
const inputsRouter = require('./inputs');
const applicationsRouter = require('./applications');
const vehiclesRouter = require('./vehicles');
const maintenanceRouter = require('./maintenance');
const partsRouter = require('./parts');
const remindersRouter = require('./reminders');
const observationsRouter = require('./observations');
const weatherRouter = require('./weather');
const ecowittRouter = require('./ecowitt');
const fieldsRouter = require('./fields');
const farmsRouter = require('./farms');
const tankMixturesRouter = require('./tank-mixtures');
const userFarmManagementRouter = require('./user-farm-management');
const syncRouter = require('./sync-routes');

// Auth routes
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.post('/api/auth/forgot-password', requestPasswordReset);
app.post('/api/auth/reset-password', resetPassword);
app.post('/api/auth/change-password', authMiddleware, changePassword);
app.get('/api/auth/me', authMiddleware, getCurrentUser);
app.get('/api/auth/profile', authMiddleware, getUserProfile);
app.put('/api/auth/profile', authMiddleware, updateUserProfile);
app.post('/api/auth/reset-admin', resetAdminUser);

// Email verification endpoint
app.get('/api/auth/verify-email', (req, res) => {
  const { token } = req.query;
  const db = require('./db');
  
  if (!token) {
    return res.status(400).json({ error: 'Verification token is required' });
  }
  
  // Find user with this verification token
  db.get(
    'SELECT id, username, email, verification_token_expiry FROM users WHERE verification_token = ?',
    [token],
    (err, user) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (!user) return res.status(400).json({ error: 'Invalid verification token' });
      
      // Check if token is expired
      const now = new Date();
      const expiry = new Date(user.verification_token_expiry);
      if (now > expiry) {
        return res.status(400).json({ error: 'Verification token has expired' });
      }
      
      // Mark email as verified
      db.run(
        'UPDATE users SET email_verified = 1, verification_token = NULL, verification_token_expiry = NULL WHERE id = ?',
        [user.id],
        function (err) {
          if (err) return res.status(500).json({ error: 'Database error' });
          
          res.json({ 
            message: 'Email verified successfully! You can now log in to your account.',
            user: { id: user.id, username: user.username, email: user.email }
          });
        }
      );
    }
  );
});

// Special endpoint to make first user admin (no admin privileges required)
app.post('/api/auth/make-first-admin', authMiddleware, (req, res) => {
  const db = require('./db');
  
  // Check if this is the first user (ID = 1)
  if (req.user.id !== 1) {
    return res.status(403).json({ error: 'Only the first registered user can become admin' });
  }
  
  // Check if any admin already exists
  db.get('SELECT COUNT(*) as count FROM users WHERE role = "admin"', (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    
    if (result.count > 0) {
      return res.status(400).json({ error: 'An admin user already exists' });
    }
    
    // Make this user an admin
    db.run('UPDATE users SET role = "admin" WHERE id = ?', [req.user.id], function (err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (this.changes === 0) return res.status(404).json({ error: 'User not found' });
      
      res.json({ 
        message: 'User successfully made admin',
        user: {
          id: req.user.id,
          username: req.user.username,
          role: 'admin'
        }
      });
    });
  });
});

// Admin routes
app.get('/api/admin/users', authMiddleware, adminMiddleware, (req, res) => {
  const db = require('./db');
  db.all('SELECT id, username, email, role FROM users ORDER BY username', (err, users) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(users);
  });
});

// Admin: Create a new user
app.post('/api/admin/users', authMiddleware, adminMiddleware, async (req, res) => {
  const db = require('./db');
  const { username, email, password, role } = req.body;
  const { sendWelcomeEmail, generateVerificationToken } = require('./emailService');

  if (!username || !email || !password || !role) {
    return res.status(400).json({ error: 'Username, email, password, and role are required.' });
  }
  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role. Must be "user" or "admin".' });
  }
  // Basic email format validation
  const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }
  // Check if username or email already exists
  db.get('SELECT id FROM users WHERE username = ? OR email = ?', [username, email], async (err, existingUser) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (existingUser) return res.status(400).json({ error: 'Username or email already exists.' });
    
    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate verification token
    const verificationToken = generateVerificationToken();
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    db.run(
      'INSERT INTO users (username, email, password, role, verification_token, verification_token_expiry, email_verified) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [username, email, hashedPassword, role, verificationToken, verificationExpiry.toISOString(), 0],
      async function (err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        
        const userId = this.lastID;
        
        // Send welcome email with verification link
        try {
          await sendWelcomeEmail(email, username, verificationToken);
          console.log(`Welcome email sent to ${email} (created by admin)`);
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError);
          // Don't fail user creation if email fails
        }
        
        res.status(201).json({
          id: userId,
          username,
          email,
          role,
          email_verified: 0,
          message: 'User created successfully! Welcome email sent.'
        });
      }
    );
  });
});

app.put('/api/admin/users/:id/role', authMiddleware, adminMiddleware, (req, res) => {
  const { role } = req.body;
  const userId = req.params.id;
  
  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role. Must be "user" or "admin"' });
  }
  
  const db = require('./db');
  db.run('UPDATE users SET role = ? WHERE id = ?', [role, userId], function (err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (this.changes === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User role updated successfully' });
  });
});

// User management routes
app.put('/api/admin/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { username, email, password } = req.body;
  const userId = req.params.id;
  
  const db = require('./db');
  
  try {
    // Check if username already exists (excluding current user)
    if (username) {
      db.get('SELECT id FROM users WHERE username = ? AND id != ?', [username, userId], (err, existingUser) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (existingUser) return res.status(400).json({ error: 'Username already exists' });
        
        // Build update query
        let updateQuery = 'UPDATE users SET ';
        let params = [];
        
        if (username) {
          updateQuery += 'username = ?, ';
          params.push(username);
        }
        if (email !== undefined) {
          updateQuery += 'email = ?, ';
          params.push(email);
        }
        
        // Remove trailing comma and space
        updateQuery = updateQuery.slice(0, -2);
        updateQuery += ' WHERE id = ?';
        params.push(userId);
        
        db.run(updateQuery, params, function (err) {
          if (err) return res.status(500).json({ error: 'Database error' });
          if (this.changes === 0) return res.status(404).json({ error: 'User not found' });
          res.json({ message: 'User updated successfully' });
        });
      });
    } else {
      // No username change, just update other fields
      let updateQuery = 'UPDATE users SET ';
      let params = [];
      
      if (email !== undefined) {
        updateQuery += 'email = ?, ';
        params.push(email);
      }
      
      if (updateQuery === 'UPDATE users SET ') {
        return res.status(400).json({ error: 'No fields to update' });
      }
      
      // Remove trailing comma and space
      updateQuery = updateQuery.slice(0, -2);
      updateQuery += ' WHERE id = ?';
      params.push(userId);
      
      db.run(updateQuery, params, function (err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (this.changes === 0) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'User updated successfully' });
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/admin/users/:id/password', authMiddleware, adminMiddleware, async (req, res) => {
  const { password } = req.body;
  const userId = req.params.id;
  
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }
  
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const db = require('./db');
    db.run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId], function (err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (this.changes === 0) return res.status(404).json({ error: 'User not found' });
      res.json({ message: 'Password updated successfully' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/admin/users/:id', authMiddleware, adminMiddleware, (req, res) => {
  const userId = req.params.id;
  
  // Prevent admin from deleting themselves
  if (parseInt(userId) === req.user.id) {
    return res.status(400).json({ error: 'Cannot delete your own account' });
  }
  
  const db = require('./db');
  db.run('DELETE FROM users WHERE id = ?', [userId], function (err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (this.changes === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  });
});

// API routes
app.use('/api/crops', cropsRouter);
app.use('/api/inputs', inputsRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api/vehicles', vehiclesRouter);
app.use('/api/maintenance', maintenanceRouter);
app.use('/api/parts', partsRouter);
app.use('/api/reminders', remindersRouter);
app.use('/api/observations', observationsRouter);
app.use('/api/weather', weatherRouter);
app.use('/api/ecowitt', ecowittRouter);
app.use('/api/fields', fieldsRouter);
app.use('/api/farms', farmsRouter);
app.use('/api/tank-mixtures', tankMixturesRouter);
app.use('/api/admin', userFarmManagementRouter);
app.use('/api/sync', syncRouter);

// Serve uploaded files
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Temporary endpoint to fix database schema
app.get('/fix-db', (req, res) => {
  try {
    const db = require('./db');
    
    console.log('🔧 Running database schema fix...');
  
      // Update fields to have farm_id = 1
    db.run('UPDATE fields SET farm_id = 1 WHERE farm_id IS NULL OR farm_id != 1', function(err) {
    if (err) {
      console.error('Error updating fields:', err);
      return res.status(500).json({ error: 'Failed to update fields' });
    }
    
    console.log(`Updated ${this.changes} fields`);
    
    // Add missing columns to fields table
    const missingColumns = [
      'user_id INTEGER',
      'area_unit TEXT',
      'location TEXT', 
      'soil_type TEXT',
      'irrigation_type TEXT',
      'notes TEXT',
      'border_coordinates TEXT',
      'created_at DATETIME',
      'updated_at DATETIME'
    ];
    
    let completed = 0;
    missingColumns.forEach(column => {
      db.run(`ALTER TABLE fields ADD COLUMN ${column}`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error(`Error adding ${column}:`, err.message);
        } else {
          console.log(`Added column: ${column}`);
        }
        completed++;
        
        if (completed === missingColumns.length) {
          // Add missing columns to crops table
          const missingCropColumns = [
            'field_id INTEGER',
            'season_year INTEGER',
            'planting_date DATE',
            'expected_harvest_date DATE',
            'status TEXT',
            'created_at DATETIME',
            'updated_at DATETIME'
          ];
          
          let cropCompleted = 0;
          missingCropColumns.forEach(column => {
            db.run(`ALTER TABLE crops ADD COLUMN ${column}`, (err) => {
              if (err && !err.message.includes('duplicate column name')) {
                console.error(`Error adding ${column}:`, err.message);
              } else {
                console.log(`Added crop column: ${column}`);
              }
              cropCompleted++;
              
              if (cropCompleted === missingCropColumns.length) {
                // Update existing crops to have default values
                db.run('UPDATE crops SET season_year = 2025 WHERE season_year IS NULL', (err) => {
                  if (err) console.error('Error updating crop season_year:', err);
                  else console.log('Updated crop season_year');
                });
                
                db.run('UPDATE crops SET status = "growing" WHERE status IS NULL', (err) => {
                  if (err) console.error('Error updating crop status:', err);
                  else console.log('Updated crop status');
                });
                
                // Ensure admin user has access to all farms
                db.run('INSERT OR IGNORE INTO farm_users (farm_id, user_id, role) VALUES (1, 1, "owner")', (err) => {
                  if (err) console.error('Error adding farm user access:', err);
                  else console.log('Added farm user access for admin');
                });
                
                db.run('INSERT OR IGNORE INTO farm_users (farm_id, user_id, role) VALUES (2, 1, "owner")', (err) => {
                  if (err) console.error('Error adding farm user access:', err);
                  else console.log('Added farm user access for admin to farm 2');
                });
                
                // Create reminders table if it doesn't exist
                db.run(`
                  CREATE TABLE IF NOT EXISTS reminders (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    vehicle_id INTEGER,
                    reminder_type TEXT NOT NULL,
                    expiry_date DATE NOT NULL,
                    reminder_date DATE NOT NULL,
                    message TEXT,
                    sent BOOLEAN DEFAULT 0,
                    sent_date DATETIME,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id),
                    FOREIGN KEY (vehicle_id) REFERENCES vehicles (id)
                  )
                `, (err) => {
                  if (err) console.error('Error creating reminders table:', err);
                  else console.log('Reminders table created/verified');
                });
                
                res.json({ 
                  message: 'Database schema fix completed',
                  fieldsUpdated: this.changes
                });
              }
            });
          });
        }
      });
    });
  } catch (error) {
    console.error('Database fix error:', error);
    res.status(500).json({ error: 'Database fix failed', details: error.message });
  }
});
              }
            });
          });
        }
      });
    });
  });
});

// Database test endpoint
app.get('/test-db', (req, res) => {
  try {
    console.log('🔍 Testing database connection...');
    
    const db = require('./db');
    
    // Simple test query
    db.get('SELECT COUNT(*) as count FROM sqlite_master WHERE type="table"', (err, result) => {
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
        tableCount: result.count,
        timestamp: new Date().toISOString()
      });
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ error: 'Database test failed', details: error.message });
  }
});

// Emergency database reset endpoint
app.get('/reset-db', (req, res) => {
  try {
    console.log('🔄 Emergency database reset requested...');
    
    // This will trigger a fresh database initialization
    const { exec } = require('child_process');
    const path = require('path');
    
    exec('node init-db-with-data.js', { cwd: __dirname }, (error, stdout, stderr) => {
      if (error) {
        console.error('Database reset error:', error);
        return res.status(500).json({ error: 'Database reset failed', details: error.message });
      }
      
      console.log('Database reset output:', stdout);
      if (stderr) console.error('Database reset stderr:', stderr);
      
      res.json({ 
        message: 'Database reset completed successfully',
        timestamp: new Date().toISOString()
      });
    });
  } catch (error) {
    console.error('Database reset error:', error);
    res.status(500).json({ error: 'Database reset failed', details: error.message });
  }
});

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
  
  const { exec } = require('child_process');
  const path = require('path');
  
  exec('node init-db-with-data.js', { cwd: __dirname }, (error, stdout, stderr) => {
    if (error) {
      console.error('Database initialization error:', error);
    } else {
      console.log('Database initialization completed');
      if (stdout) console.log('Init output:', stdout);
    }
    if (stderr) console.error('Init stderr:', stderr);
  });
};

app.listen(PORT, () => {
  console.log(`🚜 NHFarming API Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  
  // Initialize database after server starts
  setTimeout(initializeDatabase, 2000);
}); 