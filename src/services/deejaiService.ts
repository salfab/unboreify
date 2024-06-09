import axios from 'axios';

const DEEJAI_API_URL = import.meta.env.VITE_API_URL;

export interface SuggestionRequest {
  track_ids: string[];
  size: number;
  creativity: number;
  noise: number;
}

export interface Track {
  id: string;
  name: string;
  artist: string;
}

export interface SuggestionResponse {
  track_ids: string[];
}

export interface FoundTrack {
  track_id: string;
  track: string;
}

const axiosInstance = axios.create({
  baseURL: DEEJAI_API_URL,
  timeout: 30000,
});
/**
 * Fetches suggestions based on the provided track URIs.
 *
 * @param payload - The request payload containing track URIs and other parameters.
 * @returns A promise that resolves to the suggestion response.
 */
export const getSuggestions = async (payload: SuggestionRequest): Promise<SuggestionResponse> => {
  const response = await axiosInstance.post<SuggestionResponse>(
    `/deejai-playlist`,
    payload,
    {
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
};

/**
 * Searches for tracks based on a search term.
 *
 * @param searchTerm - The search term, typically the artist and track title.
 * @param maxItems - The maximum number of items to return.
 * @returns A promise that resolves to the search response.
 */
export const searchTrack = async (searchTerm: string, maxItems: number = 25): Promise<FoundTrack[]> => {
  const response = await axiosInstance.get<FoundTrack[]>(
    `/deejai-search`, // Use the Netlify function
    {
      params: {
        string: searchTerm,
        max_items: maxItems,
      },
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
};
