import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons, Entypo } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useMusicStore } from '../store/musicStore';
import audioService from '../services/audioService';
import { decodeHTMLEntities } from '../utils/helpers';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const PlayerScreen = () => {
  const navigation = useNavigation();
  const {
    currentSong,
    isPlaying,
    position,
    duration,
    repeat,
    shuffle,
    playNext,
    playPrevious,
    toggleRepeat,
    toggleShuffle,
    addToQueue,
  } = useMusicStore();

  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPosition, setSeekPosition] = useState(0);
  const [backgroundColor, setBackgroundColor] = useState(['#1a1a1a', '#0a0a0a']);
  const [loading, setLoading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (currentSong) {
      // Animate in the player
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          friction: 8,
        }),
      ]).start();

      // Extract colors from artwork
      extractColors();
    }
  }, [currentSong]);

  const extractColors = async () => {
    try {
      // For demo purposes, generate colors based on song ID
      // In production, you'd use a library like react-native-image-colors
      const colors = generateColorsFromSeed(currentSong?.id || '');
      setBackgroundColor(colors);
    } catch (error) {
      console.error('Error extracting colors:', error);
      setBackgroundColor(['#1a1a1a', '#0a0a0a']);
    }
  };

  const generateColorsFromSeed = (seed: string): string[] => {
    // Simple hash function to generate consistent colors
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const hue1 = Math.abs(hash % 360);
    const hue2 = (hue1 + 30) % 360;
    
    return [
      `hsl(${hue1}, 40%, 15%)`,
      `hsl(${hue2}, 35%, 8%)`,
      '#000000',
    ];
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = async () => {
    if (isPlaying) {
      await audioService.pause();
    } else {
      await audioService.play();
    }
  };

  const handleNext = async () => {
    setLoading(true);
    playNext();
    const nextSong = useMusicStore.getState().currentSong;
    if (nextSong) {
      await audioService.loadAndPlay(nextSong);
    }
    setLoading(false);
  };

  const handlePrevious = async () => {
    setLoading(true);
    playPrevious();
    const prevSong = useMusicStore.getState().currentSong;
    if (prevSong) {
      await audioService.loadAndPlay(prevSong);
    }
    setLoading(false);
  };

  const handleSeek = async (value: number) => {
    setIsSeeking(false);
    await audioService.seekTo(value);
  };

  const handleAddToQueue = () => {
    if (currentSong) {
      addToQueue(currentSong);
      setMenuVisible(false);
      Alert.alert('Added to Queue', `${decodeHTMLEntities(currentSong.name)} added to queue`);
    }
  };

  const getImageUrl = () => {
    if (!currentSong) return '';
    const image = currentSong.image.find(img => img.quality === '500x500') || currentSong.image[0];
    return image?.link || image?.url || '';
  };

  const getRepeatIcon = () => {
    switch (repeat) {
      case 'one':
        return 'repeat-one';
      case 'all':
        return 'repeat';
      default:
        return 'repeat';
    }
  };

  const artistName = currentSong?.primaryArtists || 
                    currentSong?.artists?.primary?.map(a => a.name).join(', ') ||
                    'Unknown Artist';

  if (!currentSong) {
    return (
      <LinearGradient colors={['#1a1a1a', '#0a0a0a']} style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="musical-notes" size={80} color="#666" />
          <Text style={styles.emptyText}>No song playing</Text>
          <Text style={styles.emptySubText}>Play a song to see it here</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={backgroundColor} style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-down" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Now Playing</Text>
          </View>
          <TouchableOpacity 
            style={styles.moreButton}
            onPress={() => setMenuVisible(true)}
          >
            <Entypo name="dots-three-horizontal" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Album Artwork */}
        <Animated.View style={[styles.artworkContainer, { transform: [{ scale: scaleAnim }] }]}>
          <Image
            source={{ uri: getImageUrl() }}
            style={styles.artwork}
            resizeMode="cover"
          />
        </Animated.View>

        {/* Song Info */}
        <View style={styles.songInfo}>
          <Text style={styles.songTitle} numberOfLines={1}>
            {decodeHTMLEntities(currentSong.name || '')}
          </Text>
          <Text style={styles.artistName} numberOfLines={1}>
            {decodeHTMLEntities(artistName)}
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <Slider
            style={styles.slider}
            value={isSeeking ? seekPosition : position}
            minimumValue={0}
            maximumValue={duration || 1}
            onValueChange={(value) => {
              setIsSeeking(true);
              setSeekPosition(value);
            }}
            onSlidingComplete={handleSeek}
            minimumTrackTintColor="#fff"
            maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
            thumbTintColor="#fff"
          />
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(position)}</Text>
            <Text style={styles.timeText}>-{formatTime(duration - position)}</Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity onPress={toggleShuffle} style={styles.controlButton}>
            <Ionicons
              name="shuffle"
              size={24}
              color={shuffle ? '#FF5252' : 'rgba(255, 255, 255, 0.7)'}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={handlePrevious} style={styles.controlButton}>
            <Ionicons name="play-skip-back" size={36} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={handlePlayPause} style={styles.playButton}>
            {loading ? (
              <ActivityIndicator size="large" color="#fff" />
            ) : (
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={40}
                color="#fff"
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={handleNext} style={styles.controlButton}>
            <Ionicons name="play-skip-forward" size={36} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleRepeat} style={styles.controlButton}>
            <MaterialIcons
              name={getRepeatIcon()}
              size={24}
              color={repeat !== 'off' ? '#FF5252' : 'rgba(255, 255, 255, 0.7)'}
            />
          </TouchableOpacity>
        </View>


      </Animated.View>

      {/* Add to Queue Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <View style={styles.menuHeader}>
              <Image
                source={{ uri: getImageUrl() }}
                style={styles.menuImage}
              />
              <View style={styles.menuHeaderInfo}>
                <Text style={styles.menuSongName} numberOfLines={1}>
                  {decodeHTMLEntities(currentSong.name || '')}
                </Text>
                <Text style={styles.menuArtistName} numberOfLines={1}>
                  {decodeHTMLEntities(artistName)}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.menuOption}
              onPress={handleAddToQueue}
            >
              <Text style={styles.menuOptionText}>Add to queue</Text>
              <Text style={styles.menuOptionIcon}>+</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </LinearGradient>
  );
};

export default PlayerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    opacity: 0.8,
  },
  moreButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  artworkContainer: {
    alignSelf: 'center',
    width: width - 80,
    height: width - 80,
    marginBottom: 32,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 20,
  },
  artwork: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  songInfo: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  songTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  artistName: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  progressContainer: {
    marginBottom: 32,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  timeText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  controlButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 16,
  },
  bottomButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#2a2a2a',
  },
  menuImage: {
    width: 60,
    height: 60,
    borderRadius: 4,
  },
  menuHeaderInfo: {
    flex: 1,
    marginLeft: 16,
  },
  menuSongName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  menuArtistName: {
    fontSize: 14,
    color: '#999',
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  menuOptionText: {
    fontSize: 16,
    color: '#fff',
  },
  menuOptionIcon: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '300',
  },
});