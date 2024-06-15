import { FC, useMemo, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Slider, Typography, Box, Tooltip, IconButton } from '@mui/material';
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
  const handleSliderChange = (_event: Event, newValue: number | number[]) => {
    playlistMultiplierChangedCallback(newValue as number);
    setPlaylistMileage(newValue as number);
  };
  const [playlistMileage, setPlaylistMileage] = useState(currentPlaylistMultiplier);
  const playlistMileageDisplay = useMemo(() => valueTextMap[playlistMileage], [playlistMileage]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Settings</DialogTitle>
      <DialogContent>
        <Box display="flex" alignItems="center">
          <Typography gutterBottom>
            Playlist Mileage
          </Typography>
          <Tooltip title="Defines how much longer than the original playlist the generated alternative one will be">
            <IconButton>
              <InfoIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <Slider
          value={playlistMileage}
          onChange={handleSliderChange}
          aria-labelledby="playlist-mileage-slider"

          valueLabelFormat={(v) => {
            console.log('value label', v);
              return valueTextMap[v as number];
          }}
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
