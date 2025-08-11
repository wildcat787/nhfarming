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
  Card,
  CardContent,
  CardActions,
  Grid,
  useTheme,
  useMediaQuery,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Lock as LockIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  Agriculture as FarmIcon,
  SupervisorAccount as ManagerIcon,
  Work as WorkerIcon,
  ExpandMore as ExpandMoreIcon,
  Business as OwnerIcon
} from '@mui/icons-material';
import { useAuth } from './AuthContext';
import { apiRequest } from './api';

const EnhancedUsersPage = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [users, setUsers] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [farmAssignDialogOpen, setFarmAssignDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Form states
  const [editForm, setEditForm] = useState({ username: '', email: '', systemRole: '' });
  const [farmAssignForm, setFarmAssignForm] = useState({ farmId: '', farmRole: '' });
  const [addForm, setAddForm] = useState({
    username: '',
    email: '',
    password: '',
    systemRole: 'user',
    farmId: '',
    farmRole: ''
  });
  
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersResponse, farmsResponse] = await Promise.all([
        apiRequest('/admin/users-comprehensive', { method: 'GET' }),
        apiRequest('/admin/farms-for-assignment', { method: 'GET' })
      ]);
      setUsers(usersResponse);
      setFarms(farmsResponse);
      setError('');
    } catch (err) {
      setError('Failed to fetch data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditForm({
      username: user.username || '',
      email: user.email || '',
      systemRole: user.system_role || 'user'
    });
    setEditDialogOpen(true);
  };

  const handleFarmAssign = (user) => {
    setSelectedUser(user);
    setFarmAssignForm({ farmId: '', farmRole: '' });
    setFarmAssignDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      await apiRequest(`/admin/users/${selectedUser.id}`, { 
        method: 'PUT', 
        body: JSON.stringify(editForm) 
      });
      
      if (editForm.systemRole !== selectedUser.system_role) {
        await apiRequest('/admin/update-system-role', {
          method: 'PUT',
          body: JSON.stringify({ 
            userId: selectedUser.id, 
            systemRole: editForm.systemRole 
          })
        });
      }
      
      setSuccess('User updated successfully');
      setEditDialogOpen(false);
      fetchData();
    } catch (err) {
      setError('Failed to update user: ' + err.message);
    }
  };

  const handleFarmAssignSubmit = async () => {
    try {
      await apiRequest('/admin/assign-user-to-farm', {
        method: 'POST',
        body: JSON.stringify({
          userId: selectedUser.id,
          farmId: farmAssignForm.farmId,
          role: farmAssignForm.farmRole
        })
      });
      setSuccess('User assigned to farm successfully');
      setFarmAssignDialogOpen(false);
      fetchData();
    } catch (err) {
      setError('Failed to assign user to farm: ' + err.message);
    }
  };

  const handleRemoveFarmAssignment = async (userId, farmName) => {
    const farm = farms.find(f => f.name === farmName);
    if (!farm) return;
    
    try {
      await apiRequest('/admin/remove-user-from-farm', {
        method: 'DELETE',
        body: JSON.stringify({ userId, farmId: farm.id })
      });
      setSuccess('User removed from farm successfully');
      fetchData();
    } catch (err) {
      setError('Failed to remove user from farm: ' + err.message);
    }
  };

  const handleAddUserSubmit = async () => {
    if (!addForm.username || !addForm.email || !addForm.password) {
      setError('Username, email, and password are required');
      return;
    }

    try {
      const requestBody = {
        username: addForm.username,
        email: addForm.email,
        password: addForm.password,
        systemRole: addForm.systemRole
      };
      
      if (addForm.farmId && addForm.farmRole) {
        requestBody.farmId = addForm.farmId;
        requestBody.farmRole = addForm.farmRole;
      }

      await apiRequest('/admin/create-user-with-farm', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });
      
      setSuccess('User created successfully');
      setAddDialogOpen(false);
      setAddForm({
        username: '',
        email: '',
        password: '',
        systemRole: 'user',
        farmId: '',
        farmRole: ''
      });
      fetchData();
    } catch (err) {
      setError('Failed to create user: ' + err.message);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <AdminIcon sx={{ color: 'error.main' }} />;
      case 'owner': return <OwnerIcon sx={{ color: 'warning.main' }} />;
      case 'manager': return <ManagerIcon sx={{ color: 'info.main' }} />;
      case 'worker': return <WorkerIcon sx={{ color: 'success.main' }} />;
      default: return <PersonIcon sx={{ color: 'action.disabled' }} />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'owner': return 'warning';
      case 'manager': return 'info';
      case 'worker': return 'success';
      default: return 'default';
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

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4, px: { xs: 1, sm: 2 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          <AdminIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Enhanced User Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Chip label={`${users.length} Users`} color="primary" variant="outlined" />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddDialogOpen(true)}
          >
            Add User
          </Button>
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

      <Grid container spacing={3}>
        {users.map((user) => (
          <Grid item xs={12} md={6} lg={4} key={user.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {getRoleIcon(user.primary_role)}
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    {user.username}
                  </Typography>
                  <Chip 
                    label={user.system_role} 
                    size="small" 
                    color={getRoleColor(user.system_role)}
                    sx={{ ml: 'auto' }}
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {user.email || 'No email'}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle2" gutterBottom>
                  Farm Assignments:
                </Typography>
                
                {user.farm_assignments.length > 0 ? (
                  <Stack spacing={1}>
                    {user.farm_assignments.map((assignment, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="caption" display="block">
                            {assignment.farmName}
                          </Typography>
                          <Chip 
                            label={assignment.role} 
                            size="small" 
                            color={getRoleColor(assignment.role)}
                            icon={getRoleIcon(assignment.role)}
                          />
                        </Box>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveFarmAssignment(user.id, assignment.farmName)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No farm assignments
                  </Typography>
                )}
              </CardContent>
              
              <CardActions sx={{ justifyContent: 'space-around' }}>
                <Tooltip title="Edit User">
                  <IconButton onClick={() => handleEditUser(user)} color="primary">
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Assign to Farm">
                  <IconButton onClick={() => handleFarmAssign(user)} color="secondary">
                    <FarmIcon />
                  </IconButton>
                </Tooltip>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Username"
              value={editForm.username}
              onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>System Role</InputLabel>
              <Select
                value={editForm.systemRole}
                label="System Role"
                onChange={(e) => setEditForm({ ...editForm, systemRole: e.target.value })}
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

      {/* Farm Assignment Dialog */}
      <Dialog open={farmAssignDialogOpen} onClose={() => setFarmAssignDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign User to Farm</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Farm</InputLabel>
              <Select
                value={farmAssignForm.farmId}
                label="Farm"
                onChange={(e) => setFarmAssignForm({ ...farmAssignForm, farmId: e.target.value })}
              >
                {farms.map((farm) => (
                  <MenuItem key={farm.id} value={farm.id}>
                    {farm.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Farm Role</InputLabel>
              <Select
                value={farmAssignForm.farmRole}
                label="Farm Role"
                onChange={(e) => setFarmAssignForm({ ...farmAssignForm, farmRole: e.target.value })}
              >
                <MenuItem value="owner">Owner</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
                <MenuItem value="worker">Worker</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFarmAssignDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleFarmAssignSubmit} variant="contained">Assign</Button>
        </DialogActions>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Username"
              value={addForm.username}
              onChange={(e) => setAddForm({ ...addForm, username: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Email"
              type="email"
              value={addForm.email}
              onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Password"
              type="password"
              value={addForm.password}
              onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
              fullWidth
              required
            />
            <FormControl fullWidth>
              <InputLabel>System Role</InputLabel>
              <Select
                value={addForm.systemRole}
                label="System Role"
                onChange={(e) => setAddForm({ ...addForm, systemRole: e.target.value })}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
            
            <Divider />
            <Typography variant="subtitle2">Optional: Assign to Farm</Typography>
            
            <FormControl fullWidth>
              <InputLabel>Farm (Optional)</InputLabel>
              <Select
                value={addForm.farmId}
                label="Farm (Optional)"
                onChange={(e) => setAddForm({ ...addForm, farmId: e.target.value })}
              >
                <MenuItem value="">No farm assignment</MenuItem>
                {farms.map((farm) => (
                  <MenuItem key={farm.id} value={farm.id}>
                    {farm.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {addForm.farmId && (
              <FormControl fullWidth>
                <InputLabel>Farm Role</InputLabel>
                <Select
                  value={addForm.farmRole}
                  label="Farm Role"
                  onChange={(e) => setAddForm({ ...addForm, farmRole: e.target.value })}
                >
                  <MenuItem value="owner">Owner</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                  <MenuItem value="worker">Worker</MenuItem>
                </Select>
              </FormControl>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddUserSubmit} variant="contained">Create User</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EnhancedUsersPage;
