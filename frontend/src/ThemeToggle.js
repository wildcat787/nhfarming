import React from 'react';
import { IconButton, Tooltip, useTheme as useMuiTheme } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useTheme } from './ThemeContext';

const ThemeToggle = ({ size = 'medium', sx = {} }) => {
  const { mode, toggleTheme } = useTheme();
  const muiTheme = useMuiTheme();

  return (
    <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
      <IconButton
        onClick={toggleTheme}
        color="inherit"
        size={size}
        sx={{
          ...sx,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'rotate(180deg)',
            backgroundColor: muiTheme.palette.mode === 'light' 
              ? 'rgba(46, 125, 50, 0.1)' 
              : 'rgba(0, 230, 118, 0.1)',
          },
        }}
      >
        {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle; 