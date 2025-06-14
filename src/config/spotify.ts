/**
 * Centralized Spotify configuration
 * All Spotify-related constants and configuration should be imported from here
 */

// Spotify OAuth scopes required by the application
export const SPOTIFY_SCOPES = [
  'user-read-private',
  'user-read-email',
  'user-read-currently-playing',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-recently-played',
  'playlist-read-private',
  'playlist-read-collaborative',
  'playlist-modify-public',
  'playlist-modify-private'
] as const;

// Spotify App credentials and URLs
export const SPOTIFY_CONFIG = {
  CLIENT_ID: import.meta.env.VITE_SPOTIFY_CLIENT_ID || '',
  REDIRECT_URI: import.meta.env.VITE_SPOTIFY_REDIRECT_URI || `${window.location.origin}/`,
  SCOPES: SPOTIFY_SCOPES.join(' '),
  API_BASE_URL: 'https://api.spotify.com/v1',
  ACCOUNTS_BASE_URL: 'https://accounts.spotify.com'
} as const;

// Spotify Auth URLs
export const SPOTIFY_URLS = {
  AUTHORIZE: `${SPOTIFY_CONFIG.ACCOUNTS_BASE_URL}/authorize`,
  TOKEN: `${SPOTIFY_CONFIG.ACCOUNTS_BASE_URL}/api/token`
} as const;

// Helper functions for Spotify configuration
export const getSpotifyAuthUrl = () => {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: SPOTIFY_CONFIG.CLIENT_ID,
    scope: SPOTIFY_CONFIG.SCOPES,
    redirect_uri: SPOTIFY_CONFIG.REDIRECT_URI,
    state: Math.random().toString(36).substring(7)
  });
  
  return `${SPOTIFY_URLS.AUTHORIZE}?${params.toString()}`;
};

export const getSpotifyApiUrl = (endpoint: string) => {
  return `${SPOTIFY_CONFIG.API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

// Type definitions for Spotify configuration
export type SpotifyScope = typeof SPOTIFY_SCOPES[number];
export type SpotifyConfig = typeof SPOTIFY_CONFIG;
