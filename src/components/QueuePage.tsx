// src/components/QueuePage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { Button, Grid, Typography, Card, CardContent, CardMedia, Box } from '@mui/material';
import { getQueue, getDevices, addToQueue, getUserPlaylists, getPlaylistTracks } from '../services/spotifyService';
import { SpotifyQueue } from '../services/spotifyService';

interface QueuePageProps {
  token: string | null;
}

const QueuePage: React.FC<QueuePageProps> = ({ token }) => {
  const [queueData, setQueueData] = useState<SpotifyQueue | null>(null);
  const [alternativePlaylist, setAlternativePlaylist] = useState<string[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);

  const fetchQueue = useCallback(async () => {
    if (!token) return;

    try {
      const queue = await getQueue(token);
      setQueueData(queue);
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
    async (playlistId: string) => {
      if (!token) return;

      try {
        const tracks = await getPlaylistTracks(token, playlistId);
        const trackUris = tracks.map((track: any) => track.track.uri);
        return trackUris;
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
      const devices = await getDevices(token);
      const deviceId = devices[0]?.id;

      for (const trackUri of alternativePlaylist) {
        await addToQueue(token, trackUri, deviceId);
      }

      fetchQueue();
    } catch (error) {
      console.error(error);
    }
  }, [alternativePlaylist, token, fetchQueue]);

  useEffect(() => {
    fetchQueue();
    fetchUserPlaylists();
  }, [fetchQueue, fetchUserPlaylists]);

  const renderTrackCard = (track: any) => (
    <Card key={track.uri} sx={{ display: 'flex', marginBottom: 2 }}>
      <CardMedia
        component="img"
        sx={{ width: 151 }}
        image={track.album.images[0].url}
        alt={track.album.name}
      />
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flex: '1 0 auto' }}>
          <Typography component="div" variant="h6">
            {track.name}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" component="div">
            {track.artists.map((artist: any) => artist.name).join(', ')}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary" component="div">
            {track.album.name}
          </Typography>
        </CardContent>
      </Box>
    </Card>
  );

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          Currently Playing
        </Typography>
        {queueData?.currently_playing.track && renderTrackCard(queueData.currently_playing.track)}
      </Grid>
      <Grid item xs={12} sm={6}>
        <Typography variant="h4" gutterBottom>
          Queue
        </Typography>
        {queueData?.queue.map((track) => renderTrackCard(track))}
      </Grid>
      <Grid item xs={12} sm={6}>
        <Typography variant="h4" gutterBottom>
          Alternative Playlist
        </Typography>
        <Box>
          {alternativePlaylist.map((uri, index) => (
            <Typography key={index}>{uri}</Typography>
          ))}
        </Box>
        <Button variant="contained" color="primary" onClick={handleButtonClick} sx={{ marginTop: 2 }}>
          Replace Queue with Alternative Playlist
        </Button>
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
