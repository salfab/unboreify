// src/hooks/useSpotifyAuth.ts
import { useEffect, useState } from 'react';
import { getCurrentUser } from '../services/spotifyService';

interface SpotifyUser {
  display_name: string;
  images: { url: string }[];
  // Add other user properties if needed
}
const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const RESPONSE_TYPE = 'token';
const SCOPES = 'user-read-currently-playing user-read-playback-state user-modify-playback-state user-read-recently-played user-modify-playback-state';




export const useSpotifyAuth = () => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<SpotifyUser | null>(null);

  useEffect(() => {
    const hash = window.location.hash;
    let token = window.localStorage.getItem('token');

    if (!token && hash) {
      token = hash.substring(1).split('&').find(elem => elem.startsWith('access_token'))?.split('=')[1] ?? null;

      if (token) {
        window.location.hash = '';
        window.localStorage.setItem('token', token);
      }
    }

    setToken(token);

  }, []);

  useEffect(() => {
    if (token) {
      getCurrentUser(token).then(setUser).catch(console.error);
    }
  }, [token]);

  const logout = () => {
    setToken(null);
    window.localStorage.removeItem('token');
  };

  const login = () => {
    window.location.href = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${encodeURIComponent(SCOPES)}`;
  };

  return { token, user, login, logout };
};
