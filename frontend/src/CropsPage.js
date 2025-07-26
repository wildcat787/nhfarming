import React, { useState, useEffect } from 'react';
import { apiRequest } from './api';
import {
  Box, Button, TextField, Typography, Alert, Paper, Grid, Snackbar, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import VoiceInputButton from './VoiceInputButton';

export default function CropsPage() {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ crop_type: '', field_name: '', planting_date: '', harvest_date: '', notes: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteId, setDeleteId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [applications, setApplications] = useState([]);
  const [selectedCropId, setSelectedCropId] = useState(null);
  const [inputs, setInputs] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const fetchCrops = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/crops');
      setCrops(data);
      // If a crop is selected, keep it selected if it still exists
      if (selectedCropId && !data.find(c => c.id === selectedCropId)) {
        setSelectedCropId(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const data = await apiRequest('/applications');
      setApplications(data);
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    }
  };

  const fetchInputs = async () => {
    try {
      const data = await apiRequest('/inputs');
      setInputs(data);
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    }
  };

  const fetchVehicles = async () => {
    try {
      const data = await apiRequest('/vehicles');
      setVehicles(data);
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    }
  };

  useEffect(() => { fetchCrops(); }, []);
  useEffect(() => { fetchApplications(); }, []);
  useEffect(() => { fetchInputs(); }, []);
  useEffect(() => { fetchVehicles(); }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async e => {
    e.preventDefault();
    setError('');
    try {
      await apiRequest('/crops', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setForm({ crop_type: '', field_name: '', planting_date: '', harvest_date: '', notes: '' });
      fetchCrops();
      setSnackbar({ open: true, message: 'Crop added!', severity: 'success' });
    } catch (err) {
      setError(err.message);
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    }
  };

  const handleDelete = id => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await apiRequest(`/crops/${deleteId}`, { method: 'DELETE' });
      fetchCrops();
      setSnackbar({ open: true, message: 'Crop deleted!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
      setDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  // Helper: group applications by date
  function groupByDate(apps) {
    const groups = {};
    apps.forEach(app => {
      if (!groups[app.date]) groups[app.date] = [];
      groups[app.date].push(app);
    });
    // Sort dates descending (most recent first)
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }

  return (
    <Box>
      <Typography variant="h4" mb={3}>Crops</Typography>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" mb={2}>Add Crop</Typography>
        <form onSubmit={handleAdd}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField name="crop_type" label="Crop Type" value={form.crop_type} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="field_name" label="Field Name" value={form.field_name} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="planting_date" label="Planting Date (YYYY-MM-DD)" value={form.planting_date} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="harvest_date" label="Harvest Date (YYYY-MM-DD)" value={form.harvest_date} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12}>
              <TextField name="notes" label="Notes" value={form.notes} onChange={handleChange} fullWidth />
              <VoiceInputButton onResult={text => setForm(f => ({ ...f, notes: (f.notes ? f.notes + ' ' : '') + text }))} />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary" startIcon={<AddIcon />}>Add Crop</Button>
            </Grid>
          </Grid>
        </form>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </Paper>
      <Typography variant="h6" mb={2}>Your Crops</Typography>
      {loading ? <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}><CircularProgress /></Box> : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Crop Type</TableCell>
                <TableCell>Field Name</TableCell>
                <TableCell>Planting Date</TableCell>
                <TableCell>Harvest Date</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {crops.map(crop => (
                <TableRow
                  key={crop.id}
                  hover
                  selected={selectedCropId === crop.id}
                  onClick={() => setSelectedCropId(crop.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <TableCell>{crop.crop_type}</TableCell>
                  <TableCell>{crop.field_name}</TableCell>
                  <TableCell>{crop.planting_date}</TableCell>
                  <TableCell>{crop.harvest_date}</TableCell>
                  <TableCell>{crop.notes}</TableCell>
                  <TableCell align="right">
                    <IconButton color="error" onClick={e => { e.stopPropagation(); handleDelete(crop.id); }}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {selectedCropId && (
        <Box mt={4}>
          <Typography variant="h6" mb={2}>
            Applications for: {crops.find(c => c.id === selectedCropId)?.crop_type} ({crops.find(c => c.id === selectedCropId)?.field_name})
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Input</TableCell>
                  <TableCell>Rate</TableCell>
                  <TableCell>Unit</TableCell>
                  <TableCell>Weather</TableCell>
                  <TableCell>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {groupByDate(applications.filter(app => String(app.crop_id) === String(selectedCropId))).map(([date, apps]) => [
                  <TableRow key={date} style={{ background: '#f5f5f5' }}>
                    <TableCell colSpan={6} style={{ fontWeight: 'bold' }}>{date}</TableCell>
                  </TableRow>,
                  ...apps.map(app => (
                    <TableRow key={app.id}>
                      <TableCell></TableCell>
                      <TableCell>{inputs.find(i => i.id === app.input_id)?.name || app.input_id}</TableCell>
                      <TableCell>{app.rate}</TableCell>
                      <TableCell>{app.unit}</TableCell>
                      <TableCell>{app.weather_temp}°C, {app.weather_humidity}% RH, {app.weather_wind} km/h, {app.weather_rain} mm</TableCell>
                      <TableCell>{app.notes}</TableCell>
                    </TableRow>
                  ))
                ])}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Crop?</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete this crop?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" onClick={confirmDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 