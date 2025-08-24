import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { apiRequest } from './api';
import { useAuth } from './AuthContext';
import {
  Box, Button, TextField, Typography, Alert, Paper, Grid, Snackbar, 
  IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Card, CardContent, CardActions, Chip, useTheme, useMediaQuery, MenuItem, InputAdornment
} from '@mui/material';
import LoadingSpinner from './components/LoadingSpinner';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import SearchIcon from '@mui/icons-material/Search';
import PageLayout, { SectionLayout, CardLayout } from './components/PageLayout';
import PrintIcon from '@mui/icons-material/Print';
import PrintReport from './components/PrintReport';


export default function CropsPage() {
  const { user } = useAuth();
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ 
    crop_type: '', 
    field_id: '', 
    field_name: '', 
    season_year: new Date().getFullYear(),
    planting_date: '', 
    expected_harvest_date: '', 
    acres: '',
    status: 'growing',
    notes: '' 
  });
  const [editId, setEditId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteId, setDeleteId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [applications, setApplications] = useState([]);
  const [selectedCropId, setSelectedCropId] = useState(null);
  const [inputs, setInputs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [fields, setFields] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterField, setFilterField] = useState('');
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const fetchCrops = useCallback(async () => {
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
  }, [selectedCropId]);

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

  const handleEdit = crop => {
    setEditId(crop.id);
    setForm({
      crop_type: crop.crop_type || '',
      field_id: crop.field_id || '',
      field_name: crop.field_name || '',
      season_year: crop.season_year || new Date().getFullYear(),
      planting_date: crop.planting_date || '',
      expected_harvest_date: crop.expected_harvest_date || '',
      acres: crop.acres || '',
      status: crop.status || 'growing',
      notes: crop.notes || '',
    });
    setShowForm(true);
  };

  const handleAdd = async e => {
    e.preventDefault();
    setError('');
    try {
      await apiRequest('/crops', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setForm({ 
        crop_type: '', 
        field_id: '', 
        field_name: '', 
        season_year: new Date().getFullYear(),
        planting_date: '', 
        expected_harvest_date: '', 
        acres: '',
        status: 'growing',
        notes: '' 
      });
      setShowForm(false);
      fetchCrops();
      setSnackbar({ open: true, message: 'Crop added!', severity: 'success' });
    } catch (err) {
      setError(err.message);
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    }
  };

  const handleUpdate = async e => {
    e.preventDefault();
    setError('');
    try {
      await apiRequest(`/crops/${editId}`, {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      setEditId(null);
      setForm({ 
        crop_type: '', 
        field_id: '', 
        field_name: '', 
        season_year: new Date().getFullYear(),
        planting_date: '', 
        expected_harvest_date: '', 
        acres: '',
        status: 'growing',
        notes: '' 
      });
      setShowForm(false);
      fetchCrops();
      setSnackbar({ open: true, message: 'Crop updated!', severity: 'success' });
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

  // Filter crops based on search term and field filter (memoized for performance)
  const filteredCrops = useMemo(() => {
    return crops.filter(crop => {
      const matchesSearch = !searchTerm || 
        crop.crop_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crop.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fields.find(f => f.id === crop.field_id)?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesField = !filterField || String(crop.field_id) === String(filterField);
      
      return matchesSearch && matchesField;
    });
  }, [crops, searchTerm, filterField, fields]);

  const CropCard = ({ crop }) => {
    const cropApplications = applications.filter(app => String(app.crop_id) === String(crop.id));
    const isSelected = selectedCropId === crop.id;
    
    return (
      <CardLayout
        sx={{ 
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
            <Grid xs={6}>
              <Typography variant="body2" color="text.secondary">
                Season: <strong>{crop.season_year || 'N/A'}</strong>
              </Typography>
            </Grid>
            <Grid xs={6}>
              <Typography variant="body2" color="text.secondary">
                Status: <strong>{crop.status || 'N/A'}</strong>
              </Typography>
            </Grid>
            <Grid xs={6}>
              <Typography variant="body2" color="text.secondary">
                Acres: <strong>{crop.acres || 'N/A'}</strong>
              </Typography>
            </Grid>
            <Grid xs={6}>
              <Typography variant="body2" color="text.secondary">
                Planted: <strong>{crop.planting_date || 'N/A'}</strong>
              </Typography>
            </Grid>
            <Grid xs={6}>
              <Typography variant="body2" color="text.secondary">
                Harvest: <strong>{crop.expected_harvest_date || 'N/A'}</strong>
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
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton 
              color="primary" 
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(crop);
              }}
              disabled={crop.user_id !== user?.id && user?.role !== 'admin'}
              title={crop.user_id !== user?.id && user?.role !== 'admin' ? 'Only creator or admin can edit' : 'Edit'}
              size="small"
            >
              <EditIcon />
            </IconButton>
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
          </Box>
        </CardActions>
      </CardLayout>
    );
  };

  // Print report configuration
  const printColumns = [
    { field: 'crop_type', header: 'Crop Type' },
    { field: 'field_name', header: 'Field' },
    { field: 'planting_date', header: 'Planting Date' },
    { field: 'harvest_date', header: 'Harvest Date' },
    { field: 'notes', header: 'Notes' },
    { field: 'created_by_username', header: 'Created By' }
  ];

  const printFilters = [
    {
      name: 'crop_type',
      label: 'Filter by Crop Type',
      type: 'text',
      placeholder: 'Search crop type'
    },
    {
      name: 'field_name',
      label: 'Filter by Field',
      type: 'text',
      placeholder: 'Search field name'
    }
  ];

  // Prepare data for printing
  const printData = crops.map(crop => ({
    ...crop,
    field_name: fields.find(f => f.id === crop.field_id)?.name || crop.field_name || 'N/A'
  }));

  const [showForm, setShowForm] = useState(false);

  return (
    <PageLayout 
      title="🌾 Crops" 
      subtitle="Manage your crop plantings and harvest tracking"
      actions={
        <>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={() => setPrintDialogOpen(true)}
          >
            Print Report
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowForm(true)}
          >
            Add Crop
          </Button>
        </>
      }
    >

      {showForm && (
        <SectionLayout title={editId ? 'Edit Crop' : 'Add New Crop'}>
          <Box component="form" onSubmit={editId ? handleUpdate : handleAdd}>
            <Grid container spacing={2}>
              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Crop Type"
                  name="crop_type"
                  value={form.crop_type}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Field"
                  name="field_id"
                  value={form.field_id}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="">Select a field</MenuItem>
                  {fields.map(field => (
                    <MenuItem key={field.id} value={field.id}>
                      {field.name} ({field.area} {field.area_unit})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Season Year"
                  name="season_year"
                  type="number"
                  value={form.season_year}
                  onChange={handleChange}
                  required
                  inputProps={{ min: 2020, max: 2030 }}
                />
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="growing">Growing</MenuItem>
                  <MenuItem value="harvested">Harvested</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                  <MenuItem value="planned">Planned</MenuItem>
                </TextField>
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Acres"
                  name="acres"
                  type="number"
                  value={form.acres}
                  onChange={handleChange}
                  inputProps={{ step: 0.1, min: 0 }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">acres</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Planting Date"
                  name="planting_date"
                  type="date"
                  value={form.planting_date}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Expected Harvest Date"
                  name="expected_harvest_date"
                  type="date"
                  value={form.expected_harvest_date}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: theme.palette.background.paper
                    }
                  }}
                />
              </Grid>
            </Grid>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 2 }}>
              <Button onClick={() => {
                setShowForm(false);
                setEditId(null);
                setForm({ 
                  crop_type: '', 
                  field_id: '', 
                  field_name: '', 
                  season_year: new Date().getFullYear(),
                  planting_date: '', 
                  expected_harvest_date: '', 
                  acres: '',
                  status: 'growing',
                  notes: '' 
                });
              }}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" startIcon={editId ? <EditIcon /> : <AddIcon />}>
                {editId ? 'Update Crop' : 'Create Crop'}
              </Button>
            </Box>
          </Box>
        </SectionLayout>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <SectionLayout title="Search & Filter">
        <Grid container spacing={2}>
          <Grid xs={12} sm={6}>
            <TextField
              fullWidth
              label="Search crops..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: theme.palette.background.paper
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Filter by Field"
              value={filterField}
              onChange={(e) => setFilterField(e.target.value)}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: theme.palette.background.paper
                }
              }}
            >
              <MenuItem value="">All Fields</MenuItem>
              {fields.map(field => (
                <MenuItem key={field.id} value={field.id}>
                  {field.name} ({field.area} {field.area_unit})
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </SectionLayout>

      <SectionLayout title="Crops">
        {loading ? (
          <LoadingSpinner message="Loading crops..." variant="card" />
        ) : (
          <Grid container spacing={isMobile ? 1 : 2}>
            {filteredCrops.length === 0 ? (
              <Grid item xs={12}>
                <Paper sx={{ p: isMobile ? 2 : 3, textAlign: 'center' }}>
                  <Typography variant={isMobile ? "body1" : "h6"} sx={{ color: '#637381' }}>
                    {loading ? 'Loading crops...' : 'No crops found matching your search criteria'}
                  </Typography>
                </Paper>
              </Grid>
            ) : (
              filteredCrops.map(crop => (
                <Grid xs={12} sm={6} md={4} lg={3} key={crop.id}>
                  <CropCard crop={crop} />
                </Grid>
              ))
            )}
          </Grid>
        )}
      </SectionLayout>

      {selectedCropId && (
        <SectionLayout title={`Applications for: ${crops.find(c => c.id === selectedCropId)?.crop_type} (${crops.find(c => c.id === selectedCropId)?.field_name})`}>
          <Grid container spacing={2}>
            {groupByDate(applications.filter(app => String(app.crop_id) === String(selectedCropId))).map(([date, apps]) => (
              <Grid xs={12} key={date}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="primary" gutterBottom>
                      {date}
                    </Typography>
                    <Grid container spacing={2}>
                      {apps.map(app => (
                        <Grid xs={12} sm={6} md={4} key={app.id}>
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
        </SectionLayout>
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

      {/* Print Report Dialog */}
      <PrintReport
        open={printDialogOpen}
        onClose={() => setPrintDialogOpen(false)}
        title="Crops Report"
        pageTitle="Crops Report"
        data={printData}
        filters={printFilters}
        columns={printColumns}
        additionalInfo={
          <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid xs={6} md={3}>
                <Typography variant="body2" color="text.secondary">Total Crops</Typography>
                <Typography variant="h6">{crops.length}</Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="body2" color="text.secondary">Unique Crop Types</Typography>
                <Typography variant="h6">{new Set(crops.map(c => c.crop_type)).size}</Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="body2" color="text.secondary">Fields Used</Typography>
                <Typography variant="h6">{new Set(crops.map(c => c.field_id).filter(Boolean)).size}</Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="body2" color="text.secondary">Total Applications</Typography>
                <Typography variant="h6">{applications.length}</Typography>
              </Grid>
            </Grid>
          </Box>
        }
      />
    </PageLayout>
  );
} 