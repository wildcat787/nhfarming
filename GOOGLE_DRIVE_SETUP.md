# Google Drive Integration Setup Guide

This guide will help you set up Google Drive integration for storing and syncing your NHFarming database.

## Overview

The Google Drive integration allows you to:
- Store your SQLite database in Google Drive
- Automatically sync changes between devices
- Create and restore database backups
- Access your data from anywhere

## Prerequisites

1. A Google account
2. Google Cloud Console access
3. Node.js backend running

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Drive API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Drive API"
   - Click "Enable"

## Step 2: Create Service Account

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the service account details:
   - Name: `nhfarming-drive-sync`
   - Description: `Service account for NHFarming database sync`
4. Click "Create and Continue"
5. Skip role assignment (we'll handle permissions manually)
6. Click "Done"

## Step 3: Generate Service Account Key

1. Click on your newly created service account
2. Go to the "Keys" tab
3. Click "Add Key" > "Create New Key"
4. Choose "JSON" format
5. Download the JSON file
6. Rename it to `google-credentials.json`
7. Place it in your backend directory (`NHFarming/backend/`)

## Step 4: Create Google Drive Folder

1. Go to [Google Drive](https://drive.google.com/)
2. Create a new folder called "NHFarming Database"
3. Right-click the folder and select "Share"
4. Add your service account email (found in the JSON file) with "Editor" permissions
5. Copy the folder ID from the URL (the long string after `/folders/`)

## Step 5: Configure Environment Variables

Add these variables to your `.env` file in the backend directory:

```env
# Google Drive Configuration
GOOGLE_DRIVE_FOLDER_ID=your_folder_id_here
GOOGLE_APPLICATION_CREDENTIALS=google-credentials.json
AUTO_SYNC_ENABLED=true
```

## Step 6: Install Dependencies

Run this command in your backend directory:

```bash
npm install googleapis
```

## Step 7: Test the Integration

1. Start your backend server
2. Check the console for "✅ Google Drive service initialized"
3. Use the Database Sync component in your React app to test:
   - Sync to Drive
   - Sync from Drive
   - Create backup

## API Endpoints

The following endpoints are available for database synchronization:

### Sync Status
- `GET /api/sync/status` - Get current sync status

### Manual Sync
- `POST /api/sync/sync-to-drive` - Upload database to Google Drive
- `POST /api/sync/sync-from-drive` - Download database from Google Drive

### Backups
- `POST /api/sync/backup` - Create a new backup
- `GET /api/sync/backups` - List all backups
- `POST /api/sync/restore/:backupName` - Restore a backup

### Auto Sync
- `POST /api/sync/auto-sync/start` - Start automatic syncing
- `POST /api/sync/auto-sync/stop` - Stop automatic syncing
- `GET /api/sync/auto-sync/status` - Get auto-sync status

## Security Considerations

1. **Keep credentials secure**: Never commit `google-credentials.json` to version control
2. **Folder permissions**: Only give the service account access to the specific folder
3. **Environment variables**: Use environment variables for sensitive configuration
4. **Backup strategy**: Regularly create backups before major changes

## Troubleshooting

### Common Issues

1. **"Google Drive not initialized"**
   - Check that `google-credentials.json` exists in the backend directory
   - Verify the service account has access to the Google Drive folder

2. **"Permission denied"**
   - Ensure the service account email has "Editor" permissions on the folder
   - Check that the folder ID is correct

3. **"API not enabled"**
   - Make sure Google Drive API is enabled in your Google Cloud project

4. **"Invalid credentials"**
   - Regenerate the service account key
   - Check that the JSON file is not corrupted

### Debug Mode

Enable debug logging by adding to your `.env`:

```env
DEBUG=true
```

## Usage Examples

### Manual Sync
```javascript
// Sync to Google Drive
await fetch('/api/sync/sync-to-drive', { method: 'POST' });

// Sync from Google Drive
await fetch('/api/sync/sync-from-drive', { method: 'POST' });
```

### Create Backup
```javascript
// Create a named backup
await fetch('/api/sync/backup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'farm-backup-2024-01-01' })
});
```

### Start Auto Sync
```javascript
// Start auto-sync every 30 minutes
await fetch('/api/sync/auto-sync/start', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ intervalMinutes: 30 })
});
```

## Best Practices

1. **Regular backups**: Create backups before major database changes
2. **Test restores**: Periodically test backup restoration
3. **Monitor sync status**: Check sync status regularly
4. **Network considerations**: Ensure stable internet for auto-sync
5. **Storage limits**: Monitor Google Drive storage usage

## Support

If you encounter issues:
1. Check the backend console for error messages
2. Verify all environment variables are set correctly
3. Test with a small database first
4. Check Google Cloud Console for API usage and errors

## Next Steps

After setting up Google Drive integration:

1. Test the sync functionality
2. Configure auto-sync if desired
3. Create initial backups
4. Train users on the sync interface
5. Monitor sync performance and adjust as needed
