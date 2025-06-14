import React, { useState } from 'react';
import { 
  IconButton, 
  Tooltip, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button, 
  Box,
  Typography,
  CircularProgress
} from '@mui/material';
import { PlaylistAdd as PlaylistAddIcon } from '@mui/icons-material';
import { Track } from '../services/spotifyService';

interface SaveToSpotifyPlaylistProps {
  tracks: Track[];
  defaultPlaylistName: string;
  onSavePlaylist: (playlistName: string, tracks: Track[]) => Promise<void>;
  sx?: any;
}

export const SaveToSpotifyPlaylist: React.FC<SaveToSpotifyPlaylistProps> = ({
  tracks,
  defaultPlaylistName,
  onSavePlaylist,
  sx = {}
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [playlistName, setPlaylistName] = useState(defaultPlaylistName);
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenDialog = () => {
    setPlaylistName(defaultPlaylistName);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setIsSaving(false);
  };

  const handleSave = async () => {
    if (!playlistName.trim()) return;
    
    setIsSaving(true);
    try {
      await onSavePlaylist(playlistName.trim(), tracks);
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving playlist:', error);
      setIsSaving(false);
    }
  };

  return (
    <>
      <Tooltip title="Save this masterpiece to Spotify before it gets too cool for school! 🎵✨">
        <IconButton 
          onClick={handleOpenDialog} 
          size="small" 
          sx={{ 
            marginLeft: 1, 
            color: 'success.main',
            '&:hover': {
              color: 'success.dark',
              transform: 'scale(1.1)',
            },
            transition: 'all 0.2s ease-in-out',
            ...sx 
          }}
        >
          <PlaylistAddIcon />
        </IconButton>
      </Tooltip>

      <Dialog 
        open={isDialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: 'background.paper',
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #1DB954, #1ed760)',
          color: 'white',
          textAlign: 'center',
          fontSize: '1.5rem',
          fontWeight: 'bold'
        }}>
          Save to Spotify Playlist
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
            Give your unborified playlist a name that rocks! 🚀
          </Typography>
          
          <TextField
            fullWidth
            label="Playlist Name"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
            placeholder="Enter your awesome playlist name..."
            variant="outlined"
            autoFocus
            disabled={isSaving}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#1DB954',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#1DB954',
                },
              },
            }}
          />
          
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              📊 {tracks.length} tracks ready to rock
            </Typography>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={handleCloseDialog}
            disabled={isSaving}
            sx={{ 
              color: 'text.secondary',
              '&:hover': { bgcolor: 'action.hover' }
            }}
          >
            Cancel
          </Button>
          
          <Button
            onClick={handleSave}
            disabled={!playlistName.trim() || isSaving}
            variant="contained"
            startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <PlaylistAddIcon />}
            sx={{
              background: 'linear-gradient(135deg, #1DB954, #1ed760)',
              color: 'white',
              fontWeight: 'bold',
              px: 3,
              '&:hover': {
                background: 'linear-gradient(135deg, #1ed760, #1DB954)',
              },
              '&:disabled': {
                background: 'rgba(0, 0, 0, 0.12)',
                color: 'rgba(0, 0, 0, 0.26)',
              },
            }}
          >
            {isSaving ? 'Creating...' : 'Save to Spotify'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SaveToSpotifyPlaylist;
