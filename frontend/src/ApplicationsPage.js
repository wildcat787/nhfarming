import React, { useState, useEffect } from 'react';
import { apiRequest } from './api';
import {
  Box, Button, TextField, Typography, Alert, Paper, Grid, Snackbar, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, MenuItem, Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';


export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [inputs, setInputs] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ crop_id: '', field_id: '', input_id: '', date: '', rate: '', unit: '', weather_temp: '', weather_humidity: '', weather_wind: '', weather_rain: '', notes: '', application_type: '', type: '' });
  const [editId, setEditId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteId, setDeleteId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCropId, setSelectedCropId] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [fields, setFields] = useState([]);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [ecowittConfig, setEcowittConfig] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [apps, ins, crs, vhs, flds] = await Promise.all([
        apiRequest('/applications'),
        apiRequest('/inputs'),
        apiRequest('/crops'),
        apiRequest('/vehicles'),
        apiRequest('/fields'),
      ]);
      setApplications(apps);
      setInputs(ins);
      setCrops(crs);
      setVehicles(vhs);
      setFields(flds);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchAll(); 
    checkEcowittConfig();
  }, []);

  // Check if Ecowitt weather station is configured
  const checkEcowittConfig = async () => {
    try {
      const config = await apiRequest('/ecowitt/config');
      setEcowittConfig(config);
    } catch (error) {
      console.log('Ecowitt not configured:', error.message);
      setEcowittConfig({ available: false });
    }
  };

  // Fetch current weather from Ecowitt station
  const fetchCurrentWeather = async () => {
    setWeatherLoading(true);
    try {
      const weather = await apiRequest('/ecowitt/current');
      setForm(prev => ({
        ...prev,
        weather_temp: weather.temperature ? weather.temperature.toFixed(1) : '',
        weather_humidity: weather.humidity ? weather.humidity.toFixed(1) : '',
        weather_wind: weather.wind_speed ? weather.wind_speed.toFixed(1) : '',
        weather_rain: weather.rainfall ? weather.rainfall.toFixed(1) : ''
      }));
      setSnackbar({
        open: true,
        message: `Weather data fetched from ${weather.source === 'local_ecowitt' ? 'local' : 'cloud'} Ecowitt station`,
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Failed to fetch weather: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setWeatherLoading(false);
    }
  };

  // Fetch historical weather for a specific date
  const fetchHistoricalWeather = async (date) => {
    if (!date) return;
    
    setWeatherLoading(true);
    try {
      const weather = await apiRequest(`/ecowitt/historical/${date}`);
      setForm(prev => ({
        ...prev,
        weather_temp: weather.temperature ? weather.temperature.toFixed(1) : '',
        weather_humidity: weather.humidity ? weather.humidity.toFixed(1) : '',
        weather_wind: weather.wind_speed ? weather.wind_speed.toFixed(1) : '',
        weather_rain: weather.rainfall ? weather.rainfall.toFixed(1) : ''
      }));
      setSnackbar({
        open: true,
        message: `Historical weather data fetched for ${date}`,
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Failed to fetch historical weather: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setWeatherLoading(false);
    }
  };

  // Auto-select vehicle based on input type
  function autoSelectVehicle(inputId) {
    const input = inputs.find(i => String(i.id) === String(inputId));
    if (!input) return;
    // Special case: harvesting
    if (input.type === 'harvesting') {
      const lexi = vehicles.find(v => v.name && v.name.toLowerCase() === 'lexi');
      if (lexi) {
        setForm(f => ({ ...f, vehicle_id: lexi.id }));
        return;
      }
    }
    // Prefer vehicle with matching application_type
    const match = vehicles.find(v => v.application_type === input.type);
    if (match) {
      setForm(f => ({ ...f, vehicle_id: match.id }));
      return;
    }
    // Fallback to keyword mapping for legacy support
    let keyword = '';
    if (input.type === 'chemical') keyword = 'spray';
    else if (input.type === 'seed') keyword = 'seed';
    else if (input.type === 'fertilizer') keyword = 'spread';
    if (input.type === 'fertilizer') keyword = 'fertilizer';
    if (input.type === 'seed') keyword = 'planter';
    if (keyword) {
      const match2 = vehicles.find(v =>
        (v.name && v.name.toLowerCase().includes(keyword)) ||
        (v.model && v.model.toLowerCase().includes(keyword))
      );
      if (match2) {
        setForm(f => ({ ...f, vehicle_id: match2.id }));
        return;
      }
    }
    // If no match, clear vehicle selection
    setForm(f => ({ ...f, vehicle_id: '' }));
  }

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === 'input_id') {
      autoSelectVehicle(value);
    }
    // Auto-fetch historical weather when date is selected and Ecowitt is available
    if (name === 'date' && value && ecowittConfig?.available) {
      fetchHistoricalWeather(value);
    }
  };

  const handleAdd = async e => {
    e.preventDefault();
    setError('');
    try {
      await apiRequest('/applications', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setForm({ crop_id: '', input_id: '', date: '', rate: '', unit: '', weather_temp: '', weather_humidity: '', weather_wind: '', weather_rain: '', notes: '', application_type: '', type: '' });
      fetchAll();
      setSnackbar({ open: true, message: 'Application added!', severity: 'success' });
    } catch (err) {
      setError(err.message);
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    }
  };

  const handleEdit = app => {
    setEditId(app.id);
    setForm({
      crop_id: app.crop_id || '',
      input_id: app.input_id || '',
      date: app.date || '',
      rate: app.rate || '',
      unit: app.unit || '',
      weather_temp: app.weather_temp || '',
      weather_humidity: app.weather_humidity || '',
      weather_wind: app.weather_wind || '',
      weather_rain: app.weather_rain || '',
      notes: app.notes || '',
      application_type: app.application_type || '',
      type: app.type || '',
    });
  };

  const handleUpdate = async e => {
    e.preventDefault();
    setError('');
    try {
      await apiRequest(`/applications/${editId}`, {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      setEditId(null);
      setForm({ crop_id: '', input_id: '', date: '', rate: '', unit: '', weather_temp: '', weather_humidity: '', weather_wind: '', weather_rain: '', notes: '', application_type: '', type: '' });
      fetchAll();
      setSnackbar({ open: true, message: 'Application updated!', severity: 'success' });
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
      await apiRequest(`/applications/${deleteId}`, { method: 'DELETE' });
      fetchAll();
      setSnackbar({ open: true, message: 'Application deleted!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
      setDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  // Filter applications by selected crop
  const filteredApplications = selectedCropId
    ? applications.filter(app => String(app.crop_id) === String(selectedCropId))
    : applications;

  return (
    <Box>
      <Typography variant="h4" mb={3}>Applications</Typography>
      <Box mb={2}>
        <TextField
          select
          label="Filter by Crop"
          value={selectedCropId}
          onChange={e => setSelectedCropId(e.target.value)}
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="">All Crops</MenuItem>
          {crops.map(crop => (
            <MenuItem key={crop.id} value={crop.id}>
              {crop.crop_type} ({fields.find(f => f.id === crop.field_id)?.name || crop.field_name})
            </MenuItem>
          ))}
        </TextField>
      </Box>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" mb={2}>{editId ? 'Edit Application' : 'Add Application'}</Typography>
        <form onSubmit={editId ? handleUpdate : handleAdd}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField name="crop_id" label="Crop" value={form.crop_id} onChange={handleChange} select fullWidth>
                <MenuItem value="">None</MenuItem>
                {crops.map(crop => (
                  <MenuItem key={crop.id} value={crop.id}>
                    {crop.crop_type} ({fields.find(f => f.id === crop.field_id)?.name || crop.field_name})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="field_id" label="Field" value={form.field_id} onChange={handleChange} select fullWidth>
                <MenuItem value="">Select field (optional)</MenuItem>
                {fields.map(field => (
                  <MenuItem key={field.id} value={field.id}>
                    {field.name} ({field.area} {field.area_unit})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="input_id" label="Input" value={form.input_id} onChange={handleChange} select fullWidth required>
                {inputs.map(input => (
                  <MenuItem key={input.id} value={input.id}>{input.name}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="date" label="Date (YYYY-MM-DD)" value={form.date} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="rate" label="Rate" value={form.rate} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="unit" label="Unit" value={form.unit} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField name="weather_temp" label="Weather Temp (°C)" value={form.weather_temp} onChange={handleChange} fullWidth />
                {ecowittConfig?.available && (
                  <Tooltip title="Fetch current weather from Ecowitt station">
                    <IconButton 
                      onClick={fetchCurrentWeather} 
                      disabled={weatherLoading}
                      color="primary"
                      size="small"
                    >
                      {weatherLoading ? <CircularProgress size={20} /> : <CloudDownloadIcon />}
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="weather_humidity" label="Weather Humidity (%)" value={form.weather_humidity} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="weather_wind" label="Weather Wind (km/h)" value={form.weather_wind} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="weather_rain" label="Weather Rain (mm)" value={form.weather_rain} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="start_time" label="Start Time (e.g. 08:00)" value={form.start_time || ''} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="finish_time" label="Finish Time (e.g. 10:30)" value={form.finish_time || ''} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="vehicle_id" label="Machine" value={form.vehicle_id || ''} onChange={handleChange} select fullWidth>
                <MenuItem value="">None</MenuItem>
                {vehicles.map(vehicle => (
                  <MenuItem key={vehicle.id} value={vehicle.id}>{vehicle.name}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField name="notes" label="Notes" value={form.notes} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary" startIcon={editId ? <EditIcon /> : <AddIcon />}>{editId ? 'Update' : 'Add'} Application</Button>
              {editId && <Button sx={{ ml: 2 }} onClick={() => { setEditId(null); setForm({ crop_id: '', field_id: '', input_id: '', date: '', rate: '', unit: '', weather_temp: '', weather_humidity: '', weather_wind: '', weather_rain: '', notes: '', application_type: '', type: '' }); }}>Cancel</Button>}
            </Grid>
          </Grid>
        </form>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </Paper>
      <Typography variant="h6" mb={2}>Your Applications</Typography>
      {loading ? <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}><CircularProgress /></Box> : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Crop</TableCell>
                <TableCell>Field</TableCell>
                <TableCell>Input</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Rate</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell>Weather</TableCell>
                <TableCell>Start</TableCell>
                <TableCell>Finish</TableCell>
                <TableCell>Machine</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredApplications.map(app => (
                <TableRow key={app.id}>
                  <TableCell>{crops.find(c => c.id === app.crop_id)?.crop_type || 'N/A'}</TableCell>
                  <TableCell>
                    {app.field_id 
                      ? fields.find(f => f.id === app.field_id)?.name 
                      : crops.find(c => c.id === app.crop_id)?.field_id 
                        ? fields.find(f => f.id === crops.find(c => c.id === app.crop_id)?.field_id)?.name 
                        : 'N/A'
                    }
                  </TableCell>
                  <TableCell>{inputs.find(i => i.id === app.input_id)?.name || 'Input'}</TableCell>
                  <TableCell>{app.date}</TableCell>
                  <TableCell>{app.rate}</TableCell>
                  <TableCell>{app.unit}</TableCell>
                  <TableCell>{app.weather_temp}°C, {app.weather_humidity}% RH, {app.weather_wind} km/h, {app.weather_rain} mm</TableCell>
                  <TableCell>{app.start_time}</TableCell>
                  <TableCell>{app.finish_time}</TableCell>
                  <TableCell>{vehicles.find(v => v.id === app.vehicle_id)?.name || ''}</TableCell>
                  <TableCell>{app.notes}</TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => handleEdit(app)}><EditIcon /></IconButton>
                    <IconButton color="error" onClick={() => handleDelete(app.id)}><DeleteIcon /></IconButton>
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
        <DialogTitle>Delete Application?</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete this application?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" onClick={confirmDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 