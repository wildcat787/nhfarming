import React, { useState, useEffect } from 'react';
import { apiRequest } from './api';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import {
  Box, Button, TextField, Typography, Alert, Paper, Grid, Snackbar, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, MenuItem, Tooltip, Card, CardContent, Divider, Chip, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import ScienceIcon from '@mui/icons-material/Science';
import PrintIcon from '@mui/icons-material/Print';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PrintReport from './components/PrintReport';


export default function ApplicationsPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [applications, setApplications] = useState([]);
  const [tankMixtures, setTankMixtures] = useState([]);
  const [crops, setCrops] = useState([]);
  const [inputs, setInputs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Application form state - now includes tank mixture creation
  const [form, setForm] = useState({ 
    crop_id: '', 
    field_id: '', 
    date: '', 
    spray_rate: '', 
    spray_rate_unit: 'L/Ha', 
    weather_temp: '', 
    weather_humidity: '', 
    weather_wind: '', 
    weather_wind_direction: '', 
    weather_rain: '', 
    notes: '', 
    start_time: '', 
    finish_time: '', 
    vehicle_id: '',
    // Tank mixture fields
    mixture_name: '',
    mixture_description: '',
    total_volume: '',
    volume_unit: 'L',
    target_area_ha: '',
    mixture_notes: '',
    ingredients: []
  });
  
  const [editId, setEditId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteId, setDeleteId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCropId, setSelectedCropId] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [fields, setFields] = useState([]);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [ecowittConfig, setEcowittConfig] = useState(null);
  const [selectedMixture, setSelectedMixture] = useState(null);
  const [viewMixtureDialogOpen, setViewMixtureDialogOpen] = useState(false);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const sprayRateUnits = ['L/Ha', 'gal/ac', 'L/ac', 'mL/m²'];
  const volumeUnits = ['L', 'gal', 'mL'];
  const formUnits = ['g', 'kg', 'mL', 'L', 'oz', 'lb'];
  const measurementTypes = [
    { value: 'rate_per_ha', label: 'Rate per Ha' },
    { value: 'percentage', label: 'Percentage of Tank' }
  ];

  const fetchAll = async () => {
    setLoading(true);
    try {
      console.log('Fetching applications data...');
      const [apps, mixtures, crs, ins, vhs, flds] = await Promise.all([
        apiRequest('/applications'),
        apiRequest('/tank-mixtures'),
        apiRequest('/crops'),
        apiRequest('/inputs'),
        apiRequest('/vehicles'),
        apiRequest('/fields'),
      ]);
      console.log('Applications received:', apps);
      setApplications(apps);
      setTankMixtures(mixtures);
      setCrops(crs);
      setInputs(ins);
      setVehicles(vhs);
      setFields(flds);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchAll(); 
    // Only check Ecowitt config if user is authenticated
    if (user) {
      checkEcowittConfig();
    }
  }, [user]);

  // Check if weather service is configured
  const checkEcowittConfig = async () => {
    try {
      const config = await apiRequest('/weather/config');
      setEcowittConfig(config);
    } catch (error) {
      console.log('Weather service not configured:', error.message);
      // Set available to true even if Ecowitt is not configured, since fallback weather is available
      setEcowittConfig({ available: true, fallbackAvailable: true });
    }
  };

  // Fetch current weather
  const fetchCurrentWeather = async () => {
    setWeatherLoading(true);
    try {
      const weather = await apiRequest('/weather/current');
      setForm(prev => ({
        ...prev,
        weather_temp: weather.temperature || '',
        weather_humidity: weather.humidity || '',
        weather_wind: weather.wind_speed || '',
        weather_wind_direction: weather.wind_direction || '',
        weather_rain: weather.rainfall || ''
      }));
      setSnackbar({ open: true, message: 'Weather data fetched successfully', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
      setWeatherLoading(false);
    }
  };

  // Fetch historical weather for a specific date
  const fetchHistoricalWeather = async (date) => {
    if (!date) return;
    
    setWeatherLoading(true);
    try {
      const weather = await apiRequest(`/weather/historical/${date}`);
      setForm(prev => ({
        ...prev,
        weather_temp: weather.temperature || '',
        weather_humidity: weather.humidity || '',
        weather_wind: weather.wind_speed || '',
        weather_wind_direction: weather.wind_direction || '',
        weather_rain: weather.rainfall || ''
      }));
      setSnackbar({ open: true, message: 'Historical weather data fetched successfully', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSetNow = () => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    const timeStr = now.toTimeString().slice(0, 5); // HH:MM format
    
    setForm(prev => ({
      ...prev,
      date: dateStr,
      start_time: timeStr,
      finish_time: '' // Leave finish time empty for user to fill
    }));
  };

  const addIngredient = () => {
    setForm(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, {
        input_id: '',
        amount: '',
        unit: 'g',
        form: 'powder',
        measurement_type: 'rate_per_ha',
        notes: ''
      }]
    }));
  };

  const removeIngredient = (index) => {
    setForm(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const updateIngredient = (index, field, value) => {
    setForm(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ingredient, i) => 
        i === index ? { 
          ...ingredient, 
          [field]: field === 'input_id' || field === 'amount' ? parseFloat(value) || value : value 
        } : ingredient
      )
    }));
  };

  const calculateTotals = () => {
    const totals = {};
    form.ingredients.forEach(ingredient => {
      if (ingredient.amount && ingredient.unit) {
        if (!totals[ingredient.unit]) totals[ingredient.unit] = 0;
        totals[ingredient.unit] += parseFloat(ingredient.amount) || 0;
      }
    });
    return totals;
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      // Always create a tank mixture (required by backend)
      let tankMixtureId = null;
      const mixtureData = {
        name: form.mixture_name || `Mixture for ${crops.find(c => c.id === form.crop_id)?.crop_type || 'Application'}`,
        description: form.mixture_description,
        total_volume: form.total_volume,
        volume_unit: form.volume_unit,
        target_area_ha: form.target_area_ha,
        notes: form.mixture_notes,
        ingredients: form.ingredients || []
      };
      
      const newMixture = await apiRequest('/tank-mixtures', 'POST', mixtureData);
      tankMixtureId = newMixture.id;

      // Then create the application with the tank mixture ID
      const applicationData = {
        crop_id: form.crop_id,
        field_id: form.field_id,
        tank_mixture_id: tankMixtureId,
        date: form.date,
        spray_rate: form.spray_rate,
        spray_rate_unit: form.spray_rate_unit,
        weather_temp: form.weather_temp,
        weather_humidity: form.weather_humidity,
        weather_wind: form.weather_wind,
        weather_rain: form.weather_rain,
        notes: form.notes,
        start_time: form.start_time,
        finish_time: form.finish_time,
        vehicle_id: form.vehicle_id
      };

      await apiRequest('/applications', 'POST', applicationData);
      
      // Reset form
      setForm({ 
        crop_id: '', 
        field_id: '', 
        date: '', 
        spray_rate: '', 
        spray_rate_unit: 'L/Ha', 
        weather_temp: '', 
        weather_humidity: '', 
        weather_wind: '', 
        weather_rain: '', 
        notes: '', 
        start_time: '', 
        finish_time: '', 
        vehicle_id: '',
        mixture_name: '',
        mixture_description: '',
        total_volume: '',
        volume_unit: 'L',
        target_area_ha: '',
        mixture_notes: '',
        ingredients: []
      });
      
      setShowForm(false);
      setSnackbar({ open: true, message: 'Application added successfully', severity: 'success' });
      console.log('Calling fetchAll after adding application...');
      fetchAll();
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      // Always handle tank mixture (required by backend)
      let tankMixtureId = form.tank_mixture_id;
      const mixtureData = {
        name: form.mixture_name || `Mixture for ${crops.find(c => c.id === form.crop_id)?.crop_type || 'Application'}`,
        description: form.mixture_description,
        total_volume: form.total_volume,
        volume_unit: form.volume_unit,
        target_area_ha: form.target_area_ha,
        notes: form.mixture_notes,
        ingredients: form.ingredients || []
      };
      
      if (tankMixtureId) {
        await apiRequest(`/tank-mixtures/${tankMixtureId}`, 'PUT', mixtureData);
      } else {
        const newMixture = await apiRequest('/tank-mixtures', 'POST', mixtureData);
        tankMixtureId = newMixture.id;
      }

      const applicationData = {
        crop_id: form.crop_id,
        field_id: form.field_id,
        tank_mixture_id: tankMixtureId,
        date: form.date,
        spray_rate: form.spray_rate,
        spray_rate_unit: form.spray_rate_unit,
        weather_temp: form.weather_temp,
        weather_humidity: form.weather_humidity,
        weather_wind: form.weather_wind,
        weather_rain: form.weather_rain,
        notes: form.notes,
        start_time: form.start_time,
        finish_time: form.finish_time,
        vehicle_id: form.vehicle_id
      };

      await apiRequest(`/applications/${editId}`, 'PUT', applicationData);
      setEditId(null);
      setForm({ 
        crop_id: '', 
        field_id: '', 
        date: '', 
        spray_rate: '', 
        spray_rate_unit: 'L/Ha', 
        weather_temp: '', 
        weather_humidity: '', 
        weather_wind: '', 
        weather_rain: '', 
        notes: '', 
        start_time: '', 
        finish_time: '', 
        vehicle_id: '',
        mixture_name: '',
        mixture_description: '',
        total_volume: '',
        volume_unit: 'L',
        target_area_ha: '',
        mixture_notes: '',
        ingredients: []
      });
      setShowForm(false);
      setSnackbar({ open: true, message: 'Application updated successfully', severity: 'success' });
      fetchAll();
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    }
  };

  const handleEdit = async (app) => {
    setEditId(app.id);
    setShowForm(true);
    
    // Load tank mixture data if it exists
    let mixtureData = {
      mixture_name: '',
      mixture_description: '',
      total_volume: '',
      volume_unit: 'L',
      target_area_ha: '',
      mixture_notes: '',
      ingredients: []
    };
    
    if (app.tank_mixture_id) {
      try {
        const mixture = await apiRequest(`/tank-mixtures/${app.tank_mixture_id}`);
        mixtureData = {
          mixture_name: mixture.name || '',
          mixture_description: mixture.description || '',
          total_volume: mixture.total_volume || '',
          volume_unit: mixture.volume_unit || 'L',
          target_area_ha: mixture.target_area_ha || '',
          mixture_notes: mixture.notes || '',
          ingredients: mixture.ingredients || []
        };
      } catch (err) {
        console.error('Error loading tank mixture:', err);
      }
    }
    
    setForm({
      crop_id: app.crop_id || '',
      field_id: app.field_id || '',
      tank_mixture_id: app.tank_mixture_id || '',
      date: app.date || '',
      spray_rate: app.spray_rate || '',
      spray_rate_unit: app.spray_rate_unit || 'L/Ha',
      weather_temp: app.weather_temp || '',
      weather_humidity: app.weather_humidity || '',
      weather_wind: app.weather_wind || '',
      weather_rain: app.weather_rain || '',
      notes: app.notes || '',
      start_time: app.start_time || '',
      finish_time: app.finish_time || '',
      vehicle_id: app.vehicle_id || '',
      ...mixtureData
    });
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await apiRequest(`/applications/${deleteId}`, 'DELETE');
      setDeleteDialogOpen(false);
      setSnackbar({ open: true, message: 'Application deleted successfully', severity: 'success' });
      fetchAll();
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    }
  };

  const viewMixture = async (mixtureId) => {
    try {
      const mixture = await apiRequest(`/tank-mixtures/${mixtureId}`);
      setSelectedMixture(mixture);
      setViewMixtureDialogOpen(true);
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    }
  };

  // Filter applications by selected crop
  const filteredApplications = selectedCropId
    ? applications.filter(app => String(app.crop_id) === String(selectedCropId))
    : applications;

  // Print report configuration
  const printColumns = [
    { field: 'crop_type', header: 'Crop' },
    { field: 'field_name', header: 'Field' },
    { field: 'tank_mixture_name', header: 'Tank Mixture' },
    { field: 'date', header: 'Date' },
    { field: 'spray_rate', header: 'Spray Rate', render: (value, row) => `${value} ${row.spray_rate_unit}` },
    { field: 'weather_temp', header: 'Weather', render: (value, row) => `${row.weather_temp}°C, ${row.weather_humidity}% RH, ${row.weather_wind} km/h` },
    { field: 'start_time', header: 'Start Time' },
    { field: 'finish_time', header: 'Finish Time' },
    { field: 'vehicle_name', header: 'Machine' },
    { field: 'notes', header: 'Notes' }
  ];

  const printFilters = [
    {
      name: 'crop_id',
      label: 'Filter by Crop',
      type: 'select',
      options: crops.map(crop => ({
        value: crop.id,
        label: `${crop.crop_type} (${fields.find(f => f.id === crop.field_id)?.name || crop.field_name})`
      }))
    },
    {
      name: 'date',
      label: 'Filter by Date',
      type: 'text',
      placeholder: 'YYYY-MM-DD'
    },
    {
      name: 'tank_mixture_name',
      label: 'Filter by Tank Mixture',
      type: 'text',
      placeholder: 'Search mixture name'
    }
  ];

  // Prepare data for printing
  const printData = applications.map(app => ({
    ...app,
    crop_type: crops.find(c => c.id === app.crop_id)?.crop_type || 'N/A',
    field_name: app.field_id 
      ? fields.find(f => f.id === app.field_id)?.name 
      : crops.find(c => c.id === app.crop_id)?.field_id 
        ? fields.find(f => f.id === crops.find(c => c.id === app.crop_id)?.field_id)?.name 
        : 'N/A',
    tank_mixture_name: tankMixtures.find(t => t.id === app.tank_mixture_id)?.name || 'N/A',
    vehicle_name: vehicles.find(v => v.id === app.vehicle_id)?.name || ''
  }));

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Applications</Typography>
        <Button
          variant="outlined"
          startIcon={<PrintIcon />}
          onClick={() => setPrintDialogOpen(true)}
        >
          Print Report
        </Button>
      </Box>

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

      {showForm && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" mb={3}>{editId ? 'Edit Application' : 'Add Application'}</Typography>
          <form onSubmit={editId ? handleUpdate : handleAdd}>
          <Grid container spacing={3}>
            
            {/* Application Details Section */}
            <Grid item xs={12}>
              <Card sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
                  📋 Application Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Crop *
                    </Typography>
                    <TextField 
                      name="crop_id" 
                      value={form.crop_id} 
                      onChange={handleChange} 
                      select 
                      fullWidth 
                      size="small"
                      placeholder="Select crop"
                    >
                      <MenuItem value="">None</MenuItem>
                      {crops.map(crop => (
                        <MenuItem key={crop.id} value={crop.id}>
                          {crop.crop_type} ({fields.find(f => f.id === crop.field_id)?.name || crop.field_name})
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Field
                    </Typography>
                    <TextField 
                      name="field_id" 
                      value={form.field_id} 
                      onChange={handleChange} 
                      select 
                      fullWidth 
                      size="small"
                      placeholder="Select field (optional)"
                    >
                      <MenuItem value="">Select field (optional)</MenuItem>
                      {fields.map(field => (
                        <MenuItem key={field.id} value={field.id}>
                          {field.name} ({field.area} {field.area_unit})
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Application Date *
                    </Typography>
                    <TextField 
                      name="date" 
                      value={form.date} 
                      onChange={handleChange} 
                      fullWidth 
                      size="small"
                      placeholder="YYYY-MM-DD"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Machine
                    </Typography>
                    <TextField 
                      name="vehicle_id" 
                      value={form.vehicle_id || ''} 
                      onChange={handleChange} 
                      select 
                      fullWidth 
                      size="small"
                      placeholder="Select machine"
                    >
                      <MenuItem value="">None</MenuItem>
                      {vehicles.map(vehicle => (
                        <MenuItem key={vehicle.id} value={vehicle.id}>{vehicle.name}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Application Time
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <TextField 
                          name="start_time" 
                          value={form.start_time || ''} 
                          onChange={handleChange} 
                          fullWidth 
                          size="small"
                          placeholder="08:00"
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField 
                          name="finish_time" 
                          value={form.finish_time || ''} 
                          onChange={handleChange} 
                          fullWidth 
                          size="small"
                          placeholder="10:30"
                        />
                      </Grid>
                    </Grid>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleSetNow}
                      sx={{ mt: 1 }}
                      startIcon={<CalendarTodayIcon />}
                    >
                      Now
                    </Button>
                  </Grid>
                </Grid>
              </Card>
            </Grid>

            {/* Tank Mixture Section */}
            <Grid item xs={12}>
              <Card sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
                  🧪 Tank Mixture Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Mixture Name *
                    </Typography>
                    <TextField 
                      name="mixture_name" 
                      value={form.mixture_name} 
                      onChange={handleChange} 
                      fullWidth 
                      size="small"
                      placeholder="e.g., Herbicide Mix for Corn"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Mixture Description
                    </Typography>
                    <TextField 
                      name="mixture_description" 
                      value={form.mixture_description} 
                      onChange={handleChange} 
                      fullWidth 
                      size="small"
                      multiline 
                      rows={2} 
                      placeholder="Brief description of the tank mixture"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total Volume
                    </Typography>
                    <TextField 
                      name="total_volume" 
                      value={form.total_volume} 
                      onChange={handleChange} 
                      fullWidth 
                      size="small"
                      type="number" 
                      placeholder="e.g., 1000"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Volume Unit
                    </Typography>
                    <TextField 
                      name="volume_unit" 
                      value={form.volume_unit} 
                      onChange={handleChange} 
                      select 
                      fullWidth 
                      size="small"
                    >
                      {volumeUnits.map(unit => (
                        <MenuItem key={unit} value={unit}>{unit}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Target Area (Ha)
                    </Typography>
                    <TextField 
                      name="target_area_ha" 
                      value={form.target_area_ha} 
                      onChange={handleChange} 
                      fullWidth 
                      size="small"
                      type="number" 
                      placeholder="e.g., 50"
                    />
                  </Grid>
                </Grid>
              </Card>
            </Grid>

            {/* Chemicals Section */}
            <Grid item xs={12}>
              <Card sx={{ 
                p: 3, 
                mb: 3, 
                bgcolor: 'background.default',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  mb: 3,
                  pb: 2,
                  borderBottom: '2px solid',
                  borderColor: 'primary.main'
                }}>
                  <Typography variant="h5" sx={{ 
                    color: 'primary.main',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    🧬 Chemical Application Rates
                  </Typography>
                  <Button 
                    type="button" 
                    onClick={addIngredient} 
                    startIcon={<AddIcon />} 
                    variant="contained" 
                    size="medium"
                    sx={{ 
                      fontWeight: 'bold',
                      px: 3,
                      py: 1
                    }}
                  >
                    + Add Chemical
                  </Button>
                </Box>
                
                {form.ingredients.length === 0 && (
                  <Box sx={{ 
                    textAlign: 'center', 
                    py: 6, 
                    color: '#637381',
                    bgcolor: '#f8fafc',
                    borderRadius: 2,
                    border: '2px dashed',
                    borderColor: '#cbd5e1'
                  }}>
                    <Typography variant="h6" sx={{ mb: 1, color: '#1a2027' }}>
                      No Chemicals Added
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#637381' }}>
                      Click "Add Chemical" to start building your application mixture.
                    </Typography>
                  </Box>
                )}
                
                {form.ingredients.map((ingredient, index) => (
                  <Card key={index} sx={{ 
                    mb: 3, 
                    p: 3, 
                    border: '2px solid',
                    borderColor: 'primary.light',
                    bgcolor: 'background.paper',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    '&:hover': {
                      boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
                      borderColor: 'primary.main'
                    }
                  }}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      mb: 2,
                      pb: 1,
                      borderBottom: '1px solid',
                      borderColor: 'divider'
                    }}>
                      <Typography variant="h6" sx={{ 
                        color: 'primary.main',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        Chemical #{index + 1}
                      </Typography>
                      <IconButton 
                        color="error" 
                        onClick={() => removeIngredient(index)}
                        title="Remove chemical"
                        size="medium"
                        sx={{ 
                          bgcolor: 'error.light',
                          color: 'error.contrastText',
                          '&:hover': {
                            bgcolor: 'error.main'
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    
                    <Grid container spacing={3} alignItems="flex-start">
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="subtitle2" sx={{ 
                          color: '#1a2027',
                          fontWeight: 'bold',
                          mb: 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5
                        }}>
                          Chemical *
                        </Typography>
                        <TextField
                          select
                          value={ingredient.input_id}
                          onChange={(e) => updateIngredient(index, 'input_id', e.target.value)}
                          fullWidth
                          size="medium"
                          required
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              bgcolor: theme.palette.background.paper
                            }
                          }}
                        >
                          {inputs.map(input => (
                            <MenuItem key={input.id} value={input.id}>
                              {input.name} ({input.type})
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={6} md={2}>
                        <Typography variant="subtitle2" sx={{ 
                          color: '#1a2027',
                          fontWeight: 'bold',
                          mb: 1
                        }}>
                          Rate *
                        </Typography>
                        <TextField
                          value={ingredient.amount}
                          onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
                          fullWidth
                          size="medium"
                          type="number"
                          required
                          placeholder="2.5"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              bgcolor: theme.palette.background.paper
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={2}>
                        <Typography variant="subtitle2" sx={{ 
                          color: '#1a2027',
                          fontWeight: 'bold',
                          mb: 1
                        }}>
                          Unit *
                        </Typography>
                        <TextField
                          select
                          value={ingredient.unit}
                          onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                          fullWidth
                          size="medium"
                          required
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              bgcolor: theme.palette.background.paper
                            }
                          }}
                        >
                          {formUnits.map(unit => (
                            <MenuItem key={unit} value={unit}>{unit}</MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={6} md={2}>
                        <Typography variant="subtitle2" sx={{ 
                          color: '#1a2027',
                          fontWeight: 'bold',
                          mb: 1
                        }}>
                          Form
                        </Typography>
                        <TextField
                          select
                          value={ingredient.form}
                          onChange={(e) => updateIngredient(index, 'form', e.target.value)}
                          fullWidth
                          size="medium"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              bgcolor: theme.palette.background.paper
                            }
                          }}
                        >
                          <MenuItem value="powder">Powder</MenuItem>
                          <MenuItem value="liquid">Liquid</MenuItem>
                          <MenuItem value="granular">Granular</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="subtitle2" sx={{ 
                          color: '#1a2027',
                          fontWeight: 'bold',
                          mb: 1
                        }}>
                          Measurement
                        </Typography>
                        <TextField
                          select
                          value={ingredient.measurement_type}
                          onChange={(e) => updateIngredient(index, 'measurement_type', e.target.value)}
                          fullWidth
                          size="medium"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              bgcolor: theme.palette.background.paper
                            }
                          }}
                        >
                          {measurementTypes.map(type => (
                            <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" sx={{ 
                          color: '#1a2027',
                          fontWeight: 'bold',
                          mb: 1
                        }}>
                          Notes
                        </Typography>
                        <TextField
                          value={ingredient.notes}
                          onChange={(e) => updateIngredient(index, 'notes', e.target.value)}
                          fullWidth
                          size="medium"
                          placeholder="Additional notes for this chemical..."
                          multiline
                          rows={2}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              bgcolor: theme.palette.background.paper
                            }
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Card>
                ))}
                
                {form.ingredients.length > 0 && (
                  <Box sx={{ 
                    mt: 3, 
                    p: 3, 
                    bgcolor: 'success.main',
                    borderRadius: 2,
                    border: '2px solid',
                    borderColor: 'success.dark',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}>
                    <Typography variant="h6" sx={{ 
                      color: 'white',
                      fontWeight: 'bold',
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      📊 Total Chemicals Summary
                    </Typography>
                    <Grid container spacing={3}>
                      {Object.entries(calculateTotals()).map(([unit, total]) => (
                        <Grid item xs={6} sm={3} key={unit}>
                          <Box sx={{ 
                            textAlign: 'center',
                            p: 2,
                            bgcolor: 'rgba(255,255,255,0.1)',
                            borderRadius: 1,
                            border: '1px solid rgba(255,255,255,0.2)'
                          }}>
                            <Typography variant="body2" sx={{ 
                              color: 'white',
                              fontWeight: 'bold',
                              mb: 0.5
                            }}>
                              {unit}
                            </Typography>
                            <Typography variant="h5" sx={{ 
                              color: 'white',
                              fontWeight: 'bold'
                            }}>
                              {total.toFixed(2)}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </Card>
            </Grid>

            {/* Application Rate Section */}
            <Grid item xs={12}>
              <Card sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
                  🎯 Overall Application Rate
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Application Rate *
                    </Typography>
                    <TextField 
                      name="spray_rate" 
                      value={form.spray_rate} 
                      onChange={handleChange} 
                      fullWidth 
                      size="small"
                      placeholder="e.g., 80"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Rate Unit
                    </Typography>
                    <TextField 
                      name="spray_rate_unit" 
                      value={form.spray_rate_unit} 
                      onChange={handleChange} 
                      select 
                      fullWidth 
                      size="small"
                    >
                      {sprayRateUnits.map(unit => (
                        <MenuItem key={unit} value={unit}>{unit}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>
              </Card>
            </Grid>

            {/* Weather Section */}
            <Grid item xs={12}>
              <Card sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
                  🌤️ Weather Conditions
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Temperature (°C)
                        </Typography>
                        <TextField 
                          name="weather_temp" 
                          value={form.weather_temp} 
                          onChange={handleChange} 
                          fullWidth 
                          size="small"
                        />
                      </Box>
                      <Tooltip title="Fetch current weather data">
                        <IconButton 
                          onClick={fetchCurrentWeather} 
                          disabled={weatherLoading}
                          color="primary"
                          size="small"
                        >
                          {weatherLoading ? <CircularProgress size={20} /> : <CloudDownloadIcon />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Humidity (%)
                    </Typography>
                    <TextField 
                      name="weather_humidity" 
                      value={form.weather_humidity} 
                      onChange={handleChange} 
                      fullWidth 
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Wind Speed (km/h)
                    </Typography>
                    <TextField 
                      name="weather_wind" 
                      value={form.weather_wind} 
                      onChange={handleChange} 
                      fullWidth 
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Wind Direction (°)
                    </Typography>
                    <TextField 
                      name="weather_wind_direction" 
                      value={form.weather_wind_direction} 
                      onChange={handleChange} 
                      fullWidth 
                      size="small"
                      placeholder="0-359"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Rainfall (mm)
                    </Typography>
                    <TextField 
                      name="weather_rain" 
                      value={form.weather_rain} 
                      onChange={handleChange} 
                      fullWidth 
                      size="small"
                    />
                  </Grid>
                </Grid>
              </Card>
            </Grid>

            {/* Notes Section */}
            <Grid item xs={12}>
              <Card sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
                  📝 Notes
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Application Notes
                    </Typography>
                    <TextField 
                      name="notes" 
                      value={form.notes} 
                      onChange={handleChange} 
                      fullWidth 
                      multiline 
                      rows={3} 
                      placeholder="Additional notes about this application"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Tank Mixture Notes
                    </Typography>
                    <TextField 
                      name="mixture_notes" 
                      value={form.mixture_notes} 
                      onChange={handleChange} 
                      fullWidth 
                      multiline 
                      rows={2} 
                      placeholder="Notes about the tank mixture"
                    />
                  </Grid>
                </Grid>
              </Card>
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                {editId && (
                                    <Button 
                    variant="outlined" 
                    onClick={() => {
                      setShowForm(false);
                      setEditId(null);
                      setForm({ 
                        crop_id: '', 
                        field_id: '', 
                        date: '', 
                        spray_rate: '', 
                        spray_rate_unit: 'L/Ha', 
                        weather_temp: '', 
                        weather_humidity: '', 
                        weather_wind: '', 
                        weather_rain: '', 
                        notes: '', 
                        start_time: '', 
                        finish_time: '', 
                        vehicle_id: '',
                        mixture_name: '',
                        mixture_description: '',
                        total_volume: '',
                        volume_unit: 'L',
                        target_area_ha: '',
                        mixture_notes: '',
                        ingredients: []
                      }); 
                    }}
                  >
                    Cancel
                  </Button>
                )}
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary" 
                  startIcon={editId ? <EditIcon /> : <AddIcon />} 
                  size="large"
                >
                  {editId ? 'Update' : 'Add'} Application
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </Paper>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Your Applications ({applications.length})</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowForm(true)}
          disabled={showForm}
        >
          Add Application
        </Button>
      </Box>
      
      {loading ? <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}><CircularProgress /></Box> : applications.length === 0 ? (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No applications found. Add your first application to get started.
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setShowForm(true)}
            sx={{ mt: 2 }}
          >
            Add First Application
          </Button>
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Crop</TableCell>
                <TableCell>Field</TableCell>
                <TableCell>Tank Mixture</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Application Rate</TableCell>
                <TableCell>Weather</TableCell>
                <TableCell>Start</TableCell>
                <TableCell>Finish</TableCell>
                <TableCell>Machine</TableCell>
                <TableCell>Created By</TableCell>
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
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>{tankMixtures.find(t => t.id === app.tank_mixture_id)?.name || 'N/A'}</span>
                      {app.tank_mixture_id && (
                        <IconButton 
                          size="small" 
                          onClick={() => viewMixture(app.tank_mixture_id)}
                          title="View mixture details"
                        >
                          <ScienceIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{app.date}</TableCell>
                  <TableCell>{app.spray_rate} {app.spray_rate_unit}</TableCell>
                  <TableCell>{app.weather_temp}°C, {app.weather_humidity}% RH, {app.weather_wind} km/h, {app.weather_rain} mm</TableCell>
                  <TableCell>{app.start_time}</TableCell>
                  <TableCell>{app.finish_time}</TableCell>
                  <TableCell>{vehicles.find(v => v.id === app.vehicle_id)?.name || ''}</TableCell>
                  <TableCell>{app.created_by_username || 'Unknown'}</TableCell>
                  <TableCell>{app.notes}</TableCell>
                  <TableCell align="right">
                    <IconButton 
                      color="primary" 
                      onClick={() => handleEdit(app)}
                      disabled={app.created_by !== user?.id && user?.role !== 'admin'}
                      title={app.created_by !== user?.id && user?.role !== 'admin' ? 'Only creator or admin can edit' : 'Edit'}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => handleDelete(app.id)}
                      disabled={app.created_by !== user?.id && user?.role !== 'admin'}
                      title={app.created_by !== user?.id && user?.role !== 'admin' ? 'Only creator or admin can delete' : 'Delete'}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* View Mixture Dialog */}
      <Dialog 
        open={viewMixtureDialogOpen} 
        onClose={() => setViewMixtureDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedMixture?.name}
        </DialogTitle>
        <DialogContent>
          {selectedMixture && (
            <Box>
              {selectedMixture.description && (
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedMixture.description}
                </Typography>
              )}
              
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                {selectedMixture.total_volume && (
                  <Typography variant="body1">
                    <strong>Total Volume:</strong> {selectedMixture.total_volume} {selectedMixture.volume_unit}
                  </Typography>
                )}
                {selectedMixture.target_area_ha && (
                  <Typography variant="body1">
                    <strong>Target Area:</strong> {selectedMixture.target_area_ha} Ha
                  </Typography>
                )}
              </Box>

              <Typography variant="h6" gutterBottom>
                Chemicals & Rates
              </Typography>
              
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Chemical</TableCell>
                      <TableCell>Rate</TableCell>
                      <TableCell>Unit</TableCell>
                      <TableCell>Form</TableCell>
                      <TableCell>Measurement</TableCell>
                      <TableCell>Notes</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedMixture.ingredients?.map((ingredient, index) => (
                      <TableRow key={index}>
                        <TableCell>{ingredient.input_name || 'Unknown'}</TableCell>
                        <TableCell>{ingredient.amount}</TableCell>
                        <TableCell>{ingredient.unit}</TableCell>
                        <TableCell>{ingredient.form}</TableCell>
                        <TableCell>{measurementTypes.find(t => t.value === ingredient.measurement_type)?.label || ingredient.measurement_type}</TableCell>
                        <TableCell>{ingredient.notes}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {selectedMixture.notes && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Notes
                  </Typography>
                  <Typography variant="body2">
                    {selectedMixture.notes}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewMixtureDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
      
      {/* Delete Application Dialog */}
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

      {/* Print Report Dialog */}
      <PrintReport
        open={printDialogOpen}
        onClose={() => setPrintDialogOpen(false)}
        title="Applications Report"
        pageTitle="Applications Report"
        data={printData}
        filters={printFilters}
        columns={printColumns}
        additionalInfo={
          <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <Typography variant="body2" color="text.secondary">Total Applications</Typography>
                <Typography variant="h6">{applications.length}</Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="body2" color="text.secondary">Unique Crops</Typography>
                <Typography variant="h6">{new Set(applications.map(a => a.crop_id)).size}</Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="body2" color="text.secondary">Unique Fields</Typography>
                <Typography variant="h6">{new Set(applications.map(a => a.field_id).filter(Boolean)).size}</Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="body2" color="text.secondary">Tank Mixtures Used</Typography>
                <Typography variant="h6">{new Set(applications.map(a => a.tank_mixture_id).filter(Boolean)).size}</Typography>
              </Grid>
            </Grid>
          </Box>
        }
      />
    </Box>
  );
} 