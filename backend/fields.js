const express = require('express');
const { authMiddleware } = require('./auth');
const { updateFarmAreaOnFieldChange } = require('./farmAreaCalculator');
const { filterByUserFarms, requireFarmAccess } = require('./permissions');
const router = express.Router();

// GET /api/fields - Get all fields (filtered by user's farm access)
router.get('/', authMiddleware, filterByUserFarms(), (req, res) => {
  const db = require('./db');
  
  let query = `
    SELECT 
      f.*,
      COUNT(DISTINCT a.id) as application_count,
      COUNT(DISTINCT c.id) as crop_count,
      farm.name as farm_name
    FROM fields f
    LEFT JOIN applications a ON f.id = a.field_id
    LEFT JOIN crops c ON f.id = c.field_id
    LEFT JOIN farms farm ON f.farm_id = farm.id
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
  
  query += ` GROUP BY f.id ORDER BY f.name`;
  
  db.all(query, params, (err, fields) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(fields);
  });
});

// GET /api/fields/:id - Get specific field with history
router.get('/:id', authMiddleware, (req, res) => {
  const db = require('./db');
  const fieldId = req.params.id;
  
  // Get field details
  db.get('SELECT * FROM fields WHERE id = ?', [fieldId], (err, field) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (!field) {
      return res.status(404).json({ error: 'Field not found' });
    }
    
    // Get field history (applications and crops)
    db.all(`
      SELECT 
        'application' as type,
        a.id,
        a.date,
        a.rate,
        a.unit,
        a.notes,
        i.name as input_name,
        c.crop_type as crop_name,
        v.name as vehicle_name
      FROM applications a
      LEFT JOIN inputs i ON a.input_id = i.id
      LEFT JOIN crops c ON a.crop_id = c.id
      LEFT JOIN vehicles v ON a.vehicle_id = v.id
      WHERE a.field_id = ?
      
      UNION ALL
      
      SELECT 
        'crop' as type,
        c.id,
        c.planting_date as date,
        c.expected_yield as rate,
        c.yield_unit as unit,
        c.notes,
        c.crop_type as input_name,
        c.crop_type as crop_name,
        NULL as vehicle_name
      FROM crops c
      WHERE c.field_id = ?
      
      ORDER BY date DESC
    `, [fieldId, fieldId], (err, history) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json({
        ...field,
        history: history || []
      });
    });
  });
});

// POST /api/fields - Create new field
router.post('/', authMiddleware, requireFarmAccess(), (req, res) => {
  const db = require('./db');
  const { 
    name, 
    area, 
    area_unit, 
    location, 
    coordinates, 
    soil_type, 
    irrigation_type,
    notes,
    border_coordinates,
    farm_id
  } = req.body;
  
  if (!name || !area || !area_unit) {
    return res.status(400).json({ error: 'Name, area, and area unit are required' });
  }
  
  if (!farm_id) {
    return res.status(400).json({ error: 'Farm ID is required' });
  }
  
  const sql = `
    INSERT INTO fields (
      user_id, name, area, area_unit, location, coordinates, soil_type, 
      irrigation_type, notes, border_coordinates, farm_id, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `;
  
  const params = [
    req.user.id, name, area, area_unit, location, coordinates, soil_type,
    irrigation_type, notes, border_coordinates, farm_id
  ];
  
  db.run(sql, params, function (err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Update farm total area
    updateFarmAreaOnFieldChange(farm_id);
    
    res.status(201).json({
      id: this.lastID,
      name,
      area,
      area_unit,
      location,
      coordinates,
      soil_type,
      irrigation_type,
      notes,
      border_coordinates,
      farm_id,
      user_id: req.user.id,
      created_at: new Date().toISOString()
    });
  });
});

// PUT /api/fields/:id - Update field
router.put('/:id', authMiddleware, requireFarmAccess(), (req, res) => {
  const db = require('./db');
  const fieldId = req.params.id;
  const { 
    name, 
    area, 
    area_unit, 
    location, 
    coordinates, 
    soil_type, 
    irrigation_type,
    notes,
    border_coordinates,
    farm_id
  } = req.body;
  
  if (!name || !area || !area_unit) {
    return res.status(400).json({ error: 'Name, area, and area unit are required' });
  }
  
  if (!farm_id) {
    return res.status(400).json({ error: 'Farm ID is required' });
  }
  
  // Get the current field to check if farm_id is changing
  db.get('SELECT farm_id FROM fields WHERE id = ?', [fieldId], (err, currentField) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (!currentField) {
      return res.status(404).json({ error: 'Field not found' });
    }
    
    const oldFarmId = currentField.farm_id;
    const newFarmId = farm_id;
    
    const sql = `
      UPDATE fields SET 
        name = ?, area = ?, area_unit = ?, location = ?, coordinates = ?,
        soil_type = ?, irrigation_type = ?, notes = ?, border_coordinates = ?,
        farm_id = ?, updated_at = datetime('now')
      WHERE id = ?
    `;
    
    const params = [
      name, area, area_unit, location, coordinates, soil_type,
      irrigation_type, notes, border_coordinates, farm_id, fieldId
    ];
    
    db.run(sql, params, function (err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Field not found' });
      }
      
      // Update farm areas - both old and new farm if farm_id changed
      if (oldFarmId && oldFarmId !== newFarmId) {
        updateFarmAreaOnFieldChange(oldFarmId);
      }
      updateFarmAreaOnFieldChange(newFarmId);
      
      res.json({
        id: fieldId,
        name,
        area,
        area_unit,
        location,
        coordinates,
        soil_type,
        irrigation_type,
        notes,
        border_coordinates,
        farm_id,
        updated_at: new Date().toISOString()
      });
    });
  });
});

// DELETE /api/fields/:id - Delete field
router.delete('/:id', authMiddleware, requireFarmAccess(), (req, res) => {
  const db = require('./db');
  const fieldId = req.params.id;
  
  // Check if field has any applications or crops
  db.get(`
    SELECT 
      (SELECT COUNT(*) FROM applications WHERE field_id = ?) as app_count,
      (SELECT COUNT(*) FROM crops WHERE field_id = ?) as crop_count
  `, [fieldId, fieldId], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (result.app_count > 0 || result.crop_count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete field with existing applications or crops' 
      });
    }
    
    // Get the farm_id before deleting the field
    db.get('SELECT farm_id FROM fields WHERE id = ?', [fieldId], (err, field) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      const farmId = field ? field.farm_id : null;
      
      db.run('DELETE FROM fields WHERE id = ?', [fieldId], function (err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Field not found' });
        }
        
        // Update farm total area after field deletion
        if (farmId) {
          updateFarmAreaOnFieldChange(farmId);
        }
        
        res.json({ message: 'Field deleted successfully' });
      });
    });
  });
});

// GET /api/fields/:id/map - Get field map data
router.get('/:id/map', authMiddleware, (req, res) => {
  const db = require('./db');
  const fieldId = req.params.id;
  
  db.get('SELECT name, coordinates, border_coordinates FROM fields WHERE id = ?', [fieldId], (err, field) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (!field) {
      return res.status(404).json({ error: 'Field not found' });
    }
    
    res.json({
      name: field.name,
      center: field.coordinates ? JSON.parse(field.coordinates) : null,
      border: field.border_coordinates ? JSON.parse(field.border_coordinates) : null
    });
  });
});

module.exports = router; 