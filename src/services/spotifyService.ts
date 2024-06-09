// src/services/spotifyService.ts
import axios from 'axios';

const BASE_URL = 'https://api.spotify.com/v1';

export interface Artist {
  name: string;
  id: string;
}

export interface Album {
  name: string;
  images: { url: string }[];
}

export interface Track {
  id : string;
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

export interface RecentlyPlayedItem {
  track: Track;
  played_at: string;
  context: {
    type: string;
    uri: string;
  };
}

export interface RecentlyPlayedResponse {
  items: RecentlyPlayedItem[];
  next: string;
  cursors: {
    after: string;
    before: string;
  };
  limit: number;
  href: string;
}

export interface PlaybackState {
  device: {
    id: string;
    is_active: boolean;
    is_restricted: boolean;
    name: string;
    type: string;
    volume_percent: number;
  };
  repeat_state: string;
  shuffle_state: boolean;
  context: {
    external_urls: {
      spotify: string;
    };
    href: string;
    type: string;
    uri: string;
  };
  timestamp: number;
  progress_ms: number;
  is_playing: boolean;
  item: Track;
}

// Utility function to create headers
const createHeaders = (token: string) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Utility function for GET requests with generics
const getRequest = async <T>(url: string, token: string): Promise<T> => {
  const response = await axios.get(url, createHeaders(token));
  return response.data;
};

// Utility function for POST requests
const postRequest = async (url: string, token: string, data: any = {}) => {
  const response = await axios.post(url, data, createHeaders(token));
  return response.data;
};

// Utility function for PUT requests
const putRequest = async (url: string, token: string, data: any = {}) => {
  const response = await axios.put(url, data, createHeaders(token));
  return response.data;
};

export const getCurrentTrack = async (token: string) => {
  return await getRequest<Track>(`${BASE_URL}/me/player/currently-playing`, token);
};

export const getUserPlaylists = async (token: string) => {
  const data = await getRequest<{ items: any[] }>(`${BASE_URL}/me/playlists`, token);
  return data.items;
};

export const getPlaylistTracks = async (token: string, playlistId: string) => {
  const data = await getRequest<{ items: any[] }>(`${BASE_URL}/playlists/${playlistId}/tracks`, token);
  return data.items;
};

export const addToQueue = async (token: string, uri: string, deviceId: string) => {
  await postRequest(`${BASE_URL}/me/player/queue?uri=${uri}&device_id=${deviceId}`, token);
};

export const getDevices = async (token: string) => {
  const data = await getRequest<{ devices: any[] }>(`${BASE_URL}/me/player/devices`, token);
  return data.devices;
};

export const getQueue = async (token: string): Promise<SpotifyQueue> => {
  return await getRequest<SpotifyQueue>(`${BASE_URL}/me/player/queue`, token);
};

export const getCurrentUser = async (token: string) => {
  return await getRequest<any>(`${BASE_URL}/me`, token);
};

export const getArtistTopTracks = async (token: string, artistId: string) => {
  const data = await getRequest<{ tracks: any[] }>(`${BASE_URL}/artists/${artistId}/top-tracks?market=US`, token);
  return data.tracks;
};

export const getRecentlyPlayedTracks = async (token: string, after?: string, before?: string, limit: number = 50): Promise<RecentlyPlayedResponse> => {
  let url = `${BASE_URL}/me/player/recently-played?limit=${limit}`;
  if (after) {
    url += `&after=${after}`;
  } else if (before) {
    url += `&before=${before}`;
  }
  return await getRequest<RecentlyPlayedResponse>(url, token);
};

export const skipToNextTrack = async (token: string) => {
  await postRequest(`${BASE_URL}/me/player/next`, token);
};

export const startPlayback = async (token: string, uris: string[], deviceId?: string) => {
  const url = `${BASE_URL}/me/player/play${deviceId ? `?device_id=${deviceId}` : ''}`;
  const data = {
    uris,
  };
  await putRequest(url, token, data);
};

export const getPlaybackState = async (token: string): Promise<PlaybackState> => {
  return await getRequest<PlaybackState>(`${BASE_URL}/me/player`, token);
};


/**
 * Fetches track details from Spotify.
 * @param trackId The Spotify track ID.
 * @param token The Spotify access token.
 * @returns A promise that resolves to a Track object.
 */
export const getTrackDetails = async (trackId: string, token: string): Promise<Track> => {
  const data = await getRequest<any>(`${BASE_URL}/tracks/${trackId}`, token);
  return {
    name: data.name,
    uri: data.uri,
    artists: data.artists.map((artist: any) => ({ name: artist.name, id: artist.id })),
    album: {
      name: data.album.name,
      images: data.album.images,
    },
  } as Track;
};

