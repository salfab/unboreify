import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { Button, Grid, Typography, Box, LinearProgress, Tooltip, IconButton, Collapse, Divider } from '@mui/material';
import { AutoAwesome as AutoAwesomeIcon, Refresh as RefreshIcon, PlayArrow as PlayArrowIcon, AutoFixHigh as AutoFixHighIcon, AutoMode as AutoModeIcon } from '@mui/icons-material';
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
  const { token, loginInProgress } = useContext<IAuthContext>(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token && !loginInProgress) {
      navigate('/');
    }
  }, [token, navigate, loginInProgress]);

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
  const [currentAlternativePlaylistSourceTracks, setCurrentAlternativePlaylistSourceTracks] = useState<{ tracks: string[], mode: 'extend' | 'alternative' }>({ tracks: [], mode: 'alternative' });
  const [sourceTracks, setSourceTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [progress, setProgress] = useState<{ phase: string; percentage: number }>({ phase: '', percentage: 0 });
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [queueOpen, setQueueOpen] = useState<boolean>(!isMobile);
  const [selectedPlaylist, setSelectedPlaylist] = useState<PlaylistResponse | null>(null);
  const [showQueue, setShowQueue] = useState<boolean>(true);
  const [mode, setMode] = useState<'extend' | 'alternative'>('alternative');
  const [showProcessCompleteMessage, setShowProcessCompleteMessage] = useState<boolean>(false);

  // AbortController reference
  const abortController = useRef<AbortController | null>(null);

  const fetchQueue = useCallback(async (updateSourceTracks = true): Promise<SpotifyQueue> => {
    try {
      const queue = await getQueue();
      console.log(queue);
      setShowQueue(true);

      setSelectedPlaylist(null);
      setQueueData(queue);
      setMode('alternative');
      if (updateSourceTracks) {
        setSourceTracks([queue.currently_playing, ...queue.queue].filter(Boolean));
      }
      return queue;

    } catch (error) {
      showBoundary(error);
      throw error;
    }

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
    setSourceTracks(selectedPlaylist.tracks.items.map(o => o.track));
    setShowQueue(false);
  }, [selectedPlaylist]);

  const handlePlayOnSpotify = useCallback(async () => {
    try {
      const playbackState = await getPlaybackState();
      const deviceId = playbackState.device?.id;

      const uris = alternativePlaylist.map(track => track.uri);
      const result = await startPlayback(uris, deviceId);
      console.log(result);
      setShowProcessCompleteMessage(false)
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
    if (sourceTracks.length > 0) {
      // note: If the source tracks haven't changed, nor the mode, don't rebuild the playlist.
      // useEffect could be triggered by a change of mode, but we're not interested in that.
      // stringify is used to compare the items in the arrays,instead of whether the object is the same.
      if (currentAlternativePlaylistSourceTracks.mode === mode && JSON.stringify(currentAlternativePlaylistSourceTracks.tracks) === JSON.stringify(sourceTracks.map(t => t.id))) {
        return;
      }
      setIsComplete(false);

      // Abort any ongoing build process
      if (abortController.current) {
        abortController.current.abort();
      }
      abortController.current = new AbortController();

      // todo : fix this , we don't want to have a token in the compomnent.
      buildAlternativePlaylist(token, sourceTracks, 1, updateProgress, mode, abortController.current.signal)
        .then((newAlternativePlaylist) => {
          const uniqueTracks = newAlternativePlaylist.filter((track, index, self) =>
            index === self.findIndex(t => t.uri === track.uri)
          );
          setAlternativePlaylist(uniqueTracks);
          // TODO: carry the mode for better comparison as if to rebuild the playlist or not.
          setCurrentAlternativePlaylistSourceTracks({ tracks: sourceTracks.map(t => t.id), mode: mode });
          setIsComplete(true);
          setShowProcessCompleteMessage(true);
          setQueueOpen(false);

        })
        .catch((error: Error) => {
          if (error.name === 'AbortError') {
            console.log('Operation aborted');
          }
        })
        .catch(showBoundary);
        // TODO: check if we should we null out the abort controller, or do we risk having some race conditions and clear out the wrong one?
    }
  }, [sourceTracks, mode, updateProgress, showBoundary, currentAlternativePlaylistSourceTracks]);

  const toggleQueue = () => {
    setQueueOpen(!queueOpen);
  };

  const handleBackToQueue = async () => {
    setShowQueue(true);
    setMode('alternative');
    setSelectedPlaylist(null);
    fetchQueue(false);
  };

  return (
    <Grid container spacing={3} sx={{ pt: 2 }}>
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
      {isComplete && showProcessCompleteMessage && (
        <Grid item xs={12} sx={{ textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom >
            You have been unboreified!
          </Typography>
          <Typography variant="body1">Your alternative playlist is ready with {alternativePlaylist.length} tracks.</Typography>
          <Box display="flex" alignItems="center" justifyContent="center" mt={2}>
            <Tooltip title="Play on Spotify">
              <Box>
                <IconButton
                  color="primary"
                  onClick={handlePlayOnSpotify}
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    color: 'white',
                  }}
                >
                  <PlayArrowIcon />
                </IconButton>
                <Typography variant="body2">Play on Spotify</Typography>
              </Box>
            </Tooltip>
          </Box>
          <Box display="flex" flexDirection={'row'} alignItems="center" justifyContent="center" mt={2}>

            <Tooltip title="Refresh currently playing queue">
              <IconButton onClick={() => fetchQueue(false)} size="small" sx={{ marginLeft: 1 }}>
                <Box display={'flex'} textAlign={'center'} flexDirection={'column'} alignItems={'center'}>
                  <RefreshIcon />
                  <Typography variant='caption' >
                    Refresh Queue
                  </Typography>
                </Box>
              </IconButton>
            </Tooltip>

            <Tooltip title="Go all CSI and ENHANCE your current playing queue !">
              <IconButton onClick={async () => {
                let tracks: Track[] = [];
                if (!queueData) {
                  const queue = await fetchQueue(false);
                  tracks = [queue?.currently_playing, ...queue!.queue].filter(Boolean);

                  setSourceTracks(tracks);
                } else {
                  tracks = [queueData?.currently_playing, ...queueData!.queue].filter(Boolean);
                }
                setMode('extend');
                setCurrentAlternativePlaylistSourceTracks({ tracks: [], mode: 'extend' });
                setSourceTracks(tracks);
              }} size="small" sx={{ marginLeft: 1 }}>
                <Box display={'flex'} textAlign={'center'} flexDirection={'column'} alignItems={'center'}>
                  <AutoFixHighIcon />
                  <Typography variant='caption' >
                    Enhance Queue
                  </Typography>
                </Box>
              </IconButton>
            </Tooltip>
            <Tooltip title="Unboreify my queue : replace all the songs with similar ones." >
              <IconButton onClick={() => fetchQueue(true)} size="small" sx={{ marginLeft: 1 }}>
                <Box display={'flex'} textAlign={'center'} flexDirection={'column'} alignItems={'center'}>

                  <AutoModeIcon />
                  <Typography variant='caption' >
                    Unboreify
                  </Typography>
                </Box>
              </IconButton>
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
            {queueData?.currently_playing ? <TrackCard track={queueData.currently_playing} /> : <>Play music to get started</>}
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="h4" gutterBottom>
              Queue
              {/* TODO create a variable for this to make it more clear */}
              {(!showProcessCompleteMessage && isComplete) &&
                <>
                  <Tooltip title="Refresh currently playing queue">
                    <IconButton onClick={() => fetchQueue(false)} size="small" sx={{ marginLeft: 1 }}>
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Go all CSI and ENHANCE your current playing queue !">
                    <IconButton onClick={async () => {
                      let tracks: Track[] = [];
                      if (!queueData) {
                        const queue = await fetchQueue(false);
                        tracks = [queue?.currently_playing, ...queue!.queue].filter(Boolean);

                        setSourceTracks(tracks);
                      } else {
                        tracks = [queueData?.currently_playing, ...queueData!.queue].filter(Boolean);
                      }
                      setMode('extend');
                      setCurrentAlternativePlaylistSourceTracks({ tracks: [], mode: 'extend' });
                      setSourceTracks(tracks);
                    }} size="small" sx={{ marginLeft: 1 }}>
                      <AutoFixHighIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Unboreify my queue : replace all the songs with similar ones." >
                    <IconButton onClick={() => fetchQueue(true)} size="small" sx={{ marginLeft: 1 }}>
                      <AutoModeIcon />
                    </IconButton>
                  </Tooltip>
                </>}
              {isMobile && (
                <IconButton onClick={toggleQueue} size="small">
                  {queueOpen ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              )}
            </Typography>
            {isMobile && <Divider />}
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
        <Typography
          variant="h4"
          gutterBottom
          display="flex"
          alignItems="center"
        >
          Alternative Playlist
          <Tooltip title="You like your alternative playlist, but you wanted more ? Double the fun by doubling its size !">

            <IconButton onClick={handleEnhanceClick} size="small" sx={{ marginLeft: 1 }}>
              <AutoAwesomeIcon sx={{ color: mode === 'extend' ? 'primary.main' : 'text.primary' }} />
            </IconButton>
          </Tooltip>
        </Typography>
        {alternativePlaylist.map((track) => <TrackCard track={track} key={track.uri} />)}
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          User Playlists
        </Typography>
        <Box>
          {playlists.map((playlist) => (
            <Button key={playlist.id} variant="contained" onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              return fetchPlaylistTracks(playlist.id);
            }} sx={{ marginRight: 1, marginBottom: 1 }}>
              {playlist.name}
            </Button>
          ))}
        </Box>
      </Grid>
    </Grid>
  );
};

export default QueuePage;
