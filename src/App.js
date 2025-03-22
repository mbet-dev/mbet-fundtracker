import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Container, Snackbar, Alert, TextField, Button, Grid, Paper } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './Home';
import FundRequestForm from './FundRequestForm';
import AdminApproval from './AdminApproval';
import Notifications from './Notifications';
import AppointmentScheduler from './AppointmentScheduler';
import Reports from './Reports';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App({ supabase }) {
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentBear, setCurrentBear] = useState('bear4.png');
  const [typingTimeout, setTypingTimeout] = useState(null);

  const clearSession = () => {
    setSession(null);
    setIsLoggedIn(false);
    setIsAdmin(false);
  };

  useEffect(() => {
    const bearImages = ['bear4.png', 'bear3.png'];
    let currentIndex = 0;

    const switchBear = () => {
      currentIndex = (currentIndex + 1) % bearImages.length;
      setCurrentBear(bearImages[currentIndex]);
    };

    const handleTypingTimeout = () => {
      clearTimeout(typingTimeout);
      const timeoutId = setTimeout(switchBear, 500);
      setTypingTimeout(timeoutId);
    };

    const handleKeyDown = () => {
      handleTypingTimeout();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(typingTimeout);
    };
  }, [typingTimeout]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setLoading(false);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsLoggedIn(!!session);
    });

    return () => {
      supabase.auth.signOut();
    };
  }, [supabase]);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setSnackbarMessage(error.message);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } else {
      setSnackbarMessage('Successfully signed in!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setIsLoggedIn(true);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (session?.user?.id) {
      // Fetch user data from profiles table
      const fetchProfileData = async () => {
        if (session?.user?.id) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', session.user.id);

          if (profileError) {
            console.error('Error fetching user data:', profileError);
          } else {
            console.log('User data:', profileData);
            setIsAdmin(() => profileData?.[0]?.is_admin || false);
            console.log('isAdmin state in App.js:', isAdmin);
          }
        } else {
          setIsAdmin(false);
        }
      };

      fetchProfileData();
    }
  }, [session, supabase]);

  async function signUpWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      setSnackbarMessage(error.message);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } else {
      setSnackbarMessage('Successfully signed up! Please check your email for confirmation.');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setIsLoggedIn(true);
    }
    setLoading(false);
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Container maxWidth="sm" style={{ marginTop: '20px' }}>
          {isLoggedIn && session?.user?.email && (
            <Typography variant="body1" align="center" style={{ marginBottom: '10px' }}>
              Signed in as: {isAdmin ? '(Admin) ' : '(User) '}{session.user.email}
            </Typography>
          )}
          <Paper elevation={3} style={{ padding: '30px' }}>
            <AppBar position="static" color="primary">
              <Toolbar>
                <img src="/MBet-FRT.jpg" alt="MBet Logo" style={{ marginRight: '10px', height: '40px' }} />
                <Typography variant="h6">MBet© Fund Requests Tracker</Typography>
              </Toolbar>
            </AppBar>
            <Routes>
              <Route path="/" element={
                isLoggedIn ? (
                  <Home supabase={supabase} isAdmin={isAdmin} supabaseUrl={supabaseUrl} clearSession={clearSession} />
                ) : (
                  <Grid container spacing={2} direction="column" alignItems="center">
                    <Grid item>
                      <Typography variant="h5">Login / Register</Typography>
                    </Grid>
                    <Grid item>
                      <img src={currentBear} alt="Bear" width="150" height="150" />
                    </Grid>
                    <Grid item>
                      <TextField
                        label="Email"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                        }}
                      />
                    </Grid>
                    <Grid item>
                      <TextField
                        label="Password"
                        type="password"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </Grid>
                    <Grid item>
                      <Button variant="contained" color="primary" onClick={signInWithEmail} style={{ marginRight: '10px' }}>
                        Sign In
                      </Button>
                      <Button variant="contained" color="secondary" onClick={signUpWithEmail}>
                        Sign Up
                      </Button>
                    </Grid>
                  </Grid>
                )
              } />
              <Route path="/home" element={<Home supabase={supabase} isAdmin={isAdmin} supabaseUrl={supabaseUrl} clearSession={clearSession} />} />
              <Route path="/fund-request" element={<FundRequestForm supabase={supabase} />} />
              <Route path="/admin-approval" element={<AdminApproval supabase={supabase} />} />
              <Route path="/notifications" element={<Notifications supabase={supabase} />} />
              <Route path="/appointment-scheduler" element={<AppointmentScheduler />} />
              <Route path="/reports" element={<Reports />} />
            </Routes>
          </Paper>
        </Container>
        <Snackbar open={snackbarOpen} autoHideDuration={10000} onClose={handleSnackbarClose}>
          <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
