import React from 'react';
import { Box, CircularProgress, Typography, Paper } from '@mui/material';

const LoadingSpinner = ({ 
  message = 'Loading...', 
  size = 'medium', 
  fullScreen = false,
  variant = 'default' 
}) => {
  const getSize = () => {
    switch (size) {
      case 'small': return 24;
      case 'large': return 64;
      default: return 40;
    }
  };

  const getMessageVariant = () => {
    switch (size) {
      case 'small': return 'body2';
      case 'large': return 'h6';
      default: return 'body1';
    }
  };

  if (fullScreen) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          gap: 2,
          bgcolor: 'background.default'
        }}
      >
        <CircularProgress size={getSize()} />
        {message && (
          <Typography variant={getMessageVariant()} color="text.secondary">
            {message}
          </Typography>
        )}
      </Box>
    );
  }

  if (variant === 'card') {
    return (
      <Paper
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 4,
          minHeight: 200,
          gap: 2
        }}
      >
        <CircularProgress size={getSize()} />
        {message && (
          <Typography variant={getMessageVariant()} color="text.secondary">
            {message}
          </Typography>
        )}
      </Paper>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        p: 3,
        gap: 2
      }}
    >
      <CircularProgress size={getSize()} />
      {message && (
        <Typography variant={getMessageVariant()} color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default LoadingSpinner; 