import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './AuthContext';
import { ThemeProvider, useTheme } from './ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import NavBar from './NavBar';
import WeatherFooter from './components/WeatherFooter';
import LandingPage from './LandingPage';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import ForgotPasswordPage from './ForgotPasswordPage';
import ChangePasswordPage from './ChangePasswordPage';
import VerifyEmailPage from './VerifyEmailPage';
import DashboardPage from './DashboardPage';
import CropsPage from './CropsPage';
import InputsPage from './InputsPage';
import ApplicationsPage from './ApplicationsPage';

import VehiclesPage from './VehiclesPage';
import MaintenancePage from './MaintenancePage';
import FieldsPage from './FieldsPage';
import UsersPage from './UsersPage';
import FarmsPage from './FarmsPage';
import AccountPage from './AccountPage';

import './App.css';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  return user && user.role === 'admin' ? children : <Navigate to="/" />;
};

function AppContent() {
  const { theme } = useTheme();
  const { user } = useAuth();

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {user && <NavBar />}
          <main style={{ flex: 1, paddingBottom: user ? '140px' : '0px' }}>
            <Routes>
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/change-password" element={<PrivateRoute><ChangePasswordPage /></PrivateRoute>} />
              <Route path="/account" element={<PrivateRoute><AccountPage /></PrivateRoute>} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
              <Route path="/farms" element={<PrivateRoute><FarmsPage /></PrivateRoute>} />
              <Route path="/vehicles" element={<PrivateRoute><VehiclesPage /></PrivateRoute>} />
              <Route path="/crops" element={<PrivateRoute><CropsPage /></PrivateRoute>} />
              <Route path="/inputs" element={<PrivateRoute><InputsPage /></PrivateRoute>} />

              <Route path="/applications" element={<PrivateRoute><ApplicationsPage /></PrivateRoute>} />
              <Route path="/fields" element={<PrivateRoute><FieldsPage /></PrivateRoute>} />
              <Route path="/maintenance/:vehicleName?" element={<PrivateRoute><MaintenancePage /></PrivateRoute>} />
              <Route path="/users" element={<AdminRoute><UsersPage /></AdminRoute>} />
              <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
            </Routes>
          </main>
          {user && <WeatherFooter />}
        </div>
      </Router>
    </MuiThemeProvider>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
