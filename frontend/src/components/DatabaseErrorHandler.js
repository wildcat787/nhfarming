import React, { useState, useEffect } from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Collapse,
  IconButton,
  Snackbar
} from '@mui/material';
import {
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Close as CloseIcon
} from '@mui/icons-material';

const DatabaseErrorHandler = ({ error, onRetry, onDismiss, showDetails = false }) => {
  const [expanded, setExpanded] = useState(showDetails);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    if (error) {
      setSnackbarOpen(true);
    }
  }, [error]);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  const getErrorMessage = (error) => {
    if (!error) return 'An unknown error occurred';
    
    // Handle different types of database errors
    if (error.message?.includes('Database error')) {
      return 'Database connection issue - please try again';
    }
    
    if (error.message?.includes('Network error')) {
      return 'Network connection issue - please check your internet connection';
    }
    
    if (error.message?.includes('UNIQUE constraint failed')) {
      return 'This record already exists - please use a different name';
    }
    
    if (error.message?.includes('FOREIGN KEY constraint failed')) {
      return 'Referenced record not found - please refresh the page';
    }
    
    if (error.message?.includes('NOT NULL constraint failed')) {
      return 'Required information is missing - please fill in all required fields';
    }
    
    if (error.message?.includes('no such table')) {
      return 'Database structure issue - please contact support';
    }
    
    if (error.message?.includes('HTTP 500')) {
      return 'Server error - please try again later';
    }
    
    if (error.message?.includes('HTTP 404')) {
      return 'Resource not found - please refresh the page';
    }
    
    if (error.message?.includes('HTTP 403')) {
      return 'Access denied - you may not have permission for this action';
    }
    
    if (error.message?.includes('HTTP 401')) {
      return 'Authentication required - please log in again';
    }
    
    return error.message || 'An unexpected error occurred';
  };

  const getErrorSeverity = (error) => {
    if (!error) return 'error';
    
    if (error.message?.includes('HTTP 401') || error.message?.includes('HTTP 403')) {
      return 'warning';
    }
    
    if (error.message?.includes('Network error')) {
      return 'info';
    }
    
    return 'error';
  };

  const getErrorIcon = (error) => {
    const severity = getErrorSeverity(error);
    
    switch (severity) {
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '❌';
    }
  };

  if (!error) return null;

  return (
    <>
      {/* Card-based error display */}
      <Card 
        sx={{ 
          mb: 2, 
          border: '1px solid',
          borderColor: 'error.main',
          bgcolor: 'error.light',
          color: 'error.contrastText'
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              {getErrorIcon(error)} Database Error
            </Typography>
            <IconButton
              size="small"
              onClick={handleExpandClick}
              sx={{ color: 'inherit' }}
            >
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          
          <Typography variant="body1" sx={{ mb: 2 }}>
            {getErrorMessage(error)}
          </Typography>
          
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" component="pre" sx={{ 
                fontFamily: 'monospace', 
                fontSize: '0.75rem',
                bgcolor: 'rgba(0,0,0,0.1)',
                p: 1,
                borderRadius: 1,
                overflow: 'auto',
                maxHeight: 200
              }}>
                {error.stack || error.message || JSON.stringify(error, null, 2)}
              </Typography>
            </Box>
          </Collapse>
          
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {onRetry && (
              <Button
                variant="contained"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={onRetry}
                sx={{ 
                  bgcolor: 'error.dark',
                  '&:hover': { bgcolor: 'error.main' }
                }}
              >
                Retry
              </Button>
            )}
            
            <Button
              variant="outlined"
              size="small"
              onClick={handleCloseSnackbar}
              sx={{ 
                borderColor: 'error.main',
                color: 'error.main',
                '&:hover': { 
                  borderColor: 'error.dark',
                  bgcolor: 'error.light'
                }
              }}
            >
              Dismiss
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Snackbar notification */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={getErrorSeverity(error)}
          variant="filled"
          action={
            <IconButton
              color="inherit"
              size="small"
              onClick={handleCloseSnackbar}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          <AlertTitle>Database Error</AlertTitle>
          {getErrorMessage(error)}
        </Alert>
      </Snackbar>
    </>
  );
};

// Hook for managing database errors
export const useDatabaseError = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleError = (error) => {
    console.error('Database error:', error);
    setError(error);
    setIsLoading(false);
  };

  const clearError = () => {
    setError(null);
  };

  const executeWithErrorHandling = async (operation) => {
    try {
      setIsLoading(true);
      clearError();
      const result = await operation();
      setIsLoading(false);
      return result;
    } catch (error) {
      handleError(error);
      throw error;
    }
  };

  return {
    error,
    isLoading,
    handleError,
    clearError,
    executeWithErrorHandling
  };
};

export default DatabaseErrorHandler;
