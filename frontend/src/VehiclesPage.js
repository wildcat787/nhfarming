import React, { useState, useEffect } from 'react';
import { apiRequest } from './api';
import {
  Box, Button, TextField, Typography, Grid, Snackbar, CircularProgress, 
  IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, 
  MenuItem, Card, CardContent, CardActions, Chip, useTheme, useMediaQuery
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import BuildIcon from '@mui/icons-material/Build';
import WorkIcon from '@mui/icons-material/Work';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import { useNavigate } from 'react-router-dom';
import PageLayout, { SectionLayout, CardLayout } from './components/PageLayout';

import VehicleJobsModal from './VehicleJobsModal';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ 
    name: '', 
    make: '', 
    model: '', 
    year: '', 
    vin: '', 
    notes: '', 
    application_type: '', 
    type: '',
    farm_id: ''
  });
  const [editVehicle, setEditVehicle] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteVehicle, setDeleteVehicle] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobsModalOpen, setJobsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const applicationTypes = [
    'spraying',
    'seeding',
    'fertilizing',
    'harvesting',
    'tillage',
    'spreading',
    'mowing',
    'transport',
    'bailing',
    'general use',
    'other',
  ];

  const vehicleTypes = [
    'tractor',
    'sprayer',
    'harvester',
    'planter',
    'spreader',
    'truck',
    'baler',
    'mower',
    'trailer',
    'other',
  ];

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/vehicles');
      setVehicles(data);
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchFarms = async () => {
    try {
      const data = await apiRequest('/farms');
      setFarms(data);
    } catch (err) {
      console.error('Failed to fetch farms:', err);
    }
  };

  useEffect(() => { 
    fetchVehicles(); 
    fetchFarms();
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async e => {
    e.preventDefault();
    if (!form.farm_id) {
      setSnackbar({ open: true, message: 'Please select a farm', severity: 'error' });
      return;
    }
    try {
      await apiRequest('/vehicles', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setForm({ name: '', make: '', model: '', year: '', vin: '', notes: '', application_type: '', type: '', farm_id: '' });
      setShowForm(false);
      fetchVehicles();
      setSnackbar({ open: true, message: 'Vehicle added successfully!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    }
  };

  const handleEdit = vehicle => {
    setEditVehicle(vehicle);
    setForm({
      name: vehicle.name,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      farm_id: vehicle.farm_id || '',
      vin: vehicle.vin,
      notes: vehicle.notes,
      application_type: vehicle.application_type || '',
      type: vehicle.type || '',
    });
    setShowForm(true);
  };

  const handleUpdate = async e => {
    e.preventDefault();
    try {
      await apiRequest(`/vehicles/${editVehicle.id}`, {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      setEditVehicle(null);
      setForm({ name: '', make: '', model: '', year: '', vin: '', notes: '', application_type: '', type: '', farm_id: '' });
      setShowForm(false);
      fetchVehicles();
      setSnackbar({ open: true, message: 'Vehicle updated successfully!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    }
  };

  const handleDelete = vehicle => {
    setDeleteVehicle(vehicle);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await apiRequest(`/vehicles/${deleteVehicle.id}`, { method: 'DELETE' });
      fetchVehicles();
      setSnackbar({ open: true, message: 'Vehicle deleted!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
      setDeleteDialogOpen(false);
      setDeleteVehicle(null);
    }
  };

  const handleViewJobs = (vehicle) => {
    setSelectedVehicle(vehicle);
    setJobsModalOpen(true);
  };

  const handleViewMaintenance = (vehicle) => {
    navigate(`/maintenance/${encodeURIComponent(vehicle.name)}`);
  };

  const VehicleCard = ({ vehicle }) => (
    <CardLayout>
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <DirectionsCarIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
            {vehicle.name}
          </Typography>
        </Box>
        
        <Grid container spacing={1} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Make: <strong>{vehicle.make || 'N/A'}</strong>
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" sx={{ color: '#637381' }}>
              Model: <strong style={{ color: '#1a2027' }}>{vehicle.model || 'N/A'}</strong>
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" sx={{ color: '#637381' }}>
              Year: <strong style={{ color: '#1a2027' }}>{vehicle.year || 'N/A'}</strong>
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" sx={{ color: '#637381' }}>
              Type: <strong style={{ color: '#1a2027' }}>{vehicle.type || 'N/A'}</strong>
            </Typography>
          </Grid>
        </Grid>
        
        {vehicle.application_type && (
          <Chip 
            label={vehicle.application_type} 
            color="primary" 
            size="small" 
            sx={{ mb: 1 }}
          />
        )}
        
        {vehicle.vin && (
          <Typography variant="caption" sx={{ color: '#637381' }} display="block">
            VIN: {vehicle.vin}
          </Typography>
        )}
        
        {vehicle.notes && (
          <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic', color: '#1a2027' }}>
            {vehicle.notes}
          </Typography>
        )}
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 'auto', pt: 2 }}>
        <IconButton 
          color="primary" 
          onClick={() => handleViewJobs(vehicle)} 
          title="View Jobs"
          size="small"
        >
          <WorkIcon />
        </IconButton>
        <IconButton 
          color="primary" 
          onClick={() => handleViewMaintenance(vehicle)} 
          title="View Maintenance"
          size="small"
        >
          <BuildIcon />
        </IconButton>
        <IconButton 
          color="primary" 
          onClick={() => handleEdit(vehicle)}
          title="Edit"
          size="small"
        >
          <EditIcon />
        </IconButton>
        <IconButton 
          color="error" 
          onClick={() => handleDelete(vehicle)}
          title="Delete"
          size="small"
        >
          <DeleteIcon />
        </IconButton>
      </Box>
    </CardLayout>
  );

  return (
    <PageLayout 
      title="🚜 Vehicles" 
      subtitle="Manage your farm vehicles and equipment"
    >
      {showForm && (
        <SectionLayout title={editVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}>
          <Box component="form" onSubmit={editVehicle ? handleUpdate : handleAdd}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Name *"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  size="small"
                  placeholder="e.g., John Deere 5075E"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: theme.palette.background.paper
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Make"
                  name="make"
                  value={form.make}
                  onChange={handleChange}
                  size="small"
                  placeholder="e.g., John Deere"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: theme.palette.background.paper
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Model"
                  name="model"
                  value={form.model}
                  onChange={handleChange}
                  size="small"
                  placeholder="e.g., 5075E"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Year"
                  name="year"
                  type="number"
                  value={form.year}
                  onChange={handleChange}
                  size="small"
                  placeholder="e.g., 2020"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="VIN"
                  name="vin"
                  value={form.vin}
                  onChange={handleChange}
                  size="small"
                  placeholder="Vehicle Identification Number"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Vehicle Type"
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  size="small"
                >
                  <MenuItem value="">Select type</MenuItem>
                  {vehicleTypes.map(type => (
                    <MenuItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Application Type"
                  name="application_type"
                  value={form.application_type}
                  onChange={handleChange}
                  size="small"
                >
                  <MenuItem value="">Select application type</MenuItem>
                  {applicationTypes.map(type => (
                    <MenuItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Farm *"
                  name="farm_id"
                  value={form.farm_id}
                  onChange={handleChange}
                  required
                  size="small"
                >
                  <MenuItem value="">Select farm</MenuItem>
                  {farms.map(farm => (
                    <MenuItem key={farm.id} value={farm.id}>{farm.name}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  size="small"
                  placeholder="Additional notes about the vehicle..."
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button 
                    variant="outlined" 
                    onClick={() => {
                      setShowForm(false);
                      setEditVehicle(null);
                      setForm({ name: '', make: '', model: '', year: '', vin: '', notes: '', application_type: '', type: '', farm_id: '' });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary"
                    startIcon={<AddIcon />}
                  >
                    {editVehicle ? 'Update' : 'Add'} Vehicle
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </SectionLayout>
      )}

      <SectionLayout title="Your Vehicles">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Vehicles ({vehicles.length})</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowForm(true)}
            disabled={showForm}
          >
            Add Vehicle
          </Button>
        </Box>
        
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        ) : vehicles.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No vehicles found. Add your first vehicle to get started.
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setShowForm(true)}
              sx={{ mt: 2 }}
            >
              Add First Vehicle
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {vehicles.map(vehicle => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={vehicle.id}>
                <VehicleCard vehicle={vehicle} />
              </Grid>
            ))}
          </Grid>
        )}
      </SectionLayout>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
      
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Vehicle?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{deleteVehicle?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" onClick={confirmDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
      
      <VehicleJobsModal 
        open={jobsModalOpen}
        onClose={() => setJobsModalOpen(false)}
        vehicle={selectedVehicle}
      />
    </PageLayout>
  );
} 