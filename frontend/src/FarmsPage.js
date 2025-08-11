import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Grid,
  IconButton,
  Chip,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
  Home as FarmIcon
} from '@mui/icons-material';
import { apiRequest } from './api';
import { useAuth } from './AuthContext';
import PageLayout, { SectionLayout, CardLayout } from './components/PageLayout';

export default function FarmsPage() {
  const { user } = useAuth();
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form states
  const [showForm, setShowForm] = useState(false);
  const [openUsersDialog, setOpenUsersDialog] = useState(false);
  const [openAddUserDialog, setOpenAddUserDialog] = useState(false);
  const [editFarm, setEditFarm] = useState(null);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [farmUsers, setFarmUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  
  const [form, setForm] = useState({
    name: '',
    description: '',
    location: ''
  });

  const [addUserForm, setAddUserForm] = useState({
    user_id: '',
    role: 'worker',
    permissions: ''
  });

  useEffect(() => {
    fetchFarms();
  }, []);

  const fetchFarms = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('/farms');
      setFarms(response);
    } catch (err) {
      setError('Failed to load farms');
    } finally {
      setLoading(false);
    }
  };

  const fetchFarmUsers = async (farmId) => {
    try {
      const response = await apiRequest(`/farms/${farmId}/users`);
      setFarmUsers(response);
    } catch (err) {
      setError('Failed to load farm users');
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await apiRequest('/admin/users');
      setAllUsers(response);
    } catch (err) {
      setError('Failed to load users');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editFarm) {
        await apiRequest(`/farms/${editFarm.id}`, { method: 'PUT', body: JSON.stringify(form) });
        setSuccess('Farm updated successfully');
      } else {
        await apiRequest('/farms', { method: 'POST', body: JSON.stringify(form) });
        setSuccess('Farm created successfully');
      }
      setShowForm(false);
      setEditFarm(null);
      setForm({ name: '', description: '', location: '' });
      fetchFarms();
    } catch (err) {
      setError(err.message || 'Failed to save farm');
    }
  };

  const handleDelete = async (farm) => {
    if (!window.confirm(`Are you sure you want to delete "${farm.name}"? This will also delete all associated data.`)) {
      return;
    }
    
    try {
      await apiRequest(`/farms/${farm.id}`, { method: 'DELETE' });
      setSuccess('Farm deleted successfully');
      fetchFarms();
    } catch (err) {
      setError(err.message || 'Failed to delete farm');
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await apiRequest(`/farms/${selectedFarm.id}/users`, { method: 'POST', body: JSON.stringify(addUserForm) });
      setSuccess('User added to farm successfully');
      setOpenAddUserDialog(false);
      setAddUserForm({ user_id: '', role: 'worker', permissions: '' });
      fetchFarmUsers(selectedFarm.id);
    } catch (err) {
      setError(err.message || 'Failed to add user to farm');
    }
  };

  const handleRemoveUser = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this user from the farm?')) {
      return;
    }
    
    try {
      await apiRequest(`/farms/${selectedFarm.id}/users/${userId}`, { method: 'DELETE' });
      setSuccess('User removed from farm successfully');
      fetchFarmUsers(selectedFarm.id);
    } catch (err) {
      setError(err.message || 'Failed to remove user from farm');
    }
  };

  const openEditDialog = (farm) => {
    setEditFarm(farm);
    setForm({
      name: farm.name,
      description: farm.description || '',
      location: farm.location || ''
    });
    setShowForm(true);
  };

  const handleOpenUsersDialog = async (farm) => {
    setSelectedFarm(farm);
    await fetchFarmUsers(farm.id);
    if (user?.role === 'admin') {
      await fetchAllUsers();
    }
    setOpenUsersDialog(true);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'owner': return 'primary';
      case 'manager': return 'secondary';
      case 'worker': return 'default';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <PageLayout title="🏠 Farms" subtitle="Manage your farms and farm access">
        <Box display="flex" justifyContent="center" p={4}>
          <Typography>Loading farms...</Typography>
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="🏠 Farms" subtitle="Manage your farms and farm access">
      {showForm && (
        <SectionLayout title={editFarm ? 'Edit Farm' : 'Add New Farm'}>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Farm Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Location"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </Grid>
            </Grid>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setShowForm(false);
                setEditFarm(null);
                setForm({ name: '', description: '', location: '' });
              }}>
                Cancel
              </Button>
              <Button type="submit" variant="contained">
                {editFarm ? 'Update Farm' : 'Create Farm'}
              </Button>
            </Box>
          </Box>
        </SectionLayout>
      )}

      <SectionLayout title="Your Farms">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Farms</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowForm(true)}
          >
            Add Farm
          </Button>
        </Box>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        ) : farms.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No farms found. Create your first farm to get started.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {farms.map((farm) => (
              <Grid item xs={12} sm={6} md={4} key={farm.id}>
                <CardLayout>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FarmIcon color="primary" />
                      <Typography variant="h6">{farm.name}</Typography>
                    </Box>
                    <Chip 
                      label={farm.user_role} 
                      color={getRoleColor(farm.user_role)}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {farm.location}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Total Area: {farm.calculated_total_area || 0} hectares ({farm.field_count || 0} fields)
                    <Typography variant="caption" display="block" color="text.secondary">
                      * Calculated from field areas
                    </Typography>
                  </Typography>
                  
                  {farm.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {farm.description}
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button
                      size="small"
                      startIcon={<PeopleIcon />}
                      onClick={() => handleOpenUsersDialog(farm)}
                    >
                      Users
                    </Button>
                    
                    {farm.user_role === 'owner' && (
                      <>
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => openEditDialog(farm)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDelete(farm)}
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  </Box>
                </CardLayout>
              </Grid>
            ))}
          </Grid>
        )}
      </SectionLayout>

      {/* Users Dialog */}
      <Dialog open={openUsersDialog} onClose={() => setOpenUsersDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Users - {selectedFarm?.name}
          {selectedFarm?.user_role === 'owner' && (
            <Button
              startIcon={<PersonAddIcon />}
              onClick={() => setOpenAddUserDialog(true)}
              sx={{ ml: 2 }}
            >
              Add User
            </Button>
          )}
        </DialogTitle>
        <DialogContent>
          <List>
            {farmUsers.map((user, index) => (
              <React.Fragment key={user.id}>
                <ListItem>
                  <ListItemText
                    primary={user.username}
                    secondary={`${user.email} • ${user.role}`}
                  />
                  <ListItemSecondaryAction>
                    <Chip label={user.role} color={getRoleColor(user.role)} size="small" />
                    {selectedFarm?.user_role === 'owner' && user.role !== 'owner' && (
                      <IconButton
                        edge="end"
                        color="error"
                        onClick={() => handleRemoveUser(user.id)}
                        sx={{ ml: 1 }}
                      >
                        <PersonRemoveIcon />
                      </IconButton>
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
                {index < farmUsers.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUsersDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={openAddUserDialog} onClose={() => setOpenAddUserDialog(false)}>
        <DialogTitle>Add User to Farm</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleAddUser} sx={{ pt: 1 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>User</InputLabel>
              <Select
                value={addUserForm.user_id}
                onChange={(e) => setAddUserForm({ ...addUserForm, user_id: e.target.value })}
                label="User"
                required
              >
                {allUsers
                  .filter(u => !farmUsers.find(fu => fu.id === u.id))
                  .map(user => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.username} ({user.email})
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={addUserForm.role}
                onChange={(e) => setAddUserForm({ ...addUserForm, role: e.target.value })}
                label="Role"
              >
                <MenuItem value="worker">Worker</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Permissions (optional)"
              value={addUserForm.permissions}
              onChange={(e) => setAddUserForm({ ...addUserForm, permissions: e.target.value })}
              placeholder="e.g., read,write,delete"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddUserDialog(false)}>Cancel</Button>
          <Button onClick={handleAddUser} variant="contained">Add User</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
        <Alert severity="error" onClose={() => setError('')}>{error}</Alert>
      </Snackbar>
      
      <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess('')}>
        <Alert severity="success" onClose={() => setSuccess('')}>{success}</Alert>
      </Snackbar>
    </PageLayout>
  );
} 