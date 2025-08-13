const express = require('express');
const db = require('./db');
const { authMiddleware } = require('./auth');
const { filterByUserFarms, requireFarmAccess } = require('./permissions');

const router = express.Router();

// Get all crops (filtered by user's farm access)
router.get('/', authMiddleware, filterByUserFarms(), (req, res) => {
  let query = `
    SELECT 
      c.*, 
      f.name as field_name, 
      f.area as field_area, 
      f.area_unit as field_area_unit,
      farm.name as farm_name,
      u.username as created_by_username
    FROM crops c
    LEFT JOIN fields f ON c.field_id = f.id
    LEFT JOIN farms farm ON f.farm_id = farm.id
    LEFT JOIN users u ON c.user_id = u.id
  `;
  
  const params = [];
  
  // Filter by user's farms if not admin
  if (req.userFarms !== null) {
    if (req.userFarms.length === 0) {
      return res.json([]);
    }
    query += ` WHERE f.farm_id IN (${req.userFarms.map(() => '?').join(',')})`;
    params.push(...req.userFarms);
  }
  
  query += ` ORDER BY c.crop_type, f.name`;
  
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// Add a new crop (requires farm access)
router.post('/', authMiddleware, async (req, res) => {
  const { crop_type, field_id, field_name, season_year, planting_date, expected_harvest_date, acres, status, notes } = req.body;
  if (!crop_type) return res.status(400).json({ error: 'crop_type is required' });
  if (!field_id) return res.status(400).json({ error: 'field_id is required' });
  if (!season_year) return res.status(400).json({ error: 'season_year is required' });
  
  try {
    // Get farm_id from field_id
    const field = await new Promise((resolve, reject) => {
      db.get('SELECT farm_id FROM fields WHERE id = ?', [field_id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!field || !field.farm_id) {
      return res.status(400).json({ error: 'Invalid field or field not found' });
    }
    
    // Check farm access
    const isAdmin = await new Promise((resolve, reject) => {
      db.get('SELECT role FROM users WHERE id = ?', [req.user.id], (err, user) => {
        if (err) reject(err);
        else resolve(user && user.role === 'admin');
      });
    });
    
    if (!isAdmin) {
      const farmAccess = await new Promise((resolve, reject) => {
        db.get(`
          SELECT fu.*, f.name as farm_name, f.owner_id
          FROM farm_users fu
          INNER JOIN farms f ON fu.farm_id = f.id
          WHERE fu.user_id = ? AND fu.farm_id = ?
        `, [req.user.id, field.farm_id], (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
      
      if (!farmAccess) {
        return res.status(403).json({ error: 'Access denied to this farm' });
      }
    }
    
    // Insert the crop
    db.run(
      `INSERT INTO crops (user_id, field_id, crop_type, field_name, season_year, planting_date, expected_harvest_date, acres, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, field_id, crop_type, field_name, season_year, planting_date, expected_harvest_date, acres, status || 'growing', notes],
      function (err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.status(201).json({ id: this.lastID, crop_type, field_id, field_name, season_year, planting_date, expected_harvest_date, acres, status, notes });
      }
    );
  } catch (error) {
    console.error('Crop creation error:', error);
    res.status(500).json({ error: 'Failed to create crop' });
  }
});

// Update a crop (requires farm access)
router.put('/:id', authMiddleware, requireFarmAccess(), (req, res) => {
  const { crop_type, field_id, field_name, season_year, planting_date, expected_harvest_date, acres, status, notes } = req.body;
  db.run(
    `UPDATE crops SET crop_type=?, field_id=?, field_name=?, season_year=?, planting_date=?, expected_harvest_date=?, acres=?, status=?, notes=? WHERE id=?`,
    [crop_type, field_id, field_name, season_year, planting_date, expected_harvest_date, acres, status, notes, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (this.changes === 0) return res.status(404).json({ error: 'Crop not found' });
      res.json({ success: true });
    }
  );
});

// Delete a crop (requires farm access)
router.delete('/:id', authMiddleware, requireFarmAccess(), (req, res) => {
  db.run(
    `DELETE FROM crops WHERE id=?`,
    [req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (this.changes === 0) return res.status(404).json({ error: 'Crop not found' });
      res.json({ success: true });
    }
  );
});

module.exports = router; 