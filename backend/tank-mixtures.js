const express = require('express');
const db = require('./db');
const { authMiddleware } = require('./auth');

const router = express.Router();

// Get all tank mixtures for the user
router.get('/', authMiddleware, (req, res) => {
  const query = `
    SELECT 
      tm.*,
      COUNT(tmi.id) as ingredient_count
    FROM tank_mixtures tm
    LEFT JOIN tank_mixture_ingredients tmi ON tm.id = tmi.tank_mixture_id
    WHERE tm.user_id = ?
    GROUP BY tm.id
    ORDER BY tm.created_at DESC
  `;
  
  db.all(query, [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// Get a specific tank mixture with its ingredients
router.get('/:id', authMiddleware, (req, res) => {
  const tankMixtureId = req.params.id;
  
  // Get tank mixture details
  db.get(
    'SELECT * FROM tank_mixtures WHERE id = ? AND user_id = ?',
    [tankMixtureId, req.user.id],
    (err, tankMixture) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (!tankMixture) return res.status(404).json({ error: 'Tank mixture not found' });
      
      // Get ingredients for this tank mixture
      const ingredientsQuery = `
        SELECT 
          tmi.*,
          i.name as input_name,
          i.type as input_type
        FROM tank_mixture_ingredients tmi
        LEFT JOIN inputs i ON tmi.input_id = i.id
        WHERE tmi.tank_mixture_id = ?
        ORDER BY tmi.order_index, tmi.id
      `;
      
      db.all(ingredientsQuery, [tankMixtureId], (err, ingredients) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        
        res.json({
          ...tankMixture,
          ingredients
        });
      });
    }
  );
});

// Create a new tank mixture
router.post('/', authMiddleware, (req, res) => {
  const { name, description, total_volume, volume_unit, notes, ingredients, target_area_ha } = req.body;
  
  if (!name) return res.status(400).json({ error: 'Name is required' });
  
  db.run(
    `INSERT INTO tank_mixtures (user_id, name, description, total_volume, volume_unit, notes) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [req.user.id, name, description, total_volume, volume_unit, notes],
    function (err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      
      const tankMixtureId = this.lastID;
      
      // Insert ingredients if provided
      if (ingredients && ingredients.length > 0) {
        const ingredientValues = ingredients.map((ingredient, index) => 
          [tankMixtureId, ingredient.input_id, ingredient.amount, ingredient.unit, ingredient.form, ingredient.measurement_type || 'rate_per_ha', index, ingredient.notes]
        );
        
        const placeholders = ingredientValues.map(() => '(?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
        const flatValues = ingredientValues.flat();
        
        db.run(
          `INSERT INTO tank_mixture_ingredients (tank_mixture_id, input_id, amount, unit, form, measurement_type, order_index, notes) 
           VALUES ${placeholders}`,
          flatValues,
          function (err) {
            if (err) {
              console.error('Error inserting ingredients:', err);
              // Continue anyway, the tank mixture was created
            }
            res.json({ 
              id: tankMixtureId, 
              name, 
              description, 
              total_volume, 
              volume_unit, 
              notes,
              ingredients 
            });
          }
        );
      } else {
        res.json({ 
          id: tankMixtureId, 
          name, 
          description, 
          total_volume, 
          volume_unit, 
          notes 
        });
      }
    }
  );
});

// Update a tank mixture
router.put('/:id', authMiddleware, (req, res) => {
  const tankMixtureId = req.params.id;
  const { name, description, total_volume, volume_unit, notes, ingredients, target_area_ha } = req.body;
  
  if (!name) return res.status(400).json({ error: 'Name is required' });
  
  // First, check if the tank mixture belongs to the user
  db.get(
    'SELECT id FROM tank_mixtures WHERE id = ? AND user_id = ?',
    [tankMixtureId, req.user.id],
    (err, tankMixture) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (!tankMixture) return res.status(404).json({ error: 'Tank mixture not found' });
      
      // Update tank mixture
      db.run(
        `UPDATE tank_mixtures 
         SET name = ?, description = ?, total_volume = ?, volume_unit = ?, notes = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [name, description, total_volume, volume_unit, notes, tankMixtureId],
        function (err) {
          if (err) return res.status(500).json({ error: 'Database error' });
          
          // Delete existing ingredients
          db.run(
            'DELETE FROM tank_mixture_ingredients WHERE tank_mixture_id = ?',
            [tankMixtureId],
            function (err) {
              if (err) return res.status(500).json({ error: 'Database error' });
              
              // Insert new ingredients if provided
              if (ingredients && ingredients.length > 0) {
                const ingredientValues = ingredients.map((ingredient, index) => 
                  [tankMixtureId, ingredient.input_id, ingredient.amount, ingredient.unit, ingredient.form, ingredient.measurement_type || 'rate_per_ha', index, ingredient.notes]
                );
                
                const placeholders = ingredientValues.map(() => '(?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
                const flatValues = ingredientValues.flat();
                
                db.run(
                  `INSERT INTO tank_mixture_ingredients (tank_mixture_id, input_id, amount, unit, form, measurement_type, order_index, notes) 
                   VALUES ${placeholders}`,
                  flatValues,
                  function (err) {
                    if (err) {
                      console.error('Error inserting ingredients:', err);
                    }
                    res.json({ success: true });
                  }
                );
              } else {
                res.json({ success: true });
              }
            }
          );
        }
      );
    }
  );
});

// Delete a tank mixture
router.delete('/:id', authMiddleware, (req, res) => {
  const tankMixtureId = req.params.id;
  
  // Check if the tank mixture belongs to the user
  db.get(
    'SELECT id FROM tank_mixtures WHERE id = ? AND user_id = ?',
    [tankMixtureId, req.user.id],
    (err, tankMixture) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (!tankMixture) return res.status(404).json({ error: 'Tank mixture not found' });
      
      // Delete ingredients first (due to foreign key constraint)
      db.run(
        'DELETE FROM tank_mixture_ingredients WHERE tank_mixture_id = ?',
        [tankMixtureId],
        function (err) {
          if (err) return res.status(500).json({ error: 'Database error' });
          
          // Delete tank mixture
          db.run(
            'DELETE FROM tank_mixtures WHERE id = ?',
            [tankMixtureId],
            function (err) {
              if (err) return res.status(500).json({ error: 'Database error' });
              res.json({ success: true });
            }
          );
        }
      );
    }
  );
});

module.exports = router; 