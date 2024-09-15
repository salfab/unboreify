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
  tracks: { items: { track: Track }[] };
  name: string;
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
  id: string;
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

// Utility function to refresh the token and retry the request
const handleRequest = async <T>(token: string, request: (safeToken: string) => Promise<T>): Promise<T> => {
  try {
    return await request(token);
  } catch (error: any) {
    if (error.response && error.response.status === 401) {

      const newToken = await TokenManager.refreshToken();
      return await request(newToken);
    }
    throw error;
  }
};

// Utility function for GET requests with generics
const getRequest = async <T>(url: string, token: string): Promise<T> => {
  return handleRequest(token, (safeToken: string) => axios.get(url, createHeaders(safeToken)).then((response) => response.data));
};

// Utility function for POST requests
const postRequest = async (url: string, token: string, data: any = {}) => {
  return handleRequest(token, (safeToken) => axios.post(url, data, createHeaders(safeToken)).then((response) => response.data));
};

// Utility function for PUT requests
const putRequest = async (url: string, token: string, data: any = {}) => {
  return handleRequest(token, (safeToken) => axios.put(url, data, createHeaders(safeToken)).then((response) => response.data));
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
  const data = await getRequest<{ devices: {id: string}[] }>(`${BASE_URL}/me/player/devices`, token);
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
/**
 * Fetches the Spotify Artist ID based on the artist's name
 * @param token - Spotify API token for authentication
 * @param artistName - The name of the artist to search
 * @returns A promise that resolves to the artist's ID if found, or null if not found
 */
export const getArtistId = async (token: string, artistName: string): Promise<string | null> => {
  try {
    const data = await getRequest<{ artists: { items: { id: string }[] } }>(
      `${BASE_URL}/search?q=${encodeURIComponent(artistName)}&type=artist&limit=1`, 
      token
    );
    
    // If the artist is found, return the ID of the first matching result
    if (data.artists.items.length > 0) {
      return data.artists.items[0].id;
    }
    
    // If no artist is found, return null
    return null;
  } catch (error) {
    console.error('Error fetching artist ID:', error);
    return null;
  }
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
  const data = await getRequest<{ tracks: Track[] }>(`${BASE_URL}/tracks?ids=${trackIds.join(',')}`, token);
  return data.tracks;
};

const fetchTracksInBatches = async (trackIds: string[], token: string): Promise<Track[]> => {
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


/**
 * Dirty workaround around the fact the oauth pkce lib doesn't expose the refresh token publicly tu manually refresh the access token.
 * This is to implement a retry in case  we make a call, and the access token couldn't be refreshed in time and is now expired.
 */
class TokenManager {
  private static isRefreshing: boolean = false;
  private static pendingPromise: Promise<string> | null = null;

  static async refreshToken(): Promise<string> {
    const refreshToken = (localStorage.getItem('SPOTIFY_refreshToken') as string)
    if (this.isRefreshing) {
      // Wait for the ongoing refresh to complete and then return the token from local storage
      await this.pendingPromise;
      return localStorage.getItem('SPOTIFY_token') || '';
    }

    this.isRefreshing = true;
    this.pendingPromise = this.refreshSpotifyToken(refreshToken);

    try {
      const token = await this.pendingPromise;
      localStorage.setItem('SPOTIFY_token', token);
      return token;
    } finally {
      this.isRefreshing = false;
      this.pendingPromise = Promise.resolve('read the token that was just retrieved ✨');
    }
  }


  
/**
 * Function to perform an HTTP POST request to the Spotify token endpoint
 * @param refreshToken - The refresh token to use for the request
 * @param clientId - The client ID of the Spotify application
 * @param redirectUri - The redirect URI registered with the Spotify application
 * @param scope - The scope of the access request
 */
static async refreshSpotifyToken(refreshToken: string): Promise<string> {
  const endpoint = 'https://accounts.spotify.com/api/token';
  const grantType = 'refresh_token';


  const params = new URLSearchParams();
  params.append('grant_type', grantType);
  params.append('refresh_token', refreshToken.slice(1, -1));
  params.append('client_id', import.meta.env.VITE_SPOTIFY_CLIENT_ID);
  params.append('redirect_uri', import.meta.env.VITE_SPOTIFY_REDIRECT_URI);
  params.append('scope', SCOPES);

  try {
    const response = await axios.post(endpoint, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });



    const access_token = response.data.access_token;
    const refresh_token = `"${response.data.refresh_token}"`;
    // TODO : try to find a way that is more resilient to config changes.
    localStorage.setItem('SPOTIFY_token', `"${access_token}"`);
    localStorage.setItem('SPOTIFY_refreshToken', refresh_token);
    return access_token as string;

  } catch (error) {
    console.error('Error fetching token:', error);
    throw error;
  }
}
}

export function searchTracks(token: string, query: string): Promise<Track[]> {
  return getRequest<{ tracks: { items: Track[] } }>(`${BASE_URL}/search?q=${encodeURIComponent(query)}&type=track&limit=10`, token)
    .then((response) => response.tracks.items);
}
