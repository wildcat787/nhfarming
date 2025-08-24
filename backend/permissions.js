const { db } = require('./db');

/**
 * Check if user has access to a specific farm
 * @param {number} userId - User ID
 * @param {number} farmId - Farm ID
 * @returns {Promise<Object|null>} - Farm user record or null if no access
 */
function getUserFarmAccess(userId, farmId) {
  return new Promise((resolve, reject) => {
    db.get(`
      SELECT fu.*, f.name as farm_name, f.owner_id
      FROM farm_users fu
      INNER JOIN farms f ON fu.farm_id = f.id
      WHERE fu.user_id = ? AND fu.farm_id = ?
    `, [userId, farmId], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}

/**
 * Check if user is a site admin
 * @param {number} userId - User ID
 * @returns {Promise<boolean>} - True if user is site admin
 */
function isSiteAdmin(userId) {
  return new Promise((resolve, reject) => {
    db.get('SELECT role FROM users WHERE id = ?', [userId], (err, user) => {
      if (err) return reject(err);
      resolve(user && user.role === 'admin');
    });
  });
}

/**
 * Check if user is a farm admin/owner
 * @param {number} userId - User ID
 * @param {number} farmId - Farm ID
 * @returns {Promise<boolean>} - True if user is farm admin/owner
 */
function isFarmAdmin(userId, farmId) {
  return new Promise((resolve, reject) => {
    db.get(`
      SELECT fu.role, f.owner_id
      FROM farm_users fu
      INNER JOIN farms f ON fu.farm_id = f.id
      WHERE fu.user_id = ? AND fu.farm_id = ?
    `, [userId, farmId], (err, result) => {
      if (err) return reject(err);
      resolve(result && (result.role === 'owner' || result.role === 'manager'));
    });
  });
}

/**
 * Check if user is a farm manager (can manage farm and users but not delete farm)
 * @param {number} userId - User ID
 * @param {number} farmId - Farm ID
 * @returns {Promise<boolean>} - True if user is farm manager
 */
function isFarmManager(userId, farmId) {
  return new Promise((resolve, reject) => {
    db.get(`
      SELECT fu.role
      FROM farm_users fu
      WHERE fu.user_id = ? AND fu.farm_id = ?
    `, [userId, farmId], (err, result) => {
      if (err) return reject(err);
      resolve(result && result.role === 'manager');
    });
  });
}

/**
 * Check if user can manage users for a specific farm
 * @param {number} userId - User ID
 * @param {number} farmId - Farm ID
 * @returns {Promise<Object>} - User's role and permissions
 */
function getUserFarmRole(userId, farmId) {
  return new Promise((resolve, reject) => {
    // First check if user is site admin
    db.get('SELECT role FROM users WHERE id = ?', [userId], (err, user) => {
      if (err) return reject(err);
      
      if (user && user.role === 'admin') {
        resolve({ role: 'admin', canManageUsers: true, canManageFarm: true, canDeleteFarm: true });
        return;
      }
      
      // Check farm-specific role
      db.get(`
        SELECT fu.role, fu.permissions
        FROM farm_users fu
        WHERE fu.user_id = ? AND fu.farm_id = ?
      `, [userId, farmId], (err, farmUser) => {
        if (err) return reject(err);
        
        if (!farmUser) {
          resolve({ role: 'none', canManageUsers: false, canManageFarm: false, canDeleteFarm: false });
          return;
        }
        
        const permissions = {
          role: farmUser.role,
          canManageUsers: farmUser.role === 'owner' || farmUser.role === 'manager',
          canManageFarm: farmUser.role === 'owner' || farmUser.role === 'manager',
          canDeleteFarm: farmUser.role === 'owner' // Only owners can delete farms
        };
        
        resolve(permissions);
      });
    });
  });
}

/**
 * Get all farms a user has access to
 * @param {number} userId - User ID
 * @returns {Promise<Array>} - Array of farm access records
 */
function getUserFarms(userId) {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT fu.*, f.name as farm_name, f.owner_id
      FROM farm_users fu
      INNER JOIN farms f ON fu.farm_id = f.id
      WHERE fu.user_id = ?
      ORDER BY f.name
    `, [userId], (err, results) => {
      if (err) return reject(err);
      resolve(results || []);
    });
  });
}

/**
 * Middleware to check if user has access to a specific farm
 */
function requireFarmAccess() {
  return async (req, res, next) => {
    try {
      const farmId = parseInt(req.params.farmId || req.params.id || req.body.farm_id);
      if (!farmId) {
        return res.status(400).json({ error: 'Farm ID is required' });
      }

      const isAdmin = await isSiteAdmin(req.user.id);
      if (isAdmin) {
        // Site admins can access all farms
        req.farmAccess = { role: 'admin', farm_id: farmId };
        return next();
      }

      const farmAccess = await getUserFarmAccess(req.user.id, farmId);
      if (!farmAccess) {
        return res.status(403).json({ error: 'Access denied to this farm' });
      }

      req.farmAccess = farmAccess;
      next();
    } catch (error) {
      console.error('Farm access check error:', error);
      res.status(500).json({ error: 'Permission check failed' });
    }
  };
}

/**
 * Middleware to check if user is farm admin/owner
 */
function requireFarmAdmin() {
  return async (req, res, next) => {
    try {
      const farmId = parseInt(req.params.farmId || req.params.id || req.body.farm_id);
      if (!farmId) {
        return res.status(400).json({ error: 'Farm ID is required' });
      }

      const isAdmin = await isSiteAdmin(req.user.id);
      if (isAdmin) {
        // Site admins can perform admin actions on all farms
        req.farmAccess = { role: 'admin', farm_id: farmId };
        return next();
      }

      const isUserFarmAdmin = await isFarmAdmin(req.user.id, farmId);
      if (!isUserFarmAdmin) {
        return res.status(403).json({ error: 'Farm admin privileges required' });
      }

      const farmAccess = await getUserFarmAccess(req.user.id, farmId);
      req.farmAccess = farmAccess;
      next();
    } catch (error) {
      console.error('Farm admin check error:', error);
      res.status(500).json({ error: 'Permission check failed' });
    }
  };
}

/**
 * Middleware to check if user can manage farm users (managers and owners)
 */
function requireFarmUserManagement() {
  return async (req, res, next) => {
    try {
      const farmId = parseInt(req.params.farmId || req.params.id || req.body.farm_id);
      if (!farmId) {
        return res.status(400).json({ error: 'Farm ID is required' });
      }

      const userRole = await getUserFarmRole(req.user.id, farmId);
      
      if (!userRole.canManageUsers) {
        return res.status(403).json({ 
          error: 'Farm manager or owner privileges required to manage users' 
        });
      }

      req.farmRole = userRole;
      req.farmId = farmId;
      next();
    } catch (error) {
      console.error('Farm user management check error:', error);
      res.status(500).json({ error: 'Permission check failed' });
    }
  };
}

/**
 * Middleware to check if user can delete farm (owners only)
 */
function requireFarmOwner() {
  return async (req, res, next) => {
    try {
      const farmId = parseInt(req.params.farmId || req.params.id || req.body.farm_id);
      if (!farmId) {
        return res.status(400).json({ error: 'Farm ID is required' });
      }

      const userRole = await getUserFarmRole(req.user.id, farmId);
      
      if (!userRole.canDeleteFarm) {
        return res.status(403).json({ 
          error: 'Farm owner privileges required for this action' 
        });
      }

      req.farmRole = userRole;
      req.farmId = farmId;
      next();
    } catch (error) {
      console.error('Farm owner check error:', error);
      res.status(500).json({ error: 'Permission check failed' });
    }
  };
}

/**
 * Middleware to filter data by user's farm access
 */
function filterByUserFarms() {
  return async (req, res, next) => {
    try {
      const isAdmin = await isSiteAdmin(req.user.id);
      if (isAdmin) {
        // Site admins can see all data
        req.userFarms = null; // null means all farms
        return next();
      }

      const userFarms = await getUserFarms(req.user.id);
      req.userFarms = userFarms.map(f => f.farm_id);
      next();
    } catch (error) {
      console.error('User farms filter error:', error);
      res.status(500).json({ error: 'Permission check failed' });
    }
  };
}

/**
 * Get farm users with proper access control
 * @param {number} farmId - Farm ID
 * @param {number} userId - Requesting user ID
 * @returns {Promise<Array>} - Array of farm users
 */
function getFarmUsers(farmId, userId) {
  return new Promise(async (resolve, reject) => {
    try {
      const isAdmin = await isSiteAdmin(userId);
      const isUserFarmAdmin = await isFarmAdmin(userId, farmId);

      if (!isAdmin && !isUserFarmAdmin) {
        return reject(new Error('Access denied'));
      }

      db.all(`
        SELECT u.id, u.username, u.email, fu.role, fu.permissions, fu.created_at
        FROM farm_users fu
        INNER JOIN users u ON fu.user_id = u.id
        WHERE fu.farm_id = ?
        ORDER BY fu.role, u.username
      `, [farmId], (err, users) => {
        if (err) return reject(err);
        resolve(users || []);
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Add user to farm with proper permissions
 * @param {number} farmId - Farm ID
 * @param {number} userId - User ID to add
 * @param {string} role - Role (worker, manager, owner)
 * @param {string} permissions - Permissions string
 * @param {number} addedByUserId - User ID who is adding the user
 * @returns {Promise<Object>} - Result of the operation
 */
function addUserToFarm(farmId, userId, role, permissions, addedByUserId) {
  return new Promise(async (resolve, reject) => {
    try {
      const isAdmin = await isSiteAdmin(addedByUserId);
      const isUserFarmAdmin = await isFarmAdmin(addedByUserId, farmId);

      if (!isAdmin && !isUserFarmAdmin) {
        return reject(new Error('Only farm admins or site admins can add users'));
      }

      // Check if user is already in the farm
      const existingAccess = await getUserFarmAccess(userId, farmId);
      if (existingAccess) {
        return reject(new Error('User is already a member of this farm'));
      }

      db.run(
        `INSERT INTO farm_users (farm_id, user_id, role, permissions) VALUES (?, ?, ?, ?)`,
        [farmId, userId, role, permissions],
        function (err) {
          if (err) return reject(err);
          resolve({ success: true, id: this.lastID });
        }
      );
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Remove user from farm with proper permissions
 * @param {number} farmId - Farm ID
 * @param {number} userId - User ID to remove
 * @param {number} removedByUserId - User ID who is removing the user
 * @returns {Promise<Object>} - Result of the operation
 */
function removeUserFromFarm(farmId, userId, removedByUserId) {
  return new Promise(async (resolve, reject) => {
    try {
      const isAdmin = await isSiteAdmin(removedByUserId);
      const isUserFarmAdmin = await isFarmAdmin(removedByUserId, farmId);

      if (!isAdmin && !isUserFarmAdmin) {
        return reject(new Error('Only farm admins or site admins can remove users'));
      }

      // Prevent removing the last owner
      if (!isAdmin) {
        const farmUsers = await getFarmUsers(farmId, removedByUserId);
        const owners = farmUsers.filter(u => u.role === 'owner');
        const userToRemove = farmUsers.find(u => u.id === userId);
        
        if (owners.length === 1 && userToRemove && userToRemove.role === 'owner') {
          return reject(new Error('Cannot remove the last owner from the farm'));
        }
      }

      db.run(
        `DELETE FROM farm_users WHERE farm_id = ? AND user_id = ?`,
        [farmId, userId],
        function (err) {
          if (err) return reject(err);
          if (this.changes === 0) {
            return reject(new Error('User not found in farm'));
          }
          resolve({ success: true });
        }
      );
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  getUserFarmAccess,
  isSiteAdmin,
  isFarmAdmin,
  isFarmManager,
  getUserFarmRole,
  getUserFarms,
  requireFarmAccess,
  requireFarmAdmin,
  requireFarmUserManagement,
  requireFarmOwner,
  filterByUserFarms,
  getFarmUsers,
  addUserToFarm,
  removeUserFromFarm
}; 