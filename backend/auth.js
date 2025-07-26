const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('./db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Register
router.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  const password_hash = bcrypt.hashSync(password, 10);
  db.run(
    'INSERT INTO users (username, password_hash) VALUES (?, ?)',
    [username, password_hash],
    function (err) {
      if (err) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      res.json({ id: this.lastID, username });
    }
  );
});

// Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (!bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  });
});

// Request password reset
router.post('/forgot-password', (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }
  
  db.get('SELECT id, username FROM users WHERE username = ?', [username], (err, user) => {
    if (err || !user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now
    
    // Store reset token in database
    db.run(
      'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
      [resetToken, resetTokenExpiry.toISOString(), user.id],
      function (err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to generate reset token' });
        }
        
        // In a real application, you would send this token via email
        // For now, we'll return it directly (for development purposes)
        res.json({ 
          message: 'Password reset token generated successfully',
          resetToken: resetToken, // Remove this in production
          username: user.username
        });
      }
    );
  });
});

// Reset password with token
router.post('/reset-password', (req, res) => {
  const { resetToken, newPassword } = req.body;
  if (!resetToken || !newPassword) {
    return res.status(400).json({ error: 'Reset token and new password are required' });
  }
  
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }
  
  db.get(
    'SELECT id, username, reset_token, reset_token_expiry FROM users WHERE reset_token = ?',
    [resetToken],
    (err, user) => {
      if (err || !user) {
        return res.status(400).json({ error: 'Invalid reset token' });
      }
      
      // Check if token is expired
      if (new Date() > new Date(user.reset_token_expiry)) {
        return res.status(400).json({ error: 'Reset token has expired' });
      }
      
      // Hash new password and update user
      const password_hash = bcrypt.hashSync(newPassword, 10);
      db.run(
        'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
        [password_hash, user.id],
        function (err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to update password' });
          }
          
          res.json({ message: 'Password updated successfully' });
        }
      );
    }
  );
});

// Change password (for logged-in users)
router.post('/change-password', authMiddleware, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required' });
  }
  
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }
  
  db.get('SELECT password_hash FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err || !user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify current password
    if (!bcrypt.compareSync(currentPassword, user.password_hash)) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    // Hash new password and update
    const password_hash = bcrypt.hashSync(newPassword, 10);
    db.run(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [password_hash, req.user.id],
      function (err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to update password' });
        }
        
        res.json({ message: 'Password changed successfully' });
      }
    );
  });
});

// Auth middleware
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Malformed token' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

// Get current user
router.get('/me', authMiddleware, (req, res) => {
  db.get('SELECT id, username, role, created_at FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err || !user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  });
});

module.exports = { router, authMiddleware }; 