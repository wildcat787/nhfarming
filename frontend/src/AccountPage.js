import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Divider,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Snackbar,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useAuth } from './AuthContext';
import { apiRequest } from './api';
import PageLayout, { SectionLayout } from './components/PageLayout';
import LoadingSpinner from './components/LoadingSpinner';

const AccountPage = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: ''
  });

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiRequest('/auth/profile');
      setProfileData({
        username: data.username || '',
        email: data.email || '',
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        phone: data.phone || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        zip_code: data.zip_code || '',
        country: data.country || ''
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setError('Failed to load profile information. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field) => (event) => {
    setProfileData({
      ...profileData,
      [field]: event.target.value
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Don't send username in the update
      const { username, ...updateData } = profileData;
      
      await apiRequest('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });
      
      setSnackbar({
        open: true,
        message: 'Profile updated successfully!',
        severity: 'success'
      });
      setEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      setError(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    fetchUserProfile(); // Reset to original data
  };

  if (loading) {
    return (
      <PageLayout title="Account">
        <LoadingSpinner />
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Account">
      <SectionLayout>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Paper elevation={1} sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon color="primary" />
              Personal Information
            </Typography>
            {!editing ? (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => setEditing(true)}
                disabled={loading}
              >
                Edit Profile
              </Button>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  disabled={loading}
                  color="primary"
                >
                  Save
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </Box>
            )}
          </Box>

          <Grid container spacing={3}>
            {/* Account Information */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" color="primary" sx={{ mb: 2, fontWeight: 600 }}>
                Account Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Username"
                value={profileData.username}
                disabled={true} // Always disabled - username cannot be changed
                variant="outlined"
                helperText="Username cannot be changed"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={profileData.email}
                onChange={handleInputChange('email')}
                disabled={!editing || loading}
                variant="outlined"
              />
            </Grid>
            
            {/* Personal Details */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" color="primary" sx={{ mb: 2, mt: 2, fontWeight: 600 }}>
                Personal Details
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="First Name"
                value={profileData.first_name}
                onChange={handleInputChange('first_name')}
                disabled={!editing || loading}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={profileData.last_name}
                onChange={handleInputChange('last_name')}
                disabled={!editing || loading}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={profileData.phone}
                onChange={handleInputChange('phone')}
                disabled={!editing || loading}
                variant="outlined"
              />
            </Grid>
            
            {/* Address Information */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" color="primary" sx={{ mb: 2, mt: 2, fontWeight: 600 }}>
                Address Information
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                value={profileData.address}
                onChange={handleInputChange('address')}
                disabled={!editing || loading}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="City"
                value={profileData.city}
                onChange={handleInputChange('city')}
                disabled={!editing || loading}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="State/Province"
                value={profileData.state}
                onChange={handleInputChange('state')}
                disabled={!editing || loading}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="ZIP/Postal Code"
                value={profileData.zip_code}
                onChange={handleInputChange('zip_code')}
                disabled={!editing || loading}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Country"
                value={profileData.country}
                onChange={handleInputChange('country')}
                disabled={!editing || loading}
                variant="outlined"
              />
            </Grid>
          </Grid>
        </Paper>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </SectionLayout>
    </PageLayout>
  );
};

export default AccountPage;
