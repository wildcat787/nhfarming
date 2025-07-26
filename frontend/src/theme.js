import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
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
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
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
          background: '#23272b',
          borderRadius: 16,
          boxShadow: '0 2px 16px #111',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          minHeight: 44, // Better touch target
          '@media (max-width: 600px)': {
            minHeight: 48, // Larger touch target on mobile
            fontSize: '1rem',
            padding: '12px 16px',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '@media (max-width: 600px)': {
            '& .MuiInputBase-root': {
              minHeight: 48, // Better touch target
              fontSize: '1rem',
            },
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '@media (max-width: 600px)': {
            minWidth: 48,
            minHeight: 48,
            padding: 12,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          '@media (max-width: 600px)': {
            padding: '8px 4px',
            fontSize: '0.875rem',
          },
        },
        head: {
          color: '#00e676',
          fontWeight: 700,
          '@media (max-width: 600px)': {
            fontSize: '0.875rem',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: '#23272b',
          color: '#00e676',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: '#23272b',
          color: '#fff',
          width: 280,
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          background: '#23272b',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          height: 72, // Larger for mobile
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          minWidth: 'auto',
          padding: '8px 12px',
          '&.Mui-selected': {
            color: '#00e676',
          },
        },
        label: {
          fontSize: '0.75rem',
          marginTop: 4,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          '@media (max-width: 600px)': {
            margin: 16,
            width: 'calc(100% - 32px)',
            maxWidth: 'none',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          '@media (max-width: 600px)': {
            height: 28,
            fontSize: '0.75rem',
          },
        },
      },
    },
  },
});

export default theme; 