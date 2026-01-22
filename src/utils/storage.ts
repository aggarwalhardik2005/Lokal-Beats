import AsyncStorage from '@react-native-async-storage/async-storage';
import { Song } from '../types';

const QUEUE_KEY = 'music_queue';
const CURRENT_INDEX_KEY = 'current_index';
const SHUFFLE_KEY = 'shuffle_mode';
const REPEAT_KEY = 'repeat_mode';
const DOWNLOADED_SONGS_KEY = 'downloaded_songs';
const RECENTLY_PLAYED_KEY = 'recently_played';

export const saveQueue = async (queue: Song[]) => {
  try {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Error saving queue:', error);
  }
};

export const getQueue = async (): Promise<Song[]> => {
  try {
    const queue = await AsyncStorage.getItem(QUEUE_KEY);
    return queue ? JSON.parse(queue) : [];
  } catch (error) {
    console.error('Error getting queue:', error);
    return [];
  }
};

export const saveCurrentIndex = async (index: number) => {
  try {
    await AsyncStorage.setItem(CURRENT_INDEX_KEY, index.toString());
  } catch (error) {
    console.error('Error saving current index:', error);
  }
};

export const getCurrentIndex = async (): Promise<number> => {
  try {
    const index = await AsyncStorage.getItem(CURRENT_INDEX_KEY);
    return index ? parseInt(index, 10) : 0;
  } catch (error) {
    console.error('Error getting current index:', error);
    return 0;
  }
};

export const saveShuffle = async (shuffle: boolean) => {
  try {
    await AsyncStorage.setItem(SHUFFLE_KEY, JSON.stringify(shuffle));
  } catch (error) {
    console.error('Error saving shuffle:', error);
  }
};

export const getShuffle = async (): Promise<boolean> => {
  try {
    const shuffle = await AsyncStorage.getItem(SHUFFLE_KEY);
    return shuffle ? JSON.parse(shuffle) : false;
  } catch (error) {
    console.error('Error getting shuffle:', error);
    return false;
  }
};

export const saveRepeat = async (repeat: 'off' | 'all' | 'one') => {
  try {
    await AsyncStorage.setItem(REPEAT_KEY, repeat);
  } catch (error) {
    console.error('Error saving repeat:', error);
  }
};

export const getRepeat = async (): Promise<'off' | 'all' | 'one'> => {
  try {
    const repeat = await AsyncStorage.getItem(REPEAT_KEY);
    return (repeat as 'off' | 'all' | 'one') || 'off';
  } catch (error) {
    console.error('Error getting repeat:', error);
    return 'off';
  }
};

export const saveDownloadedSong = async (song: Song) => {
  try {
    const downloaded = await getDownloadedSongs();
    downloaded.push(song);
    await AsyncStorage.setItem(DOWNLOADED_SONGS_KEY, JSON.stringify(downloaded));
  } catch (error) {
    console.error('Error saving downloaded song:', error);
  }
};

export const getDownloadedSongs = async (): Promise<Song[]> => {
  try {
    const songs = await AsyncStorage.getItem(DOWNLOADED_SONGS_KEY);
    return songs ? JSON.parse(songs) : [];
  } catch (error) {
    console.error('Error getting downloaded songs:', error);
    return [];
  }
};

export const removeDownloadedSong = async (songId: string) => {
  try {
    const downloaded = await getDownloadedSongs();
    const filtered = downloaded.filter(s => s.id !== songId);
    await AsyncStorage.setItem(DOWNLOADED_SONGS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing downloaded song:', error);
  }
};

// Recently Played functions
export const addToRecentlyPlayed = async (song: Song) => {
  try {
    let recentlyPlayed = await getRecentlyPlayed();
    
    // Remove if song already exists (to avoid duplicates)
    recentlyPlayed = recentlyPlayed.filter(s => s.id !== song.id);
    
    // Add to the beginning
    recentlyPlayed.unshift(song);
    
    // Keep only the last 20 songs
    recentlyPlayed = recentlyPlayed.slice(0, 20);
    
    await AsyncStorage.setItem(RECENTLY_PLAYED_KEY, JSON.stringify(recentlyPlayed));
  } catch (error) {
    console.error('Error adding to recently played:', error);
  }
};

export const getRecentlyPlayed = async (): Promise<Song[]> => {
  try {
    const songs = await AsyncStorage.getItem(RECENTLY_PLAYED_KEY);
    return songs ? JSON.parse(songs) : [];
  } catch (error) {
    console.error('Error getting recently played:', error);
    return [];
  }
};

export const clearRecentlyPlayed = async () => {
  try {
    await AsyncStorage.removeItem(RECENTLY_PLAYED_KEY);
  } catch (error) {
    console.error('Error clearing recently played:', error);
  }
};

export const clearStorage = async () => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
};