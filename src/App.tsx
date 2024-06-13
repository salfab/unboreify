// App.tsx
import React, { useContext, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, IconButton, Avatar, Menu, MenuItem, ListItemText } from '@mui/material';
import { Home as HomeIcon, QueueMusic as QueueIcon } from '@mui/icons-material';
import QueuePage from './components/QueuePage';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import HomePage from './components/HomePage';
import Footer from './components/Footer';
import { ErrorBoundary } from "react-error-boundary";
import ErrorDisplay from './components/ErrorDisplay';
import { IAuthContext, AuthContext } from 'react-oauth2-code-pkce';
import useSpotifyApi from './hooks/useSpotifyApi';

const App: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const {token, logIn, logOut} = useContext<IAuthContext>(AuthContext)
  const { currentUser } = useSpotifyApi();


  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };


  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Unboreify
          </Typography>
          {token ? (
            <>
              {isMobile ? (
                <>
                  <IconButton color="inherit" component={Link} to="/">
                    <HomeIcon />
                  </IconButton>
                  <IconButton color="inherit" component={Link} to="/queue">
                    <QueueIcon />
                  </IconButton>
                  <IconButton color="inherit" onClick={handleMenu}>
                    <Avatar alt={currentUser?.display_name} src={currentUser?.images[0]?.url} />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                  >
                    <MenuItem disabled>
                      <ListItemText primary={currentUser?.display_name} />
                    </MenuItem>
                    <MenuItem onClick={() => logOut()}>Logout</MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <Button color="inherit" component={Link} to="/">
                    Home
                  </Button>
                  <Button color="inherit" component={Link} to="/queue">
                    View Queues
                  </Button>
                  <IconButton color="inherit" onClick={handleMenu}>
                    <Avatar alt={currentUser?.display_name} src={currentUser?.images[0]?.url} />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                  >
                    <MenuItem disabled>
                      <ListItemText primary={currentUser?.display_name} />
                    </MenuItem>
                    <MenuItem onClick={() => logOut()}>Logout</MenuItem>
                  </Menu>
                </>
              )}
            </>
          ) : (
            <Button color="inherit" onClick={() => logIn()}>
              Login with Spotify
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <ErrorBoundary FallbackComponent={ErrorDisplay}>

        <Container>
          <Routes>
            <Route path="/queue" element={<QueuePage />} />
            <Route path="/callback" element={<QueuePage  />} />
            <Route path="/" element={<HomePage />} /> {/* Placeholder for Home or other components */}
          </Routes>
        </Container>
      </ErrorBoundary>

      <Footer />
    </Router>
  );
};

export default App;
