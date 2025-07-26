const express = require('express');
const db = require('./db');
const { authMiddleware } = require('./auth');

const router = express.Router();

// Get all vehicles for the logged-in user
router.get('/', authMiddleware, (req, res) => {
  db.all('SELECT * FROM vehicles WHERE user_id = ?', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// Get vehicle by name
router.get('/name/:name', authMiddleware, (req, res) => {
  const vehicleName = decodeURIComponent(req.params.name);
  db.get('SELECT * FROM vehicles WHERE name = ? AND user_id = ?', [vehicleName, req.user.id], (err, vehicle) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(vehicle);
  });
});

// Add a new vehicle
router.post('/', authMiddleware, (req, res) => {
  const { name, make, model, year, vin, notes, application_type, type } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  
  // Check if vehicle name already exists for this user
  db.get('SELECT id FROM vehicles WHERE name = ? AND user_id = ?', [name, req.user.id], (err, existing) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (existing) return res.status(400).json({ error: 'Vehicle name already exists' });
    
    db.run(
      `INSERT INTO vehicles (user_id, name, make, model, year, vin, notes, application_type, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
      [req.user.id, name, make, model, year, vin, notes, application_type, type],
      function (err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ id: this.lastID, name, make, model, year, vin, notes, application_type, type });
      }
    );
  });
});

// Update a vehicle by name
router.put('/name/:name', authMiddleware, (req, res) => {
  const vehicleName = decodeURIComponent(req.params.name);
  const { name, make, model, year, vin, notes, application_type, type } = req.body;
  
  // If name is being changed, check if new name already exists
  if (name && name !== vehicleName) {
    db.get('SELECT id FROM vehicles WHERE name = ? AND user_id = ?', [name, req.user.id], (err, existing) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (existing) return res.status(400).json({ error: 'Vehicle name already exists' });
      
      updateVehicle();
    });
  } else {
    updateVehicle();
  }
  
  function updateVehicle() {
    db.run(
      `UPDATE vehicles SET name=?, make=?, model=?, year=?, vin=?, notes=?, application_type=?, type=? WHERE name=? AND user_id=?`,
      [name, make, model, year, vin, notes, application_type, type, vehicleName, req.user.id],
      function (err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (this.changes === 0) return res.status(404).json({ error: 'Vehicle not found' });
        res.json({ success: true });
      }
    );
  }
});

// Delete a vehicle by name
router.delete('/name/:name', authMiddleware, (req, res) => {
  const vehicleName = decodeURIComponent(req.params.name);
  db.run(
    `DELETE FROM vehicles WHERE name=? AND user_id=?`,
    [vehicleName, req.user.id],
    function (err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (this.changes === 0) return res.status(404).json({ error: 'Vehicle not found' });
      res.json({ success: true });
    }
  );
});

// Legacy endpoints for backward compatibility
// Update a vehicle by ID
router.put('/:id', authMiddleware, (req, res) => {
  const { name, make, model, year, vin, notes, application_type, type } = req.body;
  db.run(
    `UPDATE vehicles SET name=?, make=?, model=?, year=?, vin=?, notes=?, application_type=?, type=? WHERE id=? AND user_id=?`,
    [name, make, model, year, vin, notes, application_type, type, req.params.id, req.user.id],
    function (err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (this.changes === 0) return res.status(404).json({ error: 'Vehicle not found' });
      res.json({ success: true });
    }
  );
});

// Delete a vehicle by ID
router.delete('/:id', authMiddleware, (req, res) => {
  db.run(
    `DELETE FROM vehicles WHERE id=? AND user_id=?`,
    [req.params.id, req.user.id],
    function (err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (this.changes === 0) return res.status(404).json({ error: 'Vehicle not found' });
      res.json({ success: true });
    }
  );
});

module.exports = router; 