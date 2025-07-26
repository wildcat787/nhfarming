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
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        },
        head: {
          color: '#00e676',
          fontWeight: 700,
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
  },
});

export default theme; 