import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import './index.css';
import { AuthProvider, TAuthConfig, TRefreshTokenExpiredEvent } from 'react-oauth2-code-pkce';
import { SCOPES } from './services/spotifyService';

const theme = createTheme();
// Register service worker in your main js file
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
  .then(function(registration) {
    console.log('Service Worker registered with scope:', registration.scope);
  })
  .catch(function(err) {
    console.log('Service Worker registration failed:', err);
  });
}
const authConfig: TAuthConfig = {
  autoLogin: false,
  storageKeyPrefix: 'SPOTIFY_',
  clientId: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
  redirectUri: import.meta.env.VITE_SPOTIFY_REDIRECT_URI,
  scope: SCOPES,
  tokenExpiresIn: 3600,
  refreshTokenExpiresIn: 31_536_000, // 365 days
  decodeToken: false,
  onRefreshTokenExpire: (event: TRefreshTokenExpiredEvent) => event.logIn(undefined, undefined, "popup"),
}


ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider authConfig={authConfig}>
        <App /> 
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
