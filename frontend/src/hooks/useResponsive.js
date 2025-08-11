import { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';

export const useResponsive = () => {
  const theme = useTheme();
  
  // Breakpoint queries
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const isLargeDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  
  // Orientation
  const [orientation, setOrientation] = useState('portrait');
  
  useEffect(() => {
    const updateOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };
    
    updateOrientation();
    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', updateOrientation);
    
    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('orientationchange', updateOrientation);
    };
  }, []);
  
  // Touch detection
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  
  useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    
    checkTouchDevice();
  }, []);
  
  // Screen size detection
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  
  useEffect(() => {
    const updateScreenSize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    
    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    
    return () => {
      window.removeEventListener('resize', updateScreenSize);
    };
  }, []);
  
  // Device type detection
  const [deviceType, setDeviceType] = useState('desktop');
  
  useEffect(() => {
    const checkDeviceType = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      
      if (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
        if (/ipad/i.test(userAgent)) {
          setDeviceType('tablet');
        } else {
          setDeviceType('mobile');
        }
      } else {
        setDeviceType('desktop');
      }
    };
    
    checkDeviceType();
  }, []);
  
  // Grid breakpoints for responsive layouts
  const getGridBreakpoints = () => {
    if (isMobile) {
      return {
        xs: 12,
        sm: 6,
        md: 4,
        lg: 3,
        xl: 2
      };
    } else if (isTablet) {
      return {
        xs: 6,
        sm: 4,
        md: 3,
        lg: 2,
        xl: 2
      };
    } else {
      return {
        xs: 4,
        sm: 3,
        md: 2,
        lg: 2,
        xl: 1
      };
    }
  };
  
  // Spacing values for responsive layouts
  const getSpacing = () => {
    if (isMobile) {
      return {
        xs: 1,
        sm: 2,
        md: 3,
        lg: 4
      };
    } else if (isTablet) {
      return {
        xs: 2,
        sm: 3,
        md: 4,
        lg: 5
      };
    } else {
      return {
        xs: 3,
        sm: 4,
        md: 5,
        lg: 6
      };
    }
  };
  
  // Typography variants for responsive text
  const getTypographyVariant = (mobileVariant, tabletVariant, desktopVariant) => {
    if (isMobile) return mobileVariant;
    if (isTablet) return tabletVariant;
    return desktopVariant;
  };
  
  // Button sizes for responsive buttons
  const getButtonSize = () => {
    if (isMobile) return 'small';
    if (isTablet) return 'medium';
    return 'large';
  };
  
  // Icon sizes for responsive icons
  const getIconSize = () => {
    if (isMobile) return 'small';
    if (isTablet) return 'medium';
    return 'large';
  };
  
  // Card layout for responsive cards
  const getCardLayout = () => {
    if (isMobile) {
      return {
        padding: 2,
        margin: 1,
        borderRadius: 2
      };
    } else if (isTablet) {
      return {
        padding: 3,
        margin: 2,
        borderRadius: 3
      };
    } else {
      return {
        padding: 4,
        margin: 3,
        borderRadius: 4
      };
    }
  };
  
  // Form layout for responsive forms
  const getFormLayout = () => {
    if (isMobile) {
      return {
        spacing: 2,
        padding: 2,
        fieldSize: 'small'
      };
    } else if (isTablet) {
      return {
        spacing: 3,
        padding: 3,
        fieldSize: 'medium'
      };
    } else {
      return {
        spacing: 4,
        padding: 4,
        fieldSize: 'medium'
      };
    }
  };
  
  // Table layout for responsive tables
  const getTableLayout = () => {
    if (isMobile) {
      return {
        dense: true,
        showPagination: false,
        rowsPerPage: 5
      };
    } else if (isTablet) {
      return {
        dense: false,
        showPagination: true,
        rowsPerPage: 10
      };
    } else {
      return {
        dense: false,
        showPagination: true,
        rowsPerPage: 25
      };
    }
  };
  
  // Navigation layout for responsive navigation
  const getNavigationLayout = () => {
    if (isMobile) {
      return {
        type: 'drawer',
        showIcons: true,
        showLabels: false
      };
    } else if (isTablet) {
      return {
        type: 'horizontal',
        showIcons: true,
        showLabels: true
      };
    } else {
      return {
        type: 'horizontal',
        showIcons: true,
        showLabels: true
      };
    }
  };
  
  return {
    // Basic breakpoints
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    
    // Device information
    orientation,
    isTouchDevice,
    screenSize,
    deviceType,
    
    // Responsive helpers
    getGridBreakpoints,
    getSpacing,
    getTypographyVariant,
    getButtonSize,
    getIconSize,
    getCardLayout,
    getFormLayout,
    getTableLayout,
    getNavigationLayout,
    
    // Convenience methods
    isSmallScreen: isMobile || isTablet,
    isLargeScreen: isDesktop || isLargeDesktop,
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape',
  };
};

export default useResponsive;
