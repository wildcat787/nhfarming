import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
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
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Home as FarmIcon,
  DirectionsCar as VehicleIcon,
  Agriculture as CropIcon,
  Inventory as InputIcon,
  Assignment as ApplicationIcon,
  Map as FieldIcon,
  Notifications as NotificationsIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  AccountCircle as AccountIcon,
  Lock as LockIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import ThemeToggle from './ThemeToggle';

console.log("DEPLOYED VERSION: 2025-07-26");

const NavBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  
  // Multiple breakpoint checks for better mobile detection
  const isMobileMd = useMediaQuery(theme.breakpoints.down('md'));
  const isMobileSm = useMediaQuery(theme.breakpoints.down('sm'));
  const isMobile = isMobileMd || window.innerWidth < 1024; // Fallback check
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    { text: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    { text: 'Farms', path: '/farms', icon: <FarmIcon /> },
    { text: 'Vehicles', path: '/vehicles', icon: <VehicleIcon /> },
    { text: 'Crops', path: '/crops', icon: <CropIcon /> },
    { text: 'Inputs', path: '/inputs', icon: <InputIcon /> },
    { text: 'Applications', path: '/applications', icon: <ApplicationIcon /> },
    { text: 'Fields', path: '/fields', icon: <FieldIcon /> },
    { text: 'Reminders', path: '/reminders', icon: <NotificationsIcon /> },
  ];

  if (user?.role === 'admin') {
    navigationItems.push({ text: 'Users', path: '/users', icon: <AdminIcon /> });
  }

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const MobileMenu = () => (
    <Drawer
      anchor="left"
      open={mobileMenuOpen}
      onClose={handleMobileMenuClose}
      PaperProps={{
        sx: { 
          width: { xs: 280, sm: 320 },
          backgroundColor: theme.palette.background.paper,
          borderRight: `1px solid ${theme.palette.divider}`
        }
      }}
      ModalProps={{
        keepMounted: true, // Better mobile performance
      }}
    >
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography 
          variant="h6" 
          component={Link}
          to="/dashboard"
          onClick={handleMobileMenuClose}
          sx={{ 
            mb: 2, 
            display: 'flex', 
            alignItems: 'center',
            textDecoration: 'none',
            color: 'inherit',
            cursor: 'pointer',
            fontSize: { xs: '1.125rem', sm: '1.25rem' },
            fontWeight: 700,
            '&:hover': {
              opacity: 0.8
            }
          }}
        >
          🚜 NHFarming
        </Typography>
        
        {user && (
          <Chip
            icon={user.role === 'admin' ? <AdminIcon /> : <PersonIcon />}
            label={user.username}
            color={user.role === 'admin' ? 'warning' : 'default'}
            variant="outlined"
            sx={{ 
              mb: 2, 
              width: '100%',
              height: { xs: 32, sm: 36 },
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }}
          />
        )}
      </Box>
      
      <Divider />
      
      <List sx={{ py: 0 }}>
        {navigationItems.map((item) => (
          <ListItem
            key={item.text}
            button
            component={Link}
            to={item.path}
            onClick={handleMobileMenuClose}
            sx={{ 
              py: { xs: 1.5, sm: 2 },
              px: { xs: 2, sm: 3 },
              backgroundColor: isActiveRoute(item.path) 
                ? theme.palette.mode === 'light' 
                  ? 'rgba(46, 125, 50, 0.08)' 
                  : 'rgba(0, 230, 118, 0.12)'
                : 'transparent',
              borderLeft: isActiveRoute(item.path) 
                ? `3px solid ${theme.palette.primary.main}` 
                : '3px solid transparent',
              '&:hover': {
                backgroundColor: theme.palette.mode === 'light' 
                  ? 'rgba(46, 125, 50, 0.12)' 
                  : 'rgba(0, 230, 118, 0.16)',
              }
            }}
          >
            <ListItemIcon sx={{ 
              color: isActiveRoute(item.path) 
                ? theme.palette.primary.main 
                : theme.palette.text.secondary,
              minWidth: { xs: 36, sm: 40 }
            }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              sx={{
                '& .MuiListItemText-primary': {
                  fontWeight: isActiveRoute(item.path) ? 600 : 500,
                  color: isActiveRoute(item.path) 
                    ? theme.palette.primary.main 
                    : theme.palette.text.primary,
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }
              }}
            />
          </ListItem>
        ))}
      </List>
      
      <Divider />
      
      <List sx={{ py: 0 }}>
        <ListItem
          button
          component={Link}
          to="/account"
          onClick={handleMobileMenuClose}
          sx={{ py: { xs: 1.5, sm: 2 }, px: { xs: 2, sm: 3 } }}
        >
          <ListItemIcon sx={{ minWidth: { xs: 36, sm: 40 } }}>
            <AccountIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Account" 
            sx={{
              '& .MuiListItemText-primary': {
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }
            }}
          />
        </ListItem>
        
        <ListItem
          button
          component={Link}
          to="/change-password"
          onClick={handleMobileMenuClose}
          sx={{ py: { xs: 1.5, sm: 2 }, px: { xs: 2, sm: 3 } }}
        >
          <ListItemIcon sx={{ minWidth: { xs: 36, sm: 40 } }}>
            <LockIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Change Password" 
            sx={{
              '& .MuiListItemText-primary': {
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }
            }}
          />
        </ListItem>
        
        <ListItem 
          button 
          onClick={handleLogout}
          sx={{ py: { xs: 1.5, sm: 2 }, px: { xs: 2, sm: 3 } }}
        >
          <ListItemIcon sx={{ minWidth: { xs: 36, sm: 40 } }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Logout" 
            sx={{
              '& .MuiListItemText-primary': {
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }
            }}
          />
        </ListItem>
      </List>
    </Drawer>
  );

  return (
    <>
      <AppBar position="static" elevation={0}>
        <Toolbar sx={{ 
          minHeight: { xs: 56, sm: 64, md: 72 },
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
                sx={{ 
                  mr: 1,
                  minWidth: { xs: 40, sm: 48 },
                  minHeight: { xs: 40, sm: 48 }
                }}
              >
                <MenuIcon />
              </IconButton>
              
              <Typography 
                variant="h6" 
                component={Link}
                to="/dashboard"
                sx={{ 
                  fontSize: { xs: '1rem', sm: '1.125rem' },
                  fontWeight: 700,
                  color: 'primary.main',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  flex: 1,
                  textAlign: 'center',
                  '&:hover': {
                    opacity: 0.8
                  }
                }}
              >
                🚜 NHFarming
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ThemeToggle size="small" />
                
                {user && (
                  <Chip
                    icon={user.role === 'admin' ? <AdminIcon /> : <PersonIcon />}
                    label={user.username}
                    color={user.role === 'admin' ? 'warning' : 'default'}
                    variant="outlined"
                    size="small"
                    onClick={handleMenu}
                    sx={{ 
                      cursor: 'pointer',
                      height: { xs: 28, sm: 32 },
                      fontSize: { xs: '0.625rem', sm: '0.75rem' },
                      '& .MuiChip-icon': {
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                      }
                    }}
                  />
                )}
              </Box>
            </>
          ) : (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography 
                  variant="h6" 
                  component={Link}
                  to="/dashboard"
                  sx={{ 
                    fontSize: { sm: '1.25rem', md: '1.5rem' },
                    fontWeight: 700,
                    color: 'primary.main',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    mr: 4,
                    '&:hover': {
                      opacity: 0.8
                    }
                  }}
                >
                  🚜 NHFarming
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {navigationItems.map((item) => (
                    <Button
                      key={item.text}
                      component={Link}
                      to={item.path}
                      startIcon={item.icon}
                      sx={{
                        color: isActiveRoute(item.path) 
                          ? 'primary.main' 
                          : 'text.secondary',
                        backgroundColor: isActiveRoute(item.path) 
                          ? theme.palette.mode === 'light' 
                            ? 'rgba(46, 125, 50, 0.08)' 
                            : 'rgba(0, 230, 118, 0.12)'
                          : 'transparent',
                        '&:hover': {
                          backgroundColor: theme.palette.mode === 'light' 
                            ? 'rgba(46, 125, 50, 0.12)' 
                            : 'rgba(0, 230, 118, 0.16)',
                          color: 'primary.main'
                        },
                        minHeight: { sm: 40, md: 48 },
                        px: { sm: 1.5, md: 2 },
                        fontSize: { sm: '0.75rem', md: '0.875rem' }
                      }}
                    >
                      {item.text}
                    </Button>
                  ))}
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ThemeToggle />
                
                {user && (
                  <Chip
                    icon={user.role === 'admin' ? <AdminIcon /> : <PersonIcon />}
                    label={user.username}
                    color={user.role === 'admin' ? 'warning' : 'default'}
                    variant="outlined"
                    onClick={handleMenu}
                    sx={{ 
                      cursor: 'pointer',
                      height: { sm: 36, md: 40 },
                      fontSize: { sm: '0.75rem', md: '0.875rem' }
                    }}
                  />
                )}
              </Box>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: { xs: 160, sm: 200 },
            borderRadius: { xs: 8, sm: 12 }
          }
        }}
      >
        <MenuItem 
          component={Link} 
          to="/account" 
          onClick={handleClose}
          sx={{ py: { xs: 1, sm: 1.5 } }}
        >
          <AccountIcon sx={{ mr: 2, fontSize: { xs: '1.125rem', sm: '1.25rem' } }} />
          Account
        </MenuItem>
        <MenuItem 
          component={Link} 
          to="/change-password" 
          onClick={handleClose}
          sx={{ py: { xs: 1, sm: 1.5 } }}
        >
          <LockIcon sx={{ mr: 2, fontSize: { xs: '1.125rem', sm: '1.25rem' } }} />
          Change Password
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={handleLogout}
          sx={{ py: { xs: 1, sm: 1.5 } }}
        >
          <LogoutIcon sx={{ mr: 2, fontSize: { xs: '1.125rem', sm: '1.25rem' } }} />
          Logout
        </MenuItem>
      </Menu>

      <MobileMenu />
    </>
  );
};

export default NavBar; 