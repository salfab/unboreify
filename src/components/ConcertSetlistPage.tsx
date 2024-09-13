import React, { FC, useCallback, useState } from "react";
import { Button, Typography, Box, TextField, CircularProgress, Avatar } from "@mui/material";
import { CheckCircle as CheckCircleIcon, Cancel as CancelIcon, Lightbulb as LightBulbIcon } from '@mui/icons-material'; // Import LightBulbIcon for approximations
import useSpotifyApi from "../hooks/useSpotifyApi";
import { getLastSetsByArtist, searchArtistByName } from "../services/setlistFmService";

interface Track {
  id: string;
  name: string;
  uri: string;
  album: {
    images: { url: string }[];
  };
  artists: { name: string }[];
}

interface ConcertSetlistPageProps {
  // Define any props you need
}

const ConcertSetlistPage: FC<ConcertSetlistPageProps> = () => {
  const { searchTracks } = useSpotifyApi(); 
  const [artistName, setArtistName] = useState<string>('');
  const [setlistInput, setSetlistInput] = useState<string>('');
  const [setlist, setSetlist] = useState<string[]>([]);
  const [trackStatuses, setTrackStatuses] = useState<{ song: string; status: 'loading' | 'success' | 'failure' | 'approximation'; track?: Track }[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleArtistNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setArtistName(event.target.value);
  };

  const handleSetlistChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSetlistInput(event.target.value);
  };

  const handleMakePlaylist = async () => {
    setIsLoading(true);
    const songList = setlistInput.split('\n').filter(song => song.trim() !== '');
    setSetlist(songList);
    
    // Initialize track statuses to 'loading'
    setTrackStatuses(songList.map(song => ({ song, status: 'loading' })));

    const fetchedTracks: { song: string; status: 'success' | 'failure' | 'approximation'; track?: Track }[] = [];

    for (const song of songList) {
      try {
        // Search the song on Spotify by the song title
        const results = await searchTracks(song);

        let preferredTrack = results.find(track => track.artists[0].name.toLowerCase() === artistName.toLowerCase());

        if (preferredTrack) {
          fetchedTracks.push({ song, status: 'success', track: preferredTrack });
        } else if (results.length > 0) {
          // If no exact match by artist, take the first track as an approximation
          preferredTrack = results[0];
          fetchedTracks.push({ song, status: 'approximation', track: preferredTrack });
        } else {
          fetchedTracks.push({ song, status: 'failure' });
        }
      } catch (error) {
        fetchedTracks.push({ song, status: 'failure' });
      }
    }

    setTrackStatuses(fetchedTracks);
    setIsLoading(false);
  };

  const handleFetchSetlist = useCallback(async () => {
    // Fetch setlist from the API
    const artists = await searchArtistByName(artistName);
    const matchingArtist = artists.find(a => a.name.toLowerCase() === artistName.toLowerCase());
    if (!matchingArtist) {
      console.error('Artist not found');
      throw new Error('Artist not found');
    }
    const setsList = await getLastSetsByArtist(matchingArtist.mbid);
    console.log(setsList);
  }, [artistName]);
    
  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        Concert Setlist Playlist
      </Typography>

      <TextField
        label="Artist Name"
        value={artistName}
        onChange={handleArtistNameChange}
        fullWidth
        sx={{ marginBottom: 2 }}
      />
      <Button variant="contained" color="primary" sx={{ marginBottom: 2 }} onClick={handleFetchSetlist}>
        Fetch Setlist
        </Button>

      <TextField
        label="Setlist (One song per line)"
        multiline
        rows={setlist.length || 3}
        value={setlistInput}
        onChange={handleSetlistChange}
        fullWidth
        sx={{ marginBottom: 2 }}
      />

      <Button
        variant="contained"
        color="primary"
        onClick={handleMakePlaylist}
        disabled={isLoading || !artistName || !setlistInput.trim()}
      >
        Make a Playlist of the Setlist
      </Button>

      {/* Display track fetching statuses */}
      <Box mt={4}>
        {trackStatuses.map((status, index) => (
          <Box key={index} display="flex" alignItems="center" sx={{ marginBottom: 1 }}>
            <Avatar 
              alt={status.track?.name} 
              src={status.track?.album.images[0]?.url} 
              sx={{ marginRight: 2, width: 40, height: 40 }} 
            />
            <Box>
              <Typography variant="body1">
                {status.song}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {status.track?.artists.map(artist => artist.name).join(', ')}
              </Typography>
            </Box>
            <Box sx={{ marginLeft: 'auto' }}>
              {status.status === 'loading' && <CircularProgress size={20} />}
              {status.status === 'success' && <CheckCircleIcon color="success" />}
              {status.status === 'failure' && <CancelIcon color="error" />}
              {status.status === 'approximation' && <LightBulbIcon color="warning" />} {/* Use LightBulbIcon for approximations */}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default ConcertSetlistPage;
