import React, { FC, useEffect, useState } from "react";
import { Button, Typography, Grid, Box, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import useSpotifyApi from "../hooks/useSpotifyApi";
import { useCallback } from "react";

interface FestivalPageProps {
  // Define any other props you need
}

interface Track {
  id: string;
  name: string;
  uri: string;
  album: {
    images: { url: string }[];
  };
}

const FestivalPage: FC<FestivalPageProps> = () => {
  const { getArtistTopTracks, getArtistId, getDevices, startPlayback } = useSpotifyApi();
  const [artistInput, setArtistInput] = useState<string[]>([]);
  const [topTracks, setTopTracks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
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
            console.log(`Fetched top tracks for ${artistName}`, tracks.map(track => track.name));
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
}    , [artistInput]);

  const navigate = useNavigate();

  useEffect(() => {
    // Get the artist names from the query string
    const artistNames = new URLSearchParams(window.location.search).get('artist')?.split(',') ?? [];
    setArtistInput(artistNames); // Initialize the input box with artist names
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Update the artistInput state with the changed text area content
    setArtistInput(event.target.value.split('\n'));
  };

  const handleNavigate = () => {
    // Concatenate the input lines into a comma-separated string
    const concatenatedArtists = artistInput.join(',');
    // Navigate to /itfwi with the concatenated artist names as a query parameter
    navigate(`/itfwi?artist=${encodeURIComponent(concatenatedArtists)}`);
  };

//   const handlePlayOnSpotify = useCallback(async () => {
//     try {
//       const playbackState = await getPlaybackState();
//       const deviceId = playbackState.device?.id ?? (await getDevices())[0].id;

//       const uris = topTracks.map(track => track.uri as string);
//       const result = await (uris, deviceId);
//       console.log(result);
//       //setShowProcessMessageBar(false)
//     //   setTimeout(async () => {
//     //     fetchQueue(false);
//     //   }, 1000);
//     } catch (error) {
//       console.error(error);
//       throw error;
//     }
//   }, [alternativePlaylist, fetchQueue, getDevices, getPlaybackState, startPlayback]);
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

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        Festival Artist Top Tracks
      </Typography>

      {/* Multiline TextField for Artist Names */}
      <TextField
        label="Artists"
        multiline
        rows={artistInput.length || 3} // Show enough rows for the input or default to 3
        value={artistInput.join('\n')} // Display each artist on a new line
        onChange={handleInputChange} // Update state on input change
        fullWidth
        sx={{ marginBottom: 2 }}
      />

      {/* Button to Concatenate and Navigate */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleNavigate}
      >
        Go to ITFWI with Artists
      </Button>

      {isLoading ? (
        <Typography variant="body1">Loading top tracks...</Typography>
      ) : (
        <Grid container spacing={2}>
          {topTracks.map(track => (
            <Grid item xs={12} sm={6} md={4} key={track.id}>
              <Box display="flex" alignItems="center">
                <img src={track.album.images[0]?.url} alt={track.name} style={{ width: 50, height: 50, marginRight: 10 }} />
                <Typography variant="body1">{track.name}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}

      {topTracks.length > 0 && (
        <Box mt={4}>
          <Button
            variant="contained"
            color="primary"
            onClick={handlePlayAllTracks}
           //  startIcon={<PlayArrowIcon />}
          >
            Play All Tracks on Spotify
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default FestivalPage;
