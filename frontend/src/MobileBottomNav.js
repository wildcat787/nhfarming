import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BottomNavigation, BottomNavigationAction, Paper, useMediaQuery } from '@mui/material';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AssignmentIcon from '@mui/icons-material/Assignment';
import InputIcon from '@mui/icons-material/PlaylistAddCheck';
import { AuthContext } from './AuthContext';

const navItems = [
  { label: 'Crops', value: '/crops', icon: <AgricultureIcon /> },
  { label: 'Inputs', value: '/inputs', icon: <InputIcon /> },
  { label: 'Applications', value: '/applications', icon: <AssignmentIcon /> },
  { label: 'Vehicles', value: '/vehicles', icon: <LocalShippingIcon /> },
];

export default function MobileBottomNav() {
  const { user } = React.useContext(AuthContext);
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('sm'));
  const location = useLocation();
  const navigate = useNavigate();
  const [value, setValue] = React.useState(location.pathname);

  React.useEffect(() => {
    setValue(location.pathname);
  }, [location.pathname]);

  if (!user || !isMobile) return null;

  return (
    <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 2000 }} elevation={8}>
      <BottomNavigation
        showLabels
        value={value}
        onChange={(e, newValue) => {
          setValue(newValue);
          navigate(newValue);
        }}
      >
        {navItems.map(item => (
          <BottomNavigationAction key={item.value} label={item.label} value={item.value} icon={item.icon} />
        ))}
      </BottomNavigation>
    </Paper>
  );
} 