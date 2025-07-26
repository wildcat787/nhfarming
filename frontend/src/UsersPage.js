import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Alert,
  Box,
  Tooltip,
  Fab,
  Card,
  CardContent,
  CardActions,
  Grid,
  useTheme,
  useMediaQuery,
  Stack
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Lock as LockIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useAuth } from './AuthContext';
import { apiRequest } from './api';

const UsersPage = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  // Add User dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  // Add User form state
  const [addForm, setAddForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user',
  });
  
  // Check if current user is admin
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('/admin/users', { method: 'GET' });
      setUsers(response);
      setError('');
    } catch (err) {
      setError('Failed to fetch users: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditForm({
      username: user.username || '',
      email: user.email || '',
      role: user.role || 'user'
    });
    setEditDialogOpen(true);
  };

  const handlePasswordChange = (user) => {
    setSelectedUser(user);
    setNewPassword('');
    setPasswordDialogOpen(true);
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      await apiRequest(`/admin/users/${selectedUser.id}`, { method: 'PUT', body: JSON.stringify(editForm) });
      setSuccess('User updated successfully');
      setEditDialogOpen(false);
      fetchUsers();
    } catch (err) {
      setError('Failed to update user: ' + err.message);
    }
  };

  const handlePasswordSubmit = async () => {
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      await apiRequest(`/admin/users/${selectedUser.id}/password`, { method: 'PUT', body: JSON.stringify({ password: newPassword }) });
      setSuccess('Password updated successfully');
      setPasswordDialogOpen(false);
      setNewPassword('');
    } catch (err) {
      setError('Failed to update password: ' + err.message);
    }
  };

  const handleDeleteSubmit = async () => {
    try {
      await apiRequest(`/admin/users/${selectedUser.id}`, { method: 'DELETE' });
      setSuccess('User deleted successfully');
      setDeleteDialogOpen(false);
      fetchUsers();
    } catch (err) {
      setError('Failed to delete user: ' + err.message);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await apiRequest(`/admin/users/${userId}/role`, { method: 'PUT', body: JSON.stringify({ role: newRole }) });
      setSuccess('User role updated successfully');
      fetchUsers();
    } catch (err) {
      setError('Failed to update user role: ' + err.message);
    }
  };

  // Add User handlers
  const handleAddUserOpen = () => {
    setAddForm({ username: '', email: '', password: '', role: 'user' });
    setAddDialogOpen(true);
  };
  const handleAddUserClose = () => {
    setAddDialogOpen(false);
  };
  const handleAddFormChange = (e) => {
    setAddForm({ ...addForm, [e.target.name]: e.target.value });
  };
  const handleAddUserSubmit = async () => {
    // Basic validation
    if (!addForm.username || !addForm.email || !addForm.password) {
      setError('All fields are required.');
      return;
    }
    // Email format validation
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(addForm.email)) {
      setError('Invalid email address.');
      return;
    }
    try {
      await apiRequest('/admin/users', {
        method: 'POST',
        body: JSON.stringify(addForm),
      });
      setSuccess('User added successfully!');
      setAddDialogOpen(false);
      fetchUsers();
    } catch (err) {
      setError('Failed to add user: ' + err.message);
    }
  };

  if (!isAdmin) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          Access denied. Admin privileges required.
        </Alert>
      </Container>
    );
  }

  const UserCard = ({ user }) => (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {user.role === 'admin' ? (
            <AdminIcon sx={{ mr: 1, color: 'warning.main' }} />
          ) : (
            <PersonIcon sx={{ mr: 1, color: 'action.disabled' }} />
          )}
          <Typography variant="h6" component="h2">
            {user.username}
          </Typography>
        </Box>
        
        <Typography color="text.secondary" gutterBottom>
          ID: {user.id}
        </Typography>
        
        <Typography color="text.secondary" gutterBottom>
          Email: {user.email || 'No email'}
        </Typography>
        
        <Box sx={{ mt: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Role</InputLabel>
            <Select
              value={user.role}
              label="Role"
              onChange={(e) => handleRoleChange(user.id, e.target.value)}
              disabled={user.id === parseInt(localStorage.getItem('userId'))}
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </CardContent>
      
      <CardActions sx={{ justifyContent: 'space-around', p: 2 }}>
        <Tooltip title="Edit User">
          <IconButton 
            size="small" 
            onClick={() => handleEditUser(user)}
            disabled={user.id === parseInt(localStorage.getItem('userId'))}
            color="primary"
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Change Password">
          <IconButton 
            size="small" 
            onClick={() => handlePasswordChange(user)}
            color="secondary"
          >
            <LockIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete User">
          <IconButton 
            size="small" 
            color="error"
            onClick={() => handleDeleteUser(user)}
            disabled={user.id === parseInt(localStorage.getItem('userId'))}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4, px: { xs: 1, sm: 2 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" component="h1" sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
          <AdminIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          User Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Chip 
            label={`${users.length} Users`} 
            color="primary" 
            variant="outlined"
            size={isMobile ? "small" : "medium"}
          />
          {isAdmin && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddUserOpen}
              sx={{ minHeight: 44 }}
            >
              Add User
            </Button>
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {isMobile ? (
        <Grid container spacing={2}>
          {users.map((user) => (
            <Grid item xs={12} sm={6} key={user.id}>
              <UserCard user={user} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Username</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {user.role === 'admin' ? (
                          <AdminIcon sx={{ mr: 1, color: 'warning.main' }} />
                        ) : (
                          <PersonIcon sx={{ mr: 1, color: 'action.disabled' }} />
                        )}
                        {user.username}
                      </Box>
                    </TableCell>
                    <TableCell>{user.email || '-'}</TableCell>
                    <TableCell>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          disabled={user.id === parseInt(localStorage.getItem('userId'))}
                        >
                          <MenuItem value="user">User</MenuItem>
                          <MenuItem value="admin">Admin</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Edit User">
                          <IconButton 
                            size="small" 
                            onClick={() => handleEditUser(user)}
                            disabled={user.id === parseInt(localStorage.getItem('userId'))}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Change Password">
                          <IconButton 
                            size="small" 
                            onClick={() => handlePasswordChange(user)}
                          >
                            <LockIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete User">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleDeleteUser(user)}
                            disabled={user.id === parseInt(localStorage.getItem('userId'))}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Edit User Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              autoFocus
              label="Username"
              fullWidth
              variant="outlined"
              value={editForm.username}
              onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              variant="outlined"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={editForm.role}
                label="Role"
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog 
        open={passwordDialogOpen} 
        onClose={() => setPasswordDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>Change Password for {selectedUser?.username}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="New Password"
            type="password"
            fullWidth
            variant="outlined"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            helperText="Password must be at least 6 characters long"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
          <Button onClick={handlePasswordSubmit} variant="contained">Update Password</Button>
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
          <Typography>
            Are you sure you want to delete user "{selectedUser?.username}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteSubmit} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={addDialogOpen} onClose={handleAddUserClose} maxWidth="sm" fullWidth fullScreen={isMobile}>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              autoFocus
              label="Username"
              name="username"
              value={addForm.username}
              onChange={handleAddFormChange}
              fullWidth
              required
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={addForm.email}
              onChange={handleAddFormChange}
              fullWidth
              required
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              value={addForm.password}
              onChange={handleAddFormChange}
              fullWidth
              required
              helperText="Minimum 6 characters"
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={addForm.role}
                label="Role"
                onChange={handleAddFormChange}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddUserClose}>Cancel</Button>
          <Button onClick={handleAddUserSubmit} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UsersPage; 