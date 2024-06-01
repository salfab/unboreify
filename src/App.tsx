import React from 'react';
import { Button, Container, Typography } from '@mui/material';
import { useSpotifyAuth } from './hooks/useSpotifyAuth';

const App: React.FC = () => {
  const { token, user, login, logout } = useSpotifyAuth();

  return (
    <Container>
      <Typography variant="h2">Spotify Auth Example</Typography>
      {token ? (
        <>
          <Typography variant="h6">Logged in as: {user?.display_name}</Typography>
          <Button variant="contained" color="secondary" onClick={logout}>
            Logout
          </Button>
        </>
      ) : (
        <Button variant="contained" color="primary" onClick={login}>
          Login with Spotify
        </Button>
      )}
    </Container>
  );
};

export default App;
