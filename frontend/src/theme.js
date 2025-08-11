import { createTheme } from '@mui/material/styles';

const createAppTheme = (mode) => createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
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
      fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: { 
      fontWeight: 700,
      fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h3: { 
      fontWeight: 600,
      fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
      lineHeight: 1.3,
    },
    h4: { 
      fontWeight: 600,
      fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.5rem' },
      lineHeight: 1.4,
    },
    h5: { 
      fontWeight: 600,
      fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
      lineHeight: 1.4,
    },
    h6: { 
      fontWeight: 600,
      fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
      lineHeight: 1.4,
    },
    body1: { 
      fontWeight: 400,
      fontSize: { xs: '0.875rem', sm: '1rem' },
      lineHeight: 1.6,
    },
    body2: { 
      fontWeight: 400,
      fontSize: { xs: '0.75rem', sm: '0.875rem' },
      lineHeight: 1.6,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      fontSize: { xs: '0.75rem', sm: '0.875rem' },
    },
    caption: {
      fontWeight: 500,
      fontSize: { xs: '0.625rem', sm: '0.75rem' },
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: { xs: 8, sm: 12 },
  },
  spacing: 8,
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: { xs: 12, sm: 16 },
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
          borderRadius: { xs: 12, sm: 16 },
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
          padding: { xs: 16, sm: 20, md: 24 },
          '&:last-child': {
            paddingBottom: { xs: 16, sm: 20, md: 24 },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: { xs: 8, sm: 12 },
          fontWeight: 600,
          textTransform: 'none',
          minHeight: { xs: 40, sm: 48 },
          padding: { xs: '8px 16px', sm: '12px 24px' },
          fontSize: { xs: '0.75rem', sm: '0.875rem' },
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
        sizeSmall: {
          minHeight: { xs: 32, sm: 36 },
          padding: { xs: '6px 12px', sm: '8px 16px' },
          fontSize: { xs: '0.625rem', sm: '0.75rem' },
        },
        sizeLarge: {
          minHeight: { xs: 48, sm: 56 },
          padding: { xs: '12px 20px', sm: '16px 32px' },
          fontSize: { xs: '0.875rem', sm: '1rem' },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            minHeight: { xs: 40, sm: 48 },
            borderRadius: { xs: 8, sm: 12 },
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
          minWidth: { xs: 40, sm: 48 },
          minHeight: { xs: 40, sm: 48 },
          borderRadius: { xs: 8, sm: 12 },
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'scale(1.05)',
          },
        },
        sizeSmall: {
          minWidth: { xs: 32, sm: 36 },
          minHeight: { xs: 32, sm: 36 },
        },
        sizeLarge: {
          minWidth: { xs: 48, sm: 56 },
          minHeight: { xs: 48, sm: 56 },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: mode === 'light' 
            ? '1px solid rgba(145, 158, 171, 0.24)' 
            : '1px solid rgba(145, 158, 171, 0.24)',
          padding: { xs: '12px 16px', sm: '16px 24px' },
          fontSize: { xs: '0.75rem', sm: '0.875rem' },
        },
        head: {
          color: mode === 'light' ? '#2e7d32' : '#00e676',
          fontWeight: 700,
          fontSize: { xs: '0.75rem', sm: '0.875rem' },
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        },
        body: {
          fontSize: { xs: '0.75rem', sm: '0.875rem' },
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
          borderRadius: { xs: 8, sm: 12 },
          fontWeight: 600,
          fontSize: { xs: '0.625rem', sm: '0.75rem' },
          height: { xs: 24, sm: 32 },
        },
        sizeSmall: {
          height: { xs: 20, sm: 24 },
          fontSize: { xs: '0.5rem', sm: '0.625rem' },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: { xs: 12, sm: 16 },
          boxShadow: mode === 'light' 
            ? '0px 8px 32px rgba(145, 158, 171, 0.24)' 
            : '0px 8px 32px rgba(0, 0, 0, 0.4)',
          margin: { xs: 16, sm: 32 },
          maxWidth: { xs: 'calc(100% - 32px)', sm: '600px' },
          width: { xs: '100%', sm: 'auto' },
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          padding: { xs: '16px 16px 12px 16px', sm: '24px 24px 16px 24px' },
          fontWeight: 700,
          fontSize: { xs: '1.125rem', sm: '1.25rem' },
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: { xs: '12px 16px 16px 16px', sm: '16px 24px 24px 24px' },
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: { xs: '12px 16px 16px 16px', sm: '16px 24px 24px 24px' },
          gap: { xs: 8, sm: 12 },
        },
      },
    },
    MuiSnackbar: {
      styleOverrides: {
        root: {
          '& .MuiSnackbarContent-root': {
            borderRadius: { xs: 8, sm: 12 },
            fontWeight: 600,
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: { xs: 8, sm: 12 },
          fontWeight: 600,
          fontSize: { xs: '0.75rem', sm: '0.875rem' },
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
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: { xs: 16, sm: 24 },
          paddingRight: { xs: 16, sm: 24 },
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: { xs: 56, sm: 64, md: 72 },
          paddingLeft: { xs: 16, sm: 24 },
          paddingRight: { xs: 16, sm: 24 },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          width: { xs: 280, sm: 320 },
          backgroundColor: mode === 'light' ? '#ffffff' : '#212b36',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: { xs: 8, sm: 12 },
          margin: { xs: '2px 8px', sm: '4px 12px' },
          '&:hover': {
            backgroundColor: mode === 'light' ? 'rgba(46, 125, 50, 0.08)' : 'rgba(0, 230, 118, 0.12)',
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: { xs: 36, sm: 40 },
          color: mode === 'light' ? '#2e7d32' : '#00e676',
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          fontSize: { xs: '0.875rem', sm: '1rem' },
          fontWeight: 500,
        },
      },
    },
  },
});

export default createAppTheme; 