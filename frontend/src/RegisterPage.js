import React, { useState, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, Alert, Paper, Container, useMediaQuery, useTheme } from '@mui/material';

export default function RegisterPage() {
  const { register } = useContext(AuthContext);
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
      await register(username, password);
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
            variant={isMobile ? "h4" : "h5"} 
            mb={isMobile ? 2 : 3}
            align="center"
          >
            Register
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField 
              label="Username" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              fullWidth 
              margin="normal"
              size={isMobile ? "medium" : "small"}
              sx={{ mb: isMobile ? 2 : 1 }}
            />
            <TextField 
              label="Password" 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              fullWidth 
              margin="normal"
              size={isMobile ? "medium" : "small"}
              sx={{ mb: isMobile ? 2 : 1 }}
            />
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              fullWidth 
              size={isMobile ? "large" : "medium"}
              sx={{ 
                mt: isMobile ? 2 : 2,
                py: isMobile ? 1.5 : 1
              }}
            >
              Register
            </Button>
          </form>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </Paper>
      </Box>
    </Container>
  );
} 