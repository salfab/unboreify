import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  IconButton,
  useTheme,
  alpha
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Compare as CompareIcon,
  Build as BuildIcon
} from '@mui/icons-material';
import PlaylistDiff from './PlaylistDiff';

type ToolType = 'diff' | null;

interface ToolConfig {
  id: ToolType;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const TOOLS: ToolConfig[] = [
  {
    id: 'diff',
    title: 'Playlist Diff',
    description: 'Compare two playlists and create new ones based on their differences or similarities',
    icon: <CompareIcon sx={{ fontSize: 48 }} />,
    color: '#2196f3'
  }
];

interface PlaylistToolsProps {
  onBack: () => void;
}

const PlaylistTools: React.FC<PlaylistToolsProps> = ({ onBack }) => {
  const theme = useTheme();
  const [selectedTool, setSelectedTool] = useState<ToolType>(null);

  const handleToolSelect = (toolId: ToolType) => {
    setSelectedTool(toolId);
  };

  const handleBackToTools = () => {
    setSelectedTool(null);
  };

  if (selectedTool === 'diff') {
    return <PlaylistDiff onBack={handleBackToTools} />;
  }

  return (
    <Box sx={{ py: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton onClick={onBack} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <BuildIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
            Playlist Tools
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Advanced tools for managing and analyzing your Spotify playlists
          </Typography>
        </Box>
      </Box>

      {/* Tools Grid */}
      <Grid container spacing={3}>
        {TOOLS.map((tool) => (
          <Grid key={tool.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8],
                  '& .tool-icon': {
                    transform: 'scale(1.1)',
                    color: tool.color
                  }
                }
              }}
              onClick={() => handleToolSelect(tool.id)}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 4 }}>
                <Box 
                  className="tool-icon"
                  sx={{ 
                    mb: 2, 
                    color: theme.palette.text.secondary,
                    transition: 'all 0.2s ease-in-out',
                    display: 'flex',
                    justifyContent: 'center'
                  }}
                >
                  {tool.icon}
                </Box>
                
                <Typography variant="h6" component="h2" gutterBottom>
                  {tool.title}
                </Typography>
                
                <Typography variant="body2" color="text.secondary">
                  {tool.description}
                </Typography>
              </CardContent>
              
              <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                <Button 
                  variant="contained" 
                  sx={{ 
                    backgroundColor: tool.color,
                    '&:hover': {
                      backgroundColor: alpha(tool.color, 0.8)
                    }
                  }}
                >
                  Open Tool
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Coming Soon Section */}
      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom color="text.secondary">
          More Tools Coming Soon
        </Typography>
        <Typography variant="body1" color="text.secondary">
          We&apos;re working on additional playlist management tools like duplicate removal, 
          smart filtering, and advanced analytics.
        </Typography>
      </Box>
    </Box>
  );
};

export default PlaylistTools;
