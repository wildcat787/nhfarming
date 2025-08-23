import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Fab,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Alert,
  Snackbar,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  CameraAlt as CameraIcon,
  PhotoLibrary as GalleryIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  BugReport as BugIcon,
  LocalFlorist as CropIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  CloudUpload as UploadIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { apiRequest } from './api';
import DatabaseErrorHandler, { useDatabaseError } from './components/DatabaseErrorHandler';

const ObservationsPage = () => {
  const { error, isLoading, executeWithErrorHandling } = useDatabaseError();
  
  const [observations, setObservations] = useState([]);
  const [crops, setCrops] = useState([]);
  const [fields, setFields] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [viewingRecord, setViewingRecord] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    damage_type: '',
    severity: '',
    crop_id: '',
    field_id: '',
    season_year: new Date().getFullYear(),
    location_notes: '',
    estimated_loss: '',
    treatment_applied: '',
    weather_conditions: '',
    date_observed: new Date().toISOString().split('T')[0]
  });
  
  // Photo handling
  const [photos, setPhotos] = useState([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const fileInputRef = useRef();
  const cameraInputRef = useRef();
  
  // Damage types and severity options
  const damageTypes = [
    'Chemical Damage',
    'Insect Damage',
    'Disease',
    'Weather Damage',
    'Nutrient Deficiency',
    'Weed Competition',
    'Equipment Damage',
    'Animal Damage',
    'Other'
  ];
  
  const severityLevels = [
    'Low',
    'Moderate',
    'High',
    'Critical'
  ];

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await executeWithErrorHandling(async () => {
      const [observationsData, cropsData, fieldsData] = await Promise.all([
        apiRequest('/observations'),
        apiRequest('/crops'),
        apiRequest('/fields')
      ]);
      
      setObservations(observationsData);
      setCrops(cropsData);
      setFields(fieldsData);
    });
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle photo selection
  const handlePhotoSelect = (event) => {
    const files = Array.from(event.target.files);
    const newPhotos = files.map(file => ({
      file,
      id: Date.now() + Math.random(),
      preview: URL.createObjectURL(file)
    }));
    setPhotos(prev => [...prev, ...newPhotos]);
  };

  // Handle camera capture
  const handleCameraCapture = (event) => {
    const files = Array.from(event.target.files);
    const newPhotos = files.map(file => ({
      file,
      id: Date.now() + Math.random(),
      preview: URL.createObjectURL(file)
    }));
    setPhotos(prev => [...prev, ...newPhotos]);
  };

  // Remove photo
  const removePhoto = (photoId) => {
    setPhotos(prev => {
      const photo = prev.find(p => p.id === photoId);
      if (photo && photo.preview) {
        URL.revokeObjectURL(photo.preview);
      }
      return prev.filter(p => p.id !== photoId);
    });
  };

  // Submit form
  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.damage_type) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error'
      });
      return;
    }

    setUploadingPhotos(true);
    
    try {
      const formDataToSend = new FormData();
      
      // Add form fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== '') {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      // Add photos
      photos.forEach(photo => {
        formDataToSend.append('photos', photo.file);
      });
      
      if (editingRecord) {
        await apiRequest(`/observations/${editingRecord.id}`, {
          method: 'PUT',
          body: formDataToSend
        });
        setSnackbar({
          open: true,
          message: 'Observation updated successfully',
          severity: 'success'
        });
      } else {
        await apiRequest('/observations', {
          method: 'POST',
          body: formDataToSend
        });
        setSnackbar({
          open: true,
          message: 'Observation created successfully',
          severity: 'success'
        });
      }
      
      handleCloseDialog();
      loadData();
    } catch (error) {
              setSnackbar({
          open: true,
          message: error.message || 'Failed to save observation',
          severity: 'error'
        });
    } finally {
      setUploadingPhotos(false);
    }
  };

  // Delete observation
  const handleDeleteObservation = async (observationId) => {
    if (window.confirm('Are you sure you want to delete this observation?')) {
      try {
                  await apiRequest(`/observations/${observationId}`, { method: 'DELETE' });
        setSnackbar({
          open: true,
          message: 'Observation deleted successfully',
          severity: 'success'
        });
        loadData();
      } catch (error) {
        setSnackbar({
          open: true,
          message: error.message || 'Failed to delete observation',
          severity: 'error'
        });
      }
    }
  };

  // Open dialog for creating/editing
  const handleOpenDialog = (observation = null) => {
    if (observation) {
      setEditingRecord(observation);
              setFormData({
          title: observation.title,
          description: observation.description,
          damage_type: observation.damage_type,
          severity: observation.severity || '',
          crop_id: observation.crop_id || '',
          field_id: observation.field_id || '',
          season_year: observation.season_year || new Date().getFullYear(),
          location_notes: observation.location_notes || '',
          estimated_loss: observation.estimated_loss || '',
          treatment_applied: observation.treatment_applied || '',
          weather_conditions: observation.weather_conditions || '',
          date_observed: observation.date_observed || new Date().toISOString().split('T')[0]
        });
    } else {
      setEditingRecord(null);
      setFormData({
        title: '',
        description: '',
        damage_type: '',
        severity: '',
        crop_id: '',
        field_id: '',
        season_year: new Date().getFullYear(),
        location_notes: '',
        estimated_loss: '',
        treatment_applied: '',
        weather_conditions: '',
        date_observed: new Date().toISOString().split('T')[0]
      });
    }
    setPhotos([]);
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingRecord(null);
    setPhotos([]);
    // Clean up photo previews
    photos.forEach(photo => {
      if (photo.preview) {
        URL.revokeObjectURL(photo.preview);
      }
    });
  };

  // Get severity color
  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'low': return 'success';
      case 'moderate': return 'warning';
      case 'high': return 'error';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <DatabaseErrorHandler error={error} onRetry={loadData} />
      
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            📋 Crop Observations
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track and document crop observations, damage, and field conditions
          </Typography>
        </Box>
                  <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ minWidth: 150 }}
          >
            Add Observation
          </Button>
      </Box>

      {/* Records List */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Observations
          </Typography>
          
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : observations.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <BugIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No observations found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Start tracking crop observations by adding your first entry
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {observations.map((observation) => (
                <Grid item xs={12} md={6} lg={4} key={observation.id}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      '&:hover': { boxShadow: 4 }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <BugIcon />
                          <Typography variant="h6" component="h3">
                            {observation.title}
                          </Typography>
                        </Box>
                        <Chip
                          label={observation.severity || 'Unknown'}
                          color={getSeverityColor(observation.severity)}
                          size="small"
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {observation.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                        <Chip
                          icon={<BugIcon />}
                          label={observation.damage_type}
                          size="small"
                          variant="outlined"
                        />
                        {observation.crop_type && (
                          <Chip
                            icon={<CropIcon />}
                            label={observation.crop_type}
                            size="small"
                            variant="outlined"
                          />
                        )}
                        {observation.field_name && (
                          <Chip
                            icon={<LocationIcon />}
                            label={observation.field_name}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                      
                      {observation.photos && observation.photos.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <ImageList sx={{ width: '100%', height: 120 }} cols={3} rowHeight={100}>
                            {observation.photos.slice(0, 3).map((photo) => (
                              <ImageListItem key={photo.id}>
                                <img
                                  src={`/api/uploads/observations/${photo.filename}`}
                                  alt="Observation photo"
                                  loading="lazy"
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => setViewingRecord(observation)}
                                />
                              </ImageListItem>
                            ))}
                          </ImageList>
                          {observation.photos.length > 3 && (
                            <Typography variant="caption" color="text.secondary">
                                                              +{observation.photos.length - 3} more photos
                            </Typography>
                          )}
                        </Box>
                      )}
                      
                      <Typography variant="caption" color="text.secondary">
                        {new Date(observation.created_at).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                    
                    <Box sx={{ p: 2, pt: 0 }}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          startIcon={<ViewIcon />}
                          onClick={() => setViewingRecord(observation)}
                        >
                          View
                        </Button>
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => handleOpenDialog(observation)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDeleteObservation(observation.id)}
                        >
                          Delete
                        </Button>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingRecord ? 'Edit Observation' : 'Add New Observation'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title *"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description *"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                multiline
                rows={3}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Damage Type *</InputLabel>
                <Select
                  value={formData.damage_type}
                  onChange={(e) => handleInputChange('damage_type', e.target.value)}
                  label="Damage Type *"
                >
                  {damageTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Severity</InputLabel>
                <Select
                  value={formData.severity}
                  onChange={(e) => handleInputChange('severity', e.target.value)}
                  label="Severity"
                >
                  {severityLevels.map((level) => (
                    <MenuItem key={level} value={level}>
                      {level}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Crop</InputLabel>
                <Select
                  value={formData.crop_id}
                  onChange={(e) => handleInputChange('crop_id', e.target.value)}
                  label="Crop"
                >
                  <MenuItem value="">None</MenuItem>
                  {crops.map((crop) => (
                    <MenuItem key={crop.id} value={crop.id}>
                      {crop.crop_type} - {crop.field_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Field</InputLabel>
                <Select
                  value={formData.field_id}
                  onChange={(e) => handleInputChange('field_id', e.target.value)}
                  label="Field"
                >
                  <MenuItem value="">None</MenuItem>
                  {fields.map((field) => (
                    <MenuItem key={field.id} value={field.id}>
                      {field.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Season Year"
                type="number"
                value={formData.season_year}
                onChange={(e) => handleInputChange('season_year', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date Observed"
                type="date"
                value={formData.date_observed}
                onChange={(e) => handleInputChange('date_observed', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location Notes"
                value={formData.location_notes}
                onChange={(e) => handleInputChange('location_notes', e.target.value)}
                multiline
                rows={2}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Estimated Loss ($)"
                type="number"
                value={formData.estimated_loss}
                onChange={(e) => handleInputChange('estimated_loss', e.target.value)}
                InputProps={{
                  startAdornment: <MoneyIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Weather Conditions"
                value={formData.weather_conditions}
                onChange={(e) => handleInputChange('weather_conditions', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Treatment Applied"
                value={formData.treatment_applied}
                onChange={(e) => handleInputChange('treatment_applied', e.target.value)}
                multiline
                rows={2}
              />
            </Grid>
            
            {/* Photo Upload Section */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Photos
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<GalleryIcon />}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose Photos
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CameraIcon />}
                  onClick={() => cameraInputRef.current?.click()}
                >
                  Take Photo
                </Button>
              </Box>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoSelect}
                style={{ display: 'none' }}
              />
              
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleCameraCapture}
                style={{ display: 'none' }}
              />
              
              {photos.length > 0 && (
                <ImageList sx={{ width: '100%', height: 200 }} cols={4} rowHeight={150}>
                  {photos.map((photo) => (
                    <ImageListItem key={photo.id}>
                      <img
                        src={photo.preview}
                        alt="Preview"
                        loading="lazy"
                      />
                      <ImageListItemBar
                        actionIcon={
                          <IconButton
                            sx={{ color: 'white' }}
                            onClick={() => removePhoto(photo.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        }
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={uploadingPhotos}
            startIcon={uploadingPhotos ? <CircularProgress size={20} /> : <UploadIcon />}
          >
            {uploadingPhotos ? 'Uploading...' : (editingRecord ? 'Update' : 'Save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ObservationsPage;
