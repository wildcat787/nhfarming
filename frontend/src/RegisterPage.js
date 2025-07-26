import React, { useState, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, Alert, Paper } from '@mui/material';

export default function RegisterPage() {
  const { register } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      await register(username, password);
      navigate('/crops');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <Paper sx={{ p: 4, minWidth: 300 }}>
        <Typography variant="h5" mb={2}>Register</Typography>
        <form onSubmit={handleSubmit}>
          <TextField label="Username" value={username} onChange={e => setUsername(e.target.value)} fullWidth margin="normal" />
          <TextField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} fullWidth margin="normal" />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>Register</Button>
        </form>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </Paper>
    </Box>
  );
} 