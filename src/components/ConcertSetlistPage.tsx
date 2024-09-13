import React, { FC, useCallback, useState } from "react";
import { Button, Typography, Box, TextField, CircularProgress, Avatar, Autocomplete, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { CheckCircle as CheckCircleIcon, Cancel as CancelIcon, Lightbulb as LightBulbIcon } from '@mui/icons-material';
import { debounce } from 'lodash';
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

interface Artist {
  mbid: string;
  name: string;
  disambiguation?: string;
}

interface Song {
  name: string;
  with?: {
    mbid: string;
    name: string;
    sortName: string;
    disambiguation?: string;
    url: string;
  };
  info?: string;
}

interface Set {
  song: Song[];
}

interface Setlist {
  id: string;
  versionId: string;
  eventDate: string;
  venue: {
    name: string;
    city: {
      name: string;
      country: {
        name: string;
      };
    };
  };
  sets: {
    set: Set[];
  };
}

interface ConcertSetlistPageProps {
  // Define any props you need
}

const ConcertSetlistPage: FC<ConcertSetlistPageProps> = () => {
  const { searchTracks, startPlayback, getDevices } = useSpotifyApi();
  const [artistName, setArtistName] = useState<string>('');
  const [artists, setArtists] = useState<Artist[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null); 
  const [setlists, setSetlists] = useState<Setlist[]>([]);
  const [selectedSetlist, setSelectedSetlist] = useState<Setlist | null>(null);
  const [setlistInput, setSetlistInput] = useState<string>(''); 
  const [trackStatuses, setTrackStatuses] = useState<{ song: string; status: 'loading' | 'success' | 'failure' | 'approximation'; track?: Track }[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTracksReady, setIsTracksReady] = useState<boolean>(false); // To show "Queue All Tracks" button

  const handleSetlistChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSetlistInput(event.target.value); // Allow manual modification of tracks
  };

  // Debounced function to search artists after 0.5 second of inactivity
  const fetchArtists = useCallback(
    debounce(async (name: string) => {
      if (!name) return;
      try {
        const artistResults = await searchArtistByName(name);
        setArtists(artistResults);
      } catch (error) {
        console.error('Error fetching artists:', error);
      }
    }, 500),
    []
  );

  // Handle artist selection from autocomplete
  const handleArtistSelect = async (event: any, artist: Artist | null) => {
    if (!artist) return;
    setSelectedArtist(artist);

    // Fetch setlists for the selected artist
    try {
      const setsList = await getLastSetsByArtist(artist.mbid);
      setSetlists(setsList);
    } catch (error) {
      console.error('Error fetching setlists:', error);
    }
  };

  // Handle input changes for typing only (not selection)
  const handleInputChange = (event: any, value: string, reason: string) => {
    if (reason === 'input') {
      fetchArtists(value); 
    }
  };

  // Automatically fetch tracks when setlist is selected
  const handleSetlistSelect = async (event: React.ChangeEvent<{ value: unknown }>) => {
    const selectedSet = setlists.find(set => set.id === event.target.value);
    setSelectedSetlist(selectedSet || null);

    if (selectedSet) {
      const trackNames = selectedSet.sets.set.flatMap(s => s.song.map(song => song.name)).join('\n');
      setSetlistInput(trackNames); // Populate the track list input automatically
      await handleMakePlaylist(trackNames.split('\n').filter(song => song.trim() !== ''));
    }
  };

  // Helper function to perform a secondary search with the artist name
  const performFallbackSearch = async (song: string): Promise<Track | null> => {
    try {
      const fallbackResults = await searchTracks(`${selectedArtist?.name} - ${song}`);
      return fallbackResults.find(track => track.name.toLowerCase() === song.toLowerCase()) || null;
    } catch (error) {
      console.error('Error performing fallback search:', error);
      return null;
    }
  };

  // Fetch and build the playlist for the setlist
  const handleMakePlaylist = async (songList: string[]) => {
    setIsLoading(true);
    setTrackStatuses(songList.map(song => ({ song, status: 'loading' })));

    const fetchedTracks: { song: string; status: 'success' | 'failure' | 'approximation'; track?: Track }[] = [];

    for (const song of songList) {
      try {
        const results = await searchTracks(song);
        const preferredTrack = results.find(track => track.artists[0].name.toLowerCase() === selectedArtist?.name.toLowerCase());

        // If no exact match by artist is found, do a fallback search with the artist name
        if (!preferredTrack) {
          const fallbackTrack = await performFallbackSearch(song);
          if (fallbackTrack) {
            // Mark as success if the fallback search found an exact match
            fetchedTracks.push({ song, status: 'success', track: fallbackTrack });
          } else {
            fetchedTracks.push({ song, status: 'failure' });
          }
        } else {
          fetchedTracks.push({ song, status: 'success', track: preferredTrack });
        }
      } catch (error) {
        fetchedTracks.push({ song, status: 'failure' });
      }
    }

    setTrackStatuses(fetchedTracks);
    setIsLoading(false);
    setIsTracksReady(fetchedTracks.every(track => track.status === 'success' || track.status === 'approximation'));
  };

  // Manually queue tracks from the input box
  const handleQueueTracksManually = async () => {
    const trackNames = setlistInput.split('\n').filter(song => song.trim() !== '');
    await handleMakePlaylist(trackNames);
  };

  // Function to queue all tracks to Spotify
  const handleQueueAllTracks = async () => {
    try {
      const uris = trackStatuses
        .filter(status => status.status === 'success' || status.status === 'approximation')
        .map(status => status.track?.uri);

      const devices = await getDevices();
      const deviceId = devices[0]?.id; // Select the first available device

      if (deviceId && uris.length > 0) {
        await startPlayback(uris as string[], deviceId);
      }
    } catch (error) {
      console.error('Error starting playback:', error);
    }
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        Concert Setlist Playlist
      </Typography>

      {/* Artist Autocomplete */}
      <Autocomplete
        freeSolo
        options={artists}
        getOptionLabel={(option) => option.disambiguation ? `${option.name} (${option.disambiguation})` : option.name}
        onInputChange={handleInputChange} 
        onChange={handleArtistSelect} 
        renderInput={(params) => <TextField {...params} label="Search Artist" fullWidth />}
        isOptionEqualToValue={(option, value) => option.mbid === value.mbid} 
        sx={{ marginBottom: 2 }}
      />

      {/* Setlist Select Box */}
      {setlists.length > 0 && (
        <FormControl fullWidth sx={{ marginBottom: 2 }}>
          <InputLabel>Select Setlist</InputLabel>
          <Select value={selectedSetlist?.id || ''} onChange={handleSetlistSelect}>
            {setlists.map((setlist) => (
              <MenuItem key={setlist.id} value={setlist.id}>
                {setlist.venue.name} - {setlist.eventDate} ({setlist.sets.set.flatMap(s => s.song).length} tracks)
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* Setlist (editable for manual modification) */}
      <TextField
        label="Setlist (One song per line)"
        multiline
        rows={setlistInput ? setlistInput.split('\n').length : 3}
        value={setlistInput}
        onChange={handleSetlistChange}
        fullWidth
        sx={{ marginBottom: 2 }}
      />

      {/* Manually Queue Tracks Button */}
      <Button
        variant="contained"
        color="secondary"
        onClick={handleQueueTracksManually}
        disabled={isLoading || !setlistInput.trim()}
        sx={{ marginBottom: 2 }}
      >
        Build my Set List
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
              {status.status === 'approximation' && <LightBulbIcon color="warning" />}
            </Box>
          </Box>
        ))}
      </Box>

      {/* Queue All Tracks Button */}
      {isTracksReady && (
        <Button
          variant="contained"
          color="primary"
          onClick={handleQueueAllTracks}
          sx={{ marginTop: 2 }}
        >
          Queue All Tracks on Spotify
        </Button>
      )}
    </Box>
  );
};

export default ConcertSetlistPage;
