// src/services/spotifyService.ts
import axios from 'axios';

const BASE_URL = 'https://api.spotify.com/v1';

export interface Artist {
  name: string;
}

export interface Album {
  name: string;
  images: { url: string }[];
}

export interface Track {
  name: string;
  uri: string;
  artists: Artist[];
  album: Album;
}

export interface CurrentlyPlaying {
  track: Track;
}

export interface SpotifyQueue {
  currently_playing: CurrentlyPlaying;
  queue: Track[];
}

export const getCurrentTrack = async (token: string) => {
  const response = await axios.get(`${BASE_URL}/me/player/currently-playing`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getUserPlaylists = async (token: string) => {
  const response = await axios.get(`${BASE_URL}/me/playlists`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.items;
};

export const getPlaylistTracks = async (token: string, playlistId: string) => {
  const response = await axios.get(`${BASE_URL}/playlists/${playlistId}/tracks`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.items;
};

export const addToQueue = async (token: string, uri: string, deviceId: string) => {
  await axios.post(
    `${BASE_URL}/me/player/queue?uri=${uri}&device_id=${deviceId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const getDevices = async (token: string) => {
  const response = await axios.get(`${BASE_URL}/me/player/devices`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.devices;
};

export const getQueue = async (token: string): Promise<SpotifyQueue> => {
  const response = await axios.get(`${BASE_URL}/me/player/queue`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data as SpotifyQueue;
};

export const getCurrentUser = async (token: string) => {
  const response = await axios.get(`${BASE_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`},
  });
  return response.data;
};
