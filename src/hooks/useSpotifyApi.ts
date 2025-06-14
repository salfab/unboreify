// src/hooks/useSpotifyApi.ts
import { useContext, useCallback, useState, useEffect } from 'react';
import * as spotifyService from '../services/spotifyService';
import { IAuthContext, AuthContext } from 'react-oauth2-code-pkce';

const useSpotifyApi = () => {
  const { token } = useContext<IAuthContext>(AuthContext);

  const [currentUser, setCurrentUser] = useState<spotifyService.SpotifyUser | null>(null);

  useEffect(() => {
    if (token) {
        // if (token && tokenData && tokenData.expiresAt && tokenData.expiresAt > Date.now()) {$
        spotifyService.getCurrentUser(token).then(setCurrentUser).catch(console.error);
    }
  }, [token]);
  
  const getCurrentTrack = useCallback(() => {
    return spotifyService.getCurrentTrack(token);
  }, [token]);

  const getUserPlaylists = useCallback(() => {
    return spotifyService.getUserPlaylists(token);
  }, [token]);

  const getPlaylist = useCallback((playlistId: string) => {
    return spotifyService.getPlaylist(token, playlistId);
  }, [token]);

  const getPlaylistTracks = useCallback((playlistId: string) => {
    return spotifyService.getPlaylistTracks(token, playlistId);
  }, [token]);

  const addToQueue = useCallback((uri: string, deviceId: string) => {
    return spotifyService.addToQueue(token, uri, deviceId);
  }, [token]);

  const getDevices = useCallback(() => {
    return spotifyService.getDevices(token);
  }, [token]);

  const getQueue = useCallback(() => {
    return spotifyService.getQueue(token);
  }, [token]);

  const getCurrentUser = useCallback(() => {
    return spotifyService.getCurrentUser(token);
  }, [token]);

  const getArtistTopTracks = useCallback((artistId: string) => {
    return spotifyService.getArtistTopTracks(token, artistId);
  }, [token]);

  const getRecentlyPlayedTracks = useCallback((after?: string, before?: string, limit: number = 50) => {
    return spotifyService.getRecentlyPlayedTracks(token, after, before, limit);
  }, [token]);

  const skipToNextTrack = useCallback(() => {
    return spotifyService.skipToNextTrack(token);
  }, [token]);

  const startPlayback = useCallback((uris: string[], deviceId?: string) => {
    return spotifyService.startPlayback(token, uris, deviceId);
  }, [token]);

  const getPlaybackState = useCallback(() => {
    return spotifyService.getPlaybackState(token);
  }, [token]);

  const getTracks = useCallback((trackIds: string[]) => {
    return spotifyService.getTracks(trackIds, token);
  }, [token]);

  const getTrackDetails = useCallback((trackId: string) => {
    return spotifyService.getTrackDetails(trackId, token);
  }, [token]);

  const getArtistId = useCallback((artistName: string) => {
    return spotifyService.getArtistId(token, artistName);
  }, [token]);

  const searchTracks = useCallback((query: string) => {
    return spotifyService.searchTracks(token, query);
  }, [token]);

  const createPlaylist = useCallback((userId: string, name: string, description?: string) => {
    return spotifyService.createPlaylist(token, userId, name, description);
  }, [token]);

  const addTracksToPlaylist = useCallback((playlistId: string, trackUris: string[]) => {
    return spotifyService.addTracksToPlaylist(token, playlistId, trackUris);
  }, [token]);

  return {
    getCurrentTrack,
    getUserPlaylists,
    getPlaylist,
    getPlaylistTracks,
    addToQueue,
    getDevices,
    getQueue,
    getCurrentUser,
    getArtistTopTracks,
    getArtistId,
    getRecentlyPlayedTracks,
    skipToNextTrack,
    startPlayback,
    getPlaybackState,
    getTracks,
    getTrackDetails,
    searchTracks,
    createPlaylist,
    addTracksToPlaylist,
    currentUser,
  };
};

export default useSpotifyApi;
