import { useEffect, useState } from 'react';
import axios from 'axios';

interface SpotifyUser {
  display_name: string;
  // Add other user properties if needed
}

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const RESPONSE_TYPE = 'token';

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
      axios.get<SpotifyUser>('https://api.spotify.com/v1/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(response => setUser(response.data))
      .catch(error => console.error(error));
    }
  }, [token]);

  const logout = () => {
    setToken(null);
    window.localStorage.removeItem('token');
  };

  const login = () => {
    window.location.href = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=user-read-private`;
  };

  return { token, user, login, logout };
};
