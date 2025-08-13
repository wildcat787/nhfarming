import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  Chip
} from '@mui/material';
import {
  CloudUpload,
  CloudDownload,
  Backup,
  RestoreFromBackup,
  Sync,
  Stop,
  Refresh,
  Schedule,
  CheckCircle,
  Error,
  Warning
} from '@mui/icons-material';
import { api } from '../api';

const DatabaseSync = () => {
  const [syncStatus, setSyncStatus] = useState(null);
  const [backups, setBackups] = useState([]);
  const [autoSyncStatus, setAutoSyncStatus] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [backupDialogOpen, setBackupDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [autoSyncDialogOpen, setAutoSyncDialogOpen] = useState(false);
  const [backupName, setBackupName] = useState('');
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [autoSyncInterval, setAutoSyncInterval] = useState(30);

  useEffect(() => {
    loadSyncStatus();
    loadBackups();
    loadAutoSyncStatus();
  }, []);

  const loadSyncStatus = async () => {
    try {
      setLoading(true);
      const response = await api.get('/sync/status');
      setSyncStatus(response.data.data);
    } catch (err) {
      setError('Failed to load sync status');
      console.error('Sync status error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadBackups = async () => {
    try {
      const response = await api.get('/sync/backups');
      setBackups(response.data.data);
    } catch (err) {
      console.error('Backups error:', err);
    }
  };

  const loadAutoSyncStatus = async () => {
    try {
      const response = await api.get('/sync/auto-sync/status');
      setAutoSyncStatus(response.data.data.isRunning);
    } catch (err) {
      console.error('Auto-sync status error:', err);
    }
  };

  const handleSyncToDrive = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post('/sync/sync-to-drive');
      setSuccess(response.data.message);
      await loadSyncStatus();
    } catch (err) {
      setError('Failed to sync to Google Drive');
      console.error('Sync to drive error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncFromDrive = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post('/sync/sync-from-drive');
      setSuccess(response.data.message);
      await loadSyncStatus();
    } catch (err) {
      setError('Failed to sync from Google Drive');
      console.error('Sync from drive error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post('/sync/backup', { name: backupName });
      setSuccess(`Backup created: ${response.data.data.backupName}`);
      setBackupDialogOpen(false);
      setBackupName('');
      await loadBackups();
    } catch (err) {
      setError('Failed to create backup');
      console.error('Create backup error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreBackup = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post(`/sync/restore/${selectedBackup}`);
      setSuccess('Backup restored successfully');
      setRestoreDialogOpen(false);
      setSelectedBackup(null);
      await loadSyncStatus();
    } catch (err) {
      setError('Failed to restore backup');
      console.error('Restore backup error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartAutoSync = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post('/sync/auto-sync/start', { intervalMinutes: autoSyncInterval });
      setSuccess(response.data.message);
      setAutoSyncDialogOpen(false);
      await loadAutoSyncStatus();
    } catch (err) {
      setError('Failed to start auto-sync');
      console.error('Start auto-sync error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStopAutoSync = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post('/sync/auto-sync/stop');
      setSuccess(response.data.message);
      await loadAutoSyncStatus();
    } catch (err) {
      setError('Failed to stop auto-sync');
      console.error('Stop auto-sync error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getSyncStatusIcon = () => {
    if (!syncStatus) return <Warning color="warning" />;
    if (syncStatus.error) return <Error color="error" />;
    if (syncStatus.synced && syncStatus.isUpToDate) return <CheckCircle color="success" />;
    return <Warning color="warning" />;
  };

  const getSyncStatusText = () => {
    if (!syncStatus) return 'Unknown';
    if (syncStatus.error) return 'Error';
    if (syncStatus.synced && syncStatus.isUpToDate) return 'Up to date';
    if (syncStatus.synced) return 'Out of sync';
    return 'Not synced';
  };

  return (
    <Box sx={{ p: 2, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Database Synchronization
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Sync Status Card */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            {getSyncStatusIcon()}
            <Typography variant="h6" sx={{ ml: 1 }}>
              Sync Status: {getSyncStatusText()}
            </Typography>
            <IconButton onClick={loadSyncStatus} disabled={loading}>
              <Refresh />
            </IconButton>
          </Box>

          {syncStatus && (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Typography variant="body2">
                Last Sync: {syncStatus.lastSync ? formatDate(syncStatus.lastSync) : 'Never'}
              </Typography>
              <Typography variant="body2">
                Cloud Size: {syncStatus.size ? formatFileSize(syncStatus.size) : 'Unknown'}
              </Typography>
              {syncStatus.localSize && (
                <Typography variant="body2">
                  Local Size: {formatFileSize(syncStatus.localSize)}
                </Typography>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Sync Actions Card */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Manual Sync
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<CloudUpload />}
              onClick={handleSyncToDrive}
              disabled={loading}
            >
              Sync to Drive
            </Button>
            <Button
              variant="outlined"
              startIcon={<CloudDownload />}
              onClick={handleSyncFromDrive}
              disabled={loading}
            >
              Sync from Drive
            </Button>
            <Button
              variant="outlined"
              startIcon={<Backup />}
              onClick={() => setBackupDialogOpen(true)}
              disabled={loading}
            >
              Create Backup
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Auto Sync Card */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Auto Sync
            </Typography>
            <Chip
              label={autoSyncStatus ? 'Running' : 'Stopped'}
              color={autoSyncStatus ? 'success' : 'default'}
              size="small"
            />
          </Box>
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<Schedule />}
              onClick={() => setAutoSyncDialogOpen(true)}
              disabled={loading || autoSyncStatus}
            >
              Start Auto Sync
            </Button>
            <Button
              variant="outlined"
              startIcon={<Stop />}
              onClick={handleStopAutoSync}
              disabled={loading || !autoSyncStatus}
            >
              Stop Auto Sync
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Backups Card */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Available Backups
          </Typography>
          {backups.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No backups available
            </Typography>
          ) : (
            <List>
              {backups.map((backup) => (
                <ListItem key={backup.id} divider>
                  <ListItemText
                    primary={backup.name}
                    secondary={`${formatFileSize(backup.size)} • ${formatDate(backup.modifiedTime)}`}
                  />
                  <ListItemSecondaryAction>
                    <Button
                      size="small"
                      startIcon={<RestoreFromBackup />}
                      onClick={() => {
                        setSelectedBackup(backup.name);
                        setRestoreDialogOpen(true);
                      }}
                    >
                      Restore
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Create Backup Dialog */}
      <Dialog open={backupDialogOpen} onClose={() => setBackupDialogOpen(false)}>
        <DialogTitle>Create Backup</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Backup Name (optional)"
            fullWidth
            value={backupName}
            onChange={(e) => setBackupName(e.target.value)}
            placeholder="farm-backup-2024-01-01"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBackupDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateBackup} disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Restore Backup Dialog */}
      <Dialog open={restoreDialogOpen} onClose={() => setRestoreDialogOpen(false)}>
        <DialogTitle>Restore Backup</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="warning.main" sx={{ mb: 2 }}>
            Warning: This will replace your current database with the backup. This action cannot be undone.
          </Typography>
          <Typography variant="body1">
            Restore: <strong>{selectedBackup}</strong>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestoreDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRestoreBackup} disabled={loading} color="warning">
            {loading ? <CircularProgress size={20} /> : 'Restore'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Auto Sync Dialog */}
      <Dialog open={autoSyncDialogOpen} onClose={() => setAutoSyncDialogOpen(false)}>
        <DialogTitle>Configure Auto Sync</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Sync Interval (minutes)"
            type="number"
            fullWidth
            value={autoSyncInterval}
            onChange={(e) => setAutoSyncInterval(parseInt(e.target.value) || 30)}
            inputProps={{ min: 5, max: 1440 }}
            helperText="Minimum 5 minutes, maximum 24 hours (1440 minutes)"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAutoSyncDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleStartAutoSync} disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Start'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DatabaseSync;
