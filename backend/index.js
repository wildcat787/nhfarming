const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration for production
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Import auth functions
const { 
  authMiddleware, 
  adminMiddleware, 
  register, 
  login, 
  requestPasswordReset, 
  resetPassword, 
  changePassword, 
  getCurrentUser 
} = require('./auth');

// Import routes
const cropsRouter = require('./crops');
const inputsRouter = require('./inputs');
const applicationsRouter = require('./applications');
const vehiclesRouter = require('./vehicles');
const maintenanceRouter = require('./maintenance');
const partsRouter = require('./parts');
const weatherRouter = require('./weather');
const whisperRouter = require('./whisper');

// Auth routes
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.post('/api/auth/forgot-password', requestPasswordReset);
app.post('/api/auth/reset-password', resetPassword);
app.post('/api/auth/change-password', authMiddleware, changePassword);
app.get('/api/auth/me', authMiddleware, getCurrentUser);

// Admin routes
app.get('/api/admin/users', authMiddleware, adminMiddleware, (req, res) => {
  const db = require('./db');
  db.all('SELECT id, username, email, role FROM users ORDER BY username', (err, users) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(users);
  });
});

app.put('/api/admin/users/:id/role', authMiddleware, adminMiddleware, (req, res) => {
  const { role } = req.body;
  const userId = req.params.id;
  
  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role. Must be "user" or "admin"' });
  }
  
  const db = require('./db');
  db.run('UPDATE users SET role = ? WHERE id = ?', [role, userId], function (err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (this.changes === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User role updated successfully' });
  });
});

// API routes
app.use('/api/crops', cropsRouter);
app.use('/api/inputs', inputsRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api/vehicles', vehiclesRouter);
app.use('/api/maintenance', maintenanceRouter);
app.use('/api/parts', partsRouter);
app.use('/api/weather', weatherRouter);
app.use('/api/whisper', whisperRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'Farm Record Keeping API is running',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

app.listen(PORT, () => {
  console.log(`🚜 NHFarming API Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
}); 