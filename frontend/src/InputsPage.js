import React, { useState, useEffect } from 'react';
import { apiRequest } from './api';
import {
  Box, Button, TextField, Typography, Paper, Grid, Snackbar, CircularProgress, 
  IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Card, CardContent, CardActions, Chip, useTheme, useMediaQuery, MenuItem
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import InputIcon from '@mui/icons-material/Input';


export default function InputsPage() {
  const [inputs, setInputs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', type: '', unit: '', notes: '' });
  const [editInput, setEditInput] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteId, setDeleteId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const inputTypes = [
    'fertilizer',
    'pesticide',
    'herbicide',
    'fungicide',
    'seed',
    'fuel',
    'lubricant',
    'other'
  ];

  const units = [
    'kg',
    'L',
    'gal',
    'lb',
    'ton',
    'acre',
    'ha',
    'piece',
    'unit'
  ];

  const fetchInputs = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/inputs');
      setInputs(data);
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInputs(); }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async e => {
    e.preventDefault();
    try {
      await apiRequest('/inputs', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setForm({ name: '', type: '', unit: '', notes: '' });
      fetchInputs();
      setSnackbar({ open: true, message: 'Input added!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    }
  };

  const handleEdit = input => {
    setEditInput(input);
    setForm({
      name: input.name,
      type: input.type || '',
      unit: input.unit || '',
      notes: input.notes || '',
    });
  };

  const handleUpdate = async e => {
    e.preventDefault();
    try {
      await apiRequest(`/inputs/${editInput.id}`, {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      setEditInput(null);
      setForm({ name: '', type: '', unit: '', notes: '' });
      fetchInputs();
      setSnackbar({ open: true, message: 'Input updated!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    }
  };

  const handleDelete = id => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await apiRequest(`/inputs/${deleteId}`, { method: 'DELETE' });
      fetchInputs();
      setSnackbar({ open: true, message: 'Input deleted!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
      setDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  const InputCard = ({ input }) => (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <InputIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
            {input.name}
          </Typography>
        </Box>
        
        <Grid container spacing={1} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Type: <strong>{input.type || 'N/A'}</strong>
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Unit: <strong>{input.unit || 'N/A'}</strong>
            </Typography>
          </Grid>
        </Grid>
        
        {input.type && (
          <Chip 
            label={input.type} 
            color="primary" 
            size="small" 
            sx={{ mb: 1 }}
          />
        )}
        
        {input.notes && (
          <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
            {input.notes}
          </Typography>
        )}
      </CardContent>
      
      <CardActions sx={{ justifyContent: 'space-around', p: 2 }}>
        <IconButton 
          color="primary" 
          onClick={() => handleEdit(input)}
          title="Edit"
          size="small"
        >
          <EditIcon />
        </IconButton>
        <IconButton 
          color="error" 
          onClick={() => handleDelete(input.id)}
          title="Delete"
          size="small"
        >
          <DeleteIcon />
        </IconButton>
      </CardActions>
    </Card>
  );

  return (
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
        📦 Inputs
      </Typography>

      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {editInput ? 'Edit Input' : 'Add New Input'}
        </Typography>
        <Box component="form" onSubmit={editInput ? handleUpdate : handleAdd}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Type"
                name="type"
                value={form.type}
                onChange={handleChange}
                size="small"
              >
                {inputTypes.map(type => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Unit"
                name="unit"
                value={form.unit}
                onChange={handleChange}
                size="small"
              >
                {units.map(unit => (
                  <MenuItem key={unit} value={unit}>{unit}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                multiline
                rows={2}
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Button type="submit" variant="contained" color="primary">
                  {editInput ? 'Update' : 'Add'} Input
                </Button>
                {editInput && (
                  <Button 
                    variant="outlined" 
                    onClick={() => {
                      setEditInput(null);
                      setForm({ name: '', type: '', unit: '', notes: '' });
                    }}
                  >
                    Cancel
                  </Button>
                )}

              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {inputs.map(input => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={input.id}>
              <InputCard input={input} />
            </Grid>
          ))}
        </Grid>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
      
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Input?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this input? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" onClick={confirmDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 