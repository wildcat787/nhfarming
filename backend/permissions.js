const db = require('./db');

// Middleware to check if user can modify an application
const canModifyApplication = (req, res, next) => {
  const applicationId = req.params.id;
  const userId = req.user.id;
  const userRole = req.user.role;

  // Admins can modify any application
  if (userRole === 'admin') {
    return next();
  }

  // Check if user is the creator of the application
  db.get(
    'SELECT created_by FROM applications WHERE id = ?',
    [applicationId],
    (err, application) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!application) {
        return res.status(404).json({ error: 'Application not found' });
      }

      if (application.created_by === userId) {
        return next();
      }

      return res.status(403).json({ 
        error: 'Permission denied. Only the original creator or admins can modify this application.' 
      });
    }
  );
};

// Middleware to check if user can modify a crop
const canModifyCrop = (req, res, next) => {
  const cropId = req.params.id;
  const userId = req.user.id;
  const userRole = req.user.role;

  // Admins can modify any crop
  if (userRole === 'admin') {
    return next();
  }

  // Check if user is the creator of the crop
  db.get(
    'SELECT user_id FROM crops WHERE id = ?',
    [cropId],
    (err, crop) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!crop) {
        return res.status(404).json({ error: 'Crop not found' });
      }

      if (crop.user_id === userId) {
        return next();
      }

      return res.status(403).json({ 
        error: 'Permission denied. Only the original creator or admins can modify this crop.' 
      });
    }
  );
};

// Middleware to check if user can modify a vehicle
const canModifyVehicle = (req, res, next) => {
  const vehicleId = req.params.id;
  const userId = req.user.id;
  const userRole = req.user.role;

  // Admins can modify any vehicle
  if (userRole === 'admin') {
    return next();
  }

  // Check if user is the creator of the vehicle
  db.get(
    'SELECT user_id FROM vehicles WHERE id = ?',
    [vehicleId],
    (err, vehicle) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }

      if (vehicle.user_id === userId) {
        return next();
      }

      return res.status(403).json({ 
        error: 'Permission denied. Only the original creator or admins can modify this vehicle.' 
      });
    }
  );
};

// Middleware to check if user can modify an input
const canModifyInput = (req, res, next) => {
  const inputId = req.params.id;
  const userId = req.user.id;
  const userRole = req.user.role;

  // Admins can modify any input
  if (userRole === 'admin') {
    return next();
  }

  // Check if user is the creator of the input
  db.get(
    'SELECT user_id FROM inputs WHERE id = ?',
    [inputId],
    (err, input) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!input) {
        return res.status(404).json({ error: 'Input not found' });
      }

      if (input.user_id === userId) {
        return next();
      }

      return res.status(403).json({ 
        error: 'Permission denied. Only the original creator or admins can modify this input.' 
      });
    }
  );
};

// Middleware to check if user can modify a field
const canModifyField = (req, res, next) => {
  const fieldId = req.params.id;
  const userId = req.user.id;
  const userRole = req.user.role;

  // Admins can modify any field
  if (userRole === 'admin') {
    return next();
  }

  // Check if user is the creator of the field
  db.get(
    'SELECT user_id FROM fields WHERE id = ?',
    [fieldId],
    (err, field) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!field) {
        return res.status(404).json({ error: 'Field not found' });
      }

      if (field.user_id === userId) {
        return next();
      }

      return res.status(403).json({ 
        error: 'Permission denied. Only the original creator or admins can modify this field.' 
      });
    }
  );
};

module.exports = {
  canModifyApplication,
  canModifyCrop,
  canModifyVehicle,
  canModifyInput,
  canModifyField
}; 