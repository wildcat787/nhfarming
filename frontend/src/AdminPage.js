import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { apiRequest } from './api';
import {
  Box, Button, TextField, Typography, Paper, Grid, Snackbar, CircularProgress, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, 
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, 
  Card, CardContent, CardActions, Chip, useMediaQuery, useTheme, MenuItem,
  Alert, Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';

export default function AdminPage() {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [editUser, setEditUser] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form, setForm] = useState({ username: '', email: '', role: 'user' });
  const [newPassword, setNewPassword] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Check if current user is admin
  if (!user || user.role !== 'admin') {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error">
          Access denied. Admin privileges required.
        </Alert>
      </Box>
    );
  }

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/admin/users');
      setUsers(data);
    } catch (err) {
      setError(err.message);
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleEdit = (user) => {
    setEditUser(user);
    setForm({
      username: user.username || '',
      email: user.email || '',
      role: user.role || 'user'
    });
    setEditDialogOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await apiRequest(`/admin/users/${editUser.id}`, {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      setEditDialogOpen(false);
      setEditUser(null);
      setForm({ username: '', email: '', role: 'user' });
      fetchUsers();
      setSnackbar({ open: true, message: 'User updated successfully!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      await apiRequest(`/admin/users/${selectedUser.id}/password`, {
        method: 'PUT',
        body: JSON.stringify({ newPassword }),
      });
      setPasswordDialogOpen(false);
      setSelectedUser(null);
      setNewPassword('');
      setSnackbar({ open: true, message: 'Password changed successfully!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    }
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await apiRequest(`/admin/users/${selectedUser.id}`, {
        method: 'DELETE',
      });
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
      setSnackbar({ open: true, message: 'User deleted successfully!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    }
  };

  const renderUserCard = (userItem) => (
    <Card key={userItem.id} sx={{ mb: 2, mx: isMobile ? 0 : 1 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" gutterBottom>
            {userItem.username}
          </Typography>
          <Chip 
            icon={userItem.role === 'admin' ? <AdminPanelSettingsIcon /> : <PersonIcon />}
            label={userItem.role} 
            color={userItem.role === 'admin' ? 'primary' : 'default'}
            size="small"
          />
        </Box>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">
              Email: {userItem.email || 'N/A'}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">
              ID: {userItem.id}
            </Typography>
          </Grid>
          {userItem.reset_token && (
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Reset Token: {userItem.reset_token}
              </Typography>
            </Grid>
          )}
        </Grid>
      </CardContent>
      <CardActions sx={{ justifyContent: 'space-around', p: 2 }}>
        <IconButton 
          color="primary" 
          onClick={() => handleEdit(userItem)}
          size={isMobile ? "large" : "medium"}
          title="Edit User"
        >
          <EditIcon />
        </IconButton>
        <IconButton 
          color="secondary" 
          onClick={() => { setSelectedUser(userItem); setPasswordDialogOpen(true); }}
          size={isMobile ? "large" : "medium"}
          title="Change Password"
        >
          <LockIcon />
        </IconButton>
        {userItem.id !== user.id && (
          <IconButton 
            color="error" 
            onClick={() => handleDelete(userItem)}
            size={isMobile ? "large" : "medium"}
            title="Delete User"
          >
            <DeleteIcon />
          </IconButton>
        )}
      </CardActions>
    </Card>
  );

  return (
    <Box>
      <Typography variant={isMobile ? "h5" : "h4"} mb={3}>
        Admin Panel - User Management
      </Typography>
      
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
          <CircularProgress />
        </Box>
      ) : isMobile ? (
        // Mobile: Cards layout
        <Box>
          {users.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No users found.
              </Typography>
            </Paper>
          ) : (
            users.map(renderUserCard)
          )}
        </Box>
      ) : (
        // Desktop: Table layout
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>ID</TableCell>
                <TableCell>Reset Token</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map(userItem => (
                <TableRow key={userItem.id}>
                  <TableCell>{userItem.username}</TableCell>
                  <TableCell>{userItem.email || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip 
                      icon={userItem.role === 'admin' ? <AdminPanelSettingsIcon /> : <PersonIcon />}
                      label={userItem.role} 
                      color={userItem.role === 'admin' ? 'primary' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{userItem.id}</TableCell>
                  <TableCell>{userItem.reset_token || 'N/A'}</TableCell>
                  <TableCell align="right">
                    <IconButton 
                      color="primary" 
                      onClick={() => handleEdit(userItem)}
                      title="Edit User"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      color="secondary" 
                      onClick={() => { setSelectedUser(userItem); setPasswordDialogOpen(true); }}
                      title="Change Password"
                    >
                      <LockIcon />
                    </IconButton>
                    {userItem.id !== user.id && (
                      <IconButton 
                        color="error" 
                        onClick={() => handleDelete(userItem)}
                        title="Delete User"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Edit User Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        fullScreen={isMobile}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <form onSubmit={handleUpdate}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  name="username"
                  label="Username"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  fullWidth
                  required
                  size={isMobile ? "medium" : "small"}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="email"
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  fullWidth
                  size={isMobile ? "medium" : "small"}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="role"
                  label="Role"
                  select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  fullWidth
                  required
                  size={isMobile ? "medium" : "small"}
                >
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdate} variant="contained">Update User</Button>
        </DialogActions>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog 
        open={passwordDialogOpen} 
        onClose={() => setPasswordDialogOpen(false)}
        fullScreen={isMobile}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Change Password for {selectedUser?.username}</DialogTitle>
        <DialogContent>
          <form onSubmit={handlePasswordChange}>
            <TextField
              margin="normal"
              required
              fullWidth
              name="newPassword"
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              size={isMobile ? "medium" : "small"}
              helperText="Password must be at least 6 characters long"
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
          <Button onClick={handlePasswordChange} variant="contained">Change Password</Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        fullScreen={isMobile}
      >
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete user "{selectedUser?.username}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" onClick={confirmDelete}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
} 