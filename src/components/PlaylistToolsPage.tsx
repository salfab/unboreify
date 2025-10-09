import React, { useState, useContext, useEffect } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Container,
  useTheme
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Compare as CompareIcon,
  Merge as MergeIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { IAuthContext, AuthContext } from 'react-oauth2-code-pkce';
import { useNavigate } from 'react-router-dom';
import PlaylistDiff from './PlaylistDiff';

type ToolType = 'diff' | 'merge' | 'analytics' | null;

const PlaylistToolsPage: React.FC = () => {
  const { token, loginInProgress } = useContext<IAuthContext>(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const [selectedTool, setSelectedTool] = useState<ToolType>(null);

  useEffect(() => {
    if (!token && !loginInProgress) {
      navigate('/');
    }
  }, [token, navigate, loginInProgress]);

  const handleBackToTools = () => {
    setSelectedTool(null);
  };

  const tools = [
    {
      id: 'diff' as ToolType,
      title: 'Playlist Diff',
      description: 'Compare two playlists and create new playlists based on their differences',
      icon: <CompareIcon fontSize="large" />,
      color: theme.palette.primary.main,
      features: [
        'Find tracks in both playlists',
        'Find tracks only in base playlist', 
        'Find tracks only in comparison playlist',
        'Multiple comparison modes'
      ]
    },
    {
      id: 'merge' as ToolType,
      title: 'Playlist Merger',
      description: 'Combine multiple playlists into one with various merge strategies',
      icon: <MergeIcon fontSize="large" />,
      color: theme.palette.secondary.main,
      features: [
        'Merge multiple playlists',
        'Remove duplicates',
        'Custom ordering strategies',
        'Smart recommendations'
      ],
      disabled: true // Coming soon
    },
    {
      id: 'analytics' as ToolType,
      title: 'Playlist Analytics',
      description: 'Analyze your playlists with detailed insights and statistics',
      icon: <AnalyticsIcon fontSize="large" />,
      color: theme.palette.success.main,
      features: [
        'Genre distribution',
        'Audio feature analysis',
        'Artist and album insights',
        'Listening patterns'
      ],
      disabled: true // Coming soon
    }
  ];

  if (selectedTool === 'diff') {
    return <PlaylistDiff onBack={handleBackToTools} />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Playlist Tools
        </Typography>
        <Typography variant="h6" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Powerful tools to manage, analyze, and enhance your Spotify playlists
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {tools.map((tool) => (
          <Grid key={tool.id} size={{ xs: 12, md: 4 }}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': !tool.disabled ? {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8],
                } : {},
                opacity: tool.disabled ? 0.7 : 1,
                position: 'relative'
              }}
            >
              {tool.disabled && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    bgcolor: 'warning.main',
                    color: 'warning.contrastText',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}
                >
                  COMING SOON
                </Box>
              )}
              
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Box sx={{ mb: 2, color: tool.color }}>
                  {tool.icon}
                </Box>
                
                <Typography variant="h5" component="h2" gutterBottom>
                  {tool.title}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {tool.description}
                </Typography>
                
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="subtitle2" gutterBottom color="primary">
                    Features:
                  </Typography>
                  {tool.features.map((feature, index) => (
                    <Typography key={index} variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      • {feature}
                    </Typography>
                  ))}
                </Box>
              </CardContent>
              
              <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => setSelectedTool(tool.id)}
                  disabled={tool.disabled}
                  data-testid={`${tool.id}-tool`}
                  sx={{
                    minWidth: 120,
                    backgroundColor: tool.color,
                    '&:hover': {
                      backgroundColor: tool.color,
                      filter: 'brightness(0.9)'
                    }
                  }}
                >
                  {tool.disabled ? 'Coming Soon' : 'Open Tool'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          More tools coming soon! Have suggestions? Let us know on our feedback channels.
        </Typography>
      </Box>
    </Container>
  );
};

export default PlaylistToolsPage;
