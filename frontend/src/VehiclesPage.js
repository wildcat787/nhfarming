import React, { useState, useEffect } from 'react';
import { apiRequest } from './api';
import {
  Box, Button, TextField, Typography, Paper, Grid, Snackbar, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, MenuItem
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import BuildIcon from '@mui/icons-material/Build';
import WorkIcon from '@mui/icons-material/Work';
import { useNavigate } from 'react-router-dom';
import VoiceInputButton from './VoiceInputButton';
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
      await apiRequest(`/vehicles/name/${encodeURIComponent(editVehicle.name)}`, {
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
      await apiRequest(`/vehicles/name/${encodeURIComponent(deleteVehicle.name)}`, { method: 'DELETE' });
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

  return (
    <Box>
      <Typography variant="h4" mb={3}>Vehicles</Typography>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" mb={2}>{editVehicle ? 'Edit Vehicle' : 'Add Vehicle'}</Typography>
        <form onSubmit={editVehicle ? handleUpdate : handleAdd}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField name="name" label="Name" value={form.name} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="make" label="Make" value={form.make} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="model" label="Model" value={form.model} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="year" label="Year" value={form.year} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="vin" label="VIN" value={form.vin} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="notes" label="Notes" value={form.notes} onChange={handleChange} fullWidth />
              <VoiceInputButton onResult={text => setForm(f => ({ ...f, notes: (f.notes ? f.notes + ' ' : '') + text }))} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="application_type"
                label="Application Type"
                value={form.application_type || ''}
                onChange={handleChange}
                select
                fullWidth
              >
                <MenuItem value="">None</MenuItem>
                {applicationTypes.map(type => (
                  <MenuItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="type"
                label="Vehicle Type"
                value={form.type || ''}
                onChange={handleChange}
                select
                fullWidth
              >
                <MenuItem value="">None</MenuItem>
                {vehicleTypes.map(type => (
                  <MenuItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary" startIcon={editVehicle ? <EditIcon /> : <AddIcon />}>{editVehicle ? 'Update' : 'Add'} Vehicle</Button>
              {editVehicle && <Button sx={{ ml: 2 }} onClick={() => { setEditVehicle(null); setForm({ name: '', make: '', model: '', year: '', vin: '', notes: '', application_type: '', type: '' }); }}>Cancel</Button>}
            </Grid>
          </Grid>
        </form>
      </Paper>
      <Typography variant="h6" mb={2}>Your Vehicles</Typography>
      {loading ? <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}><CircularProgress /></Box> : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Make</TableCell>
                <TableCell>Model</TableCell>
                <TableCell>Year</TableCell>
                <TableCell>VIN</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell>Application Type</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vehicles.map(vehicle => (
                <TableRow key={vehicle.id}>
                  <TableCell>{vehicle.name}</TableCell>
                  <TableCell>{vehicle.make}</TableCell>
                  <TableCell>{vehicle.model}</TableCell>
                  <TableCell>{vehicle.year}</TableCell>
                  <TableCell>{vehicle.vin}</TableCell>
                  <TableCell>{vehicle.notes}</TableCell>
                  <TableCell>{vehicle.application_type}</TableCell>
                  <TableCell>{vehicle.type}</TableCell>
                  <TableCell align="right">
                    <IconButton 
                      color="primary" 
                      onClick={() => handleViewJobs(vehicle)} 
                      title="View Jobs"
                    >
                      <WorkIcon />
                    </IconButton>
                    <IconButton 
                      color="primary" 
                      onClick={() => handleViewMaintenance(vehicle)} 
                      title="View Maintenance"
                    >
                      <BuildIcon />
                    </IconButton>
                    <IconButton color="primary" onClick={() => handleEdit(vehicle)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(vehicle)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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
    </Box>
  );
} 