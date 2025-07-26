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

const NavBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

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
        
        <Chip
          icon={user.role === 'admin' ? <AdminIcon /> : <PersonIcon />}
          label={user.username}
          color={user.role === 'admin' ? 'warning' : 'default'}
          variant="outlined"
          sx={{ mb: 2, width: '100%' }}
        />
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
      <AppBar position="static">
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
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
              
              <Typography variant="h6" sx={{ flexGrow: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                🚜 NHFarming
              </Typography>
              
              <Chip
                icon={user.role === 'admin' ? <AdminIcon /> : <PersonIcon />}
                label={user.username}
                color={user.role === 'admin' ? 'warning' : 'default'}
                variant="outlined"
                size="small"
                onClick={handleMenu}
                sx={{ cursor: 'pointer' }}
              />
            </>
          ) : (
            <>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                🚜 NHFarming
              </Typography>
              
              {user && (
                <>
                  {navigationItems.map((item) => (
                    <Button
                      key={item.text}
                      color="inherit"
                      component={Link}
                      to={item.path}
                      sx={{ 
                        mx: 0.5,
                        fontSize: { sm: '0.875rem', md: '1rem' },
                        minWidth: 'auto',
                        px: { sm: 1, md: 2 }
                      }}
                    >
                      {item.text}
                    </Button>
                  ))}
                  
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
            </>
          )}
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem component={Link} to="/change-password" onClick={handleClose}>
              <LockIcon sx={{ mr: 1 }} />
              Change Password
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      
      <MobileMenu />
    </>
  );
};

export default NavBar; 