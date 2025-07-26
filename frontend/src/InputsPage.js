import React, { useState, useEffect } from 'react';
import { apiRequest } from './api';
import {
  Box, Button, TextField, Typography, Alert, Paper, Grid, Snackbar, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, MenuItem
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import VoiceInputButton from './VoiceInputButton';

const inputTypes = [
  { value: 'seed', label: 'Seed' },
  { value: 'chemical', label: 'Chemical' },
  { value: 'fertilizer', label: 'Fertilizer' },
  { value: 'other', label: 'Other' },
];

export default function InputsPage() {
  const [inputs, setInputs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', type: '', unit: '', notes: '' });
  const [editId, setEditId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteId, setDeleteId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const fetchInputs = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/inputs');
      setInputs(data);
    } catch (err) {
      setError(err.message);
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
    setError('');
    try {
      await apiRequest('/inputs', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setForm({ name: '', type: '', unit: '', notes: '' });
      fetchInputs();
      setSnackbar({ open: true, message: 'Input added!', severity: 'success' });
    } catch (err) {
      setError(err.message);
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    }
  };

  const handleEdit = input => {
    setEditId(input.id);
    setForm({ name: input.name, type: input.type, unit: input.unit, notes: input.notes });
  };

  const handleUpdate = async e => {
    e.preventDefault();
    setError('');
    try {
      await apiRequest(`/inputs/${editId}`, {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      setEditId(null);
      setForm({ name: '', type: '', unit: '', notes: '' });
      fetchInputs();
      setSnackbar({ open: true, message: 'Input updated!', severity: 'success' });
    } catch (err) {
      setError(err.message);
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

  return (
    <Box>
      <Typography variant="h4" mb={3}>Inputs</Typography>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" mb={2}>{editId ? 'Edit Input' : 'Add Input'}</Typography>
        <form onSubmit={editId ? handleUpdate : handleAdd}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField name="name" label="Name" value={form.name} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="type" label="Type" value={form.type} onChange={handleChange} select fullWidth>
                {inputTypes.map(option => (
                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="unit" label="Unit" value={form.unit} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="notes" label="Notes" value={form.notes} onChange={handleChange} fullWidth />
              <VoiceInputButton onResult={text => setForm(f => ({ ...f, notes: (f.notes ? f.notes + ' ' : '') + text }))} />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary" startIcon={editId ? <EditIcon /> : <AddIcon />}>{editId ? 'Update' : 'Add'} Input</Button>
              {editId && <Button sx={{ ml: 2 }} onClick={() => { setEditId(null); setForm({ name: '', type: '', unit: '', notes: '' }); }}>Cancel</Button>}
            </Grid>
          </Grid>
        </form>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </Paper>
      <Typography variant="h6" mb={2}>Your Inputs</Typography>
      {loading ? <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}><CircularProgress /></Box> : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inputs.map(input => (
                <TableRow key={input.id}>
                  <TableCell>{input.name}</TableCell>
                  <TableCell>{input.type}</TableCell>
                  <TableCell>{input.unit}</TableCell>
                  <TableCell>{input.notes}</TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => handleEdit(input)}><EditIcon /></IconButton>
                    <IconButton color="error" onClick={() => handleDelete(input.id)}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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
          <DialogContentText>Are you sure you want to delete this input?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" onClick={confirmDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 