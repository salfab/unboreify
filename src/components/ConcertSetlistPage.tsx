import React, { FC, useState } from "react";
import { Button, Typography, Box, TextField, CircularProgress } from "@mui/material";
import { CheckCircle as CheckCircleIcon, Cancel as CancelIcon } from '@mui/icons-material';
import useSpotifyApi from "../hooks/useSpotifyApi";

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
  const { searchTracks, } = useSpotifyApi(); 
  const [artistName, setArtistName] = useState<string>('');
  const [setlistInput, setSetlistInput] = useState<string>('');
  const [setlist, setSetlist] = useState<string[]>([]);
  const [trackStatuses, setTrackStatuses] = useState<{ song: string; status: 'loading' | 'success' | 'failure'; track?: Track }[]>([]);
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

    const fetchedTracks: { song: string; status: 'success' | 'failure'; track?: Track }[] = [];

    for (const song of songList) {
      try {
        // Search the song on Spotify, prefer the version from the typed artist
        const results = await searchTracks(song);

        // TODO : if no track by that artist is available, take the first one instead of failing
        const preferredTrack = results.find(track => track.artists[0].name.toLowerCase() === artistName.toLowerCase());

        if (preferredTrack) {
          fetchedTracks.push({ song, status: 'success', track: preferredTrack });
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
            <Typography variant="body1" sx={{ marginRight: 2 }}>
              {status.song}
            </Typography>
            {status.status === 'loading' && <CircularProgress size={20} />}
            {status.status === 'success' && <CheckCircleIcon color="success" />}
            {status.status === 'failure' && <CancelIcon color="error" />}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default ConcertSetlistPage;
