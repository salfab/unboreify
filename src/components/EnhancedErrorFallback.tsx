import React, { useState } from 'react';
import { FallbackProps } from 'react-error-boundary';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Stack,
  Chip,
  Collapse,
  Alert
} from '@mui/material';
import { 
  BugReport as BugIcon, 
  Refresh as RefreshIcon, 
  Visibility as VisibilityIcon,
  Home as HomeIcon 
} from '@mui/icons-material';

interface EnhancedErrorFallbackProps extends FallbackProps {
  // Additional props can be added here if needed
}

const EnhancedErrorFallback: React.FC<EnhancedErrorFallbackProps> = ({ 
  error, 
  resetErrorBoundary 
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [debugClicked, setDebugClicked] = useState(false);

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleShowDebugInfo = () => {
    setDebugClicked(true);
    setShowDetails(!showDetails);

    if (!debugClicked && error) {
      // Log detailed error information to console
      console.group('🐛 Error Boundary Debug Information');
      console.error('Error:', error);
      console.error('Error Message:', error.message);
      console.error('Error Stack:', error.stack);
      
      console.error('Full Error Info:', {
        error,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      });
      console.groupEnd();

      // Show a temporary alert that debug info was logged
      setTimeout(() => {
        alert('Debug information has been logged to the console and is now displayed on the page.');
      }, 100);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
      data-testid="enhanced-error-boundary"
    >
      <Card sx={{ maxWidth: 600, width: '100%' }}>
        <CardContent>
          <Stack spacing={3} alignItems="center">
            <BugIcon sx={{ fontSize: 60, color: 'error.main' }} />
            
            <Typography variant="h4" component="h1" align="center" gutterBottom>
              Oops! Something went wrong
            </Typography>
            
            <Typography variant="body1" align="center" color="text.secondary">
              Don't worry, this happens sometimes. You can try refreshing the page or go back to the home page.
            </Typography>

            <Stack direction="row" spacing={2} flexWrap="wrap" justifyContent="center">
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={resetErrorBoundary}
                data-testid="error-refresh-button"
              >
                Try Again
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<HomeIcon />}
                onClick={handleGoHome}
                data-testid="error-home-button"
              >
                Go Home
              </Button>
            </Stack>

            <Button
              variant="text"
              size="small"
              startIcon={<VisibilityIcon />}
              onClick={handleShowDebugInfo}
              data-testid="error-debug-button"
              sx={{ mt: 2 }}
            >
              {showDetails ? 'Hide' : 'Show'} Debug Info
            </Button>

            {debugClicked && (
              <Alert severity="info" sx={{ width: '100%' }}>
                Debug information has been logged to the browser console and is displayed below.
              </Alert>
            )}

            <Collapse in={showDetails} sx={{ width: '100%' }}>
              <Card variant="outlined" sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Technical Details
                  </Typography>
                  
                  {error && (
                    <Box sx={{ mb: 2 }}>
                      <Chip 
                        label={error.name || 'Error'} 
                        color="error" 
                        size="small" 
                        sx={{ mb: 1 }} 
                      />
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 2 }}>
                        <strong>Message:</strong> {error.message}
                      </Typography>
                      
                      {error.stack && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                            Stack Trace:
                          </Typography>
                          <Typography 
                            variant="body2" 
                            component="pre"
                            sx={{ 
                              fontFamily: 'monospace', 
                              fontSize: '0.75rem',
                              backgroundColor: 'grey.100',
                              p: 1,
                              borderRadius: 1,
                              overflow: 'auto',
                              maxHeight: '300px',
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-word'
                            }}
                          >
                            {error.stack}
                          </Typography>
                        </Box>
                      )}
                      
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                          <strong>URL:</strong> {window.location.href}
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                          <strong>User Agent:</strong> {navigator.userAgent}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  <Typography variant="caption" color="text.secondary">
                    Timestamp: {new Date().toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Collapse>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EnhancedErrorFallback;