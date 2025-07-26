import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
  Card,
  CardContent
} from '@mui/material';
import { CheckCircle, Error, Home } from '@mui/icons-material';
import { apiRequest } from './api';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      console.log('VerifyEmailPage: Token from URL:', token);
      
      if (!token) {
        setStatus('error');
        setMessage('No verification token provided.');
        return;
      }

      try {
        console.log('VerifyEmailPage: Making API request to verify email...');
        const response = await apiRequest(`/auth/verify-email?token=${token}`, 'GET');
        console.log('VerifyEmailPage: API response:', response);
        
        if (response.message) {
          setStatus('success');
          setMessage(response.message);
          setUser(response.user);
        } else {
          setStatus('error');
          setMessage('Verification failed. Please try again.');
        }
      } catch (error) {
        console.error('Email verification error:', error);
        setStatus('error');
        setMessage(error.message || 'Verification failed. Please try again.');
      }
    };

    verifyEmail();
  }, [searchParams]);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        {status === 'verifying' && (
          <Box>
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Verifying Your Email
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Please wait while we verify your email address...
            </Typography>
          </Box>
        )}

        {status === 'success' && (
          <Box>
            <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom color="success.main">
              Email Verified Successfully!
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              {message}
            </Typography>
            
            {user && (
              <Card sx={{ mb: 3, bgcolor: 'success.light', color: 'success.contrastText' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Welcome, {user.username}!
                  </Typography>
                  <Typography variant="body2">
                    Email: {user.email}
                  </Typography>
                </CardContent>
              </Card>
            )}
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Home />}
                onClick={handleGoHome}
                sx={{ minHeight: 44 }}
              >
                Go to Home
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleGoToLogin}
                sx={{ minHeight: 44 }}
              >
                Login Now
              </Button>
            </Box>
          </Box>
        )}

        {status === 'error' && (
          <Box>
            <Error sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom color="error.main">
              Verification Failed
            </Typography>
            <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
              {message}
            </Alert>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              If you're having trouble verifying your email, please contact support or try registering again.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Home />}
                onClick={handleGoHome}
                sx={{ minHeight: 44 }}
              >
                Go to Home
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleGoToLogin}
                sx={{ minHeight: 44 }}
              >
                Back to Login
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default VerifyEmailPage; 