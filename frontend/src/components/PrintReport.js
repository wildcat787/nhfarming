import React from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  Typography,
  Grid,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Print as PrintIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
  Download as DownloadIcon
} from '@mui/icons-material';

const PrintReport = ({ 
  open, 
  onClose, 
  title, 
  data, 
  filters, 
  onFilterChange, 
  columns, 
  pageTitle,
  additionalInfo = null,
  showFilters = true,
  customPrintContent = null
}) => {
  const [printDialogOpen, setPrintDialogOpen] = React.useState(false);
  const [selectedFilters, setSelectedFilters] = React.useState({});

  const handlePrint = () => {
    setPrintDialogOpen(true);
    setTimeout(() => {
      window.print();
      setPrintDialogOpen(false);
    }, 100);
  };

  const handleDownloadPDF = () => {
    // This would integrate with a PDF library like jsPDF
    // For now, we'll just print
    handlePrint();
  };

  const handleFilterChange = (filterName, value) => {
    const newFilters = { ...selectedFilters, [filterName]: value };
    setSelectedFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const filteredData = React.useMemo(() => {
    if (!data || !selectedFilters) return data;

    return data.filter(item => {
      return Object.entries(selectedFilters).every(([key, value]) => {
        if (!value || value === '') return true;
        
        const itemValue = item[key];
        if (typeof itemValue === 'string') {
          return itemValue.toLowerCase().includes(value.toLowerCase());
        }
        return String(itemValue) === String(value);
      });
    });
  }, [data, selectedFilters]);

  const PrintContent = () => (
    <Box sx={{ p: 3, '@media print': { p: 0 } }}>
      {/* Header */}
      <Box sx={{ 
        textAlign: 'center', 
        mb: 3, 
        borderBottom: '2px solid #333',
        pb: 2,
        '@media print': { 
          pageBreakAfter: 'avoid',
          breakAfter: 'avoid'
        }
      }}>
        <Typography variant="h4" component="h1" gutterBottom>
          NHFarming
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          {pageTitle || title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
        </Typography>
        
        {/* Active Filters */}
        {Object.keys(selectedFilters).length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Filters Applied:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
              {Object.entries(selectedFilters).map(([key, value]) => (
                value && (
                  <Chip 
                    key={key} 
                    label={`${key}: ${value}`} 
                    size="small" 
                    variant="outlined"
                  />
                )
              ))}
            </Box>
          </Box>
        )}
      </Box>

      {/* Additional Info */}
      {additionalInfo && (
        <Box sx={{ mb: 3, '@media print': { pageBreakAfter: 'avoid' } }}>
          {additionalInfo}
        </Box>
      )}

      {/* Custom Content or Default Table */}
      {customPrintContent ? (
        customPrintContent(filteredData)
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell key={column.field} sx={{ fontWeight: 'bold' }}>
                    {column.header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((row, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={column.field}>
                      {column.render ? column.render(row[column.field], row) : row[column.field]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Summary */}
      <Box sx={{ 
        mt: 3, 
        pt: 2, 
        borderTop: '1px solid #ccc',
        '@media print': { 
          pageBreakBefore: 'avoid',
          breakBefore: 'avoid'
        }
      }}>
        <Typography variant="body2" color="text.secondary">
          Total Records: {filteredData.length}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Print Dialog */}
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Print Report - {title}
            </Typography>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {/* Filters Section */}
          {showFilters && filters && (
            <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FilterIcon />
                Filters
              </Typography>
              <Grid container spacing={2}>
                {filters.map((filter) => (
                  <Grid item xs={12} sm={6} md={4} key={filter.name}>
                    {filter.type === 'select' ? (
                      <FormControl fullWidth size="small">
                        <InputLabel>{filter.label}</InputLabel>
                        <Select
                          value={selectedFilters[filter.name] || ''}
                          onChange={(e) => handleFilterChange(filter.name, e.target.value)}
                          label={filter.label}
                        >
                          <MenuItem value="">All</MenuItem>
                          {filter.options.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <TextField
                        label={filter.label}
                        value={selectedFilters[filter.name] || ''}
                        onChange={(e) => handleFilterChange(filter.name, e.target.value)}
                        fullWidth
                        size="small"
                        placeholder={filter.placeholder}
                      />
                    )}
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}

          {/* Preview */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Report Preview
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Showing {filteredData.length} of {data?.length || 0} records
            </Typography>
          </Box>

          {/* Print Content Preview */}
          <Box sx={{ 
            border: '1px solid #ddd', 
            borderRadius: 1, 
            p: 2, 
            maxHeight: 400, 
            overflow: 'auto',
            bgcolor: 'white'
          }}>
            <PrintContent />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleDownloadPDF} 
            startIcon={<DownloadIcon />}
            variant="outlined"
          >
            Download PDF
          </Button>
          <Button 
            onClick={handlePrint} 
            startIcon={<PrintIcon />}
            variant="contained"
            color="primary"
          >
            Print Report
          </Button>
        </DialogActions>
      </Dialog>

      {/* Hidden Print Window */}
      {printDialogOpen && (
        <Box sx={{ 
          position: 'fixed', 
          top: '-9999px', 
          left: '-9999px',
          '@media print': {
            position: 'static',
            top: 'auto',
            left: 'auto'
          }
        }}>
          <PrintContent />
        </Box>
      )}
    </>
  );
};

export default PrintReport; 