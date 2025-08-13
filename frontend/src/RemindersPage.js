import React, { useState, useEffect } from 'react';
import { apiRequest } from './api';
import { useAuth } from './AuthContext';
import {
  Box, Button, Typography, Alert, Paper, Grid, Snackbar, 
  IconButton, Chip, useTheme, useMediaQuery, Card, CardContent,
  CardActions, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PageLayout, { SectionLayout, CardLayout } from './components/PageLayout';

export default function RemindersPage() {
  const { user } = useAuth();
  const [reminders, setReminders] = useState([]);
  const [upcomingReminders, setUpcomingReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const [allReminders, upcoming] = await Promise.all([
        apiRequest('/reminders'),
        apiRequest('/reminders/upcoming')
      ]);
      setReminders(allReminders);
      setUpcomingReminders(upcoming);
    } catch (err) {
      setError(err.message);
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const handleMarkAsSent = async (reminderId) => {
    try {
      await apiRequest(`/reminders/${reminderId}/sent`, { method: 'PUT' });
      await fetchReminders();
      setSnackbar({ open: true, message: 'Reminder marked as sent', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    }
  };

  const getReminderColor = (reminder) => {
    const today = new Date();
    const reminderDate = new Date(reminder.reminder_date);
    const expiryDate = new Date(reminder.expiry_date);
    
    if (reminder.sent) return 'default';
    if (expiryDate < today) return 'error';
    if (reminderDate <= today) return 'warning';
    return 'info';
  };

  const getReminderIcon = (reminder) => {
    if (reminder.sent) return <CheckCircleIcon />;
    if (new Date(reminder.expiry_date) < new Date()) return <WarningIcon color="error" />;
    if (new Date(reminder.reminder_date) <= new Date()) return <WarningIcon color="warning" />;
    return <ScheduleIcon />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntil = (dateString) => {
    const today = new Date();
    const targetDate = new Date(dateString);
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const ReminderCard = ({ reminder }) => {
    const daysUntil = getDaysUntil(reminder.reminder_date);
    const isOverdue = new Date(reminder.expiry_date) < new Date();
    const isDue = new Date(reminder.reminder_date) <= new Date();
    
    return (
      <CardLayout
        sx={{
          border: isOverdue ? 2 : 1,
          borderColor: isOverdue ? 'error.main' : getReminderColor(reminder) === 'warning' ? 'warning.main' : 'divider',
          bgcolor: isOverdue ? 'error.light' : 'background.paper'
        }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            {getReminderIcon(reminder)}
            <Typography variant="h6" component="h2" sx={{ ml: 1, fontWeight: 'bold' }}>
              {reminder.vehicle_name}
            </Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            <strong>{reminder.reminder_type.replace('_', ' ').replace(/([A-Z])/g, ' $1').trim()}</strong>
          </Typography>
          
          <Grid container spacing={1} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Reminder Date: <strong>{formatDate(reminder.reminder_date)}</strong>
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Expiry Date: <strong>{formatDate(reminder.expiry_date)}</strong>
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Reg Number: <strong>{reminder.registration_number || 'N/A'}</strong>
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Vehicle: <strong>{reminder.make} {reminder.model}</strong>
              </Typography>
            </Grid>
          </Grid>
          
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Chip 
              label={reminder.sent ? 'Sent' : isOverdue ? 'OVERDUE' : isDue ? 'Due Now' : `${daysUntil} days`}
              color={getReminderColor(reminder)}
              size="small"
            />
            {reminder.sent && (
              <Chip 
                label={`Sent: ${formatDate(reminder.sent_date)}`}
                color="default"
                size="small"
                variant="outlined"
              />
            )}
          </Box>
          
          {reminder.message && (
            <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
              {reminder.message}
            </Typography>
          )}
        </CardContent>
        
        <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Created: {formatDate(reminder.created_at)}
          </Typography>
          {!reminder.sent && (
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleMarkAsSent(reminder.id)}
            >
              Mark as Sent
            </Button>
          )}
        </CardActions>
      </CardLayout>
    );
  };

  const upcomingCount = upcomingReminders.filter(r => !r.sent).length;
  const overdueCount = reminders.filter(r => new Date(r.expiry_date) < new Date() && !r.sent).length;

  return (
    <PageLayout 
      title="🔔 Reminders" 
      subtitle="Vehicle registration, insurance, and service expiry notifications"
    >
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Summary Cards */}
      <SectionLayout title="Summary">
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}>
              <CardContent>
                <Typography variant="h4" component="div">
                  {reminders.length}
                </Typography>
                <Typography variant="body2">
                  Total Reminders
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
              <CardContent>
                <Typography variant="h4" component="div">
                  {upcomingCount}
                </Typography>
                <Typography variant="body2">
                  Upcoming Reminders
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
              <CardContent>
                <Typography variant="h4" component="div">
                  {overdueCount}
                </Typography>
                <Typography variant="body2">
                  Overdue Items
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </SectionLayout>

      {/* Upcoming Reminders */}
      <SectionLayout title={`Upcoming Reminders (${upcomingCount})`}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <Typography>Loading reminders...</Typography>
          </Box>
        ) : upcomingReminders.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No upcoming reminders. All vehicle registrations, insurance, and service dates are up to date!
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={isMobile ? 1 : 2}>
            {upcomingReminders
              .filter(reminder => !reminder.sent)
              .sort((a, b) => new Date(a.reminder_date) - new Date(b.reminder_date))
              .map(reminder => (
                <Grid item xs={12} sm={6} md={4} key={reminder.id}>
                  <ReminderCard reminder={reminder} />
                </Grid>
              ))}
          </Grid>
        )}
      </SectionLayout>

      {/* All Reminders */}
      <SectionLayout title={`All Reminders (${reminders.length})`}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <Typography>Loading reminders...</Typography>
          </Box>
        ) : reminders.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No reminders found. Add vehicle registration, insurance, or service dates to start receiving reminders.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={isMobile ? 1 : 2}>
            {reminders
              .sort((a, b) => new Date(a.reminder_date) - new Date(b.reminder_date))
              .map(reminder => (
                <Grid item xs={12} sm={6} md={4} key={reminder.id}>
                  <ReminderCard reminder={reminder} />
                </Grid>
              ))}
          </Grid>
        )}
      </SectionLayout>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageLayout>
  );
}
