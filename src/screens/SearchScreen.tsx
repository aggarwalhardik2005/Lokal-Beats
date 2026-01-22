import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  FlatList,
  Image,
  Alert,
  Modal,
  Animated,
} from 'react-native';
import React, { useState, useRef } from 'react';
import { Entypo } from '@expo/vector-icons';
import { defaultStyles } from '../styles';
import { searchSongs } from '../services/api';
import { Song } from '../types';
import { useMusicStore } from '../store/musicStore';
import audioService from '../services/audioService';
import { decodeHTMLEntities } from '../utils/helpers';

const colors = {
  icon: '#999',
  text: '#fff',
  subText: '#999',
  background: '#000',
  cardBackground: '#0a0a0a',
  primary: '#FF5252',
};

// Animated Song Item Component
const AnimatedSongItem = ({ 
  item, 
  index, 
  isCurrentSong, 
  onPress, 
  onMenuPress 
}: { 
  item: Song; 
  index: number; 
  isCurrentSong: boolean; 
  onPress: () => void; 
  onMenuPress: () => void;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const getImageUrl = (song: Song) => {
    const image = song.image.find((img) => img.quality === '500x500') || song.image[0];
    return image?.link || image?.url || '';
  };

  // Get artist name from different possible fields
  const artistName = item.primaryArtists || 
                    item.artists?.primary?.map(a => a.name).join(', ') ||
                    'Unknown Artist';

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      activeOpacity={1}
    >
      <Animated.View
        style={[
          styles.songItem,
          isCurrentSong && styles.currentSongItem,
          { transform: [{ scale: scaleAnim }] }
        ]}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: getImageUrl(item) }} style={styles.songImage} />
          {isCurrentSong && (
            <View style={styles.playingOverlay}>
              <View style={styles.playingIndicator}>
                <View style={[styles.bar, styles.bar1]} />
                <View style={[styles.bar, styles.bar2]} />
                <View style={[styles.bar, styles.bar3]} />
              </View>
            </View>
          )}
        </View>
        <View style={styles.songInfo}>
          <Text style={styles.songName} numberOfLines={1}>
            {decodeHTMLEntities(item.name || 'Unknown')}
          </Text>
          <Text style={styles.artistName} numberOfLines={1}>
            {decodeHTMLEntities(artistName)}
          </Text>
        </View>
        <TouchableOpacity
          onPress={onMenuPress}
          style={styles.menuButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Entypo name="dots-three-horizontal" size={18} color={colors.icon} />
        </TouchableOpacity>
      </Animated.View>
    </TouchableOpacity>
  );
};

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [songs, setSongs] = useState<Song[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  const { setQueue, currentSong, addToQueue } = useMusicStore();

  const removeDuplicates = (songs: Song[]) => {
    const seen = new Set();
    return songs.filter((song) => {
      if (seen.has(song.id)) {
        return false;
      }
      seen.add(song.id);
      return true;
    });
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setHasSearched(true);
    setPage(1);

    try {
      const response = await searchSongs(searchQuery, 1);
      const uniqueSongs = removeDuplicates(response.data.results);
      setSongs(uniqueSongs);
      setHasMore(response.data.results.length < response.data.total);
    } catch (error) {
      console.error('Error searching:', error);
      setSongs([]);
      Alert.alert('Error', 'Failed to search songs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (loading || !hasMore || !searchQuery.trim()) return;

    const nextPage = page + 1;
    setLoading(true);

    try {
      const response = await searchSongs(searchQuery, nextPage);
      const combinedSongs = [...songs, ...response.data.results];
      const uniqueSongs = removeDuplicates(combinedSongs);
      setSongs(uniqueSongs);
      setPage(nextPage);
      setHasMore(uniqueSongs.length < response.data.total);
    } catch (error) {
      console.error('Error loading more:', error);
    } finally {
      setLoading(false);
    }
  };

  const playSong = async (song: Song, index: number) => {
    try {
      setQueue(songs, index);
      await audioService.loadAndPlay(song);
    } catch (error) {
      console.error('Error playing song:', error);
      Alert.alert('Error', 'Failed to play song. Please try again.');
    }
  };

  const handleAddToQueue = (song: Song) => {
    addToQueue(song);
    setMenuVisible(false);
    setSelectedSong(null);
    Alert.alert('Added to Queue', `${decodeHTMLEntities(song.name)} added to queue`);
  };

  const openMenu = (song: Song) => {
    setSelectedSong(song);
    setMenuVisible(true);
  };

  const getImageUrl = (song: Song) => {
    const image = song.image.find((img) => img.quality === '500x500') || song.image[0];
    return image?.link || image?.url || '';
  };

  const renderSongItem = ({ item, index }: { item: Song; index: number }) => {
    const isCurrentSong = currentSong?.id === item.id;

    return (
      <AnimatedSongItem
        item={item}
        index={index}
        isCurrentSong={isCurrentSong}
        onPress={() => playSong(item, index)}
        onMenuPress={() => openMenu(item)}
      />
    );
  };

  const renderEmptyState = () => {
    if (loading && songs.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FF5252" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      );
    }

    if (hasSearched && songs.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No results found for "{searchQuery}"</Text>
          <Text style={styles.emptySubText}>Try searching with different keywords</Text>
        </View>
      );
    }

    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>Search for songs, artists, or albums</Text>
        <Text style={styles.emptySubText}>Discover millions of tracks</Text>
      </View>
    );
  };

  return (
    <View style={defaultStyles.container}>
      <View style={defaultStyles.header}>
        <Text style={defaultStyles.headerTitle}>Search</Text>

        <View style={defaultStyles.searchContainer}>
          <TextInput
            style={defaultStyles.searchInput}
            placeholder="Search songs, artists..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoFocus
          />
          <TouchableOpacity style={defaultStyles.searchButton} onPress={handleSearch}>
            <Text style={defaultStyles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>
      </View>

      {songs.length > 0 ? (
        <FlatList
          data={songs}
          renderItem={renderSongItem}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          contentContainerStyle={styles.listContent}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading && songs.length > 0 ? (
              <ActivityIndicator size="small" color="#FF5252" style={styles.loader} />
            ) : null
          }
        />
      ) : (
        renderEmptyState()
      )}

      {/* Menu Modal */}
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
                source={{ uri: selectedSong ? getImageUrl(selectedSong) : '' }}
                style={styles.menuImage}
              />
              <View style={styles.menuHeaderInfo}>
                <Text style={styles.menuSongName} numberOfLines={1}>
                  {selectedSong ? decodeHTMLEntities(selectedSong.name || '') : ''}
                </Text>
                <Text style={styles.menuArtistName} numberOfLines={1}>
                  {selectedSong ? decodeHTMLEntities(selectedSong.primaryArtists || '') : ''}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.menuOption}
              onPress={() => selectedSong && handleAddToQueue(selectedSong)}
            >
              <Text style={styles.menuOptionText}>Add to queue</Text>
              <Text style={styles.menuOptionIcon}>+</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
  },
  emptyText: {
    color: '#999',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '600',
  },
  emptySubText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  listContent: {
    paddingVertical: 8,
    paddingBottom: 140,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#1a1a1a',
  },
  currentSongItem: {
    backgroundColor: '#1a1a1a',
    shadowColor: '#FF5252',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  imageContainer: {
    position: 'relative',
  },
  songImage: {
    width: 56,
    height: 56,
    borderRadius: 4,
  },
  playingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  playingIndicator: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: 16,
  },
  bar: {
    width: 2.5,
    backgroundColor: '#FF5252',
    borderRadius: 2,
  },
  bar1: {
    height: 8,
  },
  bar2: {
    height: 14,
  },
  bar3: {
    height: 6,
  },
  songInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
    justifyContent: 'center',
  },
  songName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  artistName: {
    fontSize: 13,
    color: '#999999',
    fontWeight: '400',
  },
  menuButton: {
    padding: 8,
  },
  loader: {
    marginVertical: 20,
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
    color: colors.text,
    marginBottom: 4,
  },
  menuArtistName: {
    fontSize: 14,
    color: colors.subText,
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
    color: colors.text,
  },
  menuOptionIcon: {
    fontSize: 24,
    color: colors.text,
    fontWeight: '300',
  },
});