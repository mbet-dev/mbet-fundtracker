import React, { useState, useEffect } from 'react';
import { Typography, Box, Button, List, ListItem, ListItemText } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Notifications({ supabase }) {
  const [fundRequests, setFundRequests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [requestsPerPage] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchFundRequests() {
      const startIndex = (currentPage - 1) * requestsPerPage;
      const endIndex = startIndex + requestsPerPage - 1;

      const { data, error } = await supabase
        .from('fund_requests')
        .select('*')
        .range(startIndex, endIndex);

      if (error) {
        console.error('Error fetching fund requests:', error);
      } else {
        setFundRequests(data);
      }
    }

    fetchFundRequests();
  }, [supabase, currentPage, requestsPerPage]);

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  return (
    <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Notifications
      </Typography>
      <Button variant="contained" sx={{ mb: 2 }} onClick={() => navigate('/home')}>
        Back to Home
      </Button>

      <Typography variant="h6" component="h2" gutterBottom>
        Fund Request History
      </Typography>
      <List>
        {fundRequests.map((request) => (
          <ListItem key={request.id}>
            <ListItemText
              primary={request.case_description}
              secondary={`Status: ${request.status}`}
            />
          </ListItem>
        ))}
      </List>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mt: 2 }}>
        <Button variant="contained" onClick={handlePreviousPage} disabled={currentPage === 1}>
          Previous
        </Button>
        <Button variant="contained" onClick={handleNextPage}>
          Next
        </Button>
      </Box>
    </Box>
  );
}

export default Notifications;
