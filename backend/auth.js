const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('./db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify JWT token
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

// Admin middleware to check if user is admin
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
  next();
};

// Register a new user
const register = async (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    // Check if username already exists
    db.get('SELECT id FROM users WHERE username = ?', [username], async (err, user) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (user) return res.status(400).json({ error: 'Username already exists' });
      
      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      // Insert new user
      db.run(
        'INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)',
        [username, hashedPassword, email, 'user'],
        function (err) {
          if (err) return res.status(500).json({ error: 'Database error' });
          
          // Generate JWT token
          const token = jwt.sign(
            { id: this.lastID, username, role: 'user' },
            JWT_SECRET,
            { expiresIn: '24h' }
          );
          
          res.json({ token, user: { id: this.lastID, username, role: 'user' } });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    // Find user by username
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (!user) return res.status(400).json({ error: 'Invalid credentials' });
      
      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.json({ 
        token, 
        user: { 
          id: user.id, 
          username: user.username, 
          role: user.role 
        } 
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Request password reset
const requestPasswordReset = (req, res) => {
  const { username } = req.body;
  
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }
  
  db.get('SELECT id FROM users WHERE username = ?', [username], (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Generate reset token
    const resetToken = require('crypto').randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now
    
    db.run(
      'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
      [resetToken, resetTokenExpiry.toISOString(), user.id],
      function (err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ message: 'Password reset token generated successfully' });
      }
    );
  });
};

// Reset password with token
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }
    
    // Find user with valid reset token
    db.get(
      'SELECT id FROM users WHERE reset_token = ? AND reset_token_expiry > ?',
      [token, new Date().toISOString()],
      async (err, user) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!user) return res.status(400).json({ error: 'Invalid or expired token' });
        
        // Hash new password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        
        // Update password and clear reset token
        db.run(
          'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
          [hashedPassword, user.id],
          function (err) {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json({ message: 'Password reset successfully' });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Change password for logged-in user
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    
    // Get user's current password
    db.get('SELECT password FROM users WHERE id = ?', [req.user.id], async (err, user) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (!user) return res.status(404).json({ error: 'User not found' });
      
      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
      
      // Hash new password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      
      // Update password
      db.run(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, req.user.id],
        function (err) {
          if (err) return res.status(500).json({ error: 'Database error' });
          res.json({ message: 'Password changed successfully' });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get current user info
const getCurrentUser = (req, res) => {
  db.get('SELECT id, username, email, role FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  });
};

module.exports = {
  authMiddleware,
  adminMiddleware,
  register,
  login,
  requestPasswordReset,
  resetPassword,
  changePassword,
  getCurrentUser
}; 