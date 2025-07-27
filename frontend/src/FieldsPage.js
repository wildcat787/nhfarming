import React, { useState, useEffect } from 'react';
import { apiRequest } from './api';
import {
  Box, Button, TextField, Typography, Grid, Snackbar, CircularProgress, 
  IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, 
  MenuItem, Chip, useTheme, useMediaQuery, Tabs, Tab, Card, CardContent, CardActions,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  List, ListItem, ListItemText, ListItemIcon, Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MapIcon from '@mui/icons-material/Map';
import HistoryIcon from '@mui/icons-material/History';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import WaterIcon from '@mui/icons-material/Water';
import TerrainIcon from '@mui/icons-material/Terrain';
import PageLayout, { SectionLayout, CardLayout } from './components/PageLayout';

// Google Maps component
const GoogleMap = ({ center, border, height = 400, onMapClick, isDrawing = false }) => {
  const [map, setMap] = useState(null);
  const [polygon, setPolygon] = useState(null);
  const [marker, setMarker] = useState(null);
  const mapRef = React.useRef(null);

  useEffect(() => {
    // Load Google Maps script
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initMap();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=drawing`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
    };

    const initMap = () => {
      if (!mapRef.current) return;

      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: center || { lat: -33.8688, lng: 151.2093 },
        zoom: 15,
        mapTypeId: 'satellite',
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      setMap(mapInstance);

      // Add drawing tools if in drawing mode
      if (isDrawing) {
        const drawingManager = new window.google.maps.drawing.DrawingManager({
          drawingMode: window.google.maps.drawing.OverlayType.POLYGON,
          drawingControl: true,
          drawingControlOptions: {
            position: window.google.maps.ControlPosition.TOP_CENTER,
            drawingModes: [window.google.maps.drawing.OverlayType.POLYGON]
          },
          polygonOptions: {
            fillColor: '#4CAF50',
            fillOpacity: 0.3,
            strokeWeight: 2,
            strokeColor: '#4CAF50',
            clickable: true,
            editable: true,
            zIndex: 1
          }
        });

        drawingManager.setMap(mapInstance);

        window.google.maps.event.addListener(drawingManager, 'polygoncomplete', (polygon) => {
          const path = polygon.getPath();
          const coordinates = [];
          for (let i = 0; i < path.getLength(); i++) {
            const point = path.getAt(i);
            coordinates.push({ lat: point.lat(), lng: point.lng() });
          }
          if (onMapClick) onMapClick(coordinates);
        });
      }

      // Add existing border if provided
      if (border && border.length > 0) {
        const existingPolygon = new window.google.maps.Polygon({
          paths: border,
          fillColor: '#4CAF50',
          fillOpacity: 0.3,
          strokeWeight: 2,
          strokeColor: '#4CAF50',
          map: mapInstance
        });
        setPolygon(existingPolygon);
      }

      // Add center marker if provided
      if (center) {
        const centerMarker = new window.google.maps.Marker({
          position: center,
          map: mapInstance,
          title: 'Field Center',
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#FF5722',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2
          }
        });
        setMarker(centerMarker);
      }
    };

    loadGoogleMaps();

    return () => {
      if (map) {
        window.google.maps.event.clearInstanceListeners(map);
      }
    };
  }, [center, border, isDrawing, onMapClick]);

  return (
    <div 
      ref={mapRef} 
      style={{ 
        width: '100%', 
        height: height,
        borderRadius: 12,
        overflow: 'hidden'
      }} 
    />
  );
};

export default function FieldsPage() {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ 
    name: '', 
    area: '', 
    area_unit: 'hectares', 
    location: '', 
    coordinates: '', 
    soil_type: '', 
    irrigation_type: '',
    notes: '',
    border_coordinates: ''
  });
  const [editField, setEditField] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteField, setDeleteField] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedField, setSelectedField] = useState(null);
  const [fieldHistory, setFieldHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [showMap, setShowMap] = useState(false);
  const [mapDrawing, setMapDrawing] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const areaUnits = [
    'hectares',
    'acres',
    'square meters',
    'square kilometers'
  ];

  const soilTypes = [
    'Clay loam',
    'Sandy loam',
    'Silt loam',
    'Clay',
    'Sandy clay',
    'Silty clay',
    'Loam',
    'Sandy',
    'Silty',
    'Peat',
    'Other'
  ];

  const irrigationTypes = [
    'Sprinkler',
    'Drip',
    'Flood',
    'Furrow',
    'Center pivot',
    'Linear move',
    'Hand',
    'None',
    'Other'
  ];

  const fetchFields = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/fields');
      setFields(data);
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchFieldHistory = async (fieldId) => {
    setHistoryLoading(true);
    try {
      const data = await apiRequest(`/fields/${fieldId}`);
      setFieldHistory(data.history || []);
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => { 
    fetchFields(); 
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async e => {
    e.preventDefault();
    try {
      await apiRequest('/fields', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setForm({ 
        name: '', 
        area: '', 
        area_unit: 'hectares', 
        location: '', 
        coordinates: '', 
        soil_type: '', 
        irrigation_type: '',
        notes: '',
        border_coordinates: ''
      });
      fetchFields();
      setSnackbar({ open: true, message: 'Field added successfully!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    }
  };

  const handleEdit = field => {
    setEditField(field);
    setForm({
      name: field.name,
      area: field.area,
      area_unit: field.area_unit,
      location: field.location || '',
      coordinates: field.coordinates || '',
      soil_type: field.soil_type || '',
      irrigation_type: field.irrigation_type || '',
      notes: field.notes || '',
      border_coordinates: field.border_coordinates || ''
    });
  };

  const handleUpdate = async e => {
    e.preventDefault();
    try {
      await apiRequest(`/fields/${editField.id}`, {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      setEditField(null);
      setForm({ 
        name: '', 
        area: '', 
        area_unit: 'hectares', 
        location: '', 
        coordinates: '', 
        soil_type: '', 
        irrigation_type: '',
        notes: '',
        border_coordinates: ''
      });
      fetchFields();
      setSnackbar({ open: true, message: 'Field updated successfully!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    }
  };

  const handleDelete = field => {
    setDeleteField(field);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await apiRequest(`/fields/${deleteField.id}`, {
        method: 'DELETE',
      });
      fetchFields();
      setSnackbar({ open: true, message: 'Field deleted successfully!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
      setDeleteDialogOpen(false);
      setDeleteField(null);
    }
  };

  const handleViewHistory = (field) => {
    setSelectedField(field);
    fetchFieldHistory(field.id);
    setActiveTab(1);
  };

  const handleViewMap = (field) => {
    setSelectedField(field);
    setShowMap(true);
    setActiveTab(2);
  };

  const handleMapClick = (coordinates) => {
    setForm(prev => ({
      ...prev,
      border_coordinates: JSON.stringify(coordinates)
    }));
  };

  const FieldCard = ({ field }) => (
    <CardLayout>
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AgricultureIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
            {field.name}
          </Typography>
        </Box>
        
        <Grid container spacing={1} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Area: <strong>{field.area} {field.area_unit}</strong>
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Location: <strong>{field.location || 'N/A'}</strong>
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Soil: <strong>{field.soil_type || 'N/A'}</strong>
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Irrigation: <strong>{field.irrigation_type || 'N/A'}</strong>
            </Typography>
          </Grid>
        </Grid>
        
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip 
            icon={<AgricultureIcon />}
            label={`${field.crop_count || 0} crops`} 
            size="small" 
            variant="outlined"
          />
          <Chip 
            icon={<HistoryIcon />}
            label={`${field.application_count || 0} applications`} 
            size="small" 
            variant="outlined"
          />
        </Box>
        
        {field.notes && (
          <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
            {field.notes}
          </Typography>
        )}
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 'auto', pt: 2 }}>
        <IconButton 
          color="primary" 
          onClick={() => handleViewHistory(field)} 
          title="View History"
          size="small"
        >
          <HistoryIcon />
        </IconButton>
        <IconButton 
          color="primary" 
          onClick={() => handleViewMap(field)} 
          title="View Map"
          size="small"
        >
          <MapIcon />
        </IconButton>
        <IconButton 
          color="primary" 
          onClick={() => handleEdit(field)}
          title="Edit"
          size="small"
        >
          <EditIcon />
        </IconButton>
        <IconButton 
          color="error" 
          onClick={() => handleDelete(field)}
          title="Delete"
          size="small"
        >
          <DeleteIcon />
        </IconButton>
      </Box>
    </CardLayout>
  );

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index} style={{ paddingTop: 16 }}>
      {value === index && children}
    </div>
  );

  return (
    <PageLayout 
      title="🌾 Fields" 
      subtitle="Manage your farm paddocks and field locations"
    >
      <SectionLayout title={editField ? 'Edit Field' : 'Add New Field'}>
        <Box component="form" onSubmit={editField ? handleUpdate : handleAdd}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Field Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Area"
                name="area"
                type="number"
                value={form.area}
                onChange={handleChange}
                required
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                select
                label="Unit"
                name="area_unit"
                value={form.area_unit}
                onChange={handleChange}
                required
                size="small"
              >
                {areaUnits.map(unit => (
                  <MenuItem key={unit} value={unit}>{unit}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location Description"
                name="location"
                value={form.location}
                onChange={handleChange}
                size="small"
                placeholder="e.g., North side of property"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Coordinates (lat,lng)"
                name="coordinates"
                value={form.coordinates}
                onChange={handleChange}
                size="small"
                placeholder="e.g., -33.8688,151.2093"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Soil Type"
                name="soil_type"
                value={form.soil_type}
                onChange={handleChange}
                size="small"
              >
                <MenuItem value="">Select soil type</MenuItem>
                {soilTypes.map(type => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Irrigation Type"
                name="irrigation_type"
                value={form.irrigation_type}
                onChange={handleChange}
                size="small"
              >
                <MenuItem value="">Select irrigation type</MenuItem>
                {irrigationTypes.map(type => (
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
                rows={3}
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <Button type="submit" variant="contained" color="primary">
                  {editField ? 'Update' : 'Add'} Field
                </Button>
                {editField && (
                  <Button 
                    variant="outlined" 
                    onClick={() => {
                      setEditField(null);
                      setForm({ 
                        name: '', 
                        area: '', 
                        area_unit: 'hectares', 
                        location: '', 
                        coordinates: '', 
                        soil_type: '', 
                        irrigation_type: '',
                        notes: '',
                        border_coordinates: ''
                      });
                    }}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  variant="outlined"
                  onClick={() => setMapDrawing(!mapDrawing)}
                  startIcon={<MapIcon />}
                >
                  {mapDrawing ? 'Stop Drawing' : 'Draw Border'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </SectionLayout>

      {mapDrawing && (
        <SectionLayout title="Draw Field Border">
          <GoogleMap 
            height={300}
            isDrawing={true}
            onMapClick={handleMapClick}
          />
        </SectionLayout>
      )}

      {selectedField && (
        <SectionLayout title={`${selectedField.name} - Details`}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Overview" />
            <Tab label="History" />
            <Tab label="Map" />
          </Tabs>

          <TabPanel value={activeTab} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <CardLayout>
                  <Typography variant="h6" gutterBottom>Field Information</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><AgricultureIcon /></ListItemIcon>
                      <ListItemText 
                        primary="Area" 
                        secondary={`${selectedField.area} ${selectedField.area_unit}`} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><LocationOnIcon /></ListItemIcon>
                      <ListItemText 
                        primary="Location" 
                        secondary={selectedField.location || 'Not specified'} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><TerrainIcon /></ListItemIcon>
                      <ListItemText 
                        primary="Soil Type" 
                        secondary={selectedField.soil_type || 'Not specified'} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><WaterIcon /></ListItemIcon>
                      <ListItemText 
                        primary="Irrigation" 
                        secondary={selectedField.irrigation_type || 'Not specified'} 
                      />
                    </ListItem>
                  </List>
                </CardLayout>
              </Grid>
              <Grid item xs={12} md={6}>
                <CardLayout>
                  <Typography variant="h6" gutterBottom>Statistics</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><AgricultureIcon /></ListItemIcon>
                      <ListItemText 
                        primary="Crops Planted" 
                        secondary={selectedField.crop_count || 0} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><HistoryIcon /></ListItemIcon>
                      <ListItemText 
                        primary="Applications" 
                        secondary={selectedField.application_count || 0} 
                      />
                    </ListItem>
                  </List>
                </CardLayout>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            {historyLoading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Details</TableCell>
                      <TableCell>Rate</TableCell>
                      <TableCell>Notes</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fieldHistory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography variant="body2" color="text.secondary" py={4}>
                            No history found for this field.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      fieldHistory.map((item, index) => (
                        <TableRow key={`${item.type}-${item.id}-${index}`}>
                          <TableCell>{item.date}</TableCell>
                          <TableCell>
                            <Chip 
                              label={item.type} 
                              color={item.type === 'application' ? 'primary' : 'secondary'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {item.type === 'application' 
                              ? `${item.input_name} on ${item.crop_name}`
                              : item.crop_name
                            }
                          </TableCell>
                          <TableCell>
                            {item.rate} {item.unit}
                          </TableCell>
                          <TableCell>{item.notes}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <GoogleMap 
              center={selectedField.coordinates ? JSON.parse(selectedField.coordinates) : null}
              border={selectedField.border_coordinates ? JSON.parse(selectedField.border_coordinates) : null}
              height={400}
            />
          </TabPanel>
        </SectionLayout>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {fields.map(field => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={field.id}>
              <FieldCard field={field} />
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
        <DialogTitle>Delete Field?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{deleteField?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" onClick={confirmDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </PageLayout>
  );
} 