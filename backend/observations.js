const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { db, safeQuery, safeRun, safeGet } = require('./database-utils');
const { authMiddleware } = require('./auth');
const { filterByUserFarms, requireFarmAccess } = require('./permissions');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads', 'observations');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'observation-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files per observation
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Get all observations (filtered by user's farm access)
router.get('/', authMiddleware, filterByUserFarms(), async (req, res) => {
  try {
    let query = `
      SELECT 
        o.*,
        c.crop_type,
        c.field_name as crop_field_name,
        f.name as field_name,
        f.area as field_area,
        f.area_unit as field_area_unit,
        farm.name as farm_name,
        u.username as created_by_username
      FROM observations o
      LEFT JOIN crops c ON o.crop_id = c.id
      LEFT JOIN fields f ON o.field_id = f.id
      LEFT JOIN farms farm ON f.farm_id = farm.id
      LEFT JOIN users u ON o.user_id = u.id
    `;
    
    const params = [];
    
    // Filter by user's farms if not admin
    if (req.userFarms !== null) {
      if (req.userFarms.length === 0) {
        return res.json([]);
      }
      query += ' WHERE f.farm_id IN (' + req.userFarms.map(() => '?').join(',') + ')';
      params.push(...req.userFarms);
    }
    
    query += ' ORDER BY o.created_at DESC';
    
    const observations = await safeQuery(query, params);
    
    // Get photos for each observation
    for (let observation of observations) {
      const photos = await safeQuery(
        'SELECT * FROM observation_photos WHERE observation_id = ? ORDER BY created_at',
        [observation.id]
      );
      observation.photos = photos;
    }
    
    res.json(observations);
  } catch (error) {
    console.error('Error fetching observations:', error);
    res.status(500).json({ error: 'Failed to fetch observations' });
  }
});

// Get observation by ID
router.get('/:id', authMiddleware, requireFarmAccess(), async (req, res) => {
  try {
    const observationId = req.params.id;
    
    const observation = await safeGet(`
      SELECT 
        o.*,
        c.crop_type,
        c.field_name as crop_field_name,
        f.name as field_name,
        f.area as field_area,
        f.area_unit as field_area_unit,
        farm.name as farm_name,
        u.username as created_by_username
      FROM observations o
      LEFT JOIN crops c ON o.crop_id = c.id
      LEFT JOIN fields f ON o.field_id = f.id
      LEFT JOIN farms farm ON f.farm_id = farm.id
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `, [observationId]);
    
    if (!observation) {
      return res.status(404).json({ error: 'Observation not found' });
    }
    
    // Get photos for the observation
    const photos = await safeQuery(
      'SELECT * FROM observation_photos WHERE observation_id = ? ORDER BY created_at',
      [observationId]
    );
    observation.photos = photos;
    
    res.json(observation);
  } catch (error) {
    console.error('Error fetching observation:', error);
    res.status(500).json({ error: 'Failed to fetch observation' });
  }
});

// Create new observation
router.post('/', authMiddleware, requireFarmAccess(), upload.array('photos', 5), async (req, res) => {
  try {
    const {
      title,
      description,
      damage_type,
      severity,
      crop_id,
      field_id,
      season_year,
      location_notes,
      estimated_loss,
      treatment_applied,
      weather_conditions,
      date_observed
    } = req.body;
    
    if (!title || !description || !damage_type) {
      return res.status(400).json({ error: 'Title, description, and damage type are required' });
    }
    
    // Validate crop_id if provided
    if (crop_id) {
      const crop = await safeGet('SELECT id FROM crops WHERE id = ?', [crop_id]);
      if (!crop) {
        return res.status(400).json({ error: 'Invalid crop ID' });
      }
    }
    
    // Validate field_id if provided
    if (field_id) {
      const field = await safeGet('SELECT id FROM fields WHERE id = ?', [field_id]);
      if (!field) {
        return res.status(400).json({ error: 'Invalid field ID' });
      }
    }
    
    // Insert observation
    const result = await safeRun(`
      INSERT INTO observations (
        user_id, title, description, damage_type, severity, crop_id, field_id,
        season_year, location_notes, estimated_loss, treatment_applied,
        weather_conditions, date_observed, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [
      req.user.id, title, description, damage_type, severity, crop_id, field_id,
      season_year, location_notes, estimated_loss, treatment_applied,
      weather_conditions, date_observed
    ]);
    
    const observationId = result.lastID;
    
    // Handle photo uploads
    const uploadedPhotos = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const photoResult = await safeRun(`
          INSERT INTO observation_photos (
            observation_id, filename, original_name, file_path, file_size, mime_type, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `, [
          observationId,
          file.filename,
          file.originalname,
          file.path,
          file.size,
          file.mimetype
        ]);
        
        uploadedPhotos.push({
          id: photoResult.lastID,
          filename: file.filename,
          original_name: file.originalname,
          file_path: file.path,
          file_size: file.size,
          mime_type: file.mimetype
        });
      }
    }
    
    // Get the created observation with photos
    const createdObservation = await safeGet(`
      SELECT 
        o.*,
        c.crop_type,
        c.field_name as crop_field_name,
        f.name as field_name,
        farm.name as farm_name,
        u.username as created_by_username
      FROM observations o
      LEFT JOIN crops c ON o.crop_id = c.id
      LEFT JOIN fields f ON o.field_id = f.id
      LEFT JOIN farms farm ON f.farm_id = farm.id
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `, [observationId]);
    
    createdObservation.photos = uploadedPhotos;
    
    res.status(201).json(createdObservation);
  } catch (error) {
    console.error('Error creating observation:', error);
    res.status(500).json({ error: 'Failed to create observation' });
  }
});

// Update observation
router.put('/:id', authMiddleware, requireFarmAccess(), upload.array('photos', 5), async (req, res) => {
  try {
    const observationId = req.params.id;
    
    // Check if observation exists and user has access
    const existingObservation = await safeGet('SELECT user_id FROM observations WHERE id = ?', [observationId]);
    if (!existingObservation) {
      return res.status(404).json({ error: 'Observation not found' });
    }
    
    if (existingObservation.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this observation' });
    }
    
    const {
      title,
      description,
      damage_type,
      severity,
      crop_id,
      field_id,
      season_year,
      location_notes,
      estimated_loss,
      treatment_applied,
      weather_conditions,
      date_observed
    } = req.body;
    
    // Update observation
    await safeRun(`
      UPDATE observations SET
        title = ?, description = ?, damage_type = ?, severity = ?, crop_id = ?,
        field_id = ?, season_year = ?, location_notes = ?, estimated_loss = ?,
        treatment_applied = ?, weather_conditions = ?, date_observed = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      title, description, damage_type, severity, crop_id, field_id,
      season_year, location_notes, estimated_loss, treatment_applied,
      weather_conditions, date_observed, observationId
    ]);
    
    // Handle new photo uploads
    const uploadedPhotos = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const photoResult = await safeRun(`
          INSERT INTO observation_photos (
            observation_id, filename, original_name, file_path, file_size, mime_type, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `, [
          observationId,
          file.filename,
          file.originalname,
          file.path,
          file.size,
          file.mimetype
        ]);
        
        uploadedPhotos.push({
          id: photoResult.lastID,
          filename: file.filename,
          original_name: file.originalname,
          file_path: file.path,
          file_size: file.size,
          mime_type: file.mimetype
        });
      }
    }
    
    // Get updated observation
    const updatedObservation = await safeGet(`
      SELECT 
        o.*,
        c.crop_type,
        c.field_name as crop_field_name,
        f.name as field_name,
        farm.name as farm_name,
        u.username as created_by_username
      FROM observations o
      LEFT JOIN crops c ON o.crop_id = c.id
      LEFT JOIN fields f ON o.field_id = f.id
      LEFT JOIN farms farm ON f.farm_id = farm.id
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `, [observationId]);
    
    // Get all photos for the observation
    const photos = await safeQuery(
      'SELECT * FROM observation_photos WHERE observation_id = ? ORDER BY created_at',
      [observationId]
    );
    updatedObservation.photos = photos;
    
    res.json(updatedObservation);
  } catch (error) {
    console.error('Error updating observation:', error);
    res.status(500).json({ error: 'Failed to update observation' });
  }
});

