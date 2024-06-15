import { FC, useMemo, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Slider, Typography, Box, IconButton, Popover } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

interface SettingsProps {
    open: boolean;
    onClose: () => void;
    currentPlaylistMultiplier: number;
    playlistMultiplierChangedCallback: (value: number) => void;
}

const valueTextMap: { [key: number]: string } = {
    1: "just right",
    2: "pushing it a bit",
    3: "going beyond",
    4: "almost too much",
    5: "turn it up to eleven",
};

const Settings: FC<SettingsProps> = ({ open, onClose, currentPlaylistMultiplier, playlistMultiplierChangedCallback }) => {
    const [playlistMileage, setPlaylistMileage] = useState(currentPlaylistMultiplier);
    const playlistMileageDisplay = useMemo(() => valueTextMap[playlistMileage], [playlistMileage]);

    const handleSliderChange = (_event: Event, newValue: number | number[]) => {
        playlistMultiplierChangedCallback(newValue as number);
        setPlaylistMileage(newValue as number);
    };

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleInfoClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleInfoClose = () => {
        setAnchorEl(null);
    };

    const openPopover = Boolean(anchorEl);
    const popoverId = openPopover ? 'info-popover' : undefined;

    return (
        <Dialog open={open} onClose={onClose} fullWidth>
            <DialogTitle>Settings</DialogTitle>
            <DialogContent>
                <Box display="flex" alignItems="center">
                    <Typography gutterBottom>
                        Playlist Mileage
                    </Typography>
                    <IconButton onClick={handleInfoClick}>
                        <InfoIcon />
                    </IconButton>
                    <Popover
                        id={popoverId}
                        open={openPopover}
                        anchorEl={anchorEl}
                        onClose={handleInfoClose}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                    >
                        <Box p={2}>
                            <Typography>
                                Craving more tunes? This determines how much longer your new playlist will keep the party going compared to the original.
                            </Typography>
                        </Box>
                    </Popover>
                </Box>
                <Slider
                    value={playlistMileage}
                    onChange={handleSliderChange}
                    aria-labelledby="playlist-mileage-slider"
                    valueLabelFormat={(v) => valueTextMap[v as number]}
                    step={1}
                    marks
                    min={1}
                    max={5}
                />
                <Box mt={2}>
                    <Typography align="center" variant="subtitle1">
                        {playlistMileageDisplay}
                    </Typography>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default Settings;
