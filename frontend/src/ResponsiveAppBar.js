import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, IconButton, Typography, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, Box, Button, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AssignmentIcon from '@mui/icons-material/Assignment';
import InputIcon from '@mui/icons-material/PlaylistAddCheck';
import LockIcon from '@mui/icons-material/Lock';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { AuthContext } from './AuthContext';

const navLinks = [
  { label: 'Crops', to: '/crops', icon: <AgricultureIcon /> },
  { label: 'Inputs', to: '/inputs', icon: <InputIcon /> },
  { label: 'Applications', to: '/applications', icon: <AssignmentIcon /> },
  { label: 'Vehicles', to: '/vehicles', icon: <LocalShippingIcon /> },
  { label: 'Change Password', to: '/change-password', icon: <LockIcon /> },
];

export default function ResponsiveAppBar() {
  const { user, logout } = React.useContext(AuthContext);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Add admin link if user is admin
  const allNavLinks = user?.role === 'admin' 
    ? [...navLinks, { label: 'Admin', to: '/admin', icon: <AdminPanelSettingsIcon /> }]
    : navLinks;

  const drawer = (
    <Box sx={{ width: 250 }} role="presentation" onClick={() => setDrawerOpen(false)}>
      <List>
        {allNavLinks.map(link => (
          <ListItem button component={RouterLink} to={link.to} key={link.label}>
            <ListItemIcon>{link.icon}</ListItemIcon>
            <ListItemText primary={link.label} />
          </ListItem>
        ))}
        <Divider />
        <ListItem button onClick={handleLogout}>
          <ListItemIcon><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <AppBar position="static" color="default" sx={{ mb: 1 }}>
      <Toolbar>
        {isMobile && user && (
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={() => setDrawerOpen(true)}>
            <MenuIcon />
          </IconButton>
        )}
        <Typography variant="h6" sx={{ flexGrow: 1 }} component={RouterLink} to="/crops" color="inherit" style={{ textDecoration: 'none' }}>
          Farm App
        </Typography>
        {!isMobile && user && allNavLinks.map(link => (
          <Button color="inherit" component={RouterLink} to={link.to} key={link.label} startIcon={link.icon} sx={{ mx: 0.5 }}>
            {link.label}
          </Button>
        ))}
        {!isMobile && user && (
          <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />} sx={{ mx: 0.5 }}>
            Logout
          </Button>
        )}
      </Toolbar>
      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        {drawer}
      </Drawer>
    </AppBar>
  );
} 