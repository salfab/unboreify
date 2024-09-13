import axios from 'axios';

// Define the base URL for the Setlist.fm API
const BASE_URL = import.meta.env.VITE_SETLIST_FM_API_URL;

// Define the headers for the Setlist.fm API requests
const HEADERS = {
  Accept: 'application/json',
  'x-api-key': import.meta.env.VITE_SETLIST_FM_API_KEY,
};

// Define the interface for an Artist
interface Artist {
    mbid: string;
    name: string;
    disambiguation?: string;
  }
  
  // Define the response type for the artist search API
  interface ArtistSearchResponse {
    artist: Artist[];
  }
  
  // Define the interface for a Setlist
  interface Setlist {
    id: string;
    eventDate: string;
    venue: {
      name: string;
      city: {
        name: string;
        country: {
          code: string;
          name: string;
        };
      };
    };
    sets: {
      set: {
        name: string;
        song: {
          name: string;
        }[];
      }[];
    };
  }
  
  // Define the response type for the setlists API
  interface SetlistResponse {
    setlist: Setlist[];
  }
  
  // Function to search for an artist by name and retrieve the MBID
  export const searchArtistByName = async (artistName: string): Promise<Artist[]> => {
    try {
      // Make a request to the Setlist.fm API to search for the artist by name
      const response = await axios.get<ArtistSearchResponse>(`${BASE_URL}/search/artists?artistName=${encodeURIComponent(artistName)}`, {
        headers: HEADERS,
      });
  
      // Return the list of artists (with their MBIDs)
      return response.data.artist;
    } catch (error) {
      console.error('Error searching for artist:', error);
      throw error;
    }
  };
  
  // Function to retrieve the last sets for a given artist by their MusicBrainz ID (MBID)
  export const getLastSetsByArtist = async (mbid: string): Promise<{ eventDate: string; venue: string; numTracks: number }[]> => {
    try {
      // Make a request to the Setlist.fm API to get the setlists of the artist
      const response = await axios.get<SetlistResponse>(`${BASE_URL}/artist/${mbid}/setlists`, {
        headers: HEADERS,
      });
  
      // Extract setlist data and map to required information: event date, venue, and number of tracks
      const lastSets = response.data.setlist.map((setlist) => {
        const numTracks = setlist.sets.set.reduce((total, currentSet) => total + currentSet.song.length, 0);
  
        return {
          eventDate: setlist.eventDate,
          venue: `${setlist.venue.name}, ${setlist.venue.city.name}, ${setlist.venue.city.country.name}`,
          numTracks,
        };
      });
  
      return lastSets;
    } catch (error) {
      console.error('Error fetching setlists:', error);
      throw error;
    }
  };