const express = require('express');
const { db } = require('./db');
const { authMiddleware } = require('./auth');
const { filterByUserFarms, requireFarmAccess } = require('./permissions');

const router = express.Router();

// Get all inputs (filtered by user's farm access)
router.get('/', authMiddleware, filterByUserFarms(), (req, res) => {
  let query = 'SELECT * FROM inputs';
  const params = [];
  
  // Filter by user's farms if not admin
  if (req.userFarms !== null) {
    if (req.userFarms.length === 0) {
      return res.json([]);
    }
    query += ` WHERE farm_id IN (${req.userFarms.map(() => '?').join(',')})`;
    params.push(...req.userFarms);
  }
  
  query += ' ORDER BY name';
  
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// Add a new input (requires farm access)
router.post('/', authMiddleware, requireFarmAccess(), (req, res) => {
  const { name, type, unit, notes, farm_id } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  if (!farm_id) return res.status(400).json({ error: 'farm_id is required' });
  
  db.run(
    `INSERT INTO inputs (user_id, name, type, unit, notes, farm_id) VALUES (?, ?, ?, ?, ?, ?)`,
    [req.user.id, name, type, unit, notes, farm_id],
    function (err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ id: this.lastID, name, type, unit, notes, farm_id });
    }
  );
});

// Update an input (requires farm access)
router.put('/:id', authMiddleware, requireFarmAccess(), (req, res) => {
  const { name, type, unit, notes } = req.body;
  db.run(
    `UPDATE inputs SET name=?, type=?, unit=?, notes=? WHERE id=?`,
    [name, type, unit, notes, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (this.changes === 0) return res.status(404).json({ error: 'Input not found' });
      res.json({ success: true });
    }
  );
});

// Delete an input (requires farm access)
router.delete('/:id', authMiddleware, requireFarmAccess(), (req, res) => {
  db.run(
    `DELETE FROM inputs WHERE id=?`,
    [req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (this.changes === 0) return res.status(404).json({ error: 'Input not found' });
      res.json({ success: true });
    }
  );
});

module.exports = router; 