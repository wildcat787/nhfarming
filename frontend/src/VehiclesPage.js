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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', make: '', model: '', year: '', vin: '', notes: '', application_type: '', type: '' });
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

  useEffect(() => { fetchVehicles(); }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async e => {
    e.preventDefault();
    try {
      await apiRequest('/vehicles', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setForm({ name: '', make: '', model: '', year: '', vin: '', notes: '', application_type: '', type: '' });
      fetchVehicles();
      setSnackbar({ open: true, message: 'Vehicle added!', severity: 'success' });
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
      vin: vehicle.vin,
      notes: vehicle.notes,
      application_type: vehicle.application_type || '',
      type: vehicle.type || '',
    });
  };

  const handleUpdate = async e => {
    e.preventDefault();
    try {
      await apiRequest(`/vehicles/${editVehicle.id}`, {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      setEditVehicle(null);
      setForm({ name: '', make: '', model: '', year: '', vin: '', notes: '', application_type: '', type: '' });
      fetchVehicles();
      setSnackbar({ open: true, message: 'Vehicle updated!', severity: 'success' });
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
            <Typography variant="body2" color="text.secondary">
              Model: <strong>{vehicle.model || 'N/A'}</strong>
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Year: <strong>{vehicle.year || 'N/A'}</strong>
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Type: <strong>{vehicle.type || 'N/A'}</strong>
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
          <Typography variant="caption" color="text.secondary" display="block">
            VIN: {vehicle.vin}
          </Typography>
        )}
        
        {vehicle.notes && (
          <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
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
      <SectionLayout title={editVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}>
        <Box component="form" onSubmit={editVehicle ? handleUpdate : handleAdd}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                size="small"
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
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Type"
                name="type"
                value={form.type}
                onChange={handleChange}
                size="small"
              >
                {vehicleTypes.map(type => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
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
                {applicationTypes.map(type => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
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
                rows={2}
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Button type="submit" variant="contained" color="primary">
                  {editVehicle ? 'Update' : 'Add'} Vehicle
                </Button>
                {editVehicle && (
                  <Button 
                    variant="outlined" 
                    onClick={() => {
                      setEditVehicle(null);
                      setForm({ name: '', make: '', model: '', year: '', vin: '', notes: '', application_type: '', type: '' });
                    }}
                  >
                    Cancel
                  </Button>
                )}

              </Box>
            </Grid>
          </Grid>
        </Box>
      </SectionLayout>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
          <CircularProgress />
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