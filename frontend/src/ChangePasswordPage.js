import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Link,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { apiRequest } from './api';
import { Link as RouterLink } from 'react-router-dom';

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      await apiRequest('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      
      setMessage('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
            Change Password
          </Typography>
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              name="currentPassword"
              label="Current Password"
              type="password"
              id="currentPassword"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              size={isMobile ? "medium" : "small"}
              sx={{ mb: isMobile ? 2 : 1 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="newPassword"
              label="New Password"
              type="password"
              id="newPassword"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              size={isMobile ? "medium" : "small"}
              sx={{ mb: isMobile ? 2 : 1 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm New Password"
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Change Password'}
            </Button>
            <Box sx={{ textAlign: 'center', mt: isMobile ? 2 : 1 }}>
              <Link 
                component={RouterLink} 
                to="/crops" 
                variant="body2"
                sx={{ 
                  fontSize: isMobile ? '1rem' : '0.875rem',
                  padding: isMobile ? 1 : 0.5
                }}
              >
                Back to Dashboard
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
} 