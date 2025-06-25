import React, { FC, useEffect, useState, useCallback } from "react";
import { Button, Typography, Box, TextField, Divider } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import useSpotifyApi from "../hooks/useSpotifyApi";
import SaveToSpotifyPlaylist from "./SaveToSpotifyPlaylist";
import { Track } from "../services/spotifyService";

// No props interface needed for this component
// interface FestivalPageProps {}

const FestivalPage: FC = () => {
  const { getArtistTopTracks, getArtistId, getDevices, startPlayback, createPlaylist, addTracksToPlaylist, currentUser } = useSpotifyApi();
  const [artistInput, setArtistInput] = useState<string>('');
  const [artistsList, setArtistsList] = useState<string[]>([]);
  const [topTracks, setTopTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopTracks = async () => {
      setIsLoading(true);
      try {
        // Get list of artist names from query string
        const artistNames = new URLSearchParams(window.location.search).get('artist')?.split(',') ?? [];
        const trackList: Track[] = [];
        
        for (const artistName of artistNames) {
          const artistId = await getArtistId(artistName); // Get artist ID
          if (artistId) {
            const tracks = await getArtistTopTracks(artistId); // Fetch top tracks

            trackList.push(...tracks);
            console.log(`Fetched and filtered top tracks for ${artistName}`, tracks.map(track => track.name));
          }
        }
        
        setTopTracks(trackList);
      } catch (error) {
        console.error("Error fetching top tracks:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTopTracks();
  }, [artistsList, getArtistId, getArtistTopTracks]);

  const {search} = useLocation();

  useEffect(() => {
    // Get the artist names from the query string
    const artistNames = new URLSearchParams(search).get('artist')?.split(',') ?? [];
    setArtistsList(artistNames); // Initialize the input box with artist names
    setArtistInput(artistNames.join('\n')); // Initialize the input box with artist names
  }, [search]);

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Update the artistInput state with the changed text area content
    setArtistInput(event.target.value);
  };

  const handleNavigate = () => {
    const artistsList = artistInput.split('\n');
    // Concatenate the input lines into a comma-separated string
    const concatenatedArtists = artistsList.join(',');
    // Navigate to /itfwi with the concatenated artist names as a query parameter
    navigate(`/festiclub?artist=${encodeURIComponent(concatenatedArtists)}`);
    setArtistsList(artistsList ?? []); // Initialize the input box with artist names
  };

  const handlePlayAllTracks = async () => {
    try {
      const uris = topTracks.map(track => track.uri);
      const devices = await getDevices();
      const deviceId = devices[0]?.id; // Select the first available device

      if (deviceId) {
        await startPlayback(uris, deviceId);
      }
    } catch (error) {
      console.error("Error starting playback:", error);
    }
  };

  const handleSaveToSpotify = useCallback(async (playlistName: string, tracks: Track[]) => {
    if (!currentUser?.id) {
      throw new Error('User not found');
    }

    try {
      // Create the playlist
      const playlist = await createPlaylist(currentUser.id, playlistName);
      
      // Add tracks to the playlist
      const trackUris = tracks.map(track => track.uri);
      await addTracksToPlaylist(playlist.id, trackUris);
      
      console.log(`Successfully created playlist "${playlistName}" with ${tracks.length} tracks`);
    } catch (error) {
      console.error('Failed to save playlist to Spotify:', error);
      throw error;
    }
  }, [createPlaylist, addTracksToPlaylist, currentUser]);

  return (
    <Box sx={{ padding: 2 }}>
      {/* Page Title and Subtitle */}
      <Typography variant="h3" gutterBottom>
        Festiclub
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Is this festival/club worth it?
      </Typography>      {/* Multiline TextField for Artist Names */}
      <TextField
        label="Artists"
        multiline
        rows={artistsList.length || 3} // Show enough rows for the input or default to 3
        value={artistInput} // Display each artist on a new line
        onChange={handleInputChange} // Update state on input change
        fullWidth
        sx={{ marginBottom: 2 }}
        inputProps={{ 'data-testid': 'artist-input-0' }}
      />      {/* Button to Concatenate and Navigate */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleNavigate}
        sx={{ marginBottom: 2 }}
        data-testid="add-artist-button"
      >
        Go to FestiClub with these Artists
      </Button>

      {isLoading ? (
        <Typography variant="body1">Loading top tracks...</Typography>
      ) : (
        <Box>
          {/* Render Top Tracks */}
          {topTracks.length > 0 && (
            <>
              {topTracks.reduce((acc: React.ReactElement[], track, index) => {
                const prevTrack = topTracks[index - 1];
                const isNewArtist = !prevTrack || prevTrack.artists[0].name !== track.artists[0].name;

                if (isNewArtist) {
                  acc.push(
                    <React.Fragment key={`divider-${track.artists[0].name}`}>
                      {index > 0 && <Divider sx={{ marginY: 2 }} />} {/* Add a divider between different artists */}
                      <Typography variant="h5" gutterBottom>
                        {track.artists[0].name} {/* Display artist name */}
                      </Typography>
                    </React.Fragment>
                  );
                }

                acc.push(
                  <Box display="flex" alignItems="center" key={track.id} sx={{ marginBottom: 1 }}>
                    <Box 
                      component="img" 
                      src={track.album.images[0]?.url} 
                      alt={track.name} 
                      sx={{ width: 50, height: 50, marginRight: 1.25 }} 
                    />
                    <Typography variant="body1">{track.name}</Typography>
                  </Box>
                );

                return acc;
              }, [])}
            </>
          )}
        </Box>
      )}

      {topTracks.length > 0 && (
        <Box mt={4} display="flex" gap={2} alignItems="center">
          <Button
            variant="contained"
            color="primary"
            onClick={handlePlayAllTracks}
          >
            Play All Tracks on Spotify
          </Button>
          
          <SaveToSpotifyPlaylist
            tracks={topTracks}
            defaultPlaylistName={`unborified [festival tracks]`}
            onSavePlaylist={handleSaveToSpotify}
            sx={{ 
              '& .MuiIconButton-root': {
                bgcolor: 'success.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'success.dark',
                }
              }
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default FestivalPage;
