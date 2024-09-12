import React, { FC, useEffect, useState } from "react";
import { Button, Typography, Box, TextField, Divider } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
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
  artists: { name: string }[]; // Ensure that track objects contain the artist information
}

const FestivalPage: FC<FestivalPageProps> = () => {
  const { getArtistTopTracks, getArtistId, getDevices, startPlayback } = useSpotifyApi();
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

            // Filter tracks to only include those where the primary artist matches the search term (case-insensitive)
            const filteredTracks = tracks;
            // tracks.filter(track => 
            //   track.artists[0].name.toLowerCase() === artistName.toLowerCase()
            // );

            trackList.push(...filteredTracks);
            console.log(`Fetched and filtered top tracks for ${artistName}`, filteredTracks.map(track => track.name));
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

  return (
    <Box sx={{ padding: 2 }}>
      {/* Page Title and Subtitle */}
      <Typography variant="h3" gutterBottom>
        Festiclub
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Is this festival/club worth it?
      </Typography>

      {/* Multiline TextField for Artist Names */}
      <TextField
        label="Artists"
        multiline
        rows={artistsList.length || 3} // Show enough rows for the input or default to 3
        value={artistInput} // Display each artist on a new line
        onChange={handleInputChange} // Update state on input change
        fullWidth
        sx={{ marginBottom: 2 }}
      />

      {/* Button to Concatenate and Navigate */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleNavigate}
        sx={{ marginBottom: 2 }}
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
              {topTracks.reduce((acc: JSX.Element[], track, index) => {
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
                    <img src={track.album.images[0]?.url} alt={track.name} style={{ width: 50, height: 50, marginRight: 10 }} />
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
        <Box mt={4}>
          <Button
            variant="contained"
            color="primary"
            onClick={handlePlayAllTracks}
          >
            Play All Tracks on Spotify
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default FestivalPage;
