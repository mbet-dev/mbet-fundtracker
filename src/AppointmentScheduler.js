import React, { useState } from 'react';
import { Typography, Box, Button, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function AppointmentScheduler() {
  const navigate = useNavigate();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
  const [locationType, setLocationType] = useState('online');
  const [description, setDescription] = useState('');

  const handleScheduleAppointment = () => {
    // TODO: Implement Google Calendar API integration here
    alert('Appointment scheduling is under development. Please check back later.');
  };

  return (
    <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Appointment Scheduler
      </Typography>

      <FormControl fullWidth margin="normal">
        <TextField
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
        />
      </FormControl>

      <FormControl fullWidth margin="normal">
        <TextField
          label="Time"
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
        />
      </FormControl>

      <FormControl fullWidth margin="normal">
        <InputLabel id="location-type-label">Location Type</InputLabel>
        <Select
          labelId="location-type-label"
          id="location-type"
          value={locationType}
          label="Location Type"
          onChange={(e) => setLocationType(e.target.value)}
        >
          <MenuItem value="online">Online</MenuItem>
          <MenuItem value="physical">Physical</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth margin="normal">
        <TextField
          label="Description"
          multiline
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </FormControl>

      <Button variant="contained" color="primary" onClick={handleScheduleAppointment} sx={{ mb: 2 }}>
        Schedule Appointment
      </Button>

      <Button variant="contained" onClick={() => navigate('/home')}>
        Back to Home
      </Button>
    </Box>
  );
}

export default AppointmentScheduler;
