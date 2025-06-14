// src/hooks/useSpotifyAuth.ts
import { useEffect, useState } from 'react';
import { SpotifyUser, getCurrentUser } from '../services/spotifyService';
import { SPOTIFY_CONFIG, SPOTIFY_URLS } from '../config/spotify';






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
    window.location.href = `${SPOTIFY_URLS.AUTHORIZE}?client_id=${SPOTIFY_CONFIG.CLIENT_ID}&redirect_uri=${SPOTIFY_CONFIG.REDIRECT_URI}&response_type=token&scope=${encodeURIComponent(SPOTIFY_CONFIG.SCOPES)}`;
  };

  return { token, user, login, logout };
};
