import { create } from 'zustand';
import { Song } from '../types';
import * as storage from '../utils/storage';

interface MusicState {
  // Player state
  currentSong: Song | null;
  isPlaying: boolean;
  position: number;
  duration: number;
  
  // Queue state
  queue: Song[];
  currentIndex: number;
  originalQueue: Song[];
  
  // Playback modes
  shuffle: boolean;
  repeat: 'off' | 'all' | 'one';
  
  // Downloaded songs
  downloadedSongs: Song[];
  
  // Actions
  setCurrentSong: (song: Song | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setPosition: (position: number) => void;
  setDuration: (duration: number) => void;
  
  // Queue actions
  setQueue: (queue: Song[], startIndex?: number) => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  clearQueue: () => void;
  
  // Playback controls
  playNext: () => void;
  playPrevious: () => void;
  skipToIndex: (index: number) => void;
  
  // Modes
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  
  // Downloads
  addDownloadedSong: (song: Song) => void;
  removeDownloadedSong: (songId: string) => void;
  
  // Initialize from storage
  initializeFromStorage: () => void;
}

export const useMusicStore = create<MusicState>((set, get) => ({
  currentSong: null,
  isPlaying: false,
  position: 0,
  duration: 0,
  queue: [],
  currentIndex: 0,
  originalQueue: [],
  shuffle: false,
  repeat: 'off',
  downloadedSongs: [],

  setCurrentSong: (song) => set({ currentSong: song }),
  
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  
  setPosition: (position) => set({ position }),
  
  setDuration: (duration) => set({ duration }),

  setQueue: (queue, startIndex = 0) => {
    set({ 
      queue, 
      originalQueue: queue,
      currentIndex: startIndex,
      currentSong: queue[startIndex] || null
    });
    storage.saveQueue(queue);
    storage.saveCurrentIndex(startIndex);
  },

  addToQueue: (song) => {
    const { queue } = get();
    const newQueue = [...queue, song];
    set({ queue: newQueue });
    storage.saveQueue(newQueue);
  },

  removeFromQueue: (index) => {
    const { queue, currentIndex } = get();
    const newQueue = queue.filter((_, i) => i !== index);
    let newIndex = currentIndex;
    
    if (index < currentIndex) {
      newIndex = currentIndex - 1;
    } else if (index === currentIndex && currentIndex >= newQueue.length) {
      newIndex = newQueue.length - 1;
    }
    
    set({ 
      queue: newQueue, 
      currentIndex: newIndex,
      currentSong: newQueue[newIndex] || null
    });
    storage.saveQueue(newQueue);
    storage.saveCurrentIndex(newIndex);
  },

  reorderQueue: (fromIndex, toIndex) => {
    const { queue } = get();
    const newQueue = [...queue];
    const [movedSong] = newQueue.splice(fromIndex, 1);
    newQueue.splice(toIndex, 0, movedSong);
    set({ queue: newQueue });
    storage.saveQueue(newQueue);
  },

  clearQueue: () => {
    set({ 
      queue: [], 
      currentIndex: 0, 
      currentSong: null,
      originalQueue: []
    });
    storage.saveQueue([]);
  },

  playNext: () => {
    const { queue, currentIndex, repeat } = get();
    
    if (queue.length === 0) return;
    
    let nextIndex = currentIndex + 1;
    
    if (repeat === 'one') {
      nextIndex = currentIndex;
    } else if (nextIndex >= queue.length) {
      nextIndex = repeat === 'all' ? 0 : currentIndex;
    }
    
    set({ 
      currentIndex: nextIndex,
      currentSong: queue[nextIndex]
    });
    storage.saveCurrentIndex(nextIndex);
  },

  playPrevious: () => {
    const { queue, currentIndex } = get();
    
    if (queue.length === 0) return;
    
    let prevIndex = currentIndex - 1;
    
    if (prevIndex < 0) {
      prevIndex = queue.length - 1;
    }
    
    set({ 
      currentIndex: prevIndex,
      currentSong: queue[prevIndex]
    });
    storage.saveCurrentIndex(prevIndex);
  },

  skipToIndex: (index) => {
    const { queue } = get();
    if (index >= 0 && index < queue.length) {
      set({ 
        currentIndex: index,
        currentSong: queue[index]
      });
      storage.saveCurrentIndex(index);
    }
  },

  toggleShuffle: () => {
    const { shuffle, queue, currentSong, originalQueue } = get();
    const newShuffle = !shuffle;
    
    if (newShuffle) {
      // Shuffle the queue
      const shuffled = [...queue];
      const currentSongIndex = shuffled.findIndex(s => s.id === currentSong?.id);
      
      if (currentSongIndex > 0) {
        [shuffled[0], shuffled[currentSongIndex]] = [shuffled[currentSongIndex], shuffled[0]];
      }
      
      for (let i = shuffled.length - 1; i > 1; i--) {
        const j = Math.floor(Math.random() * (i - 1)) + 1;
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      
      set({ 
        queue: shuffled, 
        currentIndex: 0,
        shuffle: true 
      });
      storage.saveQueue(shuffled);
    } else {
      // Restore original queue
      const currentSongIndex = originalQueue.findIndex(s => s.id === currentSong?.id);
      set({ 
        queue: originalQueue,
        currentIndex: currentSongIndex >= 0 ? currentSongIndex : 0,
        shuffle: false 
      });
      storage.saveQueue(originalQueue);
    }
    
    storage.saveShuffle(newShuffle);
  },

  toggleRepeat: () => {
    const { repeat } = get();
    const modes: Array<'off' | 'all' | 'one'> = ['off', 'all', 'one'];
    const currentModeIndex = modes.indexOf(repeat);
    const nextMode = modes[(currentModeIndex + 1) % modes.length];
    set({ repeat: nextMode });
    storage.saveRepeat(nextMode);
  },

  addDownloadedSong: (song) => {
    const { downloadedSongs } = get();
    if (!downloadedSongs.find(s => s.id === song.id)) {
      const newDownloaded = [...downloadedSongs, song];
      set({ downloadedSongs: newDownloaded });
      storage.saveDownloadedSong(song);
    }
  },

  removeDownloadedSong: (songId) => {
    const { downloadedSongs } = get();
    const newDownloaded = downloadedSongs.filter(s => s.id !== songId);
    set({ downloadedSongs: newDownloaded });
    storage.removeDownloadedSong(songId);
  },

  initializeFromStorage: async () => {
    const queue = await storage.getQueue();
    const currentIndex = await storage.getCurrentIndex();
    const shuffle = await storage.getShuffle();
    const repeat = await storage.getRepeat();
    const downloadedSongs = await storage.getDownloadedSongs();
    
    set({
      queue,
      originalQueue: queue,
      currentIndex,
      currentSong: queue[currentIndex] || null,
      shuffle,
      repeat,
      downloadedSongs
    });
  }
}));