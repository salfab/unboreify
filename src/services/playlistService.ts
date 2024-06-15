import { RecentlyPlayedResponse, Track, getTracks } from './spotifyService';
import { getSuggestions, searchTrack, SuggestionRequest } from './deejaiService';
import { loadValidatedTrackIds, addValidatedTrackId } from './localStorageService';

const DEEJAI_BATCH_SIZE = 40;

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
  progressCallback: ProgressCallback,
  mode: 'extend' | 'alternative' = 'alternative',
  signal: AbortSignal
): Promise<Track[]> => {

  const checkAbort = () => {
    if (signal.aborted) {
    progressCallback({ phase: 'Operation aborted', percentage: 100 });
      const error = new Error('Operation aborted');
      throw error.name = 'AbortError';
    }
  };

  const validatedTrackIds = loadValidatedTrackIds();

  progressCallback({ phase: 'Fetching recently played tracks', percentage: 10 });
  checkAbort();
  const recentlyPlayed : RecentlyPlayedResponse = { items: [], cursors: {after: '0', before: '0'}, href: '', limit: 0, next: '0'} // await getRecentlyPlayedTracks(token);
  const recentlyPlayedUris = new Set(recentlyPlayed.items.map(item => item.track.uri));
  const existingUris = new Set(tracks.map(track => track.uri));

  const validTrackIds: string[] = [];
  for (let i = 0; i < tracks.length; i++) {
    checkAbort();

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
        } else {
          console.warn(`No valid track ID found for track: ${track.name} by ${track.artists[0].name}`);
        }
      } catch (error) {
        console.error('Error searching for track ID:', error);
        return Promise.reject(error);
      }
    }
  }

  validTrackIds.forEach((trackId) => {
    existingUris.add(`spotify:track:${trackId}`);
  });

  const alternativePlaylist: Track[] = [];
  const adjustedBatchSize = Math.round(DEEJAI_BATCH_SIZE / lengthMultiplier);

  for (let i = 0; i < validTrackIds.length; i += adjustedBatchSize) {
    checkAbort();
    const batch = validTrackIds.slice(i, i + adjustedBatchSize);
    const payload: SuggestionRequest = {
      track_ids: batch,
      size: lengthMultiplier,
      creativity: 0.99,
      noise: 0,
    };

    progressCallback({ phase: `Getting suggestions - step ${i / adjustedBatchSize + 1}`, percentage: 50 + (i / validTrackIds.length) * 50 });

    try {
      const suggestionResponse = await getSuggestions(payload);

      // Check session storage for cached tracks
      const cachedTracksString = sessionStorage.getItem('trackCache');
      let cachedTracks: Record<string, Track> = {};
      if (cachedTracksString) {
        cachedTracks = JSON.parse(cachedTracksString);
      }

      const trackIdsToFetch = suggestionResponse.track_ids.filter(id => !cachedTracks[id]);
      let fetchedTracks: Track[] = [];

      if (trackIdsToFetch.length > 0) {
        console.log('Fetching tracks not in cache:', trackIdsToFetch.length);
        // Fetch tracks not in the cache
        fetchedTracks = await getTracks(trackIdsToFetch, token);

        // Cache the fetched tracks
        fetchedTracks.forEach(track => {
          cachedTracks[track.id] = track;
        });

        // Save the updated cache back to session storage
        try {
          sessionStorage.setItem('trackCache', JSON.stringify(cachedTracks));
        } catch (error) {
          console.warn('Session storage limit exceeded, clearing cache.');
          sessionStorage.removeItem('trackCache');
        }
      } else {
        // Use cached tracks
        console.log('Using only cached tracks');
        fetchedTracks = suggestionResponse.track_ids.map(id => cachedTracks[id]);
      }



        // rebuild ordered tracklist from suggestionResponse cached and fetched tracks
        const orderedTracklist = suggestionResponse.track_ids.map(id => cachedTracks[id] || fetchedTracks.find(track => track.id === id)).filter(Boolean);
        const filteredTracks = orderedTracklist.filter(
            (track: Track) => !recentlyPlayedUris.has(track.uri) && (mode === 'extend' || !existingUris.has(track.uri)));
      alternativePlaylist.push(...filteredTracks);


      console.log('Filtered tracks:', filteredTracks);
      console.log('Suggestion tracks:', fetchedTracks);

    } catch (error) {
      console.error('Error fetching suggestions:', error);
      throw error;
    }
  }

  progressCallback({ phase: 'Completed', percentage: 100 });
  return alternativePlaylist;
};

export const trimPlaylistCyclesWithinQueue = (queueTracks: Track[], playlistTracks : Track[]) => {
  for (let i = 0; i < queueTracks.length; i++) {
    let match = true;
    for (let j = 0; j + i < queueTracks.length && j < playlistTracks.length; j++) {
      if (queueTracks[i + j].id !== playlistTracks[j].id) {
        match = false;
        break;
      }
    }
    if (match) {
      // Found a match, return the trimmed queue
      return queueTracks.slice(0, i);
    }
  }
  // No match found, return the original queue
  return queueTracks;
};
