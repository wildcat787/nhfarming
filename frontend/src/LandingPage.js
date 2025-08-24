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
  Chip,
  useTheme,
  useMediaQuery
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
  <Card 
    sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 4
      }
    }}
  >
    <CardContent sx={{ 
      flexGrow: 1, 
      textAlign: 'center',
      p: 3,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Icon sx={{ 
        fontSize: 56, 
        color: 'primary.main', 
        mb: 2,
        p: 1,
        bgcolor: 'primary.50'
      }} />
      <Typography 
        variant="h6" 
        component="h3" 
        gutterBottom
        sx={{ 
          fontWeight: 600,
          mb: 1
        }}
      >
        {title}
      </Typography>
      <Typography 
        variant="body2" 
        color="text.secondary"
        sx={{ 
          lineHeight: 1.6,
          maxWidth: '100%'
        }}
      >
        {description}
      </Typography>
    </CardContent>
  </Card>
);

const LandingPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const features = [
    {
      icon: DirectionsCar,
      title: 'Vehicle Management',
      description: 'Track and manage your farming vehicles, maintenance schedules, and operational status with real-time monitoring.'
    },
    {
      icon: Agriculture,
      title: 'Crop Management',
      description: 'Monitor crop health, growth stages, and yield predictions with detailed analytics and weather integration.'
    },
    {
      icon: Science,
      title: 'Input Tracking',
      description: 'Manage fertilizers, pesticides, and other inputs with precise application records and cost tracking.'
    },
    {
      icon: Assignment,
      title: 'Application Records',
      description: 'Keep detailed records of all farming applications and treatments with compliance documentation.'
    },
    {
      icon: Engineering,
      title: 'Maintenance Logs',
      description: 'Schedule and track vehicle maintenance to ensure optimal performance and prevent breakdowns.'
    },
    {
      icon: Analytics,
      title: 'Data Analytics',
      description: 'Generate comprehensive reports and insights to optimize your farming operations and increase profitability.'
    }
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'background.default',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Hero Section */}
      <Paper
        sx={{
          position: 'relative',
          backgroundColor: 'grey.800',
          color: 'white',
          mb: 6,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(https://images.unsplash.com/photo-1500937386664-56d1dfef3854?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80)',
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center'
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
        <Container 
          maxWidth="lg" 
          sx={{ 
            position: 'relative', 
            py: { xs: 6, md: 10 },
            textAlign: 'center'
          }}
        >
          <Typography
            component="h1"
            variant={isMobile ? "h3" : "h2"}
            color="inherit"
            gutterBottom
            sx={{ 
              fontWeight: 'bold',
              mb: 3,
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
            }}
          >
            NHFarming
          </Typography>
          <Typography 
            variant={isMobile ? "h6" : "h5"} 
            color="inherit" 
            paragraph 
            sx={{ 
              mb: 4,
              maxWidth: '800px',
              mx: 'auto',
              lineHeight: 1.6,
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
            }}
          >
            Your comprehensive digital farming management solution. 
            Streamline operations, track performance, and maximize yields with our intuitive platform.
          </Typography>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            sx={{ 
              justifyContent: 'center',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2
            }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/login')}
              sx={{ 
                minWidth: 140,
                py: 1.5,
                px: 3,
                fontSize: '1.1rem',
                fontWeight: 600
              }}
            >
              Login
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/register')}
              sx={{ 
                minWidth: 140,
                py: 1.5,
                px: 3,
                fontSize: '1.1rem',
                fontWeight: 600,
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
      <Container maxWidth="lg" sx={{ py: 6, flex: 1 }}>
        <Typography
          component="h2"
          variant={isMobile ? "h4" : "h3"}
          align="center"
          color="text.primary"
          gutterBottom
          sx={{ 
            mb: 6,
            fontWeight: 600,
            maxWidth: '600px',
            mx: 'auto'
          }}
        >
          Why Choose NHFarming?
        </Typography>
        
        <Grid 
          container 
          spacing={4} 
          sx={{ 
            mb: 8,
            justifyContent: 'center'
          }}
        >
          {features.map((feature, index) => (
            <Grid xs={12} sm={6} md={4} key={index}>
              <FeatureCard {...feature} />
            </Grid>
          ))}
        </Grid>

        {/* Call to Action */}
        <Card 
          sx={{ 
            textAlign: 'center', 
            py: 6, 
            px: { xs: 2, md: 4 },
            maxWidth: '800px',
            mx: 'auto',
            bgcolor: 'primary.50',
            border: '1px solid',
            borderColor: 'primary.200'
          }}
        >
          <CardContent>
            <Typography 
              variant={isMobile ? "h5" : "h4"} 
              component="h3" 
              gutterBottom
              sx={{ 
                fontWeight: 600,
                mb: 2
              }}
            >
              Ready to Transform Your Farming Operations?
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              paragraph 
              sx={{ 
                mb: 4,
                maxWidth: '600px',
                mx: 'auto',
                lineHeight: 1.7
              }}
            >
              Join thousands of farmers who have already digitized their operations with NHFarming.
              Start your free trial today and experience the future of farming management.
            </Typography>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2} 
              justifyContent="center" 
              sx={{ 
                flexWrap: 'wrap', 
                gap: 2
              }}
            >
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/register')}
                startIcon={<Agriculture />}
                sx={{ 
                  minWidth: 160,
                  py: 1.5,
                  px: 3,
                  fontSize: '1.1rem',
                  fontWeight: 600
                }}
              >
                Get Started
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/login')}
                sx={{ 
                  minWidth: 160,
                  py: 1.5,
                  px: 3,
                  fontSize: '1.1rem',
                  fontWeight: 600
                }}
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