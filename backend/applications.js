const express = require('express');
const db = require('./db');
const { authMiddleware } = require('./auth');
const { filterByUserFarms, requireFarmAccess } = require('./permissions');

const router = express.Router();

// Get all applications (filtered by user's farm access)
router.get('/', authMiddleware, filterByUserFarms(), (req, res) => {
  let query = `
    SELECT 
      a.*,
      c.crop_type,
      c.field_id as crop_field_id,
      f.name as field_name,
      f.area as field_area,
      f.area_unit as field_area_unit,
      tm.name as tank_mixture_name,
      tm.description as tank_mixture_description,
      u.username as created_by_username
    FROM applications a
    LEFT JOIN crops c ON a.crop_id = c.id
    LEFT JOIN fields f ON (a.field_id = f.id OR c.field_id = f.id)
    LEFT JOIN tank_mixtures tm ON a.tank_mixture_id = tm.id
    LEFT JOIN users u ON a.user_id = u.id
  `;
  
  const params = [];
  
  // Filter by user's farms if not admin
  if (req.userFarms !== null) {
    if (req.userFarms.length === 0) {
      return res.json([]);
    }
    query += ` WHERE f.farm_id IN (${req.userFarms.map(() => '?').join(',')})`;
    params.push(...req.userFarms);
  }
  
  query += ` ORDER BY a.date DESC, a.start_time DESC`;
  
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// Get applications by vehicle ID with joined data
router.get('/vehicle/:vehicleId', authMiddleware, (req, res) => {
  const vehicleId = req.params.vehicleId;
  
  // Check if vehicleId is numeric (ID) or string (name)
  const isNumeric = !isNaN(vehicleId);
  
  let query, params;
  if (isNumeric) {
    // Query by vehicle ID
    query = `
      SELECT 
        a.*,
        c.crop_type,
        c.field_name,
        tm.name as tank_mixture_name,
        tm.description as tank_mixture_description
      FROM applications a
      LEFT JOIN crops c ON a.crop_id = c.id
      LEFT JOIN tank_mixtures tm ON a.tank_mixture_id = tm.id
      WHERE a.vehicle_id = ?
      ORDER BY a.date DESC, a.start_time DESC
    `;
    params = [vehicleId];
  } else {
    // Query by vehicle name
    const vehicleName = decodeURIComponent(vehicleId);
    query = `
      SELECT 
        a.*,
        c.crop_type,
        c.field_name,
        tm.name as tank_mixture_name,
        tm.description as tank_mixture_description
      FROM applications a
      LEFT JOIN crops c ON a.crop_id = c.id
      LEFT JOIN tank_mixtures tm ON a.tank_mixture_id = tm.id
      LEFT JOIN vehicles v ON a.vehicle_id = v.id
      WHERE v.name = ?
      ORDER BY a.date DESC, a.start_time DESC
    `;
    params = [vehicleName];
  }
  
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// Get applications by vehicle name (explicit endpoint)
router.get('/vehicle/name/:vehicleName', authMiddleware, (req, res) => {
  const vehicleName = decodeURIComponent(req.params.vehicleName);
  const query = `
    SELECT 
      a.*,
      c.crop_type,
      c.field_name,
      tm.name as tank_mixture_name,
      tm.description as tank_mixture_description
    FROM applications a
    LEFT JOIN crops c ON a.crop_id = c.id
    LEFT JOIN tank_mixtures tm ON a.tank_mixture_id = tm.id
    LEFT JOIN vehicles v ON a.vehicle_id = v.id
    WHERE v.name = ?
    ORDER BY a.date DESC, a.start_time DESC
  `;
  
  db.all(query, [vehicleName], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// Add a new application (requires farm access)
router.post('/', authMiddleware, requireFarmAccess(), (req, res) => {
  const { crop_id, field_id, tank_mixture_id, vehicle_id, date, start_time, finish_time, spray_rate, spray_rate_unit, weather_temp, weather_humidity, weather_wind, weather_rain, notes } = req.body;
  if (!tank_mixture_id) return res.status(400).json({ error: 'tank_mixture_id is required' });
  db.run(
    `INSERT INTO applications (user_id, crop_id, field_id, tank_mixture_id, vehicle_id, date, start_time, finish_time, spray_rate, spray_rate_unit, weather_temp, weather_humidity, weather_wind, weather_rain, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
    [req.user.id, crop_id, field_id, tank_mixture_id, vehicle_id, date, start_time, finish_time, spray_rate, spray_rate_unit, weather_temp, weather_humidity, weather_wind, weather_rain, notes],
    function (err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ id: this.lastID, crop_id, tank_mixture_id, vehicle_id, date, start_time, finish_time, spray_rate, spray_rate_unit, weather_temp, weather_humidity, weather_wind, weather_rain, notes });
    }
  );
});

// Update an application (requires farm access)
router.put('/:id', authMiddleware, requireFarmAccess(), (req, res) => {
  const { crop_id, field_id, tank_mixture_id, vehicle_id, date, start_time, finish_time, spray_rate, spray_rate_unit, weather_temp, weather_humidity, weather_wind, weather_rain, notes } = req.body;
  db.run(
    `UPDATE applications SET crop_id=?, field_id=?, tank_mixture_id=?, vehicle_id=?, date=?, start_time=?, finish_time=?, spray_rate=?, spray_rate_unit=?, weather_temp=?, weather_humidity=?, weather_wind=?, weather_rain=?, notes=? WHERE id=?`,
    [crop_id, field_id, tank_mixture_id, vehicle_id, date, start_time, finish_time, spray_rate, spray_rate_unit, weather_temp, weather_humidity, weather_wind, weather_rain, notes, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (this.changes === 0) return res.status(404).json({ error: 'Application not found' });
      res.json({ success: true });
    }
  );
});

// Delete an application (requires farm access)
router.delete('/:id', authMiddleware, requireFarmAccess(), (req, res) => {
  db.run(
    `DELETE FROM applications WHERE id=?`,
    [req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (this.changes === 0) return res.status(404).json({ error: 'Application not found' });
      res.json({ success: true });
    }
  );
});

module.exports = router; 