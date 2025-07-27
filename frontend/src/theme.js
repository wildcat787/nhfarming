import { createTheme } from '@mui/material/styles';

const createAppTheme = (mode) => createTheme({
  palette: {
    mode,
    ...(mode === 'light' ? {
      // Light mode colors
      background: {
        default: '#f8fafc',
        paper: '#ffffff',
      },
      primary: {
        main: '#2e7d32',
        light: '#4caf50',
        dark: '#1b5e20',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#1976d2',
        light: '#42a5f5',
        dark: '#1565c0',
      },
      success: {
        main: '#2e7d32',
        light: '#4caf50',
        dark: '#1b5e20',
      },
      error: {
        main: '#d32f2f',
        light: '#ef5350',
        dark: '#c62828',
      },
      warning: {
        main: '#ed6c02',
        light: '#ff9800',
        dark: '#e65100',
      },
      info: {
        main: '#0288d1',
        light: '#03a9f4',
        dark: '#01579b',
      },
      text: {
        primary: '#1a2027',
        secondary: '#637381',
        disabled: '#919eab',
      },
      divider: 'rgba(145, 158, 171, 0.24)',
    } : {
      // Dark mode colors
      background: {
        default: '#161c24',
        paper: '#212b36',
      },
      primary: {
        main: '#00e676',
        light: '#66ffa6',
        dark: '#00b248',
        contrastText: '#000000',
      },
      secondary: {
        main: '#00bfa5',
        light: '#64ffda',
        dark: '#008e76',
      },
      success: {
        main: '#00e676',
        light: '#66ffa6',
        dark: '#00b248',
      },
      error: {
        main: '#ff1744',
        light: '#ff616f',
        dark: '#c4001d',
      },
      warning: {
        main: '#ff9800',
        light: '#ffb74d',
        dark: '#f57c00',
      },
      info: {
        main: '#29b6f6',
        light: '#73e8ff',
        dark: '#0086c3',
      },
      text: {
        primary: '#ffffff',
        secondary: '#b0b8c1',
        disabled: '#637381',
      },
      divider: 'rgba(145, 158, 171, 0.24)',
    }),
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { 
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: { 
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h3: { 
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.3,
    },
    h4: { 
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h5: { 
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h6: { 
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.4,
    },
    body1: { 
      fontWeight: 400,
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: { 
      fontWeight: 400,
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      fontSize: '0.875rem',
    },
    caption: {
      fontWeight: 500,
      fontSize: '0.75rem',
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 12,
  },
  spacing: 8,
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 16,
          boxShadow: mode === 'light' 
            ? '0px 2px 4px rgba(145, 158, 171, 0.16), 0px 0px 2px rgba(145, 158, 171, 0.12)' 
            : '0px 2px 4px rgba(0, 0, 0, 0.2), 0px 0px 2px rgba(0, 0, 0, 0.1)',
        },
        elevation1: {
          boxShadow: mode === 'light' 
            ? '0px 1px 3px rgba(145, 158, 171, 0.16), 0px 0px 2px rgba(145, 158, 171, 0.12)' 
            : '0px 1px 3px rgba(0, 0, 0, 0.2), 0px 0px 2px rgba(0, 0, 0, 0.1)',
        },
        elevation2: {
          boxShadow: mode === 'light' 
            ? '0px 2px 8px rgba(145, 158, 171, 0.16), 0px 0px 2px rgba(145, 158, 171, 0.12)' 
            : '0px 2px 8px rgba(0, 0, 0, 0.2), 0px 0px 2px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: mode === 'light' 
            ? '0px 2px 8px rgba(145, 158, 171, 0.16), 0px 0px 2px rgba(145, 158, 171, 0.12)' 
            : '0px 2px 8px rgba(0, 0, 0, 0.2), 0px 0px 2px rgba(0, 0, 0, 0.1)',
          transition: 'box-shadow 0.2s ease-in-out, transform 0.2s ease-in-out',
          '&:hover': {
            boxShadow: mode === 'light' 
              ? '0px 4px 16px rgba(145, 158, 171, 0.24), 0px 0px 4px rgba(145, 158, 171, 0.16)' 
              : '0px 4px 16px rgba(0, 0, 0, 0.3), 0px 0px 4px rgba(0, 0, 0, 0.2)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: 24,
          '&:last-child': {
            paddingBottom: 24,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 600,
          textTransform: 'none',
          minHeight: 48,
          padding: '12px 24px',
          fontSize: '0.875rem',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: mode === 'light' 
              ? '0px 4px 12px rgba(46, 125, 50, 0.3)' 
              : '0px 4px 12px rgba(0, 230, 118, 0.3)',
          },
        },
        contained: {
          boxShadow: mode === 'light' 
            ? '0px 2px 8px rgba(46, 125, 50, 0.2)' 
            : '0px 2px 8px rgba(0, 230, 118, 0.2)',
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            minHeight: 48,
            borderRadius: 12,
          },
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: mode === 'light' ? 'rgba(145, 158, 171, 0.32)' : 'rgba(145, 158, 171, 0.24)',
              borderWidth: 1,
            },
            '&:hover fieldset': {
              borderColor: mode === 'light' ? 'rgba(46, 125, 50, 0.5)' : 'rgba(0, 230, 118, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: mode === 'light' ? '#2e7d32' : '#00e676',
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          minWidth: 48,
          minHeight: 48,
          borderRadius: 12,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'scale(1.05)',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: mode === 'light' 
            ? '1px solid rgba(145, 158, 171, 0.24)' 
            : '1px solid rgba(145, 158, 171, 0.24)',
          padding: '16px 24px',
        },
        head: {
          color: mode === 'light' ? '#2e7d32' : '#00e676',
          fontWeight: 700,
          fontSize: '0.875rem',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        },
        body: {
          fontSize: '0.875rem',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'light' ? 'rgba(46, 125, 50, 0.04)' : 'rgba(0, 230, 118, 0.08)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: mode === 'light' ? '#ffffff' : '#212b36',
          color: mode === 'light' ? '#2e7d32' : '#00e676',
          boxShadow: mode === 'light' 
            ? '0px 2px 4px rgba(145, 158, 171, 0.16)' 
            : '0px 2px 4px rgba(0, 0, 0, 0.2)',
          borderBottom: mode === 'light' 
            ? '1px solid rgba(145, 158, 171, 0.24)' 
            : '1px solid rgba(145, 158, 171, 0.24)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 600,
          fontSize: '0.75rem',
          height: 32,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: mode === 'light' 
            ? '0px 8px 32px rgba(145, 158, 171, 0.24)' 
            : '0px 8px 32px rgba(0, 0, 0, 0.4)',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          padding: '24px 24px 16px 24px',
          fontWeight: 700,
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '16px 24px 24px 24px',
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '16px 24px 24px 24px',
          gap: 12,
        },
      },
    },
    MuiSnackbar: {
      styleOverrides: {
        root: {
          '& .MuiSnackbarContent-root': {
            borderRadius: 12,
            fontWeight: 600,
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 600,
        },
      },
    },
    MuiGrid: {
      styleOverrides: {
        root: {
          '&.MuiGrid-container': {
            margin: 0,
          },
        },
      },
    },
  },
});

export default createAppTheme; 