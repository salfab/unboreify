import React, { useState } from 'react';
import { Button, Box, Typography, Card, CardContent } from '@mui/material';
import { BugReport as BugIcon } from '@mui/icons-material';

const ErrorTrigger: React.FC = () => {
  const [shouldError, setShouldError] = useState(false);

  if (shouldError) {
    // This will trigger the error boundary
    throw new Error('This is a test error triggered intentionally for testing the error boundary');
  }

  const triggerError = () => {
    setShouldError(true);
  };

  const triggerAsyncError = () => {
    // Trigger an error in a setTimeout (won't be caught by error boundary)
    setTimeout(() => {
      throw new Error('Async error - this will not be caught by error boundary');
    }, 1000);
  };

  const triggerPromiseError = () => {
    // Trigger an error in a promise (won't be caught by error boundary)
    Promise.reject(new Error('Promise error - this will not be caught by error boundary'));
  };

  return (
    <Card sx={{ m: 2, maxWidth: 400 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <BugIcon sx={{ mr: 1, color: 'warning.main' }} />
          <Typography variant="h6">
            Error Boundary Test
          </Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Use these buttons to test the error boundary behavior:
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button 
            variant="contained" 
            color="error" 
            onClick={triggerError}
            data-testid="trigger-sync-error"
          >
            Trigger Sync Error (Caught)
          </Button>
          
          <Button 
            variant="outlined" 
            color="warning" 
            onClick={triggerAsyncError}
            data-testid="trigger-async-error"
          >
            Trigger Async Error (Not Caught)
          </Button>
          
          <Button 
            variant="outlined" 
            color="warning" 
            onClick={triggerPromiseError}
            data-testid="trigger-promise-error"
          >
            Trigger Promise Error (Not Caught)
          </Button>
        </Box>
        
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          Note: Only synchronous errors in render/lifecycle methods are caught by error boundaries.
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ErrorTrigger;