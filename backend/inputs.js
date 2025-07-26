const express = require('express');
const db = require('./db');
const { authMiddleware } = require('./auth');

const router = express.Router();

// Get all inputs for the logged-in user
router.get('/', authMiddleware, (req, res) => {
  db.all('SELECT * FROM inputs WHERE user_id = ?', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// Add a new input
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

// Update an input
router.put('/:id', authMiddleware, (req, res) => {
  const { name, type, unit, notes } = req.body;
  db.run(
    `UPDATE inputs SET name=?, type=?, unit=?, notes=? WHERE id=? AND user_id=?`,
    [name, type, unit, notes, req.params.id, req.user.id],
    function (err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (this.changes === 0) return res.status(404).json({ error: 'Input not found' });
      res.json({ success: true });
    }
  );
});

// Delete an input
router.delete('/:id', authMiddleware, (req, res) => {
  db.run(
    `DELETE FROM inputs WHERE id=? AND user_id=?`,
    [req.params.id, req.user.id],
    function (err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (this.changes === 0) return res.status(404).json({ error: 'Input not found' });
      res.json({ success: true });
    }
  );
});

module.exports = router; 