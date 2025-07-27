import React from 'react';
import { Box, Container, Typography, Paper, Breadcrumbs, Link } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useLocation } from 'react-router-dom';

export default function PageLayout({ 
  title, 
  subtitle, 
  children, 
  maxWidth = 'lg',
  showBreadcrumbs = true,
  actions,
  sx = {}
}) {
  const theme = useTheme();
  const location = useLocation();

  const getBreadcrumbs = () => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);
    
    if (segments.length === 0) return [];
    
    const breadcrumbs = [];
    let currentPath = '';
    
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === segments.length - 1;
      
      let label = segment.charAt(0).toUpperCase() + segment.slice(1);
      
      // Custom labels for specific routes
      if (segment === 'vehicles') label = 'Vehicles';
      if (segment === 'crops') label = 'Crops';
      if (segment === 'inputs') label = 'Inputs';
      if (segment === 'applications') label = 'Applications';
      if (segment === 'maintenance') label = 'Maintenance';
      if (segment === 'users') label = 'Users';
      
      breadcrumbs.push({
        label,
        path: currentPath,
        isLast
      });
    });
    
    return breadcrumbs;
  };

  return (
    <Container 
      maxWidth={maxWidth} 
      sx={{ 
        py: 4,
        minHeight: '100vh',
        ...sx
      }}
    >
      {showBreadcrumbs && getBreadcrumbs().length > 0 && (
        <Breadcrumbs 
          sx={{ 
            mb: 3,
            '& .MuiBreadcrumbs-separator': {
              color: theme.palette.text.secondary,
            }
          }}
        >
          {getBreadcrumbs().map((breadcrumb, index) => (
            <Link
              key={breadcrumb.path}
              color={breadcrumb.isLast ? 'text.primary' : 'text.secondary'}
              href={breadcrumb.isLast ? undefined : breadcrumb.path}
              underline="hover"
              sx={{
                fontWeight: breadcrumb.isLast ? 600 : 400,
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: breadcrumb.isLast ? 'none' : 'underline',
                }
              }}
            >
              {breadcrumb.label}
            </Link>
          ))}
        </Breadcrumbs>
      )}

      <Box sx={{ mb: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Box>
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                fontWeight: 700,
                color: theme.palette.text.primary,
                mb: subtitle ? 1 : 0
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography 
                variant="body1" 
                color="text.secondary"
                sx={{ 
                  fontSize: '1.125rem',
                  lineHeight: 1.5
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          {actions && (
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              flexWrap: 'wrap',
              alignItems: 'center'
            }}>
              {actions}
            </Box>
          )}
        </Box>
      </Box>

      {children}
    </Container>
  );
}

export function SectionLayout({ 
  title, 
  children, 
  sx = {},
  elevation = 1
}) {
  return (
    <Paper 
      elevation={elevation} 
      sx={{ 
        p: 4, 
        mb: 4,
        ...sx
      }}
    >
      {title && (
        <Typography 
          variant="h6" 
          component="h2" 
          sx={{ 
            mb: 3,
            fontWeight: 600,
            color: 'text.primary'
          }}
        >
          {title}
        </Typography>
      )}
      {children}
    </Paper>
  );
}

export function CardLayout({ 
  children, 
  sx = {},
  elevation = 2
}) {
  return (
    <Paper 
      elevation={elevation} 
      sx={{ 
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        ...sx
      }}
    >
      {children}
    </Paper>
  );
} 