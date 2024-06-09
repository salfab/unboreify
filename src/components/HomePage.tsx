import React from 'react';
import { Container, Box, Typography, Button, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSpotifyAuth } from '../hooks/useSpotifyAuth'; // Adjust the import path as necessary
import logo from '../../public/logo.png';

const HomePage: React.FC = () => {
  const { token, login } = useSpotifyAuth();
  const navigate = useNavigate();

  const handleButtonClick = () => {
    if (token) {
      navigate('/queue');
    } else {
      login();
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        textAlign="center"
      >
        <Avatar alt="Unboreify logo" src={logo} sx={{ width: 128, height: 128, marginBottom: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom>
          Unboreify
        </Typography>
        <Typography variant="h6" gutterBottom>
          Make your Spotify playlists less boring
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleButtonClick}
          sx={{ marginTop: 2 }}
        >
          {token ? 'Unboreify me' : 'Login with Spotify'}
        </Button>
      </Box>
    </Container>
  );
};

export default HomePage;
