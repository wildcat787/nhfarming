import React, { useState, useEffect } from 'react';
import { apiRequest } from './api';
import {
  Box, Button, TextField, Typography, Paper, Grid, Snackbar, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useParams, useNavigate } from 'react-router-dom';
import VoiceInputButton from './VoiceInputButton';

export default function MaintenancePage() {
  const { vehicleName } = useParams();
  const navigate = useNavigate();
  const [maintenance, setMaintenance] = useState([]);
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ date: '', description: '', cost: '', notes: '' });
  const [editId, setEditId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteId, setDeleteId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const fetchVehicle = async () => {
    try {
      const vehicleData = await apiRequest(`/vehicles/name/${vehicleName}`);
      setVehicle(vehicleData);
    } catch (err) {
      setSnackbar({ open: true, message: 'Vehicle not found', severity: 'error' });
      navigate('/vehicles');
    }
  };

  const fetchMaintenance = async () => {
    setLoading(true);
    try {
      const data = await apiRequest(`/maintenance/${encodeURIComponent(vehicleName)}`);
      setMaintenance(data);
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchVehicle();
  }, [vehicleName]);

  useEffect(() => { 
    if (vehicle) {
      fetchMaintenance();
    }
  }, [vehicle]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async e => {
    e.preventDefault();
    try {
      await apiRequest('/maintenance', {
        method: 'POST',
        body: JSON.stringify({ ...form, vehicle_id: vehicle.id }),
      });
      setForm({ date: '', description: '', cost: '', notes: '' });
      fetchMaintenance();
      setSnackbar({ open: true, message: 'Maintenance added!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    }
  };

  const handleEdit = record => {
    setEditId(record.id);
    setForm({ date: record.date, description: record.description, cost: record.cost, notes: record.notes });
  };

  const handleUpdate = async e => {
    e.preventDefault();
    try {
      await apiRequest(`/maintenance/${editId}`, {
        method: 'PUT',
        body: JSON.stringify({ ...form, vehicle_id: vehicle.id }),
      });
      setEditId(null);
      setForm({ date: '', description: '', cost: '', notes: '' });
      fetchMaintenance();
      setSnackbar({ open: true, message: 'Maintenance updated!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    }
  };

  const handleDelete = id => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await apiRequest(`/maintenance/${deleteId}`, { method: 'DELETE' });
      fetchMaintenance();
      setSnackbar({ open: true, message: 'Maintenance deleted!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
      setDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString();
  };

  const getStatusColor = (date) => {
    if (!date) return 'default';
    const maintenanceDate = new Date(date);
    const today = new Date();
    if (maintenanceDate > today) return 'primary'; // Future
    if (maintenanceDate.toDateString() === today.toDateString()) return 'success'; // Today
    return 'default'; // Past
  };

  if (!vehicle) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/vehicles')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h4">Maintenance</Typography>
          <Typography variant="h6" color="text.secondary">
            {vehicle.name} • {vehicle.make} {vehicle.model} {vehicle.year}
          </Typography>
        </Box>
      </Box>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" mb={2}>{editId ? 'Edit Maintenance' : 'Add Maintenance'}</Typography>
        <form onSubmit={editId ? handleUpdate : handleAdd}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField name="date" label="Date (YYYY-MM-DD)" value={form.date} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="description" label="Description" value={form.description} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="cost" label="Cost" value={form.cost} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="notes" label="Notes" value={form.notes} onChange={handleChange} fullWidth />
              <VoiceInputButton onResult={text => setForm(f => ({ ...f, notes: (f.notes ? f.notes + ' ' : '') + text }))} />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary" startIcon={editId ? <EditIcon /> : <AddIcon />}>{editId ? 'Update' : 'Add'} Maintenance</Button>
              {editId && <Button sx={{ ml: 2 }} onClick={() => { setEditId(null); setForm({ date: '', description: '', cost: '', notes: '' }); }}>Cancel</Button>}
            </Grid>
          </Grid>
        </form>
      </Paper>
      <Typography variant="h6" mb={2}>Maintenance Records</Typography>
      {loading ? <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}><CircularProgress /></Box> : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Cost</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {maintenance.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body2" color="text.secondary" py={4}>
                      No maintenance records found for this vehicle.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                maintenance.map(record => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <Chip 
                        label={formatDate(record.date)} 
                        color={getStatusColor(record.date)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{record.description}</TableCell>
                    <TableCell>${record.cost || '0'}</TableCell>
                    <TableCell>{record.notes}</TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => handleEdit(record)}><EditIcon /></IconButton>
                      <IconButton color="error" onClick={() => handleDelete(record.id)}><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
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
        <DialogTitle>Delete Maintenance?</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete this maintenance record?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" onClick={confirmDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 