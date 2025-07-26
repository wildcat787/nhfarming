const express = require('express');
const db = require('./db');
const { authMiddleware } = require('./auth');

const router = express.Router();

// Get all inputs (shared across all users)
router.get('/', authMiddleware, (req, res) => {
  db.all('SELECT * FROM inputs ORDER BY name', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// Add a new input (any authenticated user can add)
router.post('/', authMiddleware, (req, res) => {
  const { name, type, unit, notes } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  db.run(
    `INSERT INTO inputs (user_id, name, type, unit, notes) VALUES (?, ?, ?, ?, ?)`,
    [req.user.id, name, type, unit, notes],
    function (err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ id: this.lastID, name, type, unit, notes });
    }
  );
});

// Update an input (any authenticated user can update)
router.put('/:id', authMiddleware, (req, res) => {
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

// Delete an input (any authenticated user can delete)
router.delete('/:id', authMiddleware, (req, res) => {
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