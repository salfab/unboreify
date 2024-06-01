// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import { useSpotifyAuth } from './hooks/useSpotifyAuth';
import QueuePage from './components/QueuePage';

const App: React.FC = () => {
  const { token, user, login, logout } = useSpotifyAuth();

  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Unboreify
          </Typography>
          <Button color="inherit" component={Link} to="/">
            Home
          </Button>
          {token ? (
            <>
              <Button color="inherit" component={Link} to="/queue">
                View Queues
              </Button>
              <Button color="inherit" onClick={logout}>
                Logout
              </Button>
              <Typography variant="h6" component="div" sx={{ marginLeft: '1rem' }}>
                {user?.display_name}
              </Typography>
            </>
          ) : (
            <Button color="inherit" onClick={login}>
              Login with Spotify
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Container>
        <Routes>
          <Route path="/queue" element={<QueuePage token={token} />} />
          <Route path="/" element={<div>Home</div>} /> {/* Placeholder for Home or other components */}
        </Routes>
      </Container>
    </Router>
  );
};

export default App;
