const express = require('express');
const db = require('./db');
const { authMiddleware } = require('./auth');

const router = express.Router();

// Get all parts for a maintenance record
router.get('/:maintenance_id', authMiddleware, (req, res) => {
  db.all('SELECT * FROM parts WHERE maintenance_id = ?', [req.params.maintenance_id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// Add a new part
router.post('/', authMiddleware, (req, res) => {
  const { maintenance_id, name, quantity, cost } = req.body;
  if (!maintenance_id || !name) return res.status(400).json({ error: 'maintenance_id and name are required' });
  db.run(
    `INSERT INTO parts (maintenance_id, name, quantity, cost) VALUES (?, ?, ?, ?)`,
    [maintenance_id, name, quantity, cost],
    function (err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ id: this.lastID, maintenance_id, name, quantity, cost });
    }
  );
});

// Update a part
router.put('/:id', authMiddleware, (req, res) => {
  const { name, quantity, cost } = req.body;
  db.run(
    `UPDATE parts SET name=?, quantity=?, cost=? WHERE id=?`,
    [name, quantity, cost, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (this.changes === 0) return res.status(404).json({ error: 'Part not found' });
      res.json({ success: true });
    }
  );
});

// Delete a part
router.delete('/:id', authMiddleware, (req, res) => {
  db.run(
    `DELETE FROM parts WHERE id=?`,
    [req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (this.changes === 0) return res.status(404).json({ error: 'Part not found' });
      res.json({ success: true });
    }
  );
});

module.exports = router; 