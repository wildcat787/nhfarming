import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Alert, 
  Paper, 
  Card,
  CardContent,
  IconButton
} from '@mui/material';
import { CheckCircle, ArrowBack } from '@mui/icons-material';

export default function RegisterPage() {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Validation
    if (!username.trim()) {
      setError('Username is required');
      setIsSubmitting(false);
      return;
    }
    if (!email.trim()) {
      setError('Email is required');
      setIsSubmitting(false);
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      setIsSubmitting(false);
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await register(username, email, password);
      setSuccess(true);
      // Don't navigate automatically - let user see the success message
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  if (success) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Paper sx={{ p: 4, minWidth: 400, textAlign: 'center' }}>
          <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom color="success.main">
            Registration Successful!
          </Typography>
          <Card sx={{ mb: 3, bgcolor: 'success.light', color: 'success.contrastText' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Welcome, {username}!
              </Typography>
              <Typography variant="body2">
                We've sent a verification email to: {email}
              </Typography>
            </CardContent>
          </Card>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Please check your email and click the verification link to activate your account.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleGoToLogin}
            sx={{ minHeight: 44 }}
          >
            Go to Login
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <Paper sx={{ p: 4, minWidth: 400, position: 'relative' }}>
        <IconButton
          component={RouterLink}
          to="/"
          sx={{ position: 'absolute', top: 16, left: 16 }}
          color="primary"
        >
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" mb={3} textAlign="center">Create Account</Typography>
        <form onSubmit={handleSubmit}>
          <TextField 
            label="Username" 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            fullWidth 
            margin="normal"
            required
            disabled={isSubmitting}
            sx={{ '& .MuiInputBase-root': { minHeight: 44 } }}
          />
          <TextField 
            label="Email" 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            fullWidth 
            margin="normal"
            required
            disabled={isSubmitting}
            helperText="We'll send a verification email to this address"
            sx={{ '& .MuiInputBase-root': { minHeight: 44 } }}
          />
          <TextField 
            label="Password" 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            fullWidth 
            margin="normal"
            required
            disabled={isSubmitting}
            helperText="Minimum 6 characters"
            sx={{ '& .MuiInputBase-root': { minHeight: 44 } }}
          />
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            fullWidth 
            sx={{ mt: 3, minHeight: 44 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <Button 
              variant="text" 
              color="primary" 
              onClick={handleGoToLogin}
              sx={{ p: 0, minHeight: 'auto' }}
            >
              Sign in
            </Button>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
} 