const express = require('express');
const db = require('./db');
const { authMiddleware } = require('./auth');
const { 
  requireFarmAccess, 
  requireFarmAdmin,
  requireFarmUserManagement,
  requireFarmOwner,
  getFarmUsers, 
  addUserToFarm, 
  removeUserFromFarm 
} = require('./permissions');

const router = express.Router();

// Get all farms for the authenticated user
router.get('/', authMiddleware, (req, res) => {
  const query = `
    SELECT 
      f.*, 
      fu.role as user_role, 
      fu.permissions,
      COALESCE(SUM(fld.area), 0) as calculated_total_area,
      COUNT(fld.id) as field_count
    FROM farms f
    INNER JOIN farm_users fu ON f.id = fu.farm_id
    LEFT JOIN fields fld ON f.id = fld.farm_id
    WHERE fu.user_id = ?
    GROUP BY f.id, f.name, f.description, f.location, f.total_area, f.area_unit, f.owner_id, f.created_at, f.updated_at, fu.role, fu.permissions
    ORDER BY f.name
  `;
  
  db.all(query, [req.user.id], (err, farms) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(farms);
  });
});

// Get farm by ID (if user has access)
router.get('/:id', authMiddleware, (req, res) => {
  const query = `
    SELECT f.*, fu.role as user_role, fu.permissions
    FROM farms f
    INNER JOIN farm_users fu ON f.id = fu.farm_id
    WHERE f.id = ? AND fu.user_id = ?
  `;
  
  db.get(query, [req.params.id, req.user.id], (err, farm) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!farm) return res.status(404).json({ error: 'Farm not found or access denied' });
    res.json(farm);
  });
});

// Create a new farm
router.post('/', authMiddleware, (req, res) => {
  const { name, description, location } = req.body;
  if (!name) return res.status(400).json({ error: 'Farm name is required' });
  
  db.run(
    `INSERT INTO farms (name, description, location, total_area, area_unit, owner_id) VALUES (?, ?, ?, 0, 'hectares', ?)`,
    [name, description, location, req.user.id],
    function (err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      
      const farmId = this.lastID;
      
      // Add the creator as owner
      db.run(
        `INSERT INTO farm_users (farm_id, user_id, role, permissions) VALUES (?, ?, ?, ?)`,
        [farmId, req.user.id, 'owner', 'all'],
        (err) => {
          if (err) return res.status(500).json({ error: 'Database error' });
          res.json({ 
            id: farmId, 
            name, 
            description, 
            location, 
            total_area: 0,
            area_unit: 'hectares',
            owner_id: req.user.id 
          });
        }
      );
    }
  );
});

// Update a farm (managers and owners can update)
router.put('/:id', authMiddleware, requireFarmAdmin(), (req, res) => {
  const { name, description, location } = req.body;
  
  db.run(
    `UPDATE farms SET name=?, description=?, location=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
    [name, description, location, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (this.changes === 0) return res.status(404).json({ error: 'Farm not found' });
      res.json({ success: true });
    }
  );
});

// Delete a farm (only owners can delete)
router.delete('/:id', authMiddleware, requireFarmOwner(), (req, res) => {
  // Delete farm and all associated data
  db.serialize(() => {
    db.run('DELETE FROM farm_users WHERE farm_id = ?', [req.params.id]);
    db.run('DELETE FROM fields WHERE farm_id = ?', [req.params.id]);
    db.run('DELETE FROM crops WHERE farm_id = ?', [req.params.id]);
    db.run('DELETE FROM applications WHERE farm_id = ?', [req.params.id]);
    db.run('DELETE FROM inputs WHERE farm_id = ?', [req.params.id]);
    db.run('DELETE FROM vehicles WHERE farm_id = ?', [req.params.id]);
    db.run('DELETE FROM maintenance WHERE farm_id = ?', [req.params.id]);
    db.run('DELETE FROM farms WHERE id = ?', [req.params.id], function (err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ success: true });
    });
  });
});

// Get farm users (managers and owners can view users)
router.get('/:id/users', authMiddleware, requireFarmUserManagement(), (req, res) => {
  getFarmUsers(parseInt(req.params.id), req.user.id)
    .then(users => {
      res.json(users);
    })
    .catch(err => {
      console.error('Error getting farm users:', err);
      res.status(500).json({ error: err.message || 'Database error' });
    });
});

// Add user to farm (managers and owners can add users)
router.post('/:id/users', authMiddleware, requireFarmUserManagement(), (req, res) => {
  const { user_id, role = 'worker', permissions } = req.body;
  if (!user_id) return res.status(400).json({ error: 'User ID is required' });
  
  // Managers cannot add other managers or owners (only workers)
  if (req.farmRole.role === 'manager' && (role === 'manager' || role === 'owner')) {
    return res.status(403).json({ 
      error: 'Farm managers can only add workers. Contact the farm owner to add managers.' 
    });
  }
  
  addUserToFarm(parseInt(req.params.id), parseInt(user_id), role, permissions, req.user.id)
    .then(result => {
      res.json(result);
    })
    .catch(err => {
      console.error('Error adding user to farm:', err);
      res.status(400).json({ error: err.message || 'Failed to add user to farm' });
    });
});

// Remove user from farm (managers and owners can remove users)
router.delete('/:id/users/:userId', authMiddleware, requireFarmUserManagement(), (req, res) => {
  // Additional check: managers cannot remove other managers or owners
  if (req.farmRole.role === 'manager') {
    // Check the role of the user being removed
    getFarmUsers(parseInt(req.params.id), req.user.id)
      .then(users => {
        const targetUser = users.find(u => u.id === parseInt(req.params.userId));
        if (targetUser && (targetUser.role === 'manager' || targetUser.role === 'owner')) {
          return res.status(403).json({ 
            error: 'Farm managers cannot remove other managers or owners' 
          });
        }
        
        // Proceed with removal
        removeUserFromFarm(parseInt(req.params.id), parseInt(req.params.userId), req.user.id)
          .then(result => {
            res.json(result);
          })
          .catch(err => {
            console.error('Error removing user from farm:', err);
            res.status(400).json({ error: err.message || 'Failed to remove user from farm' });
          });
      })
      .catch(err => {
        console.error('Error checking user role:', err);
        res.status(500).json({ error: 'Permission check failed' });
      });
  } else {
    // Owners can remove anyone
    removeUserFromFarm(parseInt(req.params.id), parseInt(req.params.userId), req.user.id)
      .then(result => {
        res.json(result);
      })
      .catch(err => {
        console.error('Error removing user from farm:', err);
        res.status(400).json({ error: err.message || 'Failed to remove user from farm' });
      });
  }
});

module.exports = router; 