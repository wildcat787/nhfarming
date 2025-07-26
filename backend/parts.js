const express = require('express');
const db = require('./db');
const { authMiddleware } = require('./auth');

const router = express.Router();

// Get all parts (shared across all users)
router.get('/', authMiddleware, (req, res) => {
  db.all('SELECT * FROM parts ORDER BY name', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// Add a new part (any authenticated user can add)
router.post('/', authMiddleware, (req, res) => {
  const { maintenance_id, name, part_number, cost, notes } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  db.run(
    `INSERT INTO parts (user_id, maintenance_id, name, part_number, cost, notes) VALUES (?, ?, ?, ?, ?, ?)`,
    [req.user.id, maintenance_id, name, part_number, cost, notes],
    function (err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ id: this.lastID, maintenance_id, name, part_number, cost, notes });
    }
  );
});

// Update a part (any authenticated user can update)
router.put('/:id', authMiddleware, (req, res) => {
  const { maintenance_id, name, part_number, cost, notes } = req.body;
  db.run(
    `UPDATE parts SET maintenance_id=?, name=?, part_number=?, cost=?, notes=? WHERE id=?`,
    [maintenance_id, name, part_number, cost, notes, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (this.changes === 0) return res.status(404).json({ error: 'Part not found' });
      res.json({ success: true });
    }
  );
});

// Delete a part (any authenticated user can delete)
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