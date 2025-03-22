import React, { useState } from 'react';
import { TextField, Button, Select, MenuItem, FormControl, InputLabel, Typography, Box, Snackbar, Alert, Container } from '@mui/material';

function FundRequestForm({ supabase }) {
  const [subject, setSubject] = useState('');
  const [case_description, setCaseDescription] = useState('');
  const [amount_required, setAmountRequired] = useState('');
  const [urgency_level, seturgency_level] = useState('');
  const [importance_level, setimportance_level] = useState('');
    const [currency, setCurrency] = useState('USD'); // Default currency
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data, error } = await supabase
        .from('fund_requests')
        .insert([
          {
            subject,
            case_description,
            amount_required,
            urgency_level,
            importance_level,
              currency, // Include currency in the insert
            // attachmentUrl: null, // Will handle attachments later
            // userId: session?.user?.id, // Will handle user auth later
            status: 'pending',
          },
        ])
        .select();

      if (error) {
        // alert('Failed to submit fund request.'); // replaced with snackbar
        setSnackbarMessage(`Failed to submit fund request: ${error.message}`);
        setSnackbarOpen(true);
        console.error('Supabase error:', error);
      } else {
        // alert('Fund request submitted successfully!'); // replaced with snackbar
        setSnackbarMessage('Fund request submitted successfully!');
        setSnackbarOpen(true);
        console.log('Fund request submitted:', data);
        // Clear form
        setCaseDescription('');
        setAmountRequired('');
        seturgency_level('');
        setimportance_level('');
          setCurrency('USD');
      }
    } catch (error) {
      // alert('Error submitting fund request.'); // replaced with snackbar
      setSnackbarMessage(`Error submitting fund request: ${error.message}`);
      setSnackbarOpen(true);
      console.error('Error:', error);
    }
  };

    const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <Container>
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Submit Fund Request
      </Typography>
      <TextField
        label="Subject"
        fullWidth
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        sx={{ mb: 2 }}
        required
      />
      <TextField
        label="Case Description"
        multiline
        rows={4}
        fullWidth
        value={case_description}
        onChange={(e) => setCaseDescription(e.target.value)}
        sx={{ mb: 2 }}
      />
        <TextField
            label="Amount Required"
            type="number"
            fullWidth
            value={amount_required}
            onChange={(e) => setAmountRequired(e.target.value)}
            sx={{ mb: 2 }}
            required
        />
        <FormControl fullWidth sx={{ mb: 2 }} required>
            <InputLabel id="currency-label">Currency</InputLabel>
            <Select
                labelId="currency-label"
                value={currency}
                label="Currency"
                onChange={(e) => setCurrency(e.target.value)}
            >
                <MenuItem value="ETB">ETB</MenuItem>
                <MenuItem value="EUR">EUR</MenuItem>
                <MenuItem value="USD">USD</MenuItem>
                <MenuItem value="CHF">CHF</MenuItem>
                <MenuItem value="YEN">YEN</MenuItem>
                <MenuItem value="DHM">DHM</MenuItem>
            </Select>
        </FormControl>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="urgency-level-label">Urgency Level</InputLabel>
        <Select
          labelId="urgency-level-label"
          value={urgency_level}
          label="Urgency Level"
          onChange={(e) => seturgency_level(e.target.value)}
        >
          <MenuItem value="Low">Low</MenuItem>
          <MenuItem value="Medium">Medium</MenuItem>
          <MenuItem value="High">High</MenuItem>
        </Select>
      </FormControl>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="importance-level-label">Importance Level</InputLabel>
        <Select
          labelId="importance-level-label"
          value={importance_level}
          label="Importance Level"
          onChange={(e) => setimportance_level(e.target.value)}
        >
          <MenuItem value="Low">Low</MenuItem>
          <MenuItem value="Medium">Medium</MenuItem>
          <MenuItem value="High">High</MenuItem>
        </Select>
      </FormControl>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Button variant="contained" type="submit">
          Submit Request
        </Button>
        <Button variant="contained" onClick={() => window.location.href='/home'}>Back to Home</Button>
      </Box>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
        </Snackbar>
    </Box>
    </Container>
  );
}

export default FundRequestForm;
