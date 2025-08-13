const express = require('express');
const db = require('./db');
const { authMiddleware } = require('./auth');
const { filterByUserFarms, requireFarmAccess } = require('./permissions');

const router = express.Router();

// Get all vehicles for farms the user has access to
router.get('/', authMiddleware, filterByUserFarms(), (req, res) => {
  let query = `SELECT v.* FROM vehicles v`;
  const params = [];
  
  // Filter by user's farms if not admin
  if (req.userFarms !== null) {
    if (req.userFarms.length === 0) {
      return res.json([]);
    }
    query += ` WHERE v.farm_id IN (${req.userFarms.map(() => '?').join(',')})`;
    params.push(...req.userFarms);
  }
  
  query += ` ORDER BY v.name`;
  
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// Get vehicle by name
router.get('/name/:name', authMiddleware, (req, res) => {
  const vehicleName = decodeURIComponent(req.params.name);
  db.get('SELECT * FROM vehicles WHERE name = ?', [vehicleName], (err, vehicle) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(vehicle);
  });
});

// Add a new vehicle (requires farm access)
router.post('/', authMiddleware, requireFarmAccess(), (req, res) => {
  const { name, make, model, year, vin, registration_number, registration_expiry_date, insurance_expiry_date, service_due_date, notes, application_type, type, farm_id } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  if (!farm_id) return res.status(400).json({ error: 'farm_id is required' });
  
  // Check if vehicle name already exists in this farm
  db.get('SELECT id FROM vehicles WHERE name = ? AND farm_id = ?', [name, farm_id], (err, existing) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (existing) return res.status(400).json({ error: 'Vehicle name already exists in this farm' });
    
    db.run(
      `INSERT INTO vehicles (user_id, farm_id, name, make, model, year, vin, registration_number, registration_expiry_date, insurance_expiry_date, service_due_date, notes, application_type, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
      [req.user.id, farm_id, name, make, model, year, vin, registration_number, registration_expiry_date, insurance_expiry_date, service_due_date, notes, application_type, type],
      function (err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ id: this.lastID, farm_id, name, make, model, year, vin, registration_number, registration_expiry_date, insurance_expiry_date, service_due_date, notes, application_type, type });
      }
    );
  });
});

// Update a vehicle by name (requires farm access)
router.put('/name/:name', authMiddleware, requireFarmAccess(), (req, res) => {
  const vehicleName = decodeURIComponent(req.params.name);
  const { name, make, model, year, vin, registration_number, registration_expiry_date, insurance_expiry_date, service_due_date, notes, application_type, type } = req.body;
  
  // If name is being changed, check if new name already exists
  if (name && name !== vehicleName) {
    db.get('SELECT id FROM vehicles WHERE name = ?', [name], (err, existing) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (existing) return res.status(400).json({ error: 'Vehicle name already exists' });
      
      updateVehicle();
    });
  } else {
    updateVehicle();
  }
  
  function updateVehicle() {
    db.run(
      `UPDATE vehicles SET name=?, make=?, model=?, year=?, vin=?, registration_number=?, registration_expiry_date=?, insurance_expiry_date=?, service_due_date=?, notes=?, application_type=?, type=? WHERE name=?`,
      [name, make, model, year, vin, registration_number, registration_expiry_date, insurance_expiry_date, service_due_date, notes, application_type, type, vehicleName],
      function (err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (this.changes === 0) return res.status(404).json({ error: 'Vehicle not found' });
        res.json({ success: true });
      }
    );
  }
});

// Delete a vehicle by name (requires farm access)
router.delete('/name/:name', authMiddleware, requireFarmAccess(), (req, res) => {
  const vehicleName = decodeURIComponent(req.params.name);
  db.run(
    `DELETE FROM vehicles WHERE name=?`,
    [vehicleName],
    function (err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (this.changes === 0) return res.status(404).json({ error: 'Vehicle not found' });
      res.json({ success: true });
    }
  );
});

// Legacy endpoints for backward compatibility
// Update a vehicle by ID (requires farm access)
router.put('/:id', authMiddleware, requireFarmAccess(), (req, res) => {
  const { name, make, model, year, vin, notes, application_type, type } = req.body;
  db.run(
    `UPDATE vehicles SET name=?, make=?, model=?, year=?, vin=?, notes=?, application_type=?, type=? WHERE id=?`,
    [name, make, model, year, vin, notes, application_type, type, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (this.changes === 0) return res.status(404).json({ error: 'Vehicle not found' });
      res.json({ success: true });
    }
  );
});

// Delete a vehicle by ID (requires farm access)
router.delete('/:id', authMiddleware, requireFarmAccess(), (req, res) => {
  db.run(
    `DELETE FROM vehicles WHERE id=?`,
    [req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (this.changes === 0) return res.status(404).json({ error: 'Vehicle not found' });
      res.json({ success: true });
    }
  );
});

module.exports = router; 