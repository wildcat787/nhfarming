const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 5000;

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
  getCurrentUser 
} = require('./auth');

// Import routes
const cropsRouter = require('./crops');
const inputsRouter = require('./inputs');
const applicationsRouter = require('./applications');
const vehiclesRouter = require('./vehicles');
const maintenanceRouter = require('./maintenance');
const partsRouter = require('./parts');
const weatherRouter = require('./weather');
const ecowittRouter = require('./ecowitt');
const whisperRouter = require('./whisper');

// Auth routes
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.post('/api/auth/forgot-password', requestPasswordReset);
app.post('/api/auth/reset-password', resetPassword);
app.post('/api/auth/change-password', authMiddleware, changePassword);
app.get('/api/auth/me', authMiddleware, getCurrentUser);

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
    db.run('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, userId], function (err) {
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
app.use('/api/weather', weatherRouter);
app.use('/api/ecowitt', ecowittRouter);
app.use('/api/whisper', whisperRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'Farm Record Keeping API is running',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

app.listen(PORT, () => {
  console.log(`🚜 NHFarming API Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
}); 