const express = require('express');
const db = require('./db');
const { authMiddleware } = require('./auth');

const router = express.Router();

// Get all crops (shared across all users)
router.get('/', authMiddleware, (req, res) => {
  db.all('SELECT * FROM crops ORDER BY crop_type, field_name', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// Add a new crop (any authenticated user can add)
router.post('/', authMiddleware, (req, res) => {
  const { crop_type, field_name, acres, notes } = req.body;
  if (!crop_type) return res.status(400).json({ error: 'crop_type is required' });
  db.run(
    `INSERT INTO crops (user_id, crop_type, field_name, acres, notes) VALUES (?, ?, ?, ?, ?)`,
    [req.user.id, crop_type, field_name, acres, notes],
    function (err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ id: this.lastID, crop_type, field_name, acres, notes });
    }
  );
});

// Update a crop (any authenticated user can update)
router.put('/:id', authMiddleware, (req, res) => {
  const { crop_type, field_name, acres, notes } = req.body;
  db.run(
    `UPDATE crops SET crop_type=?, field_name=?, acres=?, notes=? WHERE id=?`,
    [crop_type, field_name, acres, notes, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (this.changes === 0) return res.status(404).json({ error: 'Crop not found' });
      res.json({ success: true });
    }
  );
});

// Delete a crop (any authenticated user can delete)
router.delete('/:id', authMiddleware, (req, res) => {
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