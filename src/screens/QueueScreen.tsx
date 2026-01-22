import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useMusicStore } from '../store/musicStore';
import { Song } from '../types';
import audioService from '../services/audioService';
import { decodeHTMLEntities } from '../utils/helpers';
import { defaultStyles } from '../styles';

// Animated Queue Item Component
const AnimatedQueueItem = ({
  item,
  index,
  isCurrentSong,
  onPlay,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: {
  item: Song;
  index: number;
  isCurrentSong: boolean;
  onPlay: () => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [showMoveButtons, setShowMoveButtons] = useState(false);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
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

  const artistName = item.primaryArtists || 
                    item.artists?.primary?.map(a => a.name).join(', ') ||
                    'Unknown Artist';

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPlay}
      onLongPress={() => setShowMoveButtons(!showMoveButtons)}
      activeOpacity={1}
    >
      <Animated.View
        style={[
          styles.queueItem,
          isCurrentSong && styles.currentQueueItem,
          { transform: [{ scale: scaleAnim }] }
        ]}
      >
        {/* Index Number */}
        <Text style={[styles.indexNumber, isCurrentSong && styles.currentIndexNumber]}>
          {index + 1}
        </Text>

        {/* Album Art */}
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

        {/* Song Info */}
        <View style={styles.songInfo}>
          <Text style={styles.songName} numberOfLines={1}>
            {decodeHTMLEntities(item.name || 'Unknown')}
          </Text>
          <Text style={styles.artistName} numberOfLines={1}>
            {decodeHTMLEntities(artistName)}
          </Text>
        </View>

        {/* Move Buttons (shown when long pressed) */}
        {showMoveButtons && (
          <View style={styles.moveButtons}>
            <TouchableOpacity
              style={[styles.moveButton, !canMoveUp && styles.disabledMoveButton]}
              onPress={() => {
                if (canMoveUp) {
                  onMoveUp();
                  setShowMoveButtons(false);
                }
              }}
              disabled={!canMoveUp}
            >
              <Ionicons
                name="chevron-up"
                size={20}
                color={canMoveUp ? '#fff' : '#666'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.moveButton, !canMoveDown && styles.disabledMoveButton]}
              onPress={() => {
                if (canMoveDown) {
                  onMoveDown();
                  setShowMoveButtons(false);
                }
              }}
              disabled={!canMoveDown}
            >
              <Ionicons
                name="chevron-down"
                size={20}
                color={canMoveDown ? '#fff' : '#666'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.moveButton, styles.doneButton]}
              onPress={() => setShowMoveButtons(false)}
            >
              <Ionicons name="checkmark" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {/* Remove Button */}
        {!showMoveButtons && (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={onRemove}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-circle" size={24} color="#ef4444" />
          </TouchableOpacity>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

export default function QueueScreen() {
  const navigation = useNavigation();
  const {
    queue,
    currentIndex,
    currentSong,
    removeFromQueue,
    skipToIndex,
    clearQueue,
    reorderQueue,
  } = useMusicStore();

  const playSongAtIndex = async (index: number) => {
    skipToIndex(index);
    const song = queue[index];
    if (song) {
      await audioService.loadAndPlay(song);
    }
  };

  const handleRemove = (index: number) => {
    const song = queue[index];
    Alert.alert(
      'Remove Song',
      `Remove "${decodeHTMLEntities(song.name)}" from queue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeFromQueue(index),
        },
      ]
    );
  };

  const handleClearQueue = async () => {
    Alert.alert(
      'Clear Queue',
      'Are you sure you want to clear the entire queue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            // Stop audio playback
            await audioService.stop();
            await audioService.unload();
            // Clear the queue
            clearQueue();
          },
        },
      ]
    );
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      reorderQueue(index, index - 1);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < queue.length - 1) {
      reorderQueue(index, index + 1);
    }
  };

  const renderQueueItem = ({ item, index }: { item: Song; index: number }) => {
    const isCurrentSong = index === currentIndex;

    return (
      <AnimatedQueueItem
        item={item}
        index={index}
        isCurrentSong={isCurrentSong}
        onPlay={() => playSongAtIndex(index)}
        onRemove={() => handleRemove(index)}
        onMoveUp={() => handleMoveUp(index)}
        onMoveDown={() => handleMoveDown(index)}
        canMoveUp={index > 0}
        canMoveDown={index < queue.length - 1}
      />
    );
  };

  return (
    <View style={defaultStyles.container}>
      {/* Header */}
      <View style={defaultStyles.header}>
        <Text style={defaultStyles.headerTitle}>Queue ({queue.length})</Text>
        {queue.length > 0 && (
          <TouchableOpacity onPress={handleClearQueue} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Help Text */}
      {queue.length > 0 && (
        <View style={styles.helpContainer}>
          <MaterialCommunityIcons name="information" size={16} color="#999" />
          <Text style={styles.helpText}>Long press to reorder • Tap to play</Text>
        </View>
      )}

      {/* Queue List */}
      {queue.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="musical-notes-outline" size={80} color="#666" />
          <Text style={styles.emptyText}>Queue is empty</Text>
          <Text style={styles.emptySubText}>
            Songs you play will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={queue}
          renderItem={renderQueueItem}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  clearButtonText: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '600',
  },
  helpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#1a1a1a',
    gap: 8,
  },
  helpText: {
    fontSize: 13,
    color: '#999',
  },
  listContent: {
    paddingVertical: 8,
    paddingBottom: 100,
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#1a1a1a',
  },
  currentQueueItem: {
    backgroundColor: '#1a1a1a',
    shadowColor: '#FF5252',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  indexNumber: {
    fontSize: 16,
    color: '#666',
    width: 32,
    fontWeight: '600',
    textAlign: 'center',
  },
  currentIndexNumber: {
    color: '#FF5252',
  },
  imageContainer: {
    position: 'relative',
    marginLeft: 8,
  },
  songImage: {
    width: 50,
    height: 50,
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
    height: 14,
  },
  bar: {
    width: 2,
    backgroundColor: '#FF5252',
    borderRadius: 2,
  },
  bar1: {
    height: 6,
  },
  bar2: {
    height: 12,
  },
  bar3: {
    height: 4,
  },
  songInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
    justifyContent: 'center',
  },
  songName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 3,
  },
  artistName: {
    fontSize: 13,
    color: '#999',
  },
  moveButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginRight: 8,
  },
  moveButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF5252',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledMoveButton: {
    backgroundColor: '#333',
  },
  doneButton: {
    backgroundColor: '#10b981',
  },
  removeButton: {
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
});