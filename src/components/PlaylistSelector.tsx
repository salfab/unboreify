import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Avatar,
  SelectChangeEvent
} from '@mui/material';
import { SpotifyPlaylist } from '../services/spotifyService';

interface PlaylistSelectorProps {
  playlists: SpotifyPlaylist[];
  selectedPlaylist: SpotifyPlaylist | null;
  onPlaylistSelect: (playlistId: string) => void;
  label: string;
  disabled?: boolean;
  testId?: string;
}

const PlaylistSelector: React.FC<PlaylistSelectorProps> = ({
  playlists,
  selectedPlaylist,
  onPlaylistSelect,
  label,
  disabled = false,
  testId
}) => {
  const handleChange = (event: SelectChangeEvent<string>) => {
    onPlaylistSelect(event.target.value);
  };

  return (
    <FormControl fullWidth disabled={disabled}>
      <InputLabel>{label}</InputLabel>
      <Select
        value={selectedPlaylist?.id || ''}
        label={label}
        onChange={handleChange}
        data-testid={testId}
        renderValue={(value) => {
          const playlist = playlists.find(p => p.id === value);
          if (!playlist) return '';
          
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar
                src={playlist.images?.[0]?.url}
                sx={{ width: 24, height: 24 }}
                variant="square"
              />
              <Typography variant="body2" noWrap>
                {playlist.name}
              </Typography>
            </Box>
          );
        }}
      >
        {playlists.map((playlist) => (
          <MenuItem key={playlist.id} value={playlist.id}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
              <Avatar
                src={playlist.images?.[0]?.url}
                sx={{ width: 32, height: 32 }}
                variant="square"
              />
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography variant="body2" noWrap>
                  {playlist.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {playlist.tracks.total} tracks
                </Typography>
              </Box>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default PlaylistSelector;
