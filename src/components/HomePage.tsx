import React, { useContext } from 'react';
import { Container, Box, Typography, Button, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import logo from '../../public/logo.png';
import { IAuthContext, AuthContext } from 'react-oauth2-code-pkce';

const HomePage: React.FC = () => {
  const {token, logIn} = useContext<IAuthContext>(AuthContext)
  console.log('token', token);

  const navigate = useNavigate();

  const handleButtonClick = () => {
    if (token) {
      navigate('/queue');
    } else {
      logIn()
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="75vh"
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
