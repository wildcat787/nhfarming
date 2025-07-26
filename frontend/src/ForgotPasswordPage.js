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

export default function ForgotPasswordPage() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState('request'); // 'request' or 'reset'
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ username }),
      });
      
      setMessage(`Reset token generated for ${response.username}. Token: ${response.resetToken}`);
      setResetToken(response.resetToken);
      setStep('reset');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      await apiRequest('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ resetToken, newPassword }),
      });
      
      setMessage('Password reset successfully! You can now login with your new password.');
      setStep('success');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setUsername('');
    setResetToken('');
    setNewPassword('');
    setConfirmPassword('');
    setMessage('');
    setError('');
    setStep('request');
  };

  if (step === 'success') {
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
              Password Reset Successful
            </Typography>
            <Alert severity="success" sx={{ mb: 2 }}>
              {message}
            </Alert>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row',
              gap: 2, 
              justifyContent: 'center' 
            }}>
              <Button
                component={RouterLink}
                to="/login"
                variant="contained"
                color="primary"
                fullWidth={isMobile}
                size={isMobile ? "large" : "medium"}
              >
                Go to Login
              </Button>
              <Button
                onClick={resetForm}
                variant="outlined"
                fullWidth={isMobile}
                size={isMobile ? "large" : "medium"}
              >
                Reset Another Password
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>
    );
  }

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
            {step === 'request' ? 'Forgot Password' : 'Reset Password'}
          </Typography>
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {message && <Alert severity="info" sx={{ mb: 2 }}>{message}</Alert>}

          {step === 'request' ? (
            <Box component="form" onSubmit={handleRequestReset} sx={{ mt: 1 }}>
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
                onChange={(e) => setUsername(e.target.value)}
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
                {loading ? <CircularProgress size={24} /> : 'Request Reset Token'}
              </Button>
              <Box sx={{ textAlign: 'center', mt: isMobile ? 2 : 1 }}>
                <Link 
                  component={RouterLink} 
                  to="/login" 
                  variant="body2"
                  sx={{ 
                    fontSize: isMobile ? '1rem' : '0.875rem',
                    padding: isMobile ? 1 : 0.5
                  }}
                >
                  Back to Login
                </Link>
              </Box>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleResetPassword} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="resetToken"
                label="Reset Token"
                name="resetToken"
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
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
                {loading ? <CircularProgress size={24} /> : 'Reset Password'}
              </Button>
              <Box sx={{ textAlign: 'center', mt: isMobile ? 2 : 1 }}>
                <Button 
                  onClick={resetForm} 
                  variant="text"
                  size={isMobile ? "large" : "medium"}
                  sx={{ 
                    fontSize: isMobile ? '1rem' : '0.875rem',
                    padding: isMobile ? 1 : 0.5
                  }}
                >
                  Back to Request Form
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
} 