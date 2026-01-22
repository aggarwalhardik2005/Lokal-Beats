import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useMusicStore } from '../store/musicStore';
import audioService from '../services/audioService';
import { decodeHTMLEntities } from '../utils/helpers';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

type TabParamList = {
  Home: undefined;
  Search: undefined;
  Player: undefined;
  Queue: undefined;
};

// Hook to detect if on Player screen
const useIsPlayerScreen = () => {
  const route = useRoute();
  return route.name === 'Player';
};

export default function MiniPlayer() {
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const { currentSong, isPlaying, playNext } = useMusicStore();
  const [slideAnim] = useState(new Animated.Value(100));
  const [isPlayerScreen, setIsPlayerScreen] = useState(false);

  // Listen to navigation state changes
  useEffect(() => {
    const unsubscribe = navigation.addListener('state', () => {
      try {
        const state = navigation.getState();
        const currentRoute = state.routes[state.index];
        setIsPlayerScreen(currentRoute.name === 'Player');
      } catch (error) {
        // Ignore error if navigation state is not available yet
        setIsPlayerScreen(false);
      }
    });

    // Initial check
    try {
      const state = navigation.getState();
      const currentRoute = state.routes[state.index];
      setIsPlayerScreen(currentRoute.name === 'Player');
    } catch (error) {
      setIsPlayerScreen(false);
    }

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    // Hide MiniPlayer on Player screen or when no song is playing
    if (isPlayerScreen || !currentSong) {
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else if (currentSong) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
      }).start();
    }
  }, [currentSong, isPlayerScreen]);

  // Don't render at all on Player screen
  if (isPlayerScreen || !currentSong) return null;

  const handlePlayPause = async (e: any) => {
    e.stopPropagation();
    if (isPlaying) {
      await audioService.pause();
    } else {
      await audioService.play();
    }
  };

  const handleNext = async (e: any) => {
    e.stopPropagation();
    playNext();
    const nextSong = useMusicStore.getState().currentSong;
    if (nextSong) {
      await audioService.loadAndPlay(nextSong);
    }
  };

  const getImageUrl = () => {
    const image = currentSong.image.find(img => img.quality === '500x500') || currentSong.image[0];
    return image?.link || image?.url || '';
  };

  // Get artist name from different possible fields
  const artistName = currentSong.primaryArtists || 
                    currentSong.artists?.primary?.map(a => a.name).join(', ') ||
                    'Unknown Artist';

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: slideAnim }] }
      ]}
    >
      <TouchableOpacity
        style={styles.content}
        onPress={() => navigation.navigate('Player')}
        activeOpacity={0.9}
      >
        {/* Album Art */}
        <Image
          source={{ uri: getImageUrl() }}
          style={styles.albumArt}
        />
        
        {/* Song Info */}
        <View style={styles.songInfo}>
          <Text style={styles.songName} numberOfLines={1}>
            {decodeHTMLEntities(currentSong.name || '')}
          </Text>
          <Text style={styles.artistName} numberOfLines={1}>
            {decodeHTMLEntities(artistName)}
          </Text>
        </View>

        {/* Playback Controls */}
        <View style={styles.controls}>
          <TouchableOpacity onPress={handlePlayPause} style={styles.controlButton}>
            <Ionicons 
              name={isPlaying ? 'pause' : 'play'} 
              size={28} 
              color="#fff" 
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleNext} style={styles.controlButton}>
            <Ionicons 
              name="play-skip-forward" 
              size={28} 
              color="#fff" 
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 70,
    left: '2%',
    right: '2%',
    backgroundColor: '#1a1a1a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 12,
    borderRadius: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  albumArt: {
    width: 56,
    height: 56,
    borderRadius: 4,
    marginRight: 12,
  },
  songInfo: {
    flex: 1,
    marginRight: 12,
    justifyContent: 'center',
  },
  songName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 3,
  },
  artistName: {
    fontSize: 13,
    color: '#999',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  controlButton: {
    padding: 4,
  },
});