import React, { useCallback, useState } from 'react';
import TrackCard from './TrackCard';
import Typography from '@mui/material/Typography';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import useMediaQuery from '@mui/material/useMediaQuery';
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import { Track } from '../services/spotifyService';
import { ExpandLess, ExpandMore, QueueMusic as QueueMusicIcon, AutoFixHigh as AutoFixHighIcon } from '@mui/icons-material';

interface PlaylistPresenterProps {
    name: string;
    description: string;
    items: Track[];
    onBackToQueue: () => void;
    onEnhance?: () => void;
    enhanceMode?: 'extend' | 'alternative';
    onRemoveTrack?: (track: Track) => void;
}

const PlaylistPresenter: React.FC<PlaylistPresenterProps> = ({ name, items, onBackToQueue, onEnhance, enhanceMode, onRemoveTrack }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [isPlaylistOpen, setIsPlaylistOpen] = useState<boolean>(!isMobile);

    const toggleIsPlaylistOpen = useCallback(() => {
        setIsPlaylistOpen((prev) => !prev);
    }, []);

    return (
        <Grid container>
            <Typography 
                variant="h4" 
                gutterBottom
                display="flex"
                alignItems="center"
            >
                <IconButton onClick={onBackToQueue} size="small" edge="start">
                    <QueueMusicIcon />
                </IconButton>
                {name}
                
                {onEnhance && (
                    <Tooltip title="Go all CSI and ENHANCE your playlist ! Add similar songs to make it even better 🔍✨">
                        <IconButton onClick={onEnhance} size="small" sx={{ marginLeft: 1 }}>
                            <AutoFixHighIcon sx={{ color: enhanceMode === 'extend' ? 'primary.main' : 'text.primary' }} />
                        </IconButton>
                    </Tooltip>
                )}
                
                {isMobile && (
                    <IconButton onClick={toggleIsPlaylistOpen} size="small">
                        {isPlaylistOpen ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                )}
            </Typography>
            <Grid size={12}>
                <Collapse in={isPlaylistOpen || !isMobile} timeout="auto" unmountOnExit>
                    {items.map((track) => (
                        <Grid key={track.id} size={12} sx={{ mb: 1 }}>
                            <TrackCard 
                                track={track} 
                                onRemove={onRemoveTrack}
                            />
                        </Grid>
                    ))}
                </Collapse>
            </Grid>
        </Grid>
    );
};

export default PlaylistPresenter;
