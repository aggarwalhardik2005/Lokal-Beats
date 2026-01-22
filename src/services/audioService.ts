// services/audioService.ts - Updated

import { Audio, AVPlaybackStatus } from 'expo-av';
import { Song } from '../types';
import * as FileSystem from 'expo-file-system';
import { useMusicStore } from '../store/musicStore';
import { addToRecentlyPlayed } from '../utils/storage';

class AudioService {
  private sound: Audio.Sound | null = null;
  private onPlaybackStatusUpdate: ((status: AVPlaybackStatus) => void) | null = null;

  async initialize() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Set up default playback status update handler
      this.setupPlaybackStatusHandler();
      
      console.log('Audio service initialized successfully');
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  }

  private setupPlaybackStatusHandler() {
    this.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded) {
        const { setIsPlaying, setPosition, setDuration, playNext, currentSong } = useMusicStore.getState();
        
        // Update playing state
        setIsPlaying(status.isPlaying);
        
        // Update position and duration
        setPosition(status.positionMillis);
        setDuration(status.durationMillis || 0);
        
        // Auto-play next song when current finishes
        if (status.didJustFinish) {
          console.log('Song finished, playing next...');
          playNext();
          const nextSong = useMusicStore.getState().currentSong;
          if (nextSong && nextSong.id !== currentSong?.id) {
            this.loadAndPlay(nextSong);
          }
        }
      }
    });
  }

  async loadAndPlay(song: Song) {
    try {
      console.log('Loading song:', song.name);
      
      // Unload previous sound
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
      }

      // Get the best quality URL
      const audioUrl = this.getBestQualityUrl(song);
      
      if (!audioUrl) {
        throw new Error('No audio URL available');
      }

      console.log('Playing from URL:', audioUrl);

      // Check if song is downloaded
      const uri = song.localUri || audioUrl;

      // Create and load new sound
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true },
        this.onPlaybackStatusUpdate || undefined
      );

      this.sound = sound;
      await sound.playAsync();
      
      // Update store
      useMusicStore.getState().setCurrentSong(song);
      useMusicStore.getState().setIsPlaying(true);
      
      // Add to recently played
      await addToRecentlyPlayed(song);
      
      console.log('Song loaded and playing successfully');
    } catch (error) {
      console.error('Error loading song:', error);
      useMusicStore.getState().setIsPlaying(false);
      throw error;
    }
  }

  async play() {
    if (this.sound) {
      await this.sound.playAsync();
      useMusicStore.getState().setIsPlaying(true);
    }
  }

  async pause() {
    if (this.sound) {
      await this.sound.pauseAsync();
      useMusicStore.getState().setIsPlaying(false);
    }
  }

  async stop() {
    if (this.sound) {
      await this.sound.stopAsync();
      useMusicStore.getState().setIsPlaying(false);
    }
  }

  async seekTo(position: number) {
    if (this.sound) {
      await this.sound.setPositionAsync(position);
    }
  }

  async setRate(rate: number) {
    if (this.sound) {
      await this.sound.setRateAsync(rate, true);
    }
  }

  setOnPlaybackStatusUpdate(callback: (status: AVPlaybackStatus) => void) {
    this.onPlaybackStatusUpdate = callback;
    if (this.sound) {
      this.sound.setOnPlaybackStatusUpdate(callback);
    }
  }

  async getStatus(): Promise<AVPlaybackStatus | null> {
    if (this.sound) {
      return await this.sound.getStatusAsync();
    }
    return null;
  }

  async unload() {
    if (this.sound) {
      await this.sound.unloadAsync();
      this.sound = null;
    }
    useMusicStore.getState().setIsPlaying(false);
  }

  private getBestQualityUrl(song: Song): string | null {
    const downloadUrls = song.downloadUrl;
    
    if (!downloadUrls || downloadUrls.length === 0) {
      return null;
    }

    // Try to get 320kbps, then 160kbps, then any available
    const qualities = ['320kbps', '160kbps', '96kbps', '48kbps', '12kbps'];
    
    for (const quality of qualities) {
      const url = downloadUrls.find(u => u.quality === quality);
      if (url) {
        return url.link || url.url || null;
      }
    }

    // Fallback to first available
    return downloadUrls[0]?.link || downloadUrls[0]?.url || null;
  }

  async downloadSong(song: Song): Promise<string> {
    try {
      const audioUrl = this.getBestQualityUrl(song);
      
      if (!audioUrl) {
        throw new Error('No audio URL available for download');
      }

      const dir = (FileSystem as any).documentDirectory ?? (FileSystem as any).cacheDirectory ?? '';
      const fileUri = dir + `${song.id}.mp4`;
      
      const downloadResumable = FileSystem.createDownloadResumable(
        audioUrl,
        fileUri
      );

      const result = await downloadResumable.downloadAsync();
      
      if (!result) {
        throw new Error('Download failed');
      }

      return result.uri;
    } catch (error) {
      console.error('Error downloading song:', error);
      throw error;
    }
  }

  async deleteSong(localUri: string) {
    try {
      const fileInfo = await FileSystem.getInfoAsync(localUri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(localUri);
      }
    } catch (error) {
      console.error('Error deleting song:', error);
    }
  }
}

export default new AudioService();