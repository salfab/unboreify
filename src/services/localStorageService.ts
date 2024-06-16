const localStorageKey = 'validatedTrackIds';
const MAX_ENTRIES = 10000; // Define the maximum number of entries to keep in local storage

export interface ValidatedTrackEntry {
  id: string;
  timestamp: number;
}

/**
 * Loads validated track IDs from local storage.
 * @returns A Map of validated track IDs with timestamps.
 */
export const loadValidatedTrackIds = (): Map<string, ValidatedTrackEntry> => {
  try {
    const data = JSON.parse(localStorage.getItem(localStorageKey) || '{}');
    const map = new Map<string, ValidatedTrackEntry>();
    Object.entries(data).forEach(([key, value]) => {
      map.set(key, value as ValidatedTrackEntry);
    });
    return map;
  } catch (error) {
    console.error('Error loading from local storage, clearing storage:', error);
    localStorage.removeItem(localStorageKey);
    return new Map<string, ValidatedTrackEntry>();
  }
};

/**
 * Saves validated track IDs to local storage.
 * @param validatedTrackIds - A Map of validated track IDs with timestamps.
 */
export const saveValidatedTrackIds = (validatedTrackIds: Map<string, ValidatedTrackEntry>) => {
  try {
    const data = Object.fromEntries(validatedTrackIds);
    localStorage.setItem(localStorageKey, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to local storage:', error);
  }
};

/**
 * Adds a validated track ID to local storage and manages the maximum entries.
 * @param trackUri - The original track URI.
 * @param trackId - The validated track ID.
 */
export const addValidatedTrackId = (trackUri: string, trackId: string) => {
  const validatedTrackIds = loadValidatedTrackIds();
  const timestamp = Date.now();
  validatedTrackIds.set(trackUri, { id: trackId, timestamp });

  // Limit the size of the validatedTrackIds map
  if (validatedTrackIds.size > MAX_ENTRIES) {
    // Find the oldest entry by timestamp
    let oldestKey: string | undefined;
    let oldestTimestamp = Infinity;
    for (const [key, value] of validatedTrackIds) {
      if (value.timestamp < oldestTimestamp) {
        oldestTimestamp = value.timestamp;
        oldestKey = key;
      }
    }
    if (oldestKey) {
      validatedTrackIds.delete(oldestKey);
    }
  }

  saveValidatedTrackIds(validatedTrackIds);
};

export const getPlaylistMultiplier = () => {
  return localStorage.getItem('playlistMultiplier') ? parseInt(localStorage.getItem('playlistMultiplier') as string) : 1;
}