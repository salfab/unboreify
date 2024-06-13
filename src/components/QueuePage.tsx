import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { Button, Grid, Typography, Box, LinearProgress, Tooltip, IconButton, Collapse } from '@mui/material';
import { AutoAwesome as AutoAwesomeIcon } from '@mui/icons-material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import useSpotifyApi from '../hooks/useSpotifyApi'; // Adjust the import path as needed
import { buildAlternativePlaylist, ProgressCallback } from '../services/playlistService';
import TrackCard from './TrackCard';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useErrorBoundary } from 'react-error-boundary';
import PlaylistPresenter from './PlaylistPresenter';
import { IAuthContext, AuthContext } from 'react-oauth2-code-pkce';
import { SpotifyQueue, Track, PlaylistResponse } from '../services/spotifyService';
import { useNavigate } from 'react-router-dom';

const QueuePage: React.FC = () => {
  const { token } = useContext<IAuthContext>(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      // if (!token || !tokenData || tokenData.expiresAt < Date.now()) {
      // navigate to root if not authenticated
      // debugger
      // navigate('/');
    }
  }
    , [token,  navigate]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { showBoundary } = useErrorBoundary();

  const {
    getQueue,
    getPlaybackState,
    startPlayback,
    getUserPlaylists,
    getPlaylist
  } = useSpotifyApi();

  const [queueData, setQueueData] = useState<SpotifyQueue | null>(null);
  const [alternativePlaylist, setAlternativePlaylist] = useState<Track[]>([]);
  const [sourceTracks, setSourceTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [progress, setProgress] = useState<{ phase: string; percentage: number }>({ phase: '', percentage: 0 });
  const [lengthMultiplier, setLengthMultiplier] = useState<number>(1);
  const isBuilding = useRef<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [queueOpen, setQueueOpen] = useState<boolean>(!isMobile);
  const [selectedPlaylist, setSelectedPlaylist] = useState<PlaylistResponse | null>(null);
  const [showQueue, setShowQueue] = useState<boolean>(true);
  const [mode, setMode] = useState<'extend' | 'alternative'>('alternative');

  const fetchQueue = useCallback(async (updateSourceTracks = true) => {
    await getQueue()
      .then((q) => {
        console.log(q);
        setQueueOpen(true);
        setShowQueue(true);

        setSelectedPlaylist(null);
        setQueueData(q);
        setMode('alternative');
        if (updateSourceTracks) {
          setSourceTracks([q.currently_playing, ...q.queue].filter(Boolean));
        }
      })
      .catch(showBoundary);
  }, [showBoundary, getQueue]);

  const fetchUserPlaylists = useCallback(async () => {
    try {
      const userPlaylists = await getUserPlaylists();
      setPlaylists(userPlaylists);
      setMode('alternative');
    } catch (error) {
      console.error(error);
    }
  }, [getUserPlaylists]);

  const fetchPlaylistTracks = useCallback(async (playlistId: string) => {
    try {
      const playlist = await getPlaylist(playlistId);
      setSelectedPlaylist(playlist);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }, [getPlaylist]);

  useEffect(() => {
    if (selectedPlaylist === null) return;
    setMode('alternative');
    setLengthMultiplier(1);
    setSourceTracks(selectedPlaylist.tracks.items.map(o => o.track));
    setShowQueue(false);
  }, [selectedPlaylist]);

  const handlePlayOnSpotify = useCallback(async () => {
    try {
      const playbackState = await getPlaybackState();
      const deviceId = playbackState.device.id;

      const uris = alternativePlaylist.map(track => track.uri);
      const result = await startPlayback(uris, deviceId);
      console.log(result);
      setTimeout(async () => {
        fetchQueue(false);
      }, 1000);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }, [alternativePlaylist, fetchQueue, getPlaybackState, startPlayback]);

  const handleEnhanceClick = () => {
    setSourceTracks(alternativePlaylist);
    setMode('extend');
  };

  const updateProgress: ProgressCallback = useCallback((progress) => {
    setProgress(progress);
  }, []);

  useEffect(() => {
    if (!token) return;
    try {
      fetchQueue();
      fetchUserPlaylists();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }, [fetchQueue, fetchUserPlaylists, token]);

  useEffect(() => {
    if (sourceTracks.length > 0 && !isBuilding.current) {
      isBuilding.current = true;
      setIsComplete(false);

      // todo : fix this , we don't want to have a token in the compomnent.
      buildAlternativePlaylist(token, sourceTracks, lengthMultiplier, updateProgress, mode)
        .then((newAlternativePlaylist) => {
          const uniqueTracks = newAlternativePlaylist.filter((track, index, self) =>
            index === self.findIndex(t => t.uri === track.uri)
          );
          setAlternativePlaylist(uniqueTracks);
          setIsComplete(true);
        })
        .catch(showBoundary)
        .finally(() => {
          isBuilding.current = false;
        });
    }
  }, [sourceTracks, lengthMultiplier, mode, updateProgress, showBoundary]);

  const toggleQueue = () => {
    setQueueOpen(!queueOpen);
  };

  const handleBackToQueue = async () => {
    setShowQueue(true);
    setMode('alternative');
    setLengthMultiplier(1);
    setSelectedPlaylist(null);
    fetchQueue();
  };

  return (
    <Grid container spacing={3}>
      {!isComplete && (
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>
            Progress
          </Typography>
          <Box>
            <Typography variant="body1">{progress.phase}</Typography>
            <LinearProgress variant="determinate" value={progress.percentage} />
          </Box>
        </Grid>
      )}
      {isComplete && (
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>
            You have been unboreified!
          </Typography>
          <Typography variant="body1">Your alternative playlist is ready with {alternativePlaylist.length} tracks.</Typography>
          <Box display="flex" alignItems="center" justifyContent="center" mt={2}>
            <Button variant="contained" color="primary" onClick={handlePlayOnSpotify} sx={{ marginRight: 2 }}>
              Play on Spotify
            </Button>
            <Tooltip title="Enhance">
              <span>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleEnhanceClick}
                  startIcon={<AutoAwesomeIcon />}
                  disabled={!isComplete}
                >
                  Enhance
                </Button>
              </span>
            </Tooltip>
          </Box>
        </Grid>
      )}
      {showQueue ? (
        <>
          <Grid item xs={12}>
            <Typography variant="h4" gutterBottom>
              Currently Playing
            </Typography>
            {queueData?.currently_playing ? <TrackCard track={queueData.currently_playing} /> : <>Player stopped</>}
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="h4" gutterBottom>
              Queue
              {isMobile && (
                <IconButton onClick={toggleQueue} size="small">
                  {queueOpen ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              )}
            </Typography>
            <Collapse in={queueOpen || !isMobile} timeout="auto" unmountOnExit>
              {queueData?.queue.map((track, i) => <TrackCard track={track} key={`${track.uri}-${i}`} />)}
            </Collapse>
          </Grid>
        </>
      ) : (
        <Grid item xs={12} sm={6}>
          {selectedPlaylist && <PlaylistPresenter onBackToQueue={handleBackToQueue} items={selectedPlaylist.tracks.items.map(o => o.track)} name={selectedPlaylist.name} description={selectedPlaylist.description} />}
        </Grid>
      )}
      <Grid item xs={12} sm={6}>
        <Typography variant="h4" gutterBottom>
          Alternative Playlist {mode === 'extend' && <AutoAwesomeIcon />}
        </Typography>
        {alternativePlaylist.map((track) => <TrackCard track={track} key={track.uri} />)}
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          User Playlists
        </Typography>
        <Box>
          {playlists.map((playlist) => (
            <Button key={playlist.id} variant="contained" onClick={() => fetchPlaylistTracks(playlist.id)} sx={{ marginRight: 1, marginBottom: 1 }}>
              {playlist.name}
            </Button>
          ))}
        </Box>
      </Grid>
    </Grid>
  );
};

export default QueuePage;
