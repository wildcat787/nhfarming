const express = require('express');
const router = express.Router();
const DatabaseSync = require('./db-sync');
const path = require('path');

// Initialize database sync
const dbPath = process.env.DB_PATH 
  ? path.resolve(__dirname, process.env.DB_PATH)
  : path.join(__dirname, 'farm.db');

const dbSync = new DatabaseSync(dbPath);

// Initialize sync on module load (with error handling)
// Temporarily disabled due to Google Drive quota issues
// dbSync.initialize().catch(error => {
//   console.log('⚠️ Database sync initialization failed, continuing without sync:', error.message);
// });
console.log('⚠️ Google Drive sync disabled due to quota issues');

// Get sync status
router.get('/status', async (req, res) => {
  try {
    const status = await dbSync.getSyncStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Sync from Google Drive
router.post('/sync-from-drive', async (req, res) => {
  try {
    const success = await dbSync.syncFromDrive();
    res.json({
      success: true,
      message: success ? 'Database synced from Google Drive' : 'Sync failed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Sync to Google Drive
router.post('/sync-to-drive', async (req, res) => {
  try {
    const success = await dbSync.syncToDrive();
    res.json({
      success: true,
      message: success ? 'Database synced to Google Drive' : 'Sync failed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create backup
router.post('/backup', async (req, res) => {
  try {
    const { name } = req.body;
    const backupName = await dbSync.createBackup(name);
    res.json({
      success: true,
      data: { backupName }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// List backups
router.get('/backups', async (req, res) => {
  try {
    const backups = await dbSync.listBackups();
    res.json({
      success: true,
      data: backups
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Restore backup
router.post('/restore/:backupName', async (req, res) => {
  try {
    const { backupName } = req.params;
    const restoredPath = await dbSync.restoreBackup(backupName);
    res.json({
      success: true,
      data: { restoredPath }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start auto-sync
router.post('/auto-sync/start', (req, res) => {
  try {
    const { intervalMinutes = 30 } = req.body;
    dbSync.startAutoSync(intervalMinutes);
    res.json({
      success: true,
      message: `Auto-sync started (every ${intervalMinutes} minutes)`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Stop auto-sync
router.post('/auto-sync/stop', (req, res) => {
  try {
    dbSync.stopAutoSync();
    res.json({
      success: true,
      message: 'Auto-sync stopped'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get auto-sync status
router.get('/auto-sync/status', (req, res) => {
  try {
    const isRunning = dbSync.syncInterval !== null;
    res.json({
      success: true,
      data: { isRunning }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
