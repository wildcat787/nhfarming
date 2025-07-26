import React, { useState, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Button, TextField, Typography, Alert, Paper, Link, Container, useMediaQuery, useTheme } from '@mui/material';

export default function LoginPage() {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      await login(username, password);
      navigate('/crops');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ px: isMobile ? 2 : 3 }}>
      <Box sx={{ 
        mt: isMobile ? 4 : 8, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center' 
      }}>
        <Paper sx={{ 
          p: isMobile ? 3 : 4, 
          width: '100%',
          borderRadius: isMobile ? 2 : 3
        }}>
          <Typography 
            component="h1" 
            variant={isMobile ? "h4" : "h5"} 
            align="center" 
            gutterBottom
            sx={{ mb: isMobile ? 2 : 3 }}
          >
            Login
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={e => setUsername(e.target.value)}
              size={isMobile ? "medium" : "small"}
              sx={{ mb: isMobile ? 2 : 1 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              size={isMobile ? "medium" : "small"}
              sx={{ mb: isMobile ? 2 : 1 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size={isMobile ? "large" : "medium"}
              sx={{ 
                mt: isMobile ? 2 : 3, 
                mb: isMobile ? 2 : 2,
                py: isMobile ? 1.5 : 1
              }}
            >
              Login
            </Button>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Box sx={{ textAlign: 'center', mt: isMobile ? 2 : 1 }}>
              <Link 
                component={RouterLink} 
                to="/forgot-password" 
                variant="body2"
                sx={{ 
                  fontSize: isMobile ? '1rem' : '0.875rem',
                  padding: isMobile ? 1 : 0.5
                }}
              >
                Forgot your password?
              </Link>
            </Box>
            <Box sx={{ textAlign: 'center', mt: isMobile ? 2 : 1 }}>
              <Link 
                component={RouterLink} 
                to="/register" 
                variant="body2"
                sx={{ 
                  fontSize: isMobile ? '1rem' : '0.875rem',
                  padding: isMobile ? 1 : 0.5
                }}
              >
                Don't have an account? Sign up
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
} 