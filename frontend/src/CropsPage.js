import React, { useState, useEffect, useContext } from 'react';
import { apiRequest } from './api';
import { AuthContext } from './AuthContext';
import {
  Box, Button, TextField, Typography, Alert, Paper, Grid, Snackbar, CircularProgress, 
  IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Card, CardContent, CardActions, Chip, useTheme, useMediaQuery, MenuItem
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import AgricultureIcon from '@mui/icons-material/Agriculture';


export default function CropsPage() {
  const { user } = useContext(AuthContext);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ crop_type: '', field_id: '', field_name: '', planting_date: '', harvest_date: '', notes: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteId, setDeleteId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [applications, setApplications] = useState([]);
  const [selectedCropId, setSelectedCropId] = useState(null);
  const [inputs, setInputs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [fields, setFields] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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

  const fetchFields = async () => {
    try {
      const data = await apiRequest('/fields');
      setFields(data);
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    }
  };

  useEffect(() => { fetchCrops(); }, []);
  useEffect(() => { fetchApplications(); }, []);
  useEffect(() => { fetchInputs(); }, []);
  useEffect(() => { fetchVehicles(); }, []);
  useEffect(() => { fetchFields(); }, []);

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
      setForm({ crop_type: '', field_id: '', field_name: '', planting_date: '', harvest_date: '', notes: '' });
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

  function groupByDate(apps) {
    const grouped = {};
    apps.forEach(app => {
      const date = app.date;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(app);
    });
    return Object.entries(grouped).sort(([a], [b]) => new Date(b) - new Date(a));
  }

  const CropCard = ({ crop }) => {
    const cropApplications = applications.filter(app => String(app.crop_id) === String(crop.id));
    const isSelected = selectedCropId === crop.id;
    
    return (
      <Card 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          cursor: 'pointer',
          border: isSelected ? 2 : 1,
          borderColor: isSelected ? 'primary.main' : 'divider',
          '&:hover': {
            borderColor: 'primary.main',
            boxShadow: 2
          }
        }}
        onClick={() => setSelectedCropId(isSelected ? null : crop.id)}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <AgricultureIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
              {crop.crop_type}
            </Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Field: <strong>{fields.find(f => f.id === crop.field_id)?.name || crop.field_name || 'N/A'}</strong>
          </Typography>
          
          <Grid container spacing={1} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Planted: <strong>{crop.planting_date || 'N/A'}</strong>
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Harvest: <strong>{crop.harvest_date || 'N/A'}</strong>
              </Typography>
            </Grid>
          </Grid>
          
          <Chip 
            label={`${cropApplications.length} applications`} 
            color="secondary" 
            size="small" 
            sx={{ mb: 1 }}
          />
          
          {crop.notes && (
            <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
              {crop.notes}
            </Typography>
          )}
        </CardContent>
        
        <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Created by: {crop.created_by_username || 'Unknown'}
          </Typography>
          <IconButton 
            color="error" 
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(crop.id);
            }}
            disabled={crop.user_id !== user?.id && user?.role !== 'admin'}
            title={crop.user_id !== user?.id && user?.role !== 'admin' ? 'Only creator or admin can delete' : 'Delete'}
            size="small"
          >
            <DeleteIcon />
          </IconButton>
        </CardActions>
      </Card>
    );
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
        🌾 Crops
      </Typography>

      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Add New Crop
        </Typography>
        <Box component="form" onSubmit={handleAdd}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Crop Type"
                name="crop_type"
                value={form.crop_type}
                onChange={handleChange}
                required
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Field"
                name="field_id"
                value={form.field_id}
                onChange={handleChange}
                required
                size="small"
              >
                <MenuItem value="">Select a field</MenuItem>
                {fields.map(field => (
                  <MenuItem key={field.id} value={field.id}>
                    {field.name} ({field.area} {field.area_unit})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Planting Date"
                name="planting_date"
                type="date"
                value={form.planting_date}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Harvest Date"
                name="harvest_date"
                type="date"
                value={form.harvest_date}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
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
                  Add Crop
                </Button>

              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {crops.map(crop => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={crop.id}>
              <CropCard crop={crop} />
            </Grid>
          ))}
        </Grid>
      )}

      {selectedCropId && (
        <Box mt={4}>
          <Typography variant="h6" mb={2}>
            Applications for: {crops.find(c => c.id === selectedCropId)?.crop_type} ({crops.find(c => c.id === selectedCropId)?.field_name})
          </Typography>
          <Grid container spacing={2}>
            {groupByDate(applications.filter(app => String(app.crop_id) === String(selectedCropId))).map(([date, apps]) => (
              <Grid item xs={12} key={date}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="primary" gutterBottom>
                      {date}
                    </Typography>
                    <Grid container spacing={2}>
                      {apps.map(app => (
                        <Grid item xs={12} sm={6} md={4} key={app.id}>
                          <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                            <Typography variant="body2" fontWeight="bold">
                              {inputs.find(i => i.id === app.input_id)?.name || app.input_id}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Rate: {app.rate} {app.unit}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Time: {app.start_time} - {app.finish_time}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Weather: {app.weather_temp}°C, {app.weather_humidity}% RH
                            </Typography>
                            {app.notes && (
                              <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                                {app.notes}
                              </Typography>
                            )}
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
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
          <DialogContentText>
            Are you sure you want to delete this crop? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" onClick={confirmDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 