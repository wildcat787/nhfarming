import { createTheme } from '@mui/material/styles';

const createAppTheme = (mode) => createTheme({
  palette: {
    mode,
    ...(mode === 'light' ? {
      // Light mode colors
      background: {
        default: '#f5f5f5',
        paper: '#ffffff',
      },
      primary: {
        main: '#2e7d32', // darker green for light mode
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#1976d2',
      },
      error: {
        main: '#d32f2f',
      },
      text: {
        primary: '#212121',
        secondary: '#666666',
      },
      divider: 'rgba(0,0,0,0.12)',
    } : {
      // Dark mode colors
      background: {
        default: '#181c20',
        paper: '#23272b',
      },
      primary: {
        main: '#00e676', // bright green
        contrastText: '#fff',
      },
      secondary: {
        main: '#00bfa5',
      },
      error: {
        main: '#ff1744',
      },
      text: {
        primary: '#fff',
        secondary: '#b0b8c1',
      },
      divider: 'rgba(255,255,255,0.08)',
    }),
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    body1: { fontWeight: 400 },
    body2: { fontWeight: 400 },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 12,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: mode === 'light' 
            ? '0 2px 8px rgba(0,0,0,0.1)' 
            : '0 2px 16px #111',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          textTransform: 'none',
          minHeight: 44,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            minHeight: 44,
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          minWidth: 44,
          minHeight: 44,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: mode === 'light' 
            ? '1px solid rgba(0,0,0,0.12)' 
            : '1px solid rgba(255,255,255,0.08)',
        },
        head: {
          color: mode === 'light' ? '#2e7d32' : '#00e676',
          fontWeight: 700,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: mode === 'light' ? '#ffffff' : '#23272b',
          color: mode === 'light' ? '#2e7d32' : '#00e676',
          boxShadow: mode === 'light' 
            ? '0 2px 4px rgba(0,0,0,0.1)' 
            : '0 2px 4px rgba(0,0,0,0.3)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

export default createAppTheme; 