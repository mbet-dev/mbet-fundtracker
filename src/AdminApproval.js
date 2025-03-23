import React, { useState, useEffect, useCallback } from 'react';
import { List, ListItem, ListItemText, IconButton, Typography, Box, Snackbar, Alert, Grid, TextField, Button } from '@mui/material';
import { CheckCircle, Cancel, CheckCircleOutline } from '@mui/icons-material';

function AdminApproval({ supabase }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [remarks, setRemarks] = useState({});
  const [partialAmounts, setPartialAmounts] = useState({});

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('fund_requests')
        .select('id, subject, case_description, amount_required, urgency_level, importance_level, status')
        .eq('status', 'pending');

      if (error) {
        console.error('Error fetching requests:', error);
      } else {
        setRequests(data);
      }
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handlePartialApprove = async (id) => {
    try {
      const { error } = await supabase
        .from('fund_requests')
        .update({
          status: 'partially_approved',
          remark: remarks[id] || '',
          amount_approved: partialAmounts[id] || 0,
        })
        .eq('id', id);

      if (error) {
        console.error('Error partially approving request:', error);
        setSnackbarMessage(`Failed to partially approve request: ${error.message}`);
        setSnackbarOpen(true);
      } else {
        console.log(`Request ${id} partially approved`);
        setSnackbarMessage(`Request ${id} partially approved`);
        setSnackbarOpen(true);
        fetchRequests(); // Refresh requests list
      }
    } catch (error) {
      console.error('Error partially approving request:', error);
      setSnackbarMessage(`Error partially approving request: ${error.message}`);
      setSnackbarOpen(true);
      //alert('Failed to approve request.');
    }
  };

  const handleApprove = async (id) => {
    try {
      const { error } = await supabase
        .from('fund_requests')
        .update({
          status: 'approved',
          remark: remarks[id] || '',
          amount_approved: requests.find(req => req.id === id).amount_required,
        })
        .eq('id', id);

      if (error) {
        console.error('Error approving request:', error);
        setSnackbarMessage(`Failed to approve request: ${error.message}`);
        setSnackbarOpen(true);
        //alert('Failed to approve request.');
      } else {
        console.log(`Request ${id} approved`);
        setSnackbarMessage(`Request ${id} approved`);
        setSnackbarOpen(true);
        fetchRequests(); // Refresh requests list
      }
    } catch (error) {
      console.error('Error approving request:', error);
        setSnackbarMessage(`Error approving request: ${error.message}`);
        setSnackbarOpen(true);
      //alert('Failed to approve request.');
    }
  };

  const handleDecline = async (id) => {
    try {
      const { error } = await supabase
        .from('fund_requests')
        .update({
          status: 'declined',
          remark: remarks[id] || '',
        })
        .eq('id', id);

      if (error) {
        console.error('Error declining request:', error);
        setSnackbarMessage(`Failed to decline request: ${error.message}`);
        setSnackbarOpen(true);
        //alert('Failed to decline request.');
      } else {
        console.log(`Request ${id} declined`);
        setSnackbarMessage(`Request ${id} declined`);
        setSnackbarOpen(true);
        fetchRequests(); // Refresh requests list
      }
    } catch (error) {
      console.error('Error declining request:', error);
      setSnackbarMessage(`Error declining request: ${error.message}`);
      setSnackbarOpen(true);
      //alert('Failed to decline request.');
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  if (loading) {
    return <Typography>Loading requests...</Typography>;
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Pending Fund Request Approvals
      </Typography>
      <List>
        {requests.map((request) => (
          <ListItem key={request.id} divider>
            <Grid container alignItems="center" spacing={2}>
              <Grid item xs={12}>
                <ListItemText
                  primary={<b>{request.subject}</b>}
                  secondary={`Amount: ${request.amount_required} ${request.currency} | Urgency: ${request.urgency_level} | Importance: ${request.importance_level} | Status: ${request.status}`}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Remark"
                  multiline
                  rows={4}
                  fullWidth
                  value={remarks[request.id] || ''}
                  onChange={(e) => setRemarks({ ...remarks, [request.id]: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Partial Amount"
                  type="number"
                  fullWidth
                  value={partialAmounts[request.id] || ''}
                onChange={(e) => setPartialAmounts({ ...partialAmounts, [request.id]: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-evenly' }}>
                <Button variant="contained" onClick={() => handleApprove(request.id)} style={{ backgroundColor: 'green', color: 'white', marginRight: '10px' }}>
                  Approve
                </Button>
                <Button variant="contained" onClick={() => handlePartialApprove(request.id)} style={{ backgroundColor: 'orange', color: 'white', marginRight: '10px' }}>
                  Partial Approve
                </Button>
                <Button variant="contained" color="error" onClick={() => handleDecline(request.id)} >
                  Decline
                </Button>
              </Grid>
            </Grid>
          </ListItem>
        ))}
      </List>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <Button variant="contained" onClick={() => window.location.href='/home'}>Back to Home</Button>
    </Box>
  );
}

export default AdminApproval;
