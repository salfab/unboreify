// src/services/spotifyService.ts
import axios from 'axios';

const BASE_URL = 'https://api.spotify.com/v1';

export interface SpotifyUser {
  display_name: string;
  images: { url: string }[];
  // Add other user properties if needed
}

export interface PlaylistTrack {
  added_at: string;
  added_by: {
    external_urls: {
      spotify: string;
    };
    href: string;
    id: string;
    type: string;
    uri: string;
  };
  is_local: boolean;
  primary_color: string | null;
  track: Track;
  video_thumbnail: {
    url: string | null;
  };
}


export interface PlaylistResponse {
  tracks : { items: { track: Track }[]};
  name : string;
  description: string;
}

export interface PlaylistTracksResponse {
  href: string;
  items: PlaylistTrack[];
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
}
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

export interface SpotifyQueue {
  currently_playing: Track;
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
export const SCOPES = 'user-read-currently-playing user-read-playback-state user-modify-playback-state user-read-recently-played user-modify-playback-state';

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

export const getPlaylist = async (token: string, playlistId: string): Promise<PlaylistResponse> => {
  const data = await getRequest<PlaylistResponse>(`${BASE_URL}/playlists/${playlistId}`, token);
  return data;
};

export const getPlaylistTracks = async (token: string, playlistId: string): Promise<PlaylistTracksResponse> => {
  const data = await getRequest<PlaylistTracksResponse>(`${BASE_URL}/playlists/${playlistId}/tracks`, token);
  return data;
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

const maxIdsPerCallGetTracks = 50;


/**
 * Fetches track details from Spotify.
 * @param trackId The Spotify track ID.
 * @param token The Spotify access token.
 * @returns A promise that resolves to a Track object.
 */
export const getTracks = async (trackIds: string[], token: string): Promise<Track[]> => {
  if (trackIds.length > maxIdsPerCallGetTracks) {
    return fetchTracksInBatches(trackIds, token);
  }
  const data = await getRequest<{tracks: Track[]}>(`${BASE_URL}/tracks?ids=${trackIds.join(',')}`, token);
  return data.tracks;
};

const  fetchTracksInBatches = async(trackIds: string[], token: string) : Promise<Track[]> =>{
  const trackChunks = [];

  for (let i = 0; i < trackIds.length; i += maxIdsPerCallGetTracks) {
    trackChunks.push(trackIds.slice(i, i + maxIdsPerCallGetTracks));
  }

  const allTracks = [];

  for (const chunk of trackChunks) {
    const tracks = await getTracks(chunk, token);
    allTracks.push(...tracks);
  }

  return allTracks;
}

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

