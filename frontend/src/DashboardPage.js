import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from './api';
import { useAuth } from './AuthContext';
import {
  Box, Typography, Grid, Card, CardContent, CardActions, Button, 
  useTheme, useMediaQuery, Chip, CircularProgress, Paper, Divider,
  Avatar, List, ListItem, ListItemAvatar, ListItemText, ListItemSecondaryAction
} from '@mui/material';
import {
  Agriculture as CropsIcon,
  LocalShipping as VehiclesIcon,
  Inventory as InputsIcon,
  Assignment as ApplicationsIcon,
  Map as FieldsIcon,
  People as UsersIcon,
  Build as MaintenanceIcon,
  Dashboard as DashboardIcon,
  Home as FarmIcon,
  LocationOn as LocationIcon,
  Straighten as AreaIcon,
  Person as PersonIcon
} from '@mui/icons-material';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [stats, setStats] = useState({
    crops: 0,
    vehicles: 0,
    inputs: 0,
    applications: 0,
    fields: 0,
    maintenance: 0
  });
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [crops, vehicles, inputs, applications, fields, maintenance, farmsData] = await Promise.all([
        apiRequest('/crops'),
        apiRequest('/vehicles'),
        apiRequest('/inputs'),
        apiRequest('/applications'),
        apiRequest('/fields'),
        apiRequest('/maintenance'),
        apiRequest('/farms')
      ]);

      setStats({
        crops: crops.length,
        vehicles: vehicles.length,
        inputs: inputs.length,
        applications: applications.length,
        fields: fields.length,
        maintenance: maintenance.length
      });
      
      setFarms(farmsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const dashboardItems = [
    {
      title: 'Crops',
      description: 'Manage your crops, planting dates, and harvest tracking',
      icon: <CropsIcon sx={{ fontSize: 40 }} />,
      color: 'primary',
      path: '/crops',
      count: stats.crops,
      badge: `${stats.crops} crops`
    },
    {
      title: 'Fields',
      description: 'Track field information, area, and location data',
      icon: <FieldsIcon sx={{ fontSize: 40 }} />,
      color: 'success',
      path: '/fields',
      count: stats.fields,
      badge: `${stats.fields} fields`
    },
    {
      title: 'Applications',
      description: 'Record input applications, weather data, and timing',
      icon: <ApplicationsIcon sx={{ fontSize: 40 }} />,
      color: 'info',
      path: '/applications',
      count: stats.applications,
      badge: `${stats.applications} applications`
    },
    {
      title: 'Vehicles',
      description: 'Manage farm vehicles and equipment inventory',
      icon: <VehiclesIcon sx={{ fontSize: 40 }} />,
      color: 'warning',
      path: '/vehicles',
      count: stats.vehicles,
      badge: `${stats.vehicles} vehicles`
    },
    {
      title: 'Inputs',
      description: 'Track fertilizers, pesticides, and other inputs',
      icon: <InputsIcon sx={{ fontSize: 40 }} />,
      color: 'secondary',
      path: '/inputs',
      count: stats.inputs,
      badge: `${stats.inputs} inputs`
    },
    {
      title: 'Maintenance',
      description: 'Schedule and track vehicle maintenance',
      icon: <MaintenanceIcon sx={{ fontSize: 40 }} />,
      color: 'error',
      path: '/maintenance',
      count: stats.maintenance,
      badge: `${stats.maintenance} records`
    }
  ];

  // Add Farms card
  dashboardItems.unshift({
    title: 'Farms',
    description: 'Manage your farms and farm access',
    icon: <FarmIcon sx={{ fontSize: 40 }} />,
    color: 'success',
    path: '/farms',
    count: farms.length,
    badge: `${farms.length} farms`
  });

  // Add Users card only for admin users
  if (user?.role === 'admin') {
    dashboardItems.push({
      title: 'Users',
      description: 'Manage user accounts and permissions',
      icon: <UsersIcon sx={{ fontSize: 40 }} />,
      color: 'default',
      path: '/users',
      count: 0,
      badge: 'Admin only'
    });
  }

  const handleCardClick = (path) => {
    navigate(path);
  };

  const getColorByType = (colorType) => {
    switch (colorType) {
      case 'primary': return theme.palette.primary.main;
      case 'success': return theme.palette.success.main;
      case 'info': return theme.palette.info.main;
      case 'warning': return theme.palette.warning.main;
      case 'secondary': return theme.palette.secondary.main;
      case 'error': return theme.palette.error.main;
      default: return theme.palette.grey[600];
    }
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="60vh"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' },
            fontWeight: 'bold',
            color: 'primary.main'
          }}
        >
          🚜 Welcome to NHFarming
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ mb: 2, color: '#637381' }}
        >
          Your comprehensive farm management dashboard
        </Typography>
        <Typography variant="body1" sx={{ color: '#637381' }}>
          Select a section below to manage your farm operations
        </Typography>
      </Box>

      {/* Quick Stats */}
      <Paper 
        sx={{ 
          p: 3, 
          mb: 4, 
          background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.secondary.main}15)`,
          border: `1px solid ${theme.palette.divider}`
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          📊 Quick Overview
        </Typography>
        <Grid container spacing={2}>
          {Object.entries(stats).map(([key, value]) => (
            <Grid item xs={6} sm={4} md={2} key={key}>
              <Box textAlign="center">
                <Typography variant="h4" color="primary.main" fontWeight="bold">
                  {value}
                </Typography>
                <Typography variant="body2" sx={{ textTransform: 'capitalize', color: '#637381' }}>
                  {key}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>



      {/* Dashboard Cards */}
      <Grid container spacing={isMobile ? 2 : 3}>
        {dashboardItems.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.title}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: `2px solid transparent`,
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8],
                  borderColor: getColorByType(item.color),
                }
              }}
              onClick={() => handleCardClick(item.path)}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                <Box 
                  sx={{ 
                    mb: 2,
                    color: getColorByType(item.color),
                    display: 'flex',
                    justifyContent: 'center'
                  }}
                >
                  {item.icon}
                </Box>
                
                <Typography 
                  variant="h5" 
                  component="h2" 
                  gutterBottom
                  sx={{ fontWeight: 'bold' }}
                >
                  {item.title}
                </Typography>
                
                <Typography 
                  variant="body2" 
                  sx={{ mb: 2, minHeight: '3em', color: '#637381' }}
                >
                  {item.description}
                </Typography>

                <Chip 
                  label={item.badge}
                  size="small"
                  sx={{ 
                    bgcolor: getColorByType(item.color) + '20',
                    color: getColorByType(item.color),
                    fontWeight: 'bold'
                  }}
                />
              </CardContent>
              
              <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button 
                  variant="outlined" 
                  size="small"
                  sx={{ 
                    borderColor: getColorByType(item.color),
                    color: getColorByType(item.color),
                    '&:hover': {
                      bgcolor: getColorByType(item.color) + '10',
                      borderColor: getColorByType(item.color),
                    }
                  }}
                >
                  Open {item.title}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Footer */}
      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          NHFarming - Comprehensive Agricultural Management System
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          Version 1.0.0 • Built with React & Material-UI
        </Typography>
      </Box>
    </Box>
  );
} 