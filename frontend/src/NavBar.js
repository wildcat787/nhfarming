import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Button,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Chip
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useAuth } from './AuthContext';

const NavBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleClose();
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          🚜 NHFarming
        </Typography>
        
        {user && (
          <>
            <Button color="inherit" component={Link} to="/vehicles">
              Vehicles
            </Button>
            <Button color="inherit" component={Link} to="/crops">
              Crops
            </Button>
            <Button color="inherit" component={Link} to="/inputs">
              Inputs
            </Button>
            <Button color="inherit" component={Link} to="/applications">
              Applications
            </Button>
            
            {user.role === 'admin' && (
              <Button 
                color="inherit" 
                component={Link} 
                to="/users"
                startIcon={<AdminIcon />}
              >
                Users
              </Button>
            )}
            
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
              <Chip
                icon={user.role === 'admin' ? <AdminIcon /> : <PersonIcon />}
                label={user.username}
                color={user.role === 'admin' ? 'warning' : 'default'}
                variant="outlined"
                onClick={handleMenu}
                sx={{ cursor: 'pointer' }}
              />
            </Box>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem component={Link} to="/change-password" onClick={handleClose}>
                Change Password
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <LogoutIcon sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </>
        )}
        
        {!user && (
          <>
            <Button color="inherit" component={Link} to="/login">
              Login
            </Button>
            <Button color="inherit" component={Link} to="/register">
              Register
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default NavBar; 