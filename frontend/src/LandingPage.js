import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Container,
  Grid,
  Paper,
  Stack,
  Chip
} from '@mui/material';
import {
  Agriculture,
  DirectionsCar,
  Science,
  Assignment,
  Engineering,
  Analytics
} from '@mui/icons-material';

const FeatureCard = ({ icon: Icon, title, description }) => (
  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
    <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
      <Icon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
      <Typography variant="h6" component="h3" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </CardContent>
  </Card>
);

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: DirectionsCar,
      title: 'Vehicle Management',
      description: 'Track and manage your farming vehicles, maintenance schedules, and operational status.'
    },
    {
      icon: Agriculture,
      title: 'Crop Management',
      description: 'Monitor crop health, growth stages, and yield predictions with detailed analytics.'
    },
    {
      icon: Science,
      title: 'Input Tracking',
      description: 'Manage fertilizers, pesticides, and other inputs with precise application records.'
    },
    {
      icon: Assignment,
      title: 'Application Records',
      description: 'Keep detailed records of all farming applications and treatments applied.'
    },
    {
      icon: Engineering,
      title: 'Maintenance Logs',
      description: 'Schedule and track vehicle maintenance to ensure optimal performance.'
    },
    {
      icon: Analytics,
      title: 'Data Analytics',
      description: 'Generate reports and insights to optimize your farming operations.'
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Hero Section */}
      <Paper
        sx={{
          position: 'relative',
          backgroundColor: 'grey.800',
          color: 'white',
          mb: 4,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(https://images.unsplash.com/photo-1500937386664-56d1dfef3854?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            backgroundColor: 'rgba(0,0,0,.3)',
          }}
        />
        <Container maxWidth="lg" sx={{ position: 'relative', py: 8 }}>
          <Typography
            component="h1"
            variant="h2"
            color="inherit"
            gutterBottom
            sx={{ fontWeight: 'bold' }}
          >
            NHFarming
          </Typography>
          <Typography variant="h5" color="inherit" paragraph sx={{ mb: 4 }}>
            Your comprehensive digital farming management solution. 
            Streamline operations, track performance, and maximize yields with our intuitive platform.
          </Typography>
          <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 2 }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/login')}
              sx={{ minWidth: 120 }}
            >
              Login
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/register')}
              sx={{ 
                minWidth: 120,
                color: 'white',
                borderColor: 'white',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              Register
            </Button>
          </Stack>
        </Container>
      </Paper>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography
          component="h2"
          variant="h3"
          align="center"
          color="text.primary"
          gutterBottom
          sx={{ mb: 6 }}
        >
          Why Choose NHFarming?
        </Typography>
        
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <FeatureCard {...feature} />
            </Grid>
          ))}
        </Grid>

        {/* Call to Action */}
        <Card sx={{ textAlign: 'center', py: 4, px: 2 }}>
          <CardContent>
            <Typography variant="h4" component="h3" gutterBottom>
              Ready to Transform Your Farming Operations?
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 3 }}>
              Join thousands of farmers who have already digitized their operations with NHFarming.
              Start your free trial today and experience the future of farming management.
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center" sx={{ flexWrap: 'wrap', gap: 2 }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/register')}
                startIcon={<Agriculture />}
              >
                Get Started
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default LandingPage; 