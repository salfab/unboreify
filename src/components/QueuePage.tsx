import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Button, Grid, Typography, Box, LinearProgress, Tooltip, IconButton, Collapse } from '@mui/material';
import { AutoAwesome as AutoAwesomeIcon } from '@mui/icons-material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { getQueue, getPlaybackState, startPlayback, getUserPlaylists, SpotifyQueue, Track, getPlaylist, PlaylistResponse } from '../services/spotifyService';
import { buildAlternativePlaylist, ProgressCallback } from '../services/playlistService';
import TrackCard from './TrackCard';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useErrorBoundary } from 'react-error-boundary';
import PlaylistPresenter from './PlaylistPresenter';

interface QueuePageProps {
  token: string | null;
}

const QueuePage: React.FC<QueuePageProps> = ({ token }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
  const { showBoundary } = useErrorBoundary();

  const fetchQueue = useCallback(async () => {
    if (!token) return;

    try {
      const queue = await getQueue(token);
      setQueueData(queue);
      setMode('alternative');
      setSourceTracks([queue.currently_playing, ...queue.queue].filter(Boolean));
    } catch (error) {
      console.error(error);
      throw error;
    }
  }, [token]);

  const fetchUserPlaylists = useCallback(async () => {
    if (!token) return;

    try {
      const userPlaylists = await getUserPlaylists(token);
      setPlaylists(userPlaylists);
      setMode('alternative')
    } catch (error) {
      console.error(error);
    }
  }, [token]);

  const fetchPlaylistTracks = useCallback(async (playlistId: string) => {
    if (!token) throw new Error('No token provided');

    try {
      const playlist = await getPlaylist(token, playlistId);
      setSelectedPlaylist(playlist);

    } catch (error) {
      console.error(error);
    }
  }, [token]);

  // when a selectedPlaylist is updated, we set the source tracks. An other effect will create an alternative playlist from those tracks
  useEffect(() => {
    if (selectedPlaylist === null) return
    setMode('alternative');
    setLengthMultiplier(1)
    setSourceTracks(selectedPlaylist.tracks.items.map(o => o.track));
    setShowQueue(false);
  }, [selectedPlaylist]);

  const handleButtonClick = useCallback(async () => {
    if (!token) return;

    try {
      const playbackState = await getPlaybackState(token);
      const deviceId = playbackState.device.id;

      const uris = alternativePlaylist.map(track => track.uri);
      await startPlayback(token, uris, deviceId);

      await fetchQueue();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }, [alternativePlaylist, token, fetchQueue]);

  const handleEnhanceClick = () => {
    setSourceTracks(alternativePlaylist);
    setMode('extend');
  };

  const updateProgress: ProgressCallback = useCallback((progress) => {
    setProgress(progress);
  }, []);

  useEffect(() => {
    try {
      fetchQueue();
      fetchUserPlaylists();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }, [fetchQueue, fetchUserPlaylists]);

  // this effect will create an alternative playlist from the source tracks, if it's not already building one.
  useEffect(() => {
    if (sourceTracks.length > 0 && !isBuilding.current) {
      isBuilding.current = true;
      setIsComplete(false);

      buildAlternativePlaylist(token!, sourceTracks, lengthMultiplier, updateProgress, mode)
        .then((newAlternativePlaylist) => {
          const uniqueTracks = newAlternativePlaylist.filter((track, index, self) =>
            index === self.findIndex(t => t.uri === track.uri)
          );
          // TODO : check that these sets are going to be batched, since it's in an async callback.
          setAlternativePlaylist(uniqueTracks);
          setIsComplete(true);
        })
        .catch(showBoundary)
        .finally(() => {
          isBuilding.current = false;
        });
    }
  }, [sourceTracks, lengthMultiplier, mode, token, updateProgress, showBoundary]);

  const toggleQueue = () => {
    setQueueOpen(!queueOpen);
  };

  // fetching the queue will trigger an other effect which will set the source tracks.
  const handleBackToQueue = async () => {
    setShowQueue(true);
    setMode('alternative');
    setLengthMultiplier(1)
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
            <Button variant="contained" color="primary" onClick={handleButtonClick} sx={{ marginRight: 2 }}>
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
              {queueData?.queue.map((track) => <TrackCard track={track} key={track.uri} />)}
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
          {/* TODO: create consts to make the conditions more clear */}
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
