import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { apiRequest } from './api';

export default function VehicleJobsModal({ open, onClose, vehicle }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && vehicle) {
      fetchVehicleJobs();
    }
  }, [open, vehicle]);

  const fetchVehicleJobs = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiRequest(`/applications/vehicle/${encodeURIComponent(vehicle.name)}`);
      setJobs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString();
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return 'N/A';
    return timeStr;
  };

  const formatWeather = (temp, humidity, wind, rain) => {
    const parts = [];
    if (temp !== null && temp !== undefined) parts.push(`${temp}°C`);
    if (humidity !== null && humidity !== undefined) parts.push(`${humidity}%`);
    if (wind !== null && wind !== undefined) parts.push(`${wind} km/h`);
    if (rain !== null && rain !== undefined) parts.push(`${rain} mm`);
    return parts.length > 0 ? parts.join(', ') : 'N/A';
  };

  const getStatusColor = (date) => {
    if (!date) return 'default';
    const jobDate = new Date(date);
    const today = new Date();
    if (jobDate > today) return 'primary'; // Future
    if (jobDate.toDateString() === today.toDateString()) return 'success'; // Today
    return 'default'; // Past
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '60vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Jobs for {vehicle?.name}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        {vehicle && (
          <Typography variant="body2" color="text.secondary">
            {vehicle.make} {vehicle.model} {vehicle.year} • {vehicle.application_type || 'No application type'}
          </Typography>
        )}
      </DialogTitle>
      
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        ) : jobs.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No jobs found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This vehicle hasn't been used in any applications yet.
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Input</TableCell>
                  <TableCell>Crop/Field</TableCell>
                  <TableCell>Rate</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Weather</TableCell>
                  <TableCell>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id} hover>
                    <TableCell>
                      <Chip 
                        label={formatDate(job.date)} 
                        color={getStatusColor(job.date)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {job.input_name || 'N/A'}
                        </Typography>
                        {job.input_type && (
                          <Typography variant="caption" color="text.secondary">
                            {job.input_type}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {job.crop_type || 'N/A'}
                        </Typography>
                        {job.field_name && (
                          <Typography variant="caption" color="text.secondary">
                            {job.field_name}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {job.rate ? (
                        <Typography variant="body2">
                          {job.rate} {job.unit || job.input_unit || ''}
                        </Typography>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {formatTime(job.start_time)}
                        </Typography>
                        {job.finish_time && (
                          <Typography variant="caption" color="text.secondary">
                            to {formatTime(job.finish_time)}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                        {formatWeather(job.weather_temp, job.weather_humidity, job.weather_wind, job.weather_rain)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={job.notes || 'No notes'} placement="top">
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            maxWidth: 150, 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis', 
                            whiteSpace: 'nowrap' 
                          }}
                        >
                          {job.notes || 'No notes'}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        
        {jobs.length > 0 && (
          <Box mt={2} textAlign="center">
            <Typography variant="body2" color="text.secondary">
              Total jobs: {jobs.length}
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
} 