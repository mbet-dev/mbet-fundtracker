import React, { useState, useEffect } from 'react';
import { Typography, Box, Button, Select, MenuItem, FormControl, InputLabel, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Chart, registerables } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { supabase } from './supabaseClient';

Chart.register(...registerables);

function Reports() {
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState('all');
  const [timePeriod, setTimePeriod] = useState('weekly');
  const [selectedUser, setSelectedUser] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [selectedUrgency, setSelectedUrgency] = useState('');
  const [selectedImportance, setSelectedImportance] = useState('');

  const fetchUsers = async () => {
    try {
      const { data: userIdsData, error: userIdsError } = await supabase
        .from('fund_requests')
        .select('user_id');

      if (userIdsError) {
        throw userIdsError;
      }

      if (userIdsData) {
        const uniqueUserIds = [...new Set(userIdsData.map(item => item.user_id))].filter(id => id !== null);

        const usersPromises = uniqueUserIds.map(async (userId) => {
          const { data: userData, error: userError } = await supabase.auth.getUserById(userId);
          if (userError) {
            console.error(`Error fetching user ${userId}:`, userError);
            return null; // Handle errors gracefully
          }
          return { id: userId, email: userData.user.email };
        });

        const users = (await Promise.all(usersPromises)).filter(user => user !== null);
        setUsers(users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      alert(`Error fetching users: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('fund_requests')
        .select('status, amount_approved, amount_required, currency');

      // Apply filters *only* for the chart
      if (filterType !== 'all') {
        if (filterType === 'user' && selectedUser) {
          query = query.eq('user_id', selectedUser);
        } else if (filterType === 'urgency' && selectedUrgency) {
          query = query.eq('urgency_level', selectedUrgency);
        } else if (filterType === 'importance' && selectedImportance) {
          query = query.eq('importance_level', selectedImportance);
        }
      }

      const startDate = calculateStartDate(timePeriod);
      query = query.gte('created_at', startDate.toISOString());

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      console.log("Raw chart data from Supabase:", data);

      if (data) {
        // Transform data for Chart.js, grouping by status and currency
        const chartDataMap = {};

        data.forEach(item => {
          const status = item.status;
          const currency = item.currency;
          let amount;

          if (status === 'Pending') {
            amount = Number(item.amount_required) || 0;
          } else {
            amount = Number(item.amount_approved) || 0;
          }
          const key = `${status} (${currency})`;
          console.log(`Processing item: status=${status}, currency=${currency}, amount=${amount}, key=${key}`);
          if (chartDataMap[key]) {
            chartDataMap[key] += amount;
          } else {
            chartDataMap[key] = amount;
          }
          console.log("chartDataMap after processing:", chartDataMap);
        });

        console.log("chartDataMap:", chartDataMap);

        const labels = Object.keys(chartDataMap);
        const amounts = Object.values(chartDataMap);

        const newChartData = {
          labels: labels,
          datasets: [{
            label: 'Fund Requests',
            data: amounts,
            backgroundColor: [
              'rgba(75, 192, 192, 0.2)', // Approved - Teal
              'rgba(255, 99, 132, 0.2)', // Declined - Red
              'rgba(255, 206, 86, 0.2)', // Partially Approved - Yellow
              'rgba(54, 162, 235, 0.2)' // Pending - Blue
              // Add more colors as needed
            ],
            borderColor: [
              'rgba(75, 192, 192, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(54, 162, 235, 1)'
              // Add more colors as needed
            ],
            borderWidth: 1,
          }],
        };
        console.log("newChartData:", newChartData);
        setChartData(newChartData);
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
      alert(`Error fetching chart data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchReportData = async () => {
    try {
      // Fetch *all* fund requests for the report, without filters
      const { data, error } = await supabase
        .from('fund_requests')
        .select('status, amount_approved, currency');

      if (error) {
        throw error;
      }

      console.log("Raw report data from Supabase:", data);

      if (data) {
        // Process data for the report table
        const approvedAmounts = {}; // { currency: amount }
        let approvedCount = 0;
        let declinedCount = 0;
        let pendingCount = 0;

        data.forEach(item => {
          if (item.status === 'Approved' || item.status === 'Partially Approved') {
            approvedCount++;
            const amount = Number(item.amount_approved); // Ensure amount is treated as a number
            if (!isNaN(amount)) { // Check if the conversion was successful
              if (approvedAmounts[item.currency]) {
                approvedAmounts[item.currency] += amount;
              } else {
                approvedAmounts[item.currency] = amount;
              }
            }
          } else if (item.status === 'Declined') {
            declinedCount++;
          } else if (item.status === 'Pending') {
            pendingCount++;
          }
        });

        console.log("approvedAmounts:", approvedAmounts);
        console.log("declinedCount:", declinedCount);
        console.log("pendingCount:", pendingCount)

        // Format data for the report table
        const newReportData = [];
        newReportData.push({ category: 'Approved', amount: Object.values(approvedAmounts).reduce((a, b) => a + b, 0), count: approvedCount });
        newReportData.push({ category: 'Declined', count: declinedCount });
        newReportData.push({ category: 'Pending', count: pendingCount });

        console.log("newReportData:", newReportData)
        setReportData(newReportData);
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
      alert(`Error fetching report data: ${error.message}`);
    }
  }

  useEffect(() => {
    fetchData();
    fetchReportData();
  }, [filterType, timePeriod, selectedUser, selectedUrgency, selectedImportance]);

  const handleViewReports = () => {
    alert('Report Viewing is under development. Please check back later.');
  };

  const handleGenerateCharts = () => {
    alert('Chart generation is under development. Please check back later.');
  };

  const handleDownloadReports = () => {
    alert('Report download is under development. Please check back later.');
  };

  const calculateStartDate = (period) => {
    const now = new Date();
    switch (period) {
      case 'weekly':
        return new Date(now.setDate(now.getDate() - 7));
      case 'monthly':
        return new Date(now.setMonth(now.getMonth() - 1));
      case 'quarterly':
        return new Date(now.setMonth(now.getMonth() - 3));
      default:
        return new Date(0);
    }
  };

  return (
    <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Reports
      </Typography>
      <FormControl fullWidth margin="normal">
        <InputLabel id="filter-type-label">Filter By</InputLabel>
        <Select
          labelId="filter-type-label"
          id="filter-type"
          value={filterType}
          label="Filter By"
          onChange={(e) => setFilterType(e.target.value)}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="user">User</MenuItem>
          <MenuItem value="urgency">Urgency</MenuItem>
          <MenuItem value="importance">Importance</MenuItem>
        </Select>
      </FormControl>
      {filterType === 'user' && (
        <FormControl fullWidth margin="normal">
          <InputLabel id="user-select-label">Select User</InputLabel>
          <Select
            labelId="user-select-label"
            id="user-select"
            value={selectedUser}
            label="Select User"
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            {users.map((user, index) => (
              <MenuItem key={index} value={user.id}>
                {user.email}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      {filterType === 'urgency' && (
        <FormControl fullWidth margin="normal">
          <InputLabel id="urgency-select-label">Select Urgency</InputLabel>
          <Select
            labelId="urgency-select-label"
            id="urgency-select"
            value={selectedUrgency}
            label="Select Urgency"
            onChange={(e) => setSelectedUrgency(e.target.value)}
          >
            <MenuItem value="High">High</MenuItem>
            <MenuItem value="Medium">Medium</MenuItem>
            <MenuItem value="Low">Low</MenuItem>
          </Select>
        </FormControl>
      )}
      {filterType === 'importance' && (
        <FormControl fullWidth margin="normal">
          <InputLabel id="importance-select-label">Select Importance</InputLabel>
          <Select
            labelId="importance-select-label"
            id="importance-select"
            value={selectedImportance}
            label="Select Importance"
            onChange={(e) => setSelectedImportance(e.target.value)}
          >
            <MenuItem value="High">High</MenuItem>
            <MenuItem value="Medium">Medium</MenuItem>
            <MenuItem value="Low">Low</MenuItem>
          </Select>
        </FormControl>
      )}
      <FormControl fullWidth margin="normal">
        <InputLabel id="time-period-label">Time Period</InputLabel>
        <Select
          labelId="time-period-label"
          id="time-period"
          value={timePeriod}
          label="Time Period"
          onChange={(e) => setTimePeriod(e.target.value)}
        >
          <MenuItem value="weekly">Weekly</MenuItem>
          <MenuItem value="monthly">Monthly</MenuItem>
          <MenuItem value="quarterly">Quarterly</MenuItem>
        </Select>
      </FormControl>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button variant="contained" color="primary" onClick={handleViewReports}>
          View
        </Button>

        <Button variant="contained" color="primary" onClick={handleGenerateCharts}>
          Charts
        </Button>

        <Button variant="contained" color="primary" onClick={handleDownloadReports}>
          Download Reports
        </Button>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : (
        chartData && (
          <Box sx={{ width: '80%', maxWidth: '600px' }}>
            <Bar data={chartData} />
          </Box>
        )
      )}

      {reportData && (
        <Box sx={{ mt: 4, width: '80%', maxWidth: 600 }}>
          <Typography variant="h6">Report Data</Typography>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 600 }} aria-label="report table">
              <TableHead sx={{ backgroundColor: 'grey' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Count</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData.map((item, index) => (
                  <TableRow
                    key={index}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {item.category}
                    </TableCell>
                    <TableCell align="right">{item.amount || ''}</TableCell>
                    <TableCell align="right">{item.count || ''}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
      <Button variant="contained" onClick={() => navigate('/home')}>
        Back to Home
      </Button>
    </Box>
  );
}

export default Reports;
