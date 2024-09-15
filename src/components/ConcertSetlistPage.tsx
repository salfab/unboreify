import { FC, useCallback, useState, useMemo } from "react";
import { Button, Typography, Box, TextField, CircularProgress, Avatar, Autocomplete, Select, MenuItem, FormControl, InputLabel, SelectChangeEvent } from "@mui/material";
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

interface ConcertSetlistPageProps {}

const ConcertSetlistPage: FC<ConcertSetlistPageProps> = () => {
  const { searchTracks, startPlayback, getDevices } = useSpotifyApi();

  const [artistName, setArtistName] = useState<string>('');  // Stores artist name, whether typed or selected
  const [artists, setArtists] = useState<Artist[]>([]);
  const [setlists, setSetlists] = useState<Setlist[]>([]);
  const [selectedSetlist, setSelectedSetlist] = useState<Setlist | null>(null);
  const [setlistInput, setSetlistInput] = useState<string>(''); 
  const [trackStatuses, setTrackStatuses] = useState<{ song: string; status: 'loading' | 'success' | 'failure' | 'approximation'; track?: Track }[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTracksReady, setIsTracksReady] = useState<boolean>(false); 

  // Debounced function to search artists after 0.5 seconds of inactivity
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

  // Handle artist selection or typing
  const handleArtistInputChange = (_event: unknown, value: string) => {
    setArtistName(value);  // Store artist name (typed or selected)
    setSetlists([]);  // Clear setlists when artist changes
    fetchArtists(value);   // Search for artist if typing
  };

  const handleArtistSelect = async (_event: unknown, artist: Artist | null) => {
    if (artist) {
      setArtistName(artist.name);  // Set artist name
      await fetchSetlists(artist.mbid);  // Fetch setlists for selected artist
    }
  };

  // Fetch setlists when artist is selected
  const fetchSetlists = async (mbid: string) => {
    try {
      const setsList = await getLastSetsByArtist(mbid);
      setSetlists(setsList);
    } catch (error) {
      console.error('Error fetching setlists:', error);
    }
  };

  // Handle setlist selection and automatically fetch songs
  const handleSetlistSelect = async (event: SelectChangeEvent<string>) => {
    const selectedSet = setlists.find(set => set.id === event.target.value);
    if (selectedSet) {
      setSelectedSetlist(selectedSet);
      const trackNames = selectedSet.sets.set.flatMap(s => s.song.map(song => song.name));
      setSetlistInput(trackNames.join('\n'));  // Populate the track list input automatically
      await handleMakePlaylist(trackNames);
    }
  };

  // Trim track names and build the playlist
  const handleMakePlaylist = async (songList: string[]) => {
    setIsLoading(true);
    setTrackStatuses(songList.map(song => ({ song, status: 'loading' })));

    const fetchedTracks: { song: string; status: 'success' | 'failure' | 'approximation'; track?: Track }[] = [];

    for (const song of songList.map(s => s.trim())) {  // Trim white spaces here
      try {
        const results = await searchTracks(song);
        let preferredTrack = results.find(track => track.artists[0].name.toLowerCase() === artistName.toLowerCase());

        // If no exact match, search with the artist name included
        if (!preferredTrack) {
          const fallbackResults = await searchTracks(`${artistName} - ${song}`);
          preferredTrack = fallbackResults.find(track => track.name.toLowerCase() === song.toLowerCase());

          if (preferredTrack) {
            fetchedTracks.push({ song, status: 'success', track: preferredTrack });
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

  // Memoized check if the input has been modified compared to the original fetched track list
  const isModified = useMemo(() => {
    const currentTracks = setlistInput.split('\n').map(track => track.trim()).filter(Boolean);  // Trim white spaces
    // TODO  :this doesn't work after editing the input box once it's been prefilled by the setlist
    return JSON.stringify(currentTracks) !== JSON.stringify(trackStatuses.map(status => status.song));
  }, [setlistInput, trackStatuses]);

  // Manually queue tracks from the input box
  const handleQueueTracksManually = async () => {
    const trackNames = setlistInput.split('\n').map(song => song.trim()).filter(song => song !== '');  // Trim white spaces
    await handleMakePlaylist(trackNames);
  };

  // Function to queue all tracks to Spotify
  const handleQueueAllTracks = async () => {
    try {
      const uris = trackStatuses
        .filter(status => status.status === 'success' || status.status === 'approximation')
        .map(status => status.track?.uri);

      const devices = await getDevices();
      const deviceId = devices[0]?.id; 

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
        getOptionLabel={(option) => {
          // if option is a string, return it as is.
          if (typeof option === 'string') {
            return option;
          }
          return option.disambiguation ? `${option.name} (${option.disambiguation})` : option.name;
        }}
        onInputChange={handleArtistInputChange}
        onChange={(e, v) => handleArtistSelect(e, v as Artist | null)} 
        renderInput={(params) => <TextField {...params} label="Search Artist" fullWidth />}
        isOptionEqualToValue={(option, value) => option.mbid === value.mbid}
        sx={{ marginBottom: 2 }}
      />

      {/* Setlist Select Box */}
      {setlists.length > 0 && (
        <FormControl fullWidth sx={{ marginBottom: 2 }}>
          <InputLabel>Select Setlist</InputLabel>
          <Select value={selectedSetlist?.id || ''} onChange={(e) => handleSetlistSelect(e)}>
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
        onChange={(e) => setSetlistInput(e.target.value)}
        fullWidth
        sx={{ marginBottom: 2 }}
      />

      {/* Manually Build Setlist Button */}
      <Button
        variant="contained"
        color="secondary"
        onClick={handleQueueTracksManually}
        disabled={isLoading || !setlistInput.trim() || !isModified}
        sx={{ marginBottom: 2 }}
      >
        Build My Setlist
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
              <Typography variant="body1">{status.song}</Typography>
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
