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
}

interface Set {
  song: Song[];
}

interface Setlist {
  id: string;
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
  const { searchTracks } = useSpotifyApi(); 
  const [artistName, setArtistName] = useState<string>('');
  const [artists, setArtists] = useState<Artist[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null); // Store selected artist object
  const [setlists, setSetlists] = useState<Setlist[]>([]);
  const [selectedSetlist, setSelectedSetlist] = useState<Setlist | null>(null);
  const [setlistInput, setSetlistInput] = useState<string>(''); // Store user input setlist
  const [trackStatuses, setTrackStatuses] = useState<{ song: string; status: 'loading' | 'success' | 'failure' | 'approximation'; track?: Track }[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [inputChanged, setInputChanged] = useState<boolean>(false); // Track if input has changed
  
  const handleSetlistChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSetlistInput(event.target.value);
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
    setInputChanged(false); // Reset input change tracking

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
      setInputChanged(true);
      fetchArtists(value); // Only trigger fetch if typing, not selection
    }
  };

  // Handle setlist selection and populate setlist input with track names
  const handleSetlistSelect = (event: React.ChangeEvent<{ value: unknown }>) => {
    const selectedSet = setlists.find(set => set.id === event.target.value);
    setSelectedSetlist(selectedSet || null);

    if (selectedSet) {
      const trackNames = selectedSet.sets.set.flatMap(s => s.song.map(song => song.name)).join('\n');
      setSetlistInput(trackNames); // Populate the input field with tracks
    }
  };

  const handleMakePlaylist = async () => {
    setIsLoading(true);
    const songList = setlistInput.split('\n').filter(song => song.trim() !== '');
    setTrackStatuses(songList.map(song => ({ song, status: 'loading' })));

    const fetchedTracks: { song: string; status: 'success' | 'failure' | 'approximation'; track?: Track }[] = [];

    for (const song of songList) {
      try {
        const results = await searchTracks(song);
        let preferredTrack = results.find(track => track.artists[0].name.toLowerCase() === selectedArtist?.name.toLowerCase());

        if (preferredTrack) {
          fetchedTracks.push({ song, status: 'success', track: preferredTrack });
        } else if (results.length > 0) {
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
        onInputChange={handleInputChange} // Fetch artists with debounce only when typing
        onChange={handleArtistSelect} // Handle artist selection
        renderInput={(params) => <TextField {...params} label="Search Artist" fullWidth />}
        isOptionEqualToValue={(option, value) => option.mbid === value.mbid} // Ensures correct matching
        sx={{ marginBottom: 2 }}
      />

      {/* Setlist Select Box */}
      {setlists.length > 0 && (
        <FormControl fullWidth sx={{ marginBottom: 2 }}>
          <InputLabel>Select Setlist</InputLabel>
          <Select value={selectedSetlist?.id || ''} onChange={handleSetlistSelect}>
            {setlists.map((setlist) => {
              return (
                <MenuItem key={setlist.id} value={setlist.id}>
                  {setlist.venue.name} - {setlist.eventDate} ({setlist.sets.set.flatMap(s => s.song).length} tracks)
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      )}

      {/* Setlist (automatically populated when setlist is selected) */}
      <TextField
        label="Setlist (One song per line)"
        multiline
        rows={setlistInput ? setlistInput.split('\n').length : 3}
        value={setlistInput}
        onChange={handleSetlistChange}
        fullWidth
        sx={{ marginBottom: 2 }}
      />

      <Button
        variant="contained"
        color="primary"
        onClick={handleMakePlaylist}
        disabled={isLoading || !selectedArtist || !setlistInput.trim()}
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
              {status.status === 'approximation' && <LightBulbIcon color="warning" />}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default ConcertSetlistPage;
