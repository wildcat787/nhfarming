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
const GoogleMap = ({ center, border, height = 400, onMapClick, isDrawing = false, zoomToBorder = false }) => {
  const [map, setMap] = useState(null);
  const [polygon, setPolygon] = useState(null);
  const [marker, setMarker] = useState(null);
  const [mapError, setMapError] = useState(null);
  const mapRef = React.useRef(null);

  useEffect(() => {
    // Load Google Maps script
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initMap();
        return;
      }

      // Check if API key is configured
      const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
      if (!apiKey || apiKey === 'your-google-maps-api-key-here') {
        console.warn('Google Maps API key not configured. Map functionality will be disabled.');
        setMapError('Google Maps API key not configured. Please set REACT_APP_GOOGLE_MAPS_API_KEY in your .env file.');
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=drawing`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      script.onerror = () => {
        console.error('Failed to load Google Maps API');
        setMapError('Failed to load Google Maps. Please check your API key and internet connection.');
      };
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

        // Zoom to border if requested
        if (zoomToBorder) {
          const bounds = new window.google.maps.LatLngBounds();
          border.forEach(coord => {
            bounds.extend(new window.google.maps.LatLng(coord.lat, coord.lng));
          });
          mapInstance.fitBounds(bounds);
          
          // Add some padding to the bounds
          const listener = window.google.maps.event.addListenerOnce(mapInstance, 'bounds_changed', () => {
            const currentZoom = mapInstance.getZoom();
            if (currentZoom > 18) {
              mapInstance.setZoom(18);
            }
          });
        }
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

          // If zooming is requested but no border, zoom to center
          if (zoomToBorder && (!border || border.length === 0)) {
            mapInstance.setCenter(center);
            mapInstance.setZoom(16);
          }
        }
    };

    loadGoogleMaps();

    return () => {
      if (map) {
        window.google.maps.event.clearInstanceListeners(map);
      }
    };
  }, [center, border, isDrawing, onMapClick]);

  if (mapError) {
    return (
      <Box 
        sx={{ 
          width: '100%', 
          height: height,
          borderRadius: 12,
          border: '2px dashed #ccc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          bgcolor: 'grey.50',
          p: 3
        }}
      >
        <MapIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Map Unavailable
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          {mapError}
        </Typography>
        <Button 
          variant="outlined" 
          size="small" 
          sx={{ mt: 2 }}
          onClick={() => window.open('https://console.cloud.google.com/', '_blank')}
        >
          Get Google Maps API Key
        </Button>
      </Box>
    );
  }

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
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ 
    name: '', 
    area: '', 
    area_unit: 'hectares', 
    location: '', 
    coordinates: '', 
    soil_type: '', 
    irrigation_type: '',
    notes: '',
    border_coordinates: '',
    farm_id: ''
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
  const [zoomToBorder, setZoomToBorder] = useState(false);
  
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

  const fetchFarms = async () => {
    try {
      const data = await apiRequest('/farms');
      setFarms(data);
    } catch (err) {
      console.error('Failed to fetch farms:', err);
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
    fetchFarms();
  }, []);

  // Reset zoom flag after map has been initialized
  useEffect(() => {
    if (zoomToBorder && selectedField) {
      // Reset the flag after a short delay to allow map to initialize
      const timer = setTimeout(() => {
        setZoomToBorder(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [zoomToBorder, selectedField]);

  const handleChange = e => {
    const { name, value } = e.target;
    
    // If area unit is changed and we have border coordinates, recalculate area
    if (name === 'area_unit' && form.border_coordinates) {
      try {
        const coordinates = JSON.parse(form.border_coordinates);
        const areaInSquareMeters = calculateAreaFromCoordinates(coordinates);
        const newArea = convertArea(areaInSquareMeters, value);
        
        setForm(prev => ({
          ...prev,
          [name]: value,
          area: newArea
        }));
      } catch (error) {
        console.error('Error recalculating area:', error);
        setForm({ ...form, [name]: value });
      }
    } else {
      setForm({ ...form, [name]: value });
    }
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
        border_coordinates: '',
        farm_id: ''
      });
      setShowForm(false);
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
      border_coordinates: field.border_coordinates || '',
      farm_id: field.farm_id || ''
    });
    setShowForm(true);
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
        border_coordinates: '',
        farm_id: ''
      });
      setShowForm(false);
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
    // Set zoom flag to true when viewing map from field card
    setZoomToBorder(true);
  };

  // Calculate area from polygon coordinates using Shoelace formula
  const calculateAreaFromCoordinates = (coordinates) => {
    if (!coordinates || coordinates.length < 3) return 0;
    
    let area = 0;
    const n = coordinates.length;
    
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += coordinates[i].lng * coordinates[j].lat;
      area -= coordinates[j].lng * coordinates[i].lat;
    }
    
    area = Math.abs(area) / 2;
    
    // Convert from square degrees to square meters
    // This is an approximation - for more accuracy, we'd need to account for latitude
    const lat = coordinates[0]?.lat || 0;
    const metersPerDegreeLat = 111320; // meters per degree latitude
    const metersPerDegreeLng = 111320 * Math.cos(lat * Math.PI / 180); // meters per degree longitude
    
    const areaInSquareMeters = area * metersPerDegreeLat * metersPerDegreeLng;
    
    return areaInSquareMeters;
  };

  // Convert area to different units
  const convertArea = (areaInSquareMeters, targetUnit) => {
    switch (targetUnit) {
      case 'hectares':
        return (areaInSquareMeters / 10000).toFixed(2);
      case 'acres':
        return (areaInSquareMeters / 4046.86).toFixed(2);
      case 'square kilometers':
        return (areaInSquareMeters / 1000000).toFixed(4);
      case 'square meters':
      default:
        return Math.round(areaInSquareMeters);
    }
  };

  // Calculate center point from polygon coordinates
  const calculateCenterFromCoordinates = (coordinates) => {
    if (!coordinates || coordinates.length === 0) return null;
    
    let sumLat = 0;
    let sumLng = 0;
    
    coordinates.forEach(coord => {
      sumLat += coord.lat;
      sumLng += coord.lng;
    });
    
    return {
      lat: sumLat / coordinates.length,
      lng: sumLng / coordinates.length
    };
  };

  const handleMapClick = (coordinates) => {
    // Calculate area from the drawn coordinates
    const areaInSquareMeters = calculateAreaFromCoordinates(coordinates);
    const currentUnit = form.area_unit || 'hectares';
    const calculatedArea = convertArea(areaInSquareMeters, currentUnit);
    
    // Calculate center point
    const center = calculateCenterFromCoordinates(coordinates);
    
    setForm(prev => ({
      ...prev,
      border_coordinates: JSON.stringify(coordinates),
      area: calculatedArea,
      coordinates: center ? JSON.stringify(center) : prev.coordinates
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
        
        {field.farm_name && (
          <Typography variant="body2" color="primary" sx={{ mb: 1, fontWeight: 'medium' }}>
            Farm: {field.farm_name}
          </Typography>
        )}
        
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
          title={field.border_coordinates ? "View Map (Zoom to Field)" : "View Map"}
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
      {showForm && (
        <SectionLayout title={editField ? 'Edit Field' : 'Add New Field'}>
          <Box component="form" onSubmit={editField ? handleUpdate : handleAdd}>
          <Grid container spacing={3}>
            
            {/* Basic Field Information */}
            <Grid item xs={12}>
              <Card sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
                  📍 Basic Field Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: '#637381' }} gutterBottom>
                      Field Name *
                    </Typography>
                    <TextField
                      fullWidth
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      size="small"
                      placeholder="e.g., North Field"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: '#637381' }} gutterBottom>
                      Farm *
                    </Typography>
                    <TextField
                      fullWidth
                      select
                      name="farm_id"
                      value={form.farm_id}
                      onChange={handleChange}
                      required
                      size="small"
                    >
                      <MenuItem value="">Select a farm</MenuItem>
                      {farms.map(farm => (
                        <MenuItem key={farm.id} value={farm.id}>
                          {farm.name} ({farm.location || 'No location'})
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: '#637381' }} gutterBottom>
                      Location Description
                    </Typography>
                    <TextField
                      fullWidth
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      size="small"
                      placeholder="e.g., North side of property, near the creek"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: '#637381' }} gutterBottom>
                      Center Coordinates (lat,lng)
                    </Typography>
                    <TextField
                      fullWidth
                      name="coordinates"
                      value={form.coordinates}
                      onChange={handleChange}
                      size="small"
                      placeholder="e.g., -33.8688,151.2093"
                      helperText={form.border_coordinates ? "Auto-calculated from drawn border" : ""}
                      InputProps={{
                        readOnly: form.border_coordinates ? true : false,
                      }}
                    />
                  </Grid>
                </Grid>
              </Card>
            </Grid>

            {/* Area & Measurements */}
            <Grid item xs={12}>
              <Card sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
                  📏 Area & Measurements
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: '#637381' }} gutterBottom>
                      Area *
                    </Typography>
                    <TextField
                      fullWidth
                      name="area"
                      type="number"
                      value={form.area}
                      onChange={handleChange}
                      required
                      size="small"
                      placeholder="e.g., 25.5"
                      helperText={form.border_coordinates ? "Auto-calculated from drawn border" : ""}
                      InputProps={{
                        readOnly: form.border_coordinates ? true : false,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Area Unit *
                    </Typography>
                    <TextField
                      fullWidth
                      select
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
                </Grid>
              </Card>
            </Grid>

            {/* Field Characteristics */}
            <Grid item xs={12}>
              <Card sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
                  🌱 Field Characteristics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Soil Type
                    </Typography>
                    <TextField
                      fullWidth
                      select
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
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Irrigation Type
                    </Typography>
                    <TextField
                      fullWidth
                      select
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
                </Grid>
              </Card>
            </Grid>

            {/* Border Coordinates */}
            <Grid item xs={12}>
              <Card sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
                  🗺️ Field Boundaries
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Border Coordinates (JSON array of lat,lng pairs)
                    </Typography>
                    <TextField
                      fullWidth
                      name="border_coordinates"
                      value={form.border_coordinates}
                      onChange={handleChange}
                      size="small"
                      multiline
                      rows={4}
                      placeholder='[{"lat": -33.8688, "lng": 151.2093}, {"lat": -33.8690, "lng": 151.2095}]'
                      helperText="Enter field boundary coordinates as JSON array. Use 'Draw Border' button below for visual drawing."
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Button
                        variant="outlined"
                        onClick={() => setMapDrawing(!mapDrawing)}
                        startIcon={<MapIcon />}
                        disabled={!process.env.REACT_APP_GOOGLE_MAPS_API_KEY || process.env.REACT_APP_GOOGLE_MAPS_API_KEY === 'your-google-maps-api-key-here'}
                        title={!process.env.REACT_APP_GOOGLE_MAPS_API_KEY || process.env.REACT_APP_GOOGLE_MAPS_API_KEY === 'your-google-maps-api-key-here' ? 'Google Maps API key not configured' : ''}
                      >
                        {mapDrawing ? 'Stop Drawing' : 'Draw Border'}
                      </Button>
                      {form.border_coordinates && (
                        <Button
                          variant="outlined"
                          onClick={() => {
                            try {
                              const coordinates = JSON.parse(form.border_coordinates);
                              const areaInSquareMeters = calculateAreaFromCoordinates(coordinates);
                              const calculatedArea = convertArea(areaInSquareMeters, form.area_unit);
                              setForm(prev => ({ ...prev, area: calculatedArea }));
                              setSnackbar({ open: true, message: 'Area recalculated from border!', severity: 'success' });
                            } catch (error) {
                              setSnackbar({ open: true, message: 'Error recalculating area', severity: 'error' });
                            }
                          }}
                          startIcon={<AgricultureIcon />}
                          title="Recalculate area from border coordinates"
                        >
                          Recalculate Area
                        </Button>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Card>
            </Grid>

            {/* Notes */}
            <Grid item xs={12}>
              <Card sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
                  📝 Notes
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Field Notes
                    </Typography>
                    <TextField
                      fullWidth
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                      multiline
                      rows={3}
                      size="small"
                      placeholder="Additional notes about this field..."
                    />
                  </Grid>
                </Grid>
              </Card>
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button 
                  variant="outlined" 
                  onClick={() => {
                    setShowForm(false);
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
                      border_coordinates: '',
                      farm_id: ''
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  startIcon={<AddIcon />}
                >
                  {editField ? 'Update' : 'Add'} Field
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
        </SectionLayout>
      )}

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
              zoomToBorder={zoomToBorder}
            />
          </TabPanel>
        </SectionLayout>
      )}

      <SectionLayout title="Your Fields">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Fields ({fields.length})</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowForm(true)}
            disabled={showForm}
          >
            Add Field
          </Button>
        </Box>
        
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        ) : fields.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No fields found. Add your first field to get started.
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setShowForm(true)}
              sx={{ mt: 2 }}
            >
              Add First Field
            </Button>
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
      </SectionLayout>

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