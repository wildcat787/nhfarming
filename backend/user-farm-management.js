const express = require('express');
const db = require('./db');
const { authMiddleware, adminMiddleware } = require('./auth');

const router = express.Router();

/**
 * Get comprehensive user information including farm assignments
 */
router.get('/users-comprehensive', authMiddleware, adminMiddleware, (req, res) => {
  const query = `
    SELECT 
      u.id,
      u.username,
      u.email,
      u.role as system_role,
      u.email_verified,
      GROUP_CONCAT(
        f.name || ':' || fu.role || ':' || fu.permissions, 
        '||'
      ) as farm_assignments
    FROM users u
    LEFT JOIN farm_users fu ON u.id = fu.user_id
    LEFT JOIN farms f ON fu.farm_id = f.id
    GROUP BY u.id, u.username, u.email, u.role, u.email_verified
    ORDER BY u.username
  `;
  
  db.all(query, (err, users) => {
    if (err) {
      console.error('Error fetching comprehensive users:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Process the results to format farm assignments
    const processedUsers = users.map(user => {
      const farmAssignments = [];
      
      if (user.farm_assignments) {
        const assignments = user.farm_assignments.split('||');
        assignments.forEach(assignment => {
          if (assignment && assignment.includes(':')) {
            const [farmName, role, permissions] = assignment.split(':');
            farmAssignments.push({
              farmName,
              role,
              permissions
            });
          }
        });
      }
      
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        system_role: user.system_role,
        email_verified: user.email_verified,
        farm_assignments: farmAssignments,
        primary_role: farmAssignments.length > 0 ? farmAssignments[0].role : user.system_role
      };
    });
    
    res.json(processedUsers);
  });
});

/**
 * Get all available farms for assignment
 */
router.get('/farms-for-assignment', authMiddleware, adminMiddleware, (req, res) => {
  db.all('SELECT id, name, description FROM farms ORDER BY name', (err, farms) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(farms);
  });
});

/**
 * Assign user to farm with specific role
 */
router.post('/assign-user-to-farm', authMiddleware, adminMiddleware, (req, res) => {
  const { userId, farmId, role, permissions = 'standard' } = req.body;
  
  if (!userId || !farmId || !role) {
    return res.status(400).json({ error: 'User ID, Farm ID, and role are required' });
  }
  
  if (!['owner', 'manager', 'worker'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role. Must be owner, manager, or worker' });
  }
  
  // Check if user is already assigned to this farm
  db.get(
    'SELECT id FROM farm_users WHERE user_id = ? AND farm_id = ?',
    [userId, farmId],
    (err, existing) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (existing) {
        // Update existing assignment
        db.run(
          'UPDATE farm_users SET role = ?, permissions = ?, assigned_by = ? WHERE user_id = ? AND farm_id = ?',
          [role, permissions, req.user.id, userId, farmId],
          function (err) {
            if (err) {
              return res.status(500).json({ error: 'Database error' });
            }
            res.json({ message: 'User farm assignment updated successfully' });
          }
        );
      } else {
        // Create new assignment
        db.run(
          'INSERT INTO farm_users (user_id, farm_id, role, permissions, assigned_by) VALUES (?, ?, ?, ?, ?)',
          [userId, farmId, role, permissions, req.user.id],
          function (err) {
            if (err) {
              return res.status(500).json({ error: 'Database error' });
            }
            res.json({ message: 'User assigned to farm successfully' });
          }
        );
      }
    }
  );
});

/**
 * Remove user from farm
 */
router.delete('/remove-user-from-farm', authMiddleware, adminMiddleware, (req, res) => {
  const { userId, farmId } = req.body;
  
  if (!userId || !farmId) {
    return res.status(400).json({ error: 'User ID and Farm ID are required' });
  }
  
  db.run(
    'DELETE FROM farm_users WHERE user_id = ? AND farm_id = ?',
    [userId, farmId],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'User farm assignment not found' });
      }
      
      res.json({ message: 'User removed from farm successfully' });
    }
  );
});

/**
 * Update user's system role
 */
router.put('/update-system-role', authMiddleware, adminMiddleware, (req, res) => {
  const { userId, systemRole } = req.body;
  
  if (!userId || !systemRole) {
    return res.status(400).json({ error: 'User ID and system role are required' });
  }
  
  if (!['user', 'admin'].includes(systemRole)) {
    return res.status(400).json({ error: 'Invalid system role. Must be user or admin' });
  }
  
  db.run(
    'UPDATE users SET role = ? WHERE id = ?',
    [systemRole, userId],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({ message: 'User system role updated successfully' });
    }
  );
});

/**
 * Create user with farm assignment
 */
router.post('/create-user-with-farm', authMiddleware, adminMiddleware, async (req, res) => {
  const { username, email, password, systemRole = 'user', farmId, farmRole, permissions = 'standard' } = req.body;
  const bcrypt = require('bcryptjs');
  const { sendWelcomeEmail, generateVerificationToken } = require('./emailService');
  
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }
  
  if (!['user', 'admin'].includes(systemRole)) {
    return res.status(400).json({ error: 'Invalid system role' });
  }
  
  if (farmId && farmRole && !['owner', 'manager', 'worker'].includes(farmRole)) {
    return res.status(400).json({ error: 'Invalid farm role' });
  }
  
  // Email validation
  const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }
  
  // Check if username or email already exists
  db.get('SELECT id FROM users WHERE username = ? OR email = ?', [username, email], async (err, existingUser) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (existingUser) return res.status(400).json({ error: 'Username or email already exists' });
    
    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Generate verification token
      const verificationToken = generateVerificationToken();
      const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
      
      // Create user
      db.run(
        'INSERT INTO users (username, email, password, role, verification_token, verification_token_expiry, email_verified) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [username, email, hashedPassword, systemRole, verificationToken, verificationExpiry.toISOString(), 0],
        function (err) {
          if (err) return res.status(500).json({ error: 'Database error' });
          
          const userId = this.lastID;
          
          // If farm assignment is specified, create it
          if (farmId && farmRole) {
            db.run(
              'INSERT INTO farm_users (user_id, farm_id, role, permissions, assigned_by) VALUES (?, ?, ?, ?, ?)',
              [userId, farmId, farmRole, permissions, req.user.id],
              async (err) => {
                if (err) {
                  console.error('Error creating farm assignment:', err);
                  // User was created but farm assignment failed
                  return res.status(201).json({
                    id: userId,
                    username,
                    email,
                    system_role: systemRole,
                    message: 'User created successfully, but farm assignment failed. You can assign them to a farm manually.'
                  });
                }
                
                // Send welcome email
                sendWelcomeEmail(email, username, verificationToken)
                  .then(() => {
                    console.log('Welcome email sent successfully');
                  })
                  .catch(emailError => {
                    console.error('Failed to send welcome email:', emailError);
                  });
                
                res.status(201).json({
                  id: userId,
                  username,
                  email,
                  system_role: systemRole,
                  farm_assignment: { farmId, farmRole, permissions },
                  message: 'User created and assigned to farm successfully!'
                });
              }
            );
          } else {
            // No farm assignment, just create user
            sendWelcomeEmail(email, username, verificationToken)
              .then(() => {
                console.log('Welcome email sent successfully');
              })
              .catch(emailError => {
                console.error('Failed to send welcome email:', emailError);
              });
            
            res.status(201).json({
              id: userId,
              username,
              email,
              system_role: systemRole,
              message: 'User created successfully!'
            });
          }
        }
      );
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });
});

module.exports = router;
