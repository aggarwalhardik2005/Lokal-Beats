import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { searchSongs ,searchAll} from "../services/api";
import audioService from "../services/audioService";
import { useMusicStore } from "../store/musicStore";
import { defaultStyles, homeStyles } from "../styles";
import { Song } from "../types";
import { decodeHTMLEntities } from "../utils/helpers";
import { getRecentlyPlayed } from "../utils/storage";
import { Fontisto } from "@expo/vector-icons";

const AnimatedCard = ({
  song,
  index,
  songList,
  isCurrentSong,
}: {
  song: Song;
  index: number;
  songList: Song[];
  isCurrentSong: boolean;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const { setQueue } = useMusicStore();

  const playSong = async (song: Song, songList: Song[], index: number) => {
    try {
      setQueue(songList, index);
      await audioService.loadAndPlay(song);
    } catch (error) {
      console.error("Error playing song:", error);
      Alert.alert("Error", "Failed to play song. Please try again.");
    }
  };

  const getImageUrl = (song: Song) => {
    const image =
      song.image.find((img) => img.quality === "500x500") || song.image[0];
    return image?.link || image?.url || "";
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
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

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={() => playSong(song, songList, index)}
      activeOpacity={1}
    >
      <Animated.View
        style={[
          homeStyles.card,
          isCurrentSong && styles.currentCard,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: getImageUrl(song) }}
            style={homeStyles.cardImage}
          />
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
        <Text style={homeStyles.cardTitle} numberOfLines={1}>
          {decodeHTMLEntities(song.name || "")}
        </Text>
        <Text style={homeStyles.cardSubtitle} numberOfLines={1}>
          {decodeHTMLEntities(song.primaryArtists || "")}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const HomeScreen = () => {
  const navigation = useNavigation();
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
  const [trendingSongs, setTrendingSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  const { currentSong } = useMusicStore();

  useEffect(() => {
    loadContent();
    
    // Set up an interval to refresh recently played every 3 seconds
    const interval = setInterval(() => {
      loadRecentlyPlayedSongs();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Also refresh when currentSong changes
  useEffect(() => {
    if (currentSong) {
      loadRecentlyPlayedSongs();
    }
  }, [currentSong]);

  const loadContent = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadRecentlyPlayedSongs(),
        loadTrendingSongs()
      ]);
    } catch (error) {
      console.error("Error loading content:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentlyPlayedSongs = async () => {
    try {
      const songs = await getRecentlyPlayed();
      // Get top 5 recently played songs
      setRecentlyPlayed(songs.slice(0, 5));
    } catch (error) {
      console.error("Error loading recently played:", error);
    }
  };

  const loadTrendingSongs = async () => {
    try {
      const response = await searchSongs("hindi", 1);
      const songs = response.data.results.slice(0, 5);
      setTrendingSongs(songs);
    } catch (error) {
      console.error("Error loading trending songs:", error);
    }
  };

  const handleSearchPress = () => {
    navigation.navigate("Search" as never);
  };

  if (loading) {
    return (
      <View style={defaultStyles.container}>
        <View style={defaultStyles.header}>
          <Text style={defaultStyles.headerTitle}>Lokal Beats</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF5252" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={defaultStyles.container}>
      <View style={defaultStyles.header}>
        <View style={{flexDirection:"row",alignItems:"center",gap:15}}>
        <Fontisto name="music-note" color="#ff0000" size={32} style={{marginBottom:10}}/>
        <Text style={defaultStyles.headerTitle}>Lokal Beats</Text>
        </View>
        <TouchableOpacity
          style={defaultStyles.searchContainer}
          onPress={handleSearchPress}
          activeOpacity={0.7}
        >
          <View style={defaultStyles.searchInput}>
            <Text style={styles.searchPlaceholder}>
              Search songs, artists...
            </Text>
          </View>
          <View style={defaultStyles.searchButton}>
            <Text style={defaultStyles.searchButtonText}>Search</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={homeStyles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={homeStyles.scrollContent}
      >
        {/* Recently Played Section */}
        {recentlyPlayed.length > 0 && (
          <View style={homeStyles.section}>
            <View style={homeStyles.sectionHeader}>
              <Text style={homeStyles.sectionTitle}>Recently Played</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Search" as never)}>
                <Text style={homeStyles.seeAllText}>Explore {'>>'}</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={homeStyles.horizontalScroll}
            >
              {recentlyPlayed.map((song, index) => {
                const isCurrentSong = currentSong?.id === song.id;
                return (
                  <AnimatedCard
                    key={`recent-${song.id}-${index}`}
                    song={song}
                    index={index}
                    songList={recentlyPlayed}
                    isCurrentSong={isCurrentSong}
                  />
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Empty State for Recently Played */}
        {recentlyPlayed.length === 0 && (
          <View style={homeStyles.section}>
            <View style={homeStyles.sectionHeader}>
              <Text style={homeStyles.sectionTitle}>Recently Played</Text>
            </View>
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No recently played songs yet
              </Text>
              <Text style={styles.emptyStateSubText}>
                Start playing music to see your history here
              </Text>
            </View>
          </View>
        )}

        {/* Trending Section */}
        <View style={homeStyles.section}>
          <View style={homeStyles.sectionHeader}>
            <Text style={homeStyles.sectionTitle}>Popular songs</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Search" as never)}>
              <Text style={homeStyles.seeAllText}>Explore {'>>'}</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={homeStyles.horizontalScroll}
          >
            {trendingSongs.map((song, index) => {
              const isCurrentSong = currentSong?.id === song.id;
              return (
                <AnimatedCard
                  key={`trending-${song.id}-${index}`}
                  song={song}
                  index={index}
                  songList={trendingSongs}
                  isCurrentSong={isCurrentSong}
                />
              );
            })}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  searchPlaceholder: {
    color: "#999",
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 10,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
  },
  currentCard: {
    shadowColor: "#FF5252",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  playingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  playingIndicator: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 3,
    height: 20,
  },
  bar: {
    width: 3,
    backgroundColor: "#FF5252",
    borderRadius: 2,
  },
  bar1: {
    height: 12,
    animation: "pulse 0.8s ease-in-out infinite",
  },
  bar2: {
    height: 18,
    animation: "pulse 0.8s ease-in-out 0.2s infinite",
  },
  bar3: {
    height: 8,
    animation: "pulse 0.8s ease-in-out 0.4s infinite",
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    color: "#999",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  emptyStateSubText: {
    color: "#666",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
});