import React from 'react';
import { Card, CardContent, CardMedia, Typography, Box } from '@mui/material';
import { Track } from '../services/spotifyService';

interface TrackCardProps {
  track: Track;
}

const TrackCard: React.FC<TrackCardProps> = ({ track }) => (
  <Card sx={{ display: 'flex', marginBottom: 2 }}>
    <CardMedia
      component="img"
      sx={{ width: 151 }}
      image={track.album.images[0]?.url}
      alt={track.album.name}
    />
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
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
    </Box>
  </Card>
);

export default TrackCard;
