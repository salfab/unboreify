import React, { FC, useEffect, useState } from "react";
import { Button, Typography, Grid, Box } from "@mui/material";
import useSpotifyApi from "../hooks/useSpotifyApi";

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
  const { getArtistTopTracks, getArtistId, startPlayback, getDevices } = useSpotifyApi();
  const [topTracks, setTopTracks] = useState<Track[]>([]);
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
  }, [getArtistId, getArtistTopTracks]);

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
