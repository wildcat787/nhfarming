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
  Chip,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  DirectionsCar as VehicleIcon,
  Agriculture as CropIcon,
  Input as InputIcon,
  Assignment as ApplicationIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import { useAuth } from './AuthContext';
import ThemeToggle from './ThemeToggle';

console.log("DEPLOYED VERSION: 2025-07-26");

const NavBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  
  // Multiple breakpoint checks for better mobile detection
  const isMobileMd = useMediaQuery(theme.breakpoints.down('md'));
  const isMobileSm = useMediaQuery(theme.breakpoints.down('sm'));
  const isMobile = isMobileMd || window.innerWidth < 1024; // Fallback check
  
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Debug logging
  React.useEffect(() => {
    console.log('NavBar - isMobile:', isMobile);
    console.log('NavBar - isMobileMd:', isMobileMd);
    console.log('NavBar - isMobileSm:', isMobileSm);
    console.log('NavBar - window width:', window.innerWidth);
  }, [isMobile, isMobileMd, isMobileSm]);

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
    setMobileMenuOpen(false);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };

  const navigationItems = [
    { text: 'Vehicles', path: '/vehicles', icon: <VehicleIcon /> },
    { text: 'Crops', path: '/crops', icon: <CropIcon /> },
    { text: 'Inputs', path: '/inputs', icon: <InputIcon /> },
    { text: 'Applications', path: '/applications', icon: <ApplicationIcon /> },
  ];

  if (user?.role === 'admin') {
    navigationItems.push({ text: 'Users', path: '/users', icon: <AdminIcon /> });
  }

  const MobileMenu = () => (
    <Drawer
      anchor="left"
      open={mobileMenuOpen}
      onClose={handleMobileMenuClose}
      PaperProps={{
        sx: { width: 280 }
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          🚜 NHFarming
        </Typography>
        
        {user && (
          <Chip
            icon={user.role === 'admin' ? <AdminIcon /> : <PersonIcon />}
            label={user.username}
            color={user.role === 'admin' ? 'warning' : 'default'}
            variant="outlined"
            sx={{ mb: 2, width: '100%' }}
          />
        )}
      </Box>
      
      <Divider />
      
      <List>
        {navigationItems.map((item) => (
          <ListItem
            key={item.text}
            button
            component={Link}
            to={item.path}
            onClick={handleMobileMenuClose}
            sx={{ py: 1.5 }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      
      <Divider />
      
      <List>
        <ListItem
          button
          component={Link}
          to="/change-password"
          onClick={handleMobileMenuClose}
        >
          <ListItemIcon><LockIcon /></ListItemIcon>
          <ListItemText primary="Change Password" />
        </ListItem>
        
        <ListItem button onClick={handleLogout}>
          <ListItemIcon><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Drawer>
  );

  return (
    <>
      <AppBar position="static" elevation={0}>
        <Toolbar sx={{ 
          minHeight: { xs: 64, sm: 72 },
          px: { xs: 2, sm: 3 },
          justifyContent: 'space-between'
        }}>
          {isMobile ? (
            <>
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={() => setMobileMenuOpen(true)}
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
              
              <Typography variant="h6" sx={{ 
                fontSize: { xs: '1.125rem', sm: '1.25rem' },
                fontWeight: 700,
                color: 'primary.main'
              }}>
                🚜 NHFarming
              </Typography>
              
              <ThemeToggle size="small" />
              
              {user && (
                <Chip
                  icon={user.role === 'admin' ? <AdminIcon /> : <PersonIcon />}
                  label={user.username}
                  color={user.role === 'admin' ? 'warning' : 'default'}
                  variant="outlined"
                  size="small"
                  onClick={handleMenu}
                  sx={{ ml: 1, cursor: 'pointer' }}
                />
              )}
            </>
          ) : (
            <>
              <Typography variant="h6" sx={{ 
                fontWeight: 700,
                color: 'primary.main'
              }}>
                🚜 NHFarming
              </Typography>
              
              {user && (
                <>
                  <Box sx={{ display: 'flex', gap: 1, mx: 2 }}>
                    {navigationItems.map((item) => (
                      <Button
                        key={item.text}
                        color="inherit"
                        component={Link}
                        to={item.path}
                        sx={{ 
                          textTransform: 'none',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          px: 2,
                          py: 1,
                          borderRadius: 2,
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          }
                        }}
                      >
                        {item.text}
                      </Button>
                    ))}
                  </Box>
                  
                  <ThemeToggle sx={{ ml: 1 }} />
                  
                  <Chip
                    icon={user.role === 'admin' ? <AdminIcon /> : <PersonIcon />}
                    label={user.username}
                    color={user.role === 'admin' ? 'warning' : 'default'}
                    variant="outlined"
                    size="small"
                    onClick={handleMenu}
                    sx={{ ml: 2, cursor: 'pointer' }}
                  />
                </>
              )}
            </>
          )}
        </Toolbar>
      </AppBar>
      
      <MobileMenu />
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem component={Link} to="/change-password" onClick={handleClose}>
          Change Password
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          Logout
        </MenuItem>
      </Menu>
    </>
  );
};

export default NavBar; 