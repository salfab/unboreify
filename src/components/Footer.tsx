import React from 'react';
import { Container, Box, Typography, Link, IconButton } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';

const Footer: React.FC = () => {  return (
    <footer data-testid="footer">
      <Container maxWidth="md">
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          py={4}
        >
          <Box display="flex" alignItems="center" justifyContent="center">
            <Typography variant="body1">
              Made with ❤️ by{' '}
              <Link href="https://www.linkedin.com/in/fabio-salvalai/" target="_blank" rel="noopener noreferrer">
                Fabio Salvalai
              </Link>
            </Typography>
            <IconButton href="https://github.com/salfab/unboreify" target="_blank" rel="noopener noreferrer" sx={{ ml: 1 }}>
              <GitHubIcon />
            </IconButton>
          </Box>
          <Typography variant="body2">
            Big kudos to the work of{' '}
            <Link href="https://www.linkedin.com/in/attentioncoach/" target="_blank" rel="noopener noreferrer">
              Robert Dargavel Smith
            </Link>{' '}
            for his work on{' '}
            <Link href="https://github.com/teticio/Deej-AI" target="_blank" rel="noopener noreferrer">
              Deej-AI
            </Link>
          </Typography>
        </Box>
      </Container>
    </footer>
  );
};

export default Footer;
