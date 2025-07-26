import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './AuthContext';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import ForgotPasswordPage from './ForgotPasswordPage';
import ChangePasswordPage from './ChangePasswordPage';
import CropsPage from './CropsPage';
import InputsPage from './InputsPage';
import ApplicationsPage from './ApplicationsPage';
import VehiclesPage from './VehiclesPage';
import MaintenancePage from './MaintenancePage';
import AIVoiceAssistantModal from './AIVoiceAssistantModal';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Fab from '@mui/material/Fab';
import MicIcon from '@mui/icons-material/Mic';
import ResponsiveAppBar from './ResponsiveAppBar';
import MobileBottomNav from './MobileBottomNav';
import AdminPage from './AdminPage';

function PrivateRoute({ children }) {
  const { user, loading } = React.useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { user, loading } = React.useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'admin') return <Navigate to="/crops" />;
  return children;
}

function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [aiModalOpen, setAIModalOpen] = React.useState(false);
  return (
    <AuthProvider>
      <Router>
        <ResponsiveAppBar />
        <Container maxWidth="lg" sx={{ py: isMobile ? 1 : 4, pb: isMobile ? 8 : 4 }}>
          <Box sx={{ p: isMobile ? 1 : 2 }}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/change-password" element={<PrivateRoute><ChangePasswordPage /></PrivateRoute>} />
              <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
              <Route path="/crops" element={<PrivateRoute><CropsPage /></PrivateRoute>} />
              <Route path="/inputs" element={<PrivateRoute><InputsPage /></PrivateRoute>} />
              <Route path="/applications" element={<PrivateRoute><ApplicationsPage /></PrivateRoute>} />
              <Route path="/vehicles" element={<PrivateRoute><VehiclesPage /></PrivateRoute>} />
              <Route path="/maintenance/:vehicleName" element={<PrivateRoute><MaintenancePage /></PrivateRoute>} />
              <Route path="*" element={<Navigate to="/crops" />} />
            </Routes>
          </Box>
        </Container>
        <Box sx={{ position: 'fixed', left: 0, right: 0, bottom: isMobile ? 72 : 32, display: 'flex', justifyContent: 'center', zIndex: 2100 }}>
          <Fab
            onClick={() => setAIModalOpen(true)}
            sx={{
              width: isMobile ? 72 : 96,
              height: isMobile ? 72 : 96,
              background: 'linear-gradient(135deg, #d500f9 0%, #8e24aa 100%)',
              color: '#fff',
              boxShadow: '0 0 32px 8px #d500f9',
              fontSize: isMobile ? 18 : 24,
              fontWeight: 'bold',
              borderRadius: '50%',
              transition: 'background 0.3s',
              '&:hover': {
                background: 'linear-gradient(135deg, #8e24aa 0%, #d500f9 100%)',
              },
            }}
          >
            <MicIcon sx={{ fontSize: isMobile ? 36 : 48, filter: 'drop-shadow(0 0 16px #d500f9)' }} />
          </Fab>
        </Box>
        <MobileBottomNav />
        <AIVoiceAssistantModal open={aiModalOpen} onClose={() => setAIModalOpen(false)} />
      </Router>
    </AuthProvider>
  );
}

export default App;
