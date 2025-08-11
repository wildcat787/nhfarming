const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('./db');
const { sendWelcomeEmail, generateVerificationToken } = require('./emailService');

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

// Farm manager middleware to check if user is admin or farm manager
const farmManagerMiddleware = (req, res, next) => {
  // Site admins can access everything
  if (req.user.role === 'admin') {
    return next();
  }
  
  // For farm managers, we need to check farm-specific permissions
  // This will be handled by the farm-specific permission middleware
  next();
};

// Register a new user
const register = async (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    if (!username || !password || !email) {
      return res.status(400).json({ error: 'Username, password, and email are required' });
    }
    
    // Basic email format validation
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    
    // Check if username or email already exists
    db.get('SELECT id FROM users WHERE username = ? OR email = ?', [username, email], async (err, user) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (user) return res.status(400).json({ error: 'Username or email already exists' });
      
      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      // Generate verification token
      const verificationToken = generateVerificationToken();
      const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      
      // Insert new user
      db.run(
        'INSERT INTO users (username, password, email, role, verification_token, verification_token_expiry, email_verified) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [username, hashedPassword, email, 'user', verificationToken, verificationExpiry.toISOString(), 0],
        async function (err) {
          if (err) return res.status(500).json({ error: 'Database error' });
          
          const userId = this.lastID;
          
          // Send welcome email with verification link
          try {
            await sendWelcomeEmail(email, username, verificationToken);
            console.log(`Welcome email sent to ${email}`);
          } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
            // Don't fail registration if email fails
          }
          
          // Generate JWT token
          const token = jwt.sign(
            { id: userId, username, role: 'user' },
            JWT_SECRET,
            { expiresIn: '24h' }
          );
          
          res.json({ 
            token, 
            user: { id: userId, username, role: 'user', email_verified: 0 },
            message: 'Registration successful! Please check your email to verify your account.'
          });
        }
      );
    });
  } catch (error) {
    console.error('Registration error:', error);
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
          role: user.role,
          email_verified: user.email_verified || 0
        } 
      });
    });
  } catch (error) {
    console.error('Login error:', error);
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

// Get user profile with all details
const getUserProfile = (req, res) => {
  db.get(
    `SELECT id, username, email, role, first_name, last_name, phone, 
     address, city, state, zip_code, country FROM users WHERE id = ?`, 
    [req.user.id], 
    (err, user) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(user);
    }
  );
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const { 
      email, first_name, last_name, phone, 
      address, city, state, zip_code, country 
    } = req.body;
    
    // Note: username is not included - it cannot be changed
    
    // Basic email format validation if email is being updated
    if (email) {
      const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email address' });
      }
    }
    
    // Check if email already exists for other users
    if (email) {
      db.get('SELECT id FROM users WHERE email = ? AND id != ?', [email, req.user.id], (err, existingUser) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (existingUser) {
          return res.status(400).json({ 
            error: 'Email already exists' 
          });
        }
        
        // Proceed with update
        performProfileUpdate();
      });
    } else {
      // No email change, proceed directly
      performProfileUpdate();
    }
    
    function performProfileUpdate() {
      // Build dynamic update query (excluding username)
      const updates = [];
      const params = [];
      
      if (email !== undefined) { updates.push('email = ?'); params.push(email); }
      if (first_name !== undefined) { updates.push('first_name = ?'); params.push(first_name); }
      if (last_name !== undefined) { updates.push('last_name = ?'); params.push(last_name); }
      if (phone !== undefined) { updates.push('phone = ?'); params.push(phone); }
      if (address !== undefined) { updates.push('address = ?'); params.push(address); }
      if (city !== undefined) { updates.push('city = ?'); params.push(city); }
      if (state !== undefined) { updates.push('state = ?'); params.push(state); }
      if (zip_code !== undefined) { updates.push('zip_code = ?'); params.push(zip_code); }
      if (country !== undefined) { updates.push('country = ?'); params.push(country); }
      
      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }
      
      params.push(req.user.id);
      const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
      
      db.run(query, params, function (err) {
        if (err) {
          console.error('Profile update error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        res.json({ message: 'Profile updated successfully' });
      });
    }
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  authMiddleware,
  adminMiddleware,
  farmManagerMiddleware,
  register,
  login,
  requestPasswordReset,
  resetPassword,
  changePassword,
  getCurrentUser,
  getUserProfile,
  updateUserProfile
}; 