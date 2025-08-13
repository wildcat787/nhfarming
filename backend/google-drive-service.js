const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

class GoogleDriveService {
  constructor() {
    this.drive = null;
    this.folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    this.initializeDrive();
  }

  async initializeDrive() {
    try {
      // For service account authentication
      const auth = new google.auth.GoogleAuth({
        keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS || 'google-credentials.json',
        scopes: ['https://www.googleapis.com/auth/drive.file']
      });

      this.drive = google.drive({ version: 'v3', auth });
      console.log('✅ Google Drive service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Google Drive:', error);
    }
  }

  async uploadDatabase(dbPath, fileName = 'farm.db') {
    try {
      if (!this.drive) {
        throw new Error('Google Drive not initialized');
      }

      const fileMetadata = {
        name: fileName,
        parents: [this.folderId]
      };

      const media = {
        mimeType: 'application/x-sqlite3',
        body: fs.createReadStream(dbPath)
      };

      const response = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id'
      });

      console.log(`✅ Database uploaded to Google Drive: ${response.data.id}`);
      return response.data.id;
    } catch (error) {
      console.error('❌ Failed to upload database:', error);
      throw error;
    }
  }

  async downloadDatabase(fileId, localPath) {
    try {
      if (!this.drive) {
        throw new Error('Google Drive not initialized');
      }

      const response = await this.drive.files.get({
        fileId: fileId,
        alt: 'media'
      }, { responseType: 'stream' });

      const writer = fs.createWriteStream(localPath);
      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', () => {
          console.log(`✅ Database downloaded from Google Drive: ${localPath}`);
          resolve(localPath);
        });
        writer.on('error', reject);
      });
    } catch (error) {
      console.error('❌ Failed to download database:', error);
      throw error;
    }
  }

  async listDatabases() {
    try {
      if (!this.drive) {
        throw new Error('Google Drive not initialized');
      }

      const response = await this.drive.files.list({
        q: `'${this.folderId}' in parents and mimeType='application/x-sqlite3'`,
        fields: 'files(id, name, modifiedTime, size)'
      });

      return response.data.files;
    } catch (error) {
      console.error('❌ Failed to list databases:', error);
      throw error;
    }
  }

  async syncDatabase(dbPath, fileName = 'farm.db') {
    try {
      // First, try to download the latest version
      const databases = await this.listDatabases();
      const existingDb = databases.find(db => db.name === fileName);

      if (existingDb) {
        // Download and replace local database
        await this.downloadDatabase(existingDb.id, dbPath);
        console.log('✅ Database synced from Google Drive');
      } else {
        // Upload local database if it doesn't exist in Drive
        await this.uploadDatabase(dbPath, fileName);
        console.log('✅ New database uploaded to Google Drive');
      }
    } catch (error) {
      console.error('❌ Failed to sync database:', error);
      throw error;
    }
  }

  async backupDatabase(dbPath, backupName = null) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = backupName || `farm-backup-${timestamp}.db`;
      
      await this.uploadDatabase(dbPath, fileName);
      console.log(`✅ Database backup created: ${fileName}`);
      return fileName;
    } catch (error) {
      console.error('❌ Failed to backup database:', error);
      throw error;
    }
  }
}

module.exports = GoogleDriveService;