// Delete observation
router.delete('/:id', authMiddleware, requireFarmAccess(), async (req, res) => {
  try {
    const observationId = req.params.id;
    
    // Check if observation exists and user has access
    const existingObservation = await safeGet('SELECT user_id FROM observations WHERE id = ?', [observationId]);
    if (!existingObservation) {
      return res.status(404).json({ error: 'Observation not found' });
    }
    
    if (existingObservation.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this observation' });
    }
    
    // Get photos to delete files
    const photos = await safeQuery('SELECT file_path FROM observation_photos WHERE observation_id = ?', [observationId]);
    
    // Delete photo files
    for (const photo of photos) {
      if (fs.existsSync(photo.file_path)) {
        fs.unlinkSync(photo.file_path);
      }
    }
    
    // Delete photos from database
    await safeRun('DELETE FROM observation_photos WHERE observation_id = ?', [observationId]);
    
    // Delete observation
    await safeRun('DELETE FROM observations WHERE id = ?', [observationId]);
    
    res.json({ message: 'Observation deleted successfully' });
  } catch (error) {
    console.error('Error deleting observation:', error);
    res.status(500).json({ error: 'Failed to delete observation' });
  }
});

// Delete photo
router.delete('/:observationId/photos/:photoId', authMiddleware, requireFarmAccess(), async (req, res) => {
  try {
    const { observationId, photoId } = req.params;
    
    // Check if observation exists and user has access
    const existingObservation = await safeGet('SELECT user_id FROM observations WHERE id = ?', [observationId]);
    if (!existingObservation) {
      return res.status(404).json({ error: 'Observation not found' });
    }
    
    if (existingObservation.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this photo' });
    }
    
    // Get photo details
    const photo = await safeGet('SELECT file_path FROM observation_photos WHERE id = ? AND observation_id = ?', [photoId, observationId]);
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    
    // Delete file
    if (fs.existsSync(photo.file_path)) {
      fs.unlinkSync(photo.file_path);
    }
    
    // Delete from database
    await safeRun('DELETE FROM observation_photos WHERE id = ?', [photoId]);
    
    res.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
});

// Get observations statistics
router.get('/stats/overview', authMiddleware, filterByUserFarms(), async (req, res) => {
  try {
    let whereClause = '';
    const params = [];
    
    // Filter by user's farms if not admin
    if (req.userFarms !== null) {
      if (req.userFarms.length === 0) {
        return res.json({
          totalObservations: 0,
          damageTypes: {},
          severityBreakdown: {},
          recentObservations: 0,
          totalLoss: 0
        });
      }
      whereClause = 'WHERE f.farm_id IN (' + req.userFarms.map(() => '?').join(',') + ')';
      params.push(...req.userFarms);
    }
    
    // Total observations
    const totalObservations = await safeGet(`
      SELECT COUNT(*) as count 
      FROM observations o
      LEFT JOIN fields f ON o.field_id = f.id
      ${whereClause}
    `, params);
    
    // Damage types breakdown
    const damageTypes = await safeQuery(`
      SELECT damage_type, COUNT(*) as count 
      FROM observations o
      LEFT JOIN fields f ON o.field_id = f.id
      ${whereClause}
      GROUP BY damage_type
    `, params);
    
    // Severity breakdown
    const severityBreakdown = await safeQuery(`
      SELECT severity, COUNT(*) as count 
      FROM observations o
      LEFT JOIN fields f ON o.field_id = f.id
      ${whereClause}
      GROUP BY severity
    `, params);
    
    // Recent observations (last 30 days)
    const recentObservations = await safeGet(`
      SELECT COUNT(*) as count 
      FROM observations o
      LEFT JOIN fields f ON o.field_id = f.id
      ${whereClause} ${whereClause ? 'AND' : 'WHERE'} o.created_at >= datetime('now', '-30 days')
    `, params);
    
    // Total estimated loss
    const totalLoss = await safeGet(`
      SELECT COALESCE(SUM(estimated_loss), 0) as total 
      FROM observations o
      LEFT JOIN fields f ON o.field_id = f.id
      ${whereClause}
    `, params);
    
    res.json({
      totalObservations: totalObservations.count,
      damageTypes: damageTypes.reduce((acc, item) => {
        acc[item.damage_type] = item.count;
        return acc;
      }, {}),
      severityBreakdown: severityBreakdown.reduce((acc, item) => {
        acc[item.severity] = item.count;
        return acc;
      }, {}),
      recentObservations: recentObservations.count,
      totalLoss: totalLoss.total
    });
  } catch (error) {
    console.error('Error fetching observations statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;
