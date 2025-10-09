import React, { useState, useCallback, useEffect, useContext } from 'react';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  useTheme,
  IconButton,
  LinearProgress
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Compare as CompareIcon
} from '@mui/icons-material';
import { IAuthContext, AuthContext } from 'react-oauth2-code-pkce';
import useSpotifyApi from '../hooks/useSpotifyApi';
import { SpotifyPlaylist, PlaylistResponse, Track, getCurrentUser, createPlaylist, addTracksToPlaylist } from '../services/spotifyService';
import PlaylistSelector from './PlaylistSelector';
import TrackCard from './TrackCard';
import { SaveToSpotifyPlaylist } from './SaveToSpotifyPlaylist';

interface PlaylistDiffProps {
  onBack: () => void;
}

type DiffMode = 'intersection' | 'base-only' | 'compare-only' | 'union' | 'symmetric-diff';

interface DiffResult {
  tracks: Track[];
  count: number;
  description: string;
}

const PlaylistDiff: React.FC<PlaylistDiffProps> = ({ onBack }) => {
  const theme = useTheme();
  const { token } = useContext<IAuthContext>(AuthContext);
  const { getUserPlaylists, getPlaylist } = useSpotifyApi();
  
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [basePlaylist, setBasePlaylist] = useState<SpotifyPlaylist | null>(null);
  const [comparePlaylist, setComparePlaylist] = useState<SpotifyPlaylist | null>(null);
  const [basePlaylistData, setBasePlaylistData] = useState<PlaylistResponse | null>(null);
  const [comparePlaylistData, setComparePlaylistData] = useState<PlaylistResponse | null>(null);
  const [diffMode, setDiffMode] = useState<DiffMode>('intersection');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Load user playlists on component mount
  useEffect(() => {
    const loadPlaylists = async () => {
      try {
        setIsLoading(true);
        const playlistsData = await getUserPlaylists();
        setPlaylists(playlistsData || []);
      } catch (err) {
        setError('Failed to load playlists');
        console.error('Error loading playlists:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadPlaylists();
  }, [getUserPlaylists]);

  const diffModes = [
    {
      id: 'intersection' as DiffMode,
      label: 'Intersection',
      description: 'Tracks that exist in BOTH playlists',
      icon: '∩',
      color: theme.palette.primary.main
    },
    {
      id: 'base-only' as DiffMode,
      label: 'Base Only',
      description: 'Tracks that exist ONLY in the base playlist',
      icon: 'A-B',
      color: theme.palette.secondary.main
    },
    {
      id: 'compare-only' as DiffMode,
      label: 'Compare Only',
      description: 'Tracks that exist ONLY in the comparison playlist',
      icon: 'B-A',
      color: theme.palette.warning.main
    },
    {
      id: 'union' as DiffMode,
      label: 'Union',
      description: 'ALL tracks from both playlists (no duplicates)',
      icon: '∪',
      color: theme.palette.success.main
    },
    {
      id: 'symmetric-diff' as DiffMode,
      label: 'Symmetric Difference',
      description: 'Tracks that exist in EITHER playlist but NOT in both',
      icon: '⊕',
      color: theme.palette.error.main
    }
  ];

  const handlePlaylistSelect = useCallback(async (playlistId: string, isBase: boolean) => {
    try {
      setIsLoading(true);
      setLoadingProgress(25);
      
      // Find the playlist info from the loaded playlists
      const playlistInfo = playlists.find(p => p.id === playlistId);
      if (!playlistInfo) {
        throw new Error('Playlist not found');
      }
      
      setLoadingProgress(50);
      
      // Load the playlist tracks
      const playlistData = await getPlaylist(playlistId);
      setLoadingProgress(75);
      
      if (isBase) {
        setBasePlaylist(playlistInfo);
        setBasePlaylistData(playlistData);
      } else {
        setComparePlaylist(playlistInfo);
        setComparePlaylistData(playlistData);
      }
      
      setLoadingProgress(100);
      
      // Clear previous results when changing playlists
      setDiffResult(null);
      setError(null);
    } catch (err) {
      setError('Failed to load playlist details');
      console.error('Error loading playlist:', err);
    } finally {
      setIsLoading(false);
      setLoadingProgress(0);
    }
  }, [getPlaylist, playlists]);

  const calculateDiff = useCallback(() => {
    if (!basePlaylistData || !comparePlaylistData) return;

    setIsLoading(true);
    setLoadingProgress(10);

    try {
      const baseTracks = basePlaylistData.tracks.items.map((item: { track: Track }) => item.track);
      const compareTracks = comparePlaylistData.tracks.items.map((item: { track: Track }) => item.track);
      
      setLoadingProgress(30);

      // Create sets for efficient lookup using track IDs
      const baseTrackIds = new Set(baseTracks.map((track: Track) => track.id));
      const compareTrackIds = new Set(compareTracks.map((track: Track) => track.id));
      
      setLoadingProgress(50);

      let resultTracks: Track[] = [];
      let description = '';

      switch (diffMode) {
        case 'intersection':
          resultTracks = baseTracks.filter((track: Track) => compareTrackIds.has(track.id));
          description = `Tracks found in both "${basePlaylist?.name}" and "${comparePlaylist?.name}"`;
          break;
          
        case 'base-only':
          resultTracks = baseTracks.filter((track: Track) => !compareTrackIds.has(track.id));
          description = `Tracks found only in "${basePlaylist?.name}"`;
          break;
          
        case 'compare-only':
          resultTracks = compareTracks.filter((track: Track) => !baseTrackIds.has(track.id));
          description = `Tracks found only in "${comparePlaylist?.name}"`;
          break;
          
        case 'union':
          const uniqueTrackIds = new Set<string>();
          resultTracks = [...baseTracks, ...compareTracks].filter((track: Track) => {
            if (uniqueTrackIds.has(track.id)) {
              return false;
            }
            uniqueTrackIds.add(track.id);
            return true;
          });
          description = `All unique tracks from both "${basePlaylist?.name}" and "${comparePlaylist?.name}"`;
          break;
          
        case 'symmetric-diff':
          const baseOnly = baseTracks.filter((track: Track) => !compareTrackIds.has(track.id));
          const compareOnly = compareTracks.filter((track: Track) => !baseTrackIds.has(track.id));
          resultTracks = [...baseOnly, ...compareOnly];
          description = `Tracks that exist in either playlist but not in both`;
          break;
      }

      setLoadingProgress(75);

      setDiffResult({
        tracks: resultTracks,
        count: resultTracks.length,
        description
      });

      setLoadingProgress(100);
    } catch (err) {
      setError('Failed to calculate playlist difference');
      console.error('Error calculating diff:', err);
    } finally {
      setIsLoading(false);
      setLoadingProgress(0);
    }
  }, [basePlaylistData, comparePlaylistData, diffMode, basePlaylist?.name, comparePlaylist?.name]);

  const canCalculateDiff = basePlaylistData && comparePlaylistData && !isLoading;
  const selectedModeInfo = diffModes.find(mode => mode.id === diffMode);

  return (
    <Box sx={{ py: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={onBack} sx={{ mr: 2 }} data-testid="back-to-tools">
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" component="h1">
            Playlist Diff Tool
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Compare two playlists and create new ones based on their differences
          </Typography>
        </Box>
      </Box>

      {/* Loading Progress */}
      {isLoading && loadingProgress > 0 && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress variant="determinate" value={loadingProgress} />
        </Box>
      )}

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Playlist Selection */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Select Playlists to Compare
              </Typography>
              
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <PlaylistSelector
                    playlists={playlists}
                    selectedPlaylist={basePlaylist}
                    onPlaylistSelect={(id) => handlePlaylistSelect(id, true)}
                    label="Base Playlist"
                    disabled={isLoading}
                    testId="base-playlist-selector"
                  />
                </Grid>
                
                <Grid size={{ xs: 12, md: 6 }}>
                  <PlaylistSelector
                    playlists={playlists}
                    selectedPlaylist={comparePlaylist}
                    onPlaylistSelect={(id) => handlePlaylistSelect(id, false)}
                    label="Compare With"
                    disabled={isLoading}
                    testId="compare-playlist-selector"
                  />
                </Grid>
              </Grid>

              {/* Playlist Info */}
              {(basePlaylist || comparePlaylist) && (
                <Box sx={{ mt: 2 }}>
                  {basePlaylist && (
                    <Box sx={{ mb: 1 }}>
                      <Chip
                        label={`Base: ${basePlaylist.name} (${basePlaylist.tracks.total} tracks)`}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                  )}
                  {comparePlaylist && (
                    <Box>
                      <Chip
                        label={`Compare: ${comparePlaylist.name} (${comparePlaylist.tracks.total} tracks)`}
                        color="secondary"
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Diff Mode Selection */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Comparison Mode
              </Typography>
              
              <FormControl component="fieldset" fullWidth>
                <RadioGroup
                  value={diffMode}
                  onChange={(e) => setDiffMode(e.target.value as DiffMode)}
                >
                  {diffModes.map((mode) => (
                    <Box key={mode.id} sx={{ mb: 1 }}>
                      <FormControlLabel
                        value={mode.id}
                        control={<Radio />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography
                              component="span"
                              sx={{
                                fontFamily: 'monospace',
                                fontWeight: 'bold',
                                color: mode.color,
                                minWidth: 30,
                                textAlign: 'center'
                              }}
                            >
                              {mode.icon}
                            </Typography>
                            <Box>
                              <Typography variant="body1" component="div">
                                {mode.label}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {mode.description}
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </Box>
                  ))}
                </RadioGroup>
              </FormControl>

              {/* Calculate Button */}
              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  onClick={calculateDiff}
                  disabled={!canCalculateDiff}
                  fullWidth
                  size="large"
                  startIcon={isLoading ? <CircularProgress size={20} /> : <CompareIcon />}
                >
                  {isLoading ? 'Calculating...' : 'Calculate Difference'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Results */}
        {diffResult && (
          <Grid size={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Results
                      <Chip 
                        label={selectedModeInfo?.label} 
                        color="primary" 
                        size="small" 
                        sx={{ ml: 2 }}
                      />
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {diffResult.description}
                    </Typography>
                  </Box>
                  
                  {diffResult.tracks.length > 0 && (
                    <SaveToSpotifyPlaylist
                      tracks={diffResult.tracks}
                      defaultPlaylistName={`${selectedModeInfo?.label} - ${basePlaylist?.name || 'Playlist'} & ${comparePlaylist?.name || 'Playlist'}`}
                      onSavePlaylist={async (name: string, tracks: Track[]) => {
                        try {
                          if (!token) throw new Error('No authentication token');
                          
                          // Get current user ID
                          const user = await getCurrentUser(token);
                          
                          // Create the playlist
                          const playlist = await createPlaylist(
                            token,
                            user.id,
                            name,
                            `Created from playlist diff: ${selectedModeInfo?.label} of ${basePlaylist?.name || 'Playlist'} and ${comparePlaylist?.name || 'Playlist'}`
                          );
                          
                          // Add tracks to the playlist if any exist
                          if (tracks.length > 0) {
                            const trackUris = tracks.map(track => track.uri);
                            await addTracksToPlaylist(token, playlist.id, trackUris);
                          }
                          
                          console.log('Playlist saved successfully:', name, tracks.length, 'tracks');
                        } catch (error) {
                          console.error('Error saving playlist:', error);
                          throw error; // Re-throw to show error in UI
                        }
                      }}
                    />
                  )}
                </Box>

                <Typography variant="h4" color="primary" gutterBottom>
                  {diffResult.count} tracks found
                </Typography>

                <Divider sx={{ my: 2 }} />

                {diffResult.tracks.length === 0 ? (
                  <Alert severity="info">
                    No tracks found with the selected comparison mode.
                  </Alert>
                ) : (
                  <Box sx={{ maxHeight: 600, overflow: 'auto' }}>
                    {diffResult.tracks.map((track, index) => (
                      <Box key={`${track.id}-${index}`} sx={{ mb: 1 }}>
                        <TrackCard track={track} />
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Save to Spotify Dialog - removed since SaveToSpotifyPlaylist handles its own dialog */}
    </Box>
  );
};

export default PlaylistDiff;
