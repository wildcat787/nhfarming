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

const { router: authRouter } = require('./auth');
const cropsRouter = require('./crops');
const inputsRouter = require('./inputs');
const applicationsRouter = require('./applications');
const weatherRouter = require('./weather');
const vehiclesRouter = require('./vehicles');
const maintenanceRouter = require('./maintenance');
const partsRouter = require('./parts');
const whisperRouter = require('./whisper');

app.use('/api/auth', authRouter);
app.use('/api/crops', cropsRouter);
app.use('/api/inputs', inputsRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api/weather', weatherRouter);
app.use('/api/vehicles', vehiclesRouter);
app.use('/api/maintenance', maintenanceRouter);
app.use('/api/parts', partsRouter);
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