import { Song, SearchResponse, Artist, Album } from '../types';

const BASE_URL = 'https://saavn.sumit.co';

export const searchSongs = async (query: string, page: number = 1): Promise<SearchResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/api/search/songs?query=${encodeURIComponent(query)}&page=${page}`);
    const data = await response.json() as SearchResponse;
    return data;
  } catch (error) {
    console.error('Error searching songs:', error);
    throw error;
  }
};

export const getSongById = async (id: string): Promise<Song> => {
  try {
    const response = await fetch(`${BASE_URL}/api/songs/${id}`);
    const data = await response.json() as { data?: Song[] };
    if (!data?.data || data.data.length === 0) {
      throw new Error('Song not found');
    }
    return data.data[0];
  } catch (error) {
    console.error('Error getting song:', error);
    throw error;
  }
};

export const getSongSuggestions = async (id: string): Promise<Song[]> => {
  try {
    const response = await fetch(`${BASE_URL}/api/songs/${id}/suggestions`);
    const data = await response.json() as { data?: Song[] };
    return data.data || [];
  } catch (error) {
    console.error('Error getting suggestions:', error);
    return [];
  }
};

export const getArtistById = async (id: string): Promise<Artist> => {
  try {
    const response = await fetch(`${BASE_URL}/api/artists/${id}`);
    const data = await response.json() as { data?: Artist };
    if (!data?.data) {
      throw new Error('Artist not found');
    }
    return data.data;
  } catch (error) {
    console.error('Error getting artist:', error);
    throw error;
  }
};

export const getArtistSongs = async (id: string): Promise<Song[]> => {
  try {
    const response = await fetch(`${BASE_URL}/api/artists/${id}/songs`);
    const data = await response.json() as { data?: { results?: Song[] } };
    return data.data?.results || [];
  } catch (error) {
    console.error('Error getting artist songs:', error);
    return [];
  }
};

export const searchAll = async (query: string): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/api/search?query=${encodeURIComponent(query)}`);
    const data = await response.json() as { data?: any };
    return data.data;
  } catch (error) {
    console.error('Error searching:', error);
    throw error;
  }
};