import React from 'react';
import { Card, CardContent, CardMedia, Typography, Box, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import { Track } from '../services/spotifyService';

interface TrackCardProps {
  track: Track;
  onRemove?: (track: Track) => void;
}

const TrackCard: React.FC<TrackCardProps> = ({ track, onRemove }) => (
  <Card sx={{ display: 'flex', marginBottom: 2, position: 'relative' }} data-testid="track-card">
    <CardMedia
      component="img"
      sx={{ width: 151 }}
      image={track.album.images[0]?.url}
      alt={track.album.name}
    />
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <CardContent sx={{ flex: '1 0 auto' }}>
        <Typography component="div" variant="h6">
          {track.name}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" component="div">
          {track.artists.map(artist => artist.name).join(', ')}
        </Typography>
        <Typography variant="subtitle2" color="text.secondary" component="div">
          {track.album.name}
        </Typography>
      </CardContent>
    </Box>    {onRemove && (
      <IconButton
        onClick={() => onRemove(track)}
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          color: 'white',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
          },
          width: 32,
          height: 32,
        }}
        size="small"
        title="Remove track"
        data-testid="remove-track-button"
      >
        <Close fontSize="small" />
      </IconButton>
    )}
  </Card>
);

export default TrackCard;
