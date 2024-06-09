import React, { useEffect, useState, useCallback } from 'react';
import { Button, Grid, Typography, Box, LinearProgress, Tooltip } from '@mui/material';
import { AutoAwesome as AutoAwesomeIcon } from '@mui/icons-material';
import { getQueue, getPlaybackState, startPlayback, getUserPlaylists, getPlaylistTracks, SpotifyQueue, Track, getTrackDetails } from '../services/spotifyService';
import { buildAlternativePlaylist, ProgressCallback } from '../services/playlistService';
import TrackCard from './TrackCard';

interface QueuePageProps {
  token: string | null;
}

const QueuePage: React.FC<QueuePageProps> = ({ token }) => {
  const [queueData, setQueueData] = useState<SpotifyQueue | null>(null);
  const [alternativePlaylist, setAlternativePlaylist] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [progress, setProgress] = useState<{ phase: string; percentage: number }>({ phase: '', percentage: 0 });
  const [lengthMultiplier, setLengthMultiplier] = useState<number>(1);
  const [isBuilding, setIsBuilding] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);

  const fetchQueue = useCallback(async () => {
    if (!token) return;

    try {
      const queue = await getQueue(token);
      if (queue.currently_playing && !queue.currently_playing.track) {
        const currentTrack = await getTrackDetails(queue.currently_playing.id, token);
        queue.currently_playing.track = currentTrack;
        setQueueData(queue);
      } else {
        setQueueData(queue);
      }
    } catch (error) {
      console.error(error);
    }
  }, [token]);

  const fetchUserPlaylists = useCallback(async () => {
    if (!token) return;

    try {
      const userPlaylists = await getUserPlaylists(token);
      setPlaylists(userPlaylists);
    } catch (error) {
      console.error(error);
    }
  }, [token]);

  const fetchPlaylistTracks = useCallback(
    async (playlistId: string): Promise<Track[]> => {
      if (!token) throw new Error('No token provided');

      try {
        const items = (await getPlaylistTracks(token, playlistId)).items;
        const tracks = items.map((item: { track: Track }) => item.track);
        return tracks;
      } catch (error) {
        console.error(error);
        return [];
      }
    },
    [token]
  );

  const handleAlternativePlaylistChange = useCallback(
    async (playlistId: string) => {
      const trackUris = await fetchPlaylistTracks(playlistId);
      setAlternativePlaylist(trackUris);
    },
    [fetchPlaylistTracks]
  );

  const handleButtonClick = useCallback(async () => {
    if (!token) return;

    try {
      const playbackState = await getPlaybackState(token);
      const deviceId = playbackState.device.id;

      const uris = alternativePlaylist.map(track => track.uri);
      await startPlayback(token, uris, deviceId);

      fetchQueue();
    } catch (error) {
      console.error(error);
    }
  }, [alternativePlaylist, token, fetchQueue]);

  const handleEnhanceClick = () => {
    setLengthMultiplier(prev => Math.min(prev + 1, 5));
    setIsComplete(false);
    setIsBuilding(true);
  };

  const updateProgress: ProgressCallback = useCallback((progress) => {
    setProgress(progress);
  }, []);

  useEffect(() => {
    fetchQueue();
    fetchUserPlaylists();
  }, [fetchQueue, fetchUserPlaylists]);

  useEffect(() => {
    if (queueData && !isComplete) {
      setIsBuilding(true);
      (async () => {
        const alternativePlaylist = await buildAlternativePlaylist(
          token!,
          [queueData.currently_playing.track, ...queueData.queue].filter(o => !!o),
          lengthMultiplier,
          updateProgress
        );
        setAlternativePlaylist(alternativePlaylist);
        setIsBuilding(false);
        setIsComplete(true);
      })();
    }
  }, [queueData, token, lengthMultiplier, updateProgress, isComplete]);

  return (
    <Grid container spacing={3}>
      {isBuilding && (
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
      {!isBuilding && isComplete && (
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>
            You have been unboreified!
          </Typography>
          <Typography variant="body1">Your alternative playlist is ready with {alternativePlaylist.length} tracks.</Typography>
          <Button variant="contained" color="primary" onClick={handleButtonClick} sx={{ marginTop: 2 }}>
            Play on Spotify
          </Button>
        </Grid>
      )}
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          Currently Playing
        </Typography>
        {queueData?.currently_playing?.track ? <TrackCard track={queueData.currently_playing.track} /> : <>Player stopped</>}
      </Grid>
      <Grid item xs={12} sm={6}>
        <Typography variant="h4" gutterBottom>
          Queue
        </Typography>
        {queueData?.queue.map((track) => <TrackCard track={track} key={track.uri} />)}
      </Grid>
      <Grid item xs={12} sm={6}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h4" gutterBottom>
            Alternative Playlist {lengthMultiplier > 1 && (<><AutoAwesomeIcon /> x{lengthMultiplier}</>)}
          </Typography>
          <Tooltip title="Enhance">
            <span>
              <Button
                variant="contained"
                color="primary"
                onClick={handleEnhanceClick}
                startIcon={<AutoAwesomeIcon />}
                sx={{ marginLeft: 2 }}
                disabled={lengthMultiplier >= 5}
              />
            </span>
          </Tooltip>
        </Box>
        {alternativePlaylist.map((track) => <TrackCard track={track} key={track.uri} />)}
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          User Playlists
        </Typography>
        <Box>
          {playlists.map((playlist) => (
            <Button key={playlist.id} variant="contained" onClick={() => handleAlternativePlaylistChange(playlist.id)} sx={{ marginRight: 1, marginBottom: 1 }}>
              {playlist.name}
            </Button>
          ))}
        </Box>
      </Grid>
    </Grid>
  );
};

export default QueuePage;
