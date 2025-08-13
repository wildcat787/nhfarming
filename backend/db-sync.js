const GoogleDriveService = require('./google-drive-service');
const path = require('path');
const fs = require('fs');

class DatabaseSync {
  constructor(dbPath) {
    this.dbPath = dbPath;
    this.googleDrive = new GoogleDriveService();
    this.syncInterval = null;
    this.autoSyncEnabled = process.env.AUTO_SYNC_ENABLED === 'true';
  }

  async initialize() {
    try {
      // Ensure database directory exists
      const dbDir = path.dirname(this.dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      // Try to sync database on startup, but don't fail if it doesn't work
      try {
        await this.syncFromDrive();
      } catch (syncError) {
        console.log('⚠️ Initial sync failed, continuing without Google Drive sync:', syncError.message);
      }
      
      // Start auto-sync if enabled
      if (this.autoSyncEnabled) {
        this.startAutoSync();
      }

      console.log('✅ Database sync initialized');
    } catch (error) {
      console.error('❌ Failed to initialize database sync:', error);
      // Don't throw the error, just log it and continue
    }
  }

  async syncFromDrive() {
    try {
      await this.googleDrive.syncDatabase(this.dbPath);
      return true;
    } catch (error) {
      console.error('❌ Failed to sync from Drive:', error);
      return false;
    }
  }

  async syncToDrive() {
    try {
      if (fs.existsSync(this.dbPath)) {
        await this.googleDrive.uploadDatabase(this.dbPath);
        return true;
      } else {
        console.warn('⚠️ Database file does not exist locally');
        return false;
      }
    } catch (error) {
      console.error('❌ Failed to sync to Drive:', error);
      return false;
    }
    }

  async createBackup() {
    try {
      if (fs.existsSync(this.dbPath)) {
        const backupName = await this.googleDrive.backupDatabase(this.dbPath);
        return backupName;
      } else {
        throw new Error('Database file does not exist');
      }
    } catch (error) {
      console.error('❌ Failed to create backup:', error);
      throw error;
    }
  }

  async listBackups() {
    try {
      const databases = await this.googleDrive.listDatabases();
      return databases.filter(db => db.name.includes('backup'));
    } catch (error) {
      console.error('❌ Failed to list backups:', error);
      throw error;
    }
  }

  async restoreBackup(backupName) {
    try {
      const databases = await this.googleDrive.listDatabases();
      const backup = databases.find(db => db.name === backupName);
      
      if (!backup) {
        throw new Error(`Backup ${backupName} not found`);
      }

      // Create a temporary path for the restored database
      const tempPath = this.dbPath.replace('.db', `-restored-${Date.now()}.db`);
      await this.googleDrive.downloadDatabase(backup.id, tempPath);
      
      return tempPath;
    } catch (error) {
      console.error('❌ Failed to restore backup:', error);
      throw error;
    }
  }

  startAutoSync(intervalMinutes = 30) {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(async () => {
      console.log('🔄 Auto-syncing database...');
      await this.syncToDrive();
    }, intervalMinutes * 60 * 1000);

    console.log(`✅ Auto-sync started (every ${intervalMinutes} minutes)`);
  }

  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('⏹️ Auto-sync stopped');
    }
  }

  async getSyncStatus() {
    try {
      const databases = await this.googleDrive.listDatabases();
      const mainDb = databases.find(db => db.name === 'farm.db');
      
      if (!mainDb) {
        return { synced: false, lastSync: null, size: null };
      }

      const localStats = fs.existsSync(this.dbPath) ? fs.statSync(this.dbPath) : null;
      
      return {
        synced: true,
        lastSync: mainDb.modifiedTime,
        size: mainDb.size,
        localSize: localStats ? localStats.size : null,
        isUpToDate: localStats ? (localStats.size === parseInt(mainDb.size)) : false
      };
    } catch (error) {
      console.error('❌ Failed to get sync status:', error);
      return { synced: false, error: error.message };
    }
  }
}

module.exports = DatabaseSync;
