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

// Define the interface for the city
interface City {
  id: string;
  name: string;
  state: string;
  stateCode: string;
  country: {
    code: string;
    name: string;
  };
  coords: {
    lat: number;
    long: number;
  };
}

// Define the interface for the Venue
interface Venue {
  id: string;
  name: string;
  city: City;
  url: string;
}

// Define the interface for Song
interface Song {
  name: string;
  with?: {
    mbid: string;
    name: string;
    sortName: string;
    disambiguation?: string;
    url: string;
  };
  info?: string;
}

// Define the interface for Set
interface Set {
  song: Song[];
  encore?: number;
}

// Define the interface for a Setlist
interface Setlist {
  id: string;
  versionId: string;
  eventDate: string;
  lastUpdated: string;
  artist: Artist;
  venue: Venue;
  sets: {
    set: Set[];
  };
  url: string;
}

// Define the response type for the setlists API
interface SetlistResponse {
  type: string;
  itemsPerPage: number;
  page: number;
  total: number;
  setlist: Setlist[];
}

// Define the response type for the artist search API
interface ArtistSearchResponse {
  artist: Artist[];
}

// Function to search for an artist by name and retrieve the MBID
export const searchArtistByName = async (artistName: string): Promise<Artist[]> => {
  try {
    const response = await axios.get<ArtistSearchResponse>(
      `${BASE_URL}/search/artists?artistName=${encodeURIComponent(artistName)}`, 
      { headers: HEADERS }
    );
    
    return response.data.artist;
  } catch (error) {
    console.error('Error searching for artist:', error);
    throw error;
  }
};

// Function to retrieve the last sets for a given artist by their MusicBrainz ID (MBID)
export const getLastSetsByArtist = async (mbid: string): Promise<Setlist[]> => {
  try {
    const response = await axios.get<SetlistResponse>(`${BASE_URL}/artist/${mbid}/setlists`, {
      headers: HEADERS,
    });
    
    return response.data.setlist.map(setlist => ({
      id: setlist.id,
      versionId: setlist.versionId,
      eventDate: setlist.eventDate,
      lastUpdated: setlist.lastUpdated,
      artist: setlist.artist,
      venue: setlist.venue,
      sets: setlist.sets,
      url: setlist.url,
    }));
  } catch (error) {
    console.error('Error fetching setlists:', error);
    throw error;
  }
};
