import React from 'react';
import { Box, Container, Typography, Paper, Breadcrumbs, Link, useTheme, useMediaQuery, Card, CardContent, Grid, Chip } from '@mui/material';
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
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

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
        py: { xs: 2, sm: 3, md: 4 },
        minHeight: '100vh',
        ...sx
      }}
    >
      {showBreadcrumbs && getBreadcrumbs().length > 0 && !isMobile && (
        <Breadcrumbs 
          sx={{ 
            mb: { xs: 2, sm: 3 },
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
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
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

      <Box sx={{ mb: { xs: 3, sm: 4 } }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 3 }
        }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                fontWeight: 700,
                color: theme.palette.text.primary,
                mb: subtitle ? { xs: 1, sm: 1.5 } : 0,
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                lineHeight: { xs: 1.3, sm: 1.2 }
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography 
                variant="body1" 
                color="text.secondary"
                sx={{ 
                  fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
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
              gap: { xs: 1, sm: 2 }, 
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: { xs: 'flex-start', sm: 'flex-end' },
              width: { xs: '100%', sm: 'auto' }
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Paper 
      elevation={elevation} 
      sx={{ 
        p: { xs: 2, sm: 3, md: 4 }, 
        mb: { xs: 3, sm: 4 },
        borderRadius: { xs: 12, sm: 16 },
        ...sx
      }}
    >
      {title && (
        <Typography 
          variant="h6" 
          component="h2" 
          sx={{ 
            mb: { xs: 2, sm: 3 },
            fontWeight: 600,
            color: 'text.primary',
            fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' }
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Paper 
      elevation={elevation} 
      sx={{ 
        p: { xs: 2, sm: 2.5, md: 3 },
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: { xs: 12, sm: 16 },
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[8],
        },
        ...sx
      }}
    >
      {children}
    </Paper>
  );
}

// Mobile-optimized table component that switches to cards on mobile
export function ResponsiveTable({ 
  data, 
  columns, 
  mobileCardRenderer,
  sx = {},
  emptyMessage = "No data found",
  loading = false
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body2" color="text.secondary">
          Loading...
        </Typography>
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body2" color="text.secondary">
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  if (isMobile) {
    return (
      <Grid container spacing={2}>
        {data.map((item, index) => (
          <Grid item xs={12} key={index}>
            {mobileCardRenderer ? (
              mobileCardRenderer(item, index)
            ) : (
              <CardLayout>
                <Box>
                  {columns.map((column) => (
                    <Box key={column.key} sx={{ mb: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        {column.label}:
                      </Typography>
                      <Typography variant="body2">
                        {column.render ? column.render(item[column.key], item) : item[column.key]}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardLayout>
            )}
          </Grid>
        ))}
      </Grid>
    );
  }

  // Desktop table view
  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Box
        component="table"
        sx={{
          width: '100%',
          borderCollapse: 'collapse',
          '& th, & td': {
            borderBottom: `1px solid ${theme.palette.divider}`,
            padding: { xs: '8px 12px', sm: '12px 16px', md: '16px 24px' },
            textAlign: 'left',
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
          },
          '& th': {
            backgroundColor: theme.palette.mode === 'light' 
              ? 'rgba(46, 125, 50, 0.04)' 
              : 'rgba(0, 230, 118, 0.08)',
            color: theme.palette.primary.main,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
          },
          '& tr:hover': {
            backgroundColor: theme.palette.mode === 'light' 
              ? 'rgba(46, 125, 50, 0.02)' 
              : 'rgba(0, 230, 118, 0.04)',
          },
          ...sx
        }}
      >
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} style={{ width: column.width }}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              {columns.map((column) => (
                <td key={column.key}>
                  {column.render ? column.render(item[column.key], item) : item[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </Box>
    </Box>
  );
} 