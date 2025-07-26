const express = require('express');
const db = require('./db');
const { authMiddleware } = require('./auth');

const router = express.Router();

// Get all maintenance records for the logged-in user
router.get('/', authMiddleware, (req, res) => {
  db.all('SELECT * FROM maintenance WHERE user_id = ?', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// Get maintenance records by vehicle ID or name
router.get('/:vehicleId', authMiddleware, (req, res) => {
  const vehicleId = req.params.vehicleId;
  
  // Check if vehicleId is numeric (ID) or string (name)
  const isNumeric = !isNaN(vehicleId);
  
  let query, params;
  if (isNumeric) {
    // Query by vehicle ID
    query = `
      SELECT m.*, v.name as vehicle_name, v.make, v.model
      FROM maintenance m
      LEFT JOIN vehicles v ON m.vehicle_id = v.id
      WHERE m.vehicle_id = ? AND m.user_id = ?
      ORDER BY m.date DESC
    `;
    params = [vehicleId, req.user.id];
  } else {
    // Query by vehicle name
    const vehicleName = decodeURIComponent(vehicleId);
    query = `
      SELECT m.*, v.name as vehicle_name, v.make, v.model
      FROM maintenance m
      LEFT JOIN vehicles v ON m.vehicle_id = v.id
      WHERE v.name = ? AND m.user_id = ?
      ORDER BY m.date DESC
    `;
    params = [vehicleName, req.user.id];
  }
  
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// Get maintenance records by vehicle name (explicit endpoint)
router.get('/name/:vehicleName', authMiddleware, (req, res) => {
  const vehicleName = decodeURIComponent(req.params.vehicleName);
  const query = `
    SELECT m.*, v.name as vehicle_name, v.make, v.model
    FROM maintenance m
    LEFT JOIN vehicles v ON m.vehicle_id = v.id
    WHERE v.name = ? AND m.user_id = ?
    ORDER BY m.date DESC
  `;
  
  db.all(query, [vehicleName, req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// Add a new maintenance record
router.post('/', authMiddleware, (req, res) => {
  const { vehicle_id, date, description, cost, notes } = req.body;
  if (!vehicle_id) return res.status(400).json({ error: 'vehicle_id is required' });
  db.run(
    `INSERT INTO maintenance (user_id, vehicle_id, date, description, cost, notes) VALUES (?, ?, ?, ?, ?, ?)`,
    [req.user.id, vehicle_id, date, description, cost, notes],
    function (err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ id: this.lastID, vehicle_id, date, description, cost, notes });
    }
  );
});

// Update a maintenance record
router.put('/:id', authMiddleware, (req, res) => {
  const { vehicle_id, date, description, cost, notes } = req.body;
  db.run(
    `UPDATE maintenance SET vehicle_id=?, date=?, description=?, cost=?, notes=? WHERE id=? AND user_id=?`,
    [vehicle_id, date, description, cost, notes, req.params.id, req.user.id],
    function (err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (this.changes === 0) return res.status(404).json({ error: 'Maintenance record not found' });
      res.json({ success: true });
    }
  );
});

// Delete a maintenance record
router.delete('/:id', authMiddleware, (req, res) => {
  db.run(
    `DELETE FROM maintenance WHERE id=? AND user_id=?`,
    [req.params.id, req.user.id],
    function (err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (this.changes === 0) return res.status(404).json({ error: 'Maintenance record not found' });
      res.json({ success: true });
    }
  );
});

module.exports = router; 