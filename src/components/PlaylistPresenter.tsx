import React, { useCallback, useState } from 'react';
import TrackCard from './TrackCard';
import { Typography, Grid, Collapse, IconButton, useMediaQuery, useTheme } from '@mui/material';
import { Track } from '../services/spotifyService';
import { ExpandLess, ExpandMore, QueueMusic as QueueMusicIcon } from '@mui/icons-material';

interface PlaylistPresenterProps {
    name: string;
    description: string;
    items: Track[];
    onBackToQueue: () => void;
}

const PlaylistPresenter: React.FC<PlaylistPresenterProps> = ({ name, items, onBackToQueue }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [isPlaylistOpen, setIsPlaylistOpen] = useState<boolean>(!isMobile);

    const toggleIsPlaylistOpen = useCallback(() => {
        setIsPlaylistOpen((prev) => !prev);
    }, []);

    return (
        <Grid item xs={12} sm={12}>
            <Typography variant="h4" gutterBottom>
                <IconButton onClick={onBackToQueue} size="small" edge="start">
                    <QueueMusicIcon />
                </IconButton>
                {name}
                {isMobile && (
                    <IconButton onClick={toggleIsPlaylistOpen} size="small">
                        {isPlaylistOpen ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                )}
            </Typography>
            <Grid container spacing={2}>
                <Collapse in={isPlaylistOpen || !isMobile} timeout="auto" unmountOnExit>
                    {items.map((track) => (
                        <Grid item xs={12} sm={12} key={track.id}>
                            <TrackCard track={track} />
                        </Grid>
                    ))}
                </Collapse>
            </Grid>
        </Grid>
    );
};

export default PlaylistPresenter;
