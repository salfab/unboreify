import { getTrackDetails, Track, getRecentlyPlayedTracks } from './spotifyService';
import { getSuggestions, searchTrack, SuggestionRequest } from './deejaiService';
import { loadValidatedTrackIds, addValidatedTrackId } from './localStorageService';

const BATCH_SIZE = 40 ;

export type ProgressCallback = (progress: { phase: string; percentage: number }) => void;

/**
 * Searches for a valid track ID.
 * @param track - The track to search for.
 * @returns The valid track ID.
 */
const searchForTrackId = async (track: Track): Promise<string | null> => {
  const searchTerm = `${track.artists[0].name} ${track.name}`;
  const searchResponse = await searchTrack(searchTerm);
  const foundTrack = searchResponse.find(item => item.track_id === track.uri.split(':')[2]);
  return foundTrack ? foundTrack.track_id : (searchResponse[0]?.track_id || null);
};

/**
 * Builds an alternative playlist based on the provided queue data.
 * @param token - The Spotify access token.
 * @param queueData - The Spotify queue data.
 * @param progressCallback - A callback to report progress.
 * @returns An alternative playlist.
 */
export const buildAlternativePlaylist = async (
    token: string,
    tracks: Track[],
    lengthMultiplier = 1,
    progressCallback: ProgressCallback
  ): Promise<Track[]> => {
    const validatedTrackIds = loadValidatedTrackIds();
  
    progressCallback({ phase: 'Fetching recently played tracks', percentage: 10 });
    const recentlyPlayed = await getRecentlyPlayedTracks(token);
    const recentlyPlayedUris = new Set(recentlyPlayed.items.map(item => item.track.uri));
    const existingUris = new Set(tracks.map(track => track.uri));
  
    const validTrackIds: string[] = [];
    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      progressCallback({ phase: `Searching for track ID (${i + 1}/${tracks.length})`, percentage: 20 + (i / tracks.length) * 30 });
      const cachedEntry = validatedTrackIds.get(track.uri);
  
      if (cachedEntry) {
        validTrackIds.push(cachedEntry.id);
        // Update the timestamp
        addValidatedTrackId(track.uri, cachedEntry.id);
      } else {
        try {
          const validTrackId = await searchForTrackId(track);
          if (validTrackId) {
            validTrackIds.push(validTrackId);
            addValidatedTrackId(track.uri, validTrackId);
          }
        } catch (error) {
          console.error('Error searching for track ID:', error);
        }
      }
    }
  
    validTrackIds.forEach((trackId) => {
      existingUris.add(`spotify:track:${trackId}`);
    });
  
    const alternativePlaylist: Track[] = [];
    const adjustedBatchSize = Math.round(BATCH_SIZE / lengthMultiplier);
    for (let i = 0; i < validTrackIds.length; i += adjustedBatchSize) {
      const batch = validTrackIds.slice(i, i + adjustedBatchSize);
      const payload: SuggestionRequest = {
        track_ids: batch,
        size: lengthMultiplier,
        creativity: 0.99,
        noise: 0,
      };
  
      progressCallback({ phase: `Fetching suggestions for batch ${i / adjustedBatchSize + 1}`, percentage: 50 + (i / validTrackIds.length) * 50 });
  
      try {
        const suggestionResponse = await getSuggestions(payload);
        const suggestionTracks = await Promise.all(
          suggestionResponse.track_ids.map(trackId => getTrackDetails(trackId, token))
        );
  
        const filteredTracks = suggestionTracks.filter(
          (track: Track) => !recentlyPlayedUris.has(track.uri) && !existingUris.has(track.uri)
        );
  
        alternativePlaylist.push(...filteredTracks);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    }
  
    progressCallback({ phase: 'Completed', percentage: 100 });
    return alternativePlaylist;
  };