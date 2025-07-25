import React from 'react';
import App from './App';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import './index.css';
import { AuthProvider, TAuthConfig, TRefreshTokenExpiredEvent } from 'react-oauth2-code-pkce';
import { SPOTIFY_CONFIG, SPOTIFY_URLS } from './config/spotify';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorDisplay from './components/ErrorDisplay';

const theme = createTheme();
// Register service worker in your main js file
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then(function (registration) {
      console.log('Service Worker registered with scope:', registration.scope);
    })
    .catch(function (err) {
      console.log('Service Worker registration failed:', err);
    });
}
const authConfig: TAuthConfig = {
  autoLogin: false,
  storageKeyPrefix: 'SPOTIFY_',
  clientId: SPOTIFY_CONFIG.CLIENT_ID,
  authorizationEndpoint: SPOTIFY_URLS.AUTHORIZE,
  tokenEndpoint: SPOTIFY_URLS.TOKEN,
  redirectUri: SPOTIFY_CONFIG.REDIRECT_URI,
  scope: SPOTIFY_CONFIG.SCOPES,
  tokenExpiresIn: 3600,
  refreshTokenExpiresIn: 31_536_000, // 365 days
  decodeToken: false,
  onRefreshTokenExpire: (event: TRefreshTokenExpiredEvent) => event.logIn(undefined, undefined, "popup"),
}

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <ErrorBoundary FallbackComponent={ErrorDisplay} onError={cleanup}>

    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider authConfig={authConfig}>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </React.StrictMode>
  </ErrorBoundary>);

function cleanup(): void {
  // in case there is an unrecoverable error, let's clear the local storage and refresh the app.
  localStorage.clear();
  sessionStorage.clear();
  window.location.reload();
}

