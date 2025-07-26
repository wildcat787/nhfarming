const express = require('express');
const db = require('./db');
const { authMiddleware } = require('./auth');

const router = express.Router();

// Get all crops for the logged-in user
router.get('/', authMiddleware, (req, res) => {
  db.all('SELECT * FROM crops WHERE user_id = ?', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// Add a new crop
router.post('/', authMiddleware, (req, res) => {
  const { crop_type, field_name, planting_date, harvest_date, notes } = req.body;
  if (!crop_type) return res.status(400).json({ error: 'crop_type is required' });
  db.run(
    `INSERT INTO crops (user_id, crop_type, field_name, planting_date, harvest_date, notes) VALUES (?, ?, ?, ?, ?, ?)`,
    [req.user.id, crop_type, field_name, planting_date, harvest_date, notes],
    function (err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ id: this.lastID, crop_type, field_name, planting_date, harvest_date, notes });
    }
  );
});

// Update a crop
router.put('/:id', authMiddleware, (req, res) => {
  const { crop_type, field_name, planting_date, harvest_date, notes } = req.body;
  db.run(
    `UPDATE crops SET crop_type=?, field_name=?, planting_date=?, harvest_date=?, notes=? WHERE id=? AND user_id=?`,
    [crop_type, field_name, planting_date, harvest_date, notes, req.params.id, req.user.id],
    function (err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (this.changes === 0) return res.status(404).json({ error: 'Crop not found' });
      res.json({ success: true });
    }
  );
});

// Delete a crop
router.delete('/:id', authMiddleware, (req, res) => {
  db.run(
    `DELETE FROM crops WHERE id=? AND user_id=?`,
    [req.params.id, req.user.id],
    function (err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (this.changes === 0) return res.status(404).json({ error: 'Crop not found' });
      res.json({ success: true });
    }
  );
});

module.exports = router; 