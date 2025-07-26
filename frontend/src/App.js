import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './AuthContext';
import NavBar from './NavBar';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import ForgotPasswordPage from './ForgotPasswordPage';
import ChangePasswordPage from './ChangePasswordPage';
import CropsPage from './CropsPage';
import InputsPage from './InputsPage';
import ApplicationsPage from './ApplicationsPage';
import VehiclesPage from './VehiclesPage';
import MaintenancePage from './MaintenancePage';
import UsersPage from './UsersPage';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32',
    },
    secondary: {
      main: '#ff9800',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          minHeight: 44, // Touch-friendly button height
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            minHeight: 44, // Touch-friendly input height
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          minWidth: 44, // Touch-friendly icon button size
          minHeight: 44,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
        },
      },
    },
  },
  typography: {
    h4: {
      '@media (max-width:600px)': {
        fontSize: '1.5rem',
      },
    },
    h5: {
      '@media (max-width:600px)': {
        fontSize: '1.25rem',
      },
    },
    h6: {
      '@media (max-width:600px)': {
        fontSize: '1.125rem',
      },
    },
  },
});

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  return user && user.role === 'admin' ? children : <Navigate to="/" />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <div className="App">
            <NavBar />
            <div style={{ 
              paddingTop: 16, 
              paddingBottom: 16,
              paddingLeft: 'env(safe-area-inset-left)',
              paddingRight: 'env(safe-area-inset-right)',
              minHeight: 'calc(100vh - 64px)'
            }}>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/change-password" element={
                  <PrivateRoute>
                    <ChangePasswordPage />
                  </PrivateRoute>
                } />
                <Route path="/crops" element={
                  <PrivateRoute>
                    <CropsPage />
                  </PrivateRoute>
                } />
                <Route path="/inputs" element={
                  <PrivateRoute>
                    <InputsPage />
                  </PrivateRoute>
                } />
                <Route path="/applications" element={
                  <PrivateRoute>
                    <ApplicationsPage />
                  </PrivateRoute>
                } />
                <Route path="/vehicles" element={
                  <PrivateRoute>
                    <VehiclesPage />
                  </PrivateRoute>
                } />
                <Route path="/maintenance/:vehicleName" element={
                  <PrivateRoute>
                    <MaintenancePage />
                  </PrivateRoute>
                } />
                <Route path="/users" element={
                  <AdminRoute>
                    <UsersPage />
                  </AdminRoute>
                } />
                <Route path="/" element={<Navigate to="/vehicles" />} />
              </Routes>
            </div>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
