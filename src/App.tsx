import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, IconButton, Avatar, Menu, MenuItem, ListItemText } from '@mui/material';
import { Home as HomeIcon, QueueMusic as QueueIcon } from '@mui/icons-material';
import { useSpotifyAuth } from './hooks/useSpotifyAuth';
import QueuePage from './components/QueuePage';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import HomePage from './components/HomePage';
import Footer from './components/Footer';

const App: React.FC = () => {
  const { token, user, login, logout } = useSpotifyAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
                    <Avatar alt={user?.display_name} src={user?.images[0]?.url} />
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
                      <ListItemText primary={user?.display_name} />
                    </MenuItem>
                    <MenuItem onClick={logout}>Logout</MenuItem>
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
                    <Avatar alt={user?.display_name} src={user?.images[0]?.url} />
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
                      <ListItemText primary={user?.display_name} />
                    </MenuItem>
                    <MenuItem onClick={logout}>Logout</MenuItem>
                  </Menu>
                </>
              )}
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
          <Route path="/callback" element={<QueuePage token={token} />} />
          <Route path="/" element={<HomePage />} /> {/* Placeholder for Home or other components */}
        </Routes>
      </Container>
      <Footer />
    </Router>
  );
};

export default App;
