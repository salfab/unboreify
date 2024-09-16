// App.tsx
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, IconButton, Avatar, Menu, MenuItem, ListItemText, Divider } from '@mui/material';
import { Home as HomeIcon, QueueMusic as QueueIcon, Settings as SettingsIcon, SpeakerGroup as LiveMusicIcon } from '@mui/icons-material';
import QueuePage from './components/QueuePage';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import HomePage from './components/HomePage';
import Footer from './components/Footer';
import { ErrorBoundary } from "react-error-boundary";
import ErrorDisplay from './components/ErrorDisplay';
import { IAuthContext, AuthContext } from 'react-oauth2-code-pkce';
import useSpotifyApi from './hooks/useSpotifyApi';
import Settings from './components/Settings';
import { getPlaylistMultiplier } from './services/localStorageService';
import FestivalPage from './components/FestivalPage';
import ConcertSetlistPage from './components/ConcertSetlistPage';

const App: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [musicMenuAnchorEl, setMusicMenuAnchorEl] = useState<null | HTMLElement>(null); // State for live music menu
  const open = Boolean(anchorEl);
  const openMusicMenu = Boolean(musicMenuAnchorEl); // State to check if music menu is open
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { token, logIn, logOut } = useContext<IAuthContext>(AuthContext);
  const { currentUser } = useSpotifyApi();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [playlistMultiplier, setPlaylistMultiplier] = useState(getPlaylistMultiplier());

  useEffect(() => {
    // Store the playlist multiplier in local storage
    localStorage.setItem('playlistMultiplier', playlistMultiplier.toString());
  }, [playlistMultiplier]);

  const handleMenu = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleMusicMenu = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setMusicMenuAnchorEl(event.currentTarget);
  }, []);

  const openSettings = useCallback(() => {
    setSettingsOpen(true);
  }, []);

  const closeSettings = useCallback(() => {
    setSettingsOpen(false);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
    setMusicMenuAnchorEl(null); // Close live music menu
  }, []);

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

                  {/* Live Music Features Button */}
                  <IconButton color="inherit" onClick={handleMusicMenu}>
                    <LiveMusicIcon />
                  </IconButton>

                  {/* Live Music Menu */}
                  <Menu
                    anchorEl={musicMenuAnchorEl}
                    open={openMusicMenu}
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
                    <MenuItem component={Link} to="/festiclub" onClick={handleClose}>
                      FestiClub
                    </MenuItem>
                    <MenuItem component={Link} to="/setlist" onClick={handleClose}>
                      Concert Setlist
                    </MenuItem>
                  </Menu>

                  <IconButton color="inherit" onClick={openSettings}>
                    <SettingsIcon />
                  </IconButton>

                  <IconButton color="inherit" onClick={handleMenu}>
                    <Avatar alt={currentUser?.display_name} src={currentUser?.images[0]?.url} />
                  </IconButton>

                  {/* User Profile Menu */}
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

                    <MenuItem onClick={() => logOut()}>Sign out</MenuItem>
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
                  <Button color="inherit" component={Link} to="/festiclub">
                    FestiClub
                  </Button>
                  <Button color="inherit" component={Link} to="/setlist">
                    Setlist
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
                    <MenuItem onClick={openSettings}>
                      <SettingsIcon /> Settings
                    </MenuItem>
                    <Divider sx={{ my: 0.5 }} />
                    <MenuItem onClick={() => logOut()}>Sign out</MenuItem>
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
            <Route path="/callback" element={<QueuePage />} />
            <Route path="/festiclub" element={<FestivalPage />} />
            <Route path="/setlist" element={<ConcertSetlistPage />} />
            <Route path="/" element={<HomePage />} /> {/* Placeholder for Home or other components */}
          </Routes>
        </Container>
      </ErrorBoundary>
      <Settings
        open={settingsOpen}
        onClose={closeSettings}
        currentPlaylistMultiplier={playlistMultiplier}
        playlistMultiplierChangedCallback={(m) => setPlaylistMultiplier(m)}
      />
      <Footer />
    </Router>
  );
};

export default App;
