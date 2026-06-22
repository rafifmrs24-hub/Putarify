import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAudioContext } from "../context/AudioContext";
import { useTheme } from "../context/ThemeContext";

const MiniPlayer: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    pauseSong,
    playSong,
    playNext,
    playPrev,
    hasNext,
    hasPrev,
  } = useAudioContext();
  const { theme } = useTheme();
  const router = useRouter();
  const isDark = theme === "dark";

  // Animasi slide up saat mini player muncul
  const slideAnim = useRef(new Animated.Value(80)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (currentSong) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 70,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 80,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [currentSong]);

  if (!currentSong) return null;

  const handlePlayPause = () => {
    if (isPlaying) {
      pauseSong();
    } else {
      playSong(currentSong);
    }
  };

  return (
    <Animated.View
      style={{
        transform: [{ translateY: slideAnim }],
        opacity: fadeAnim,
      }}
    >
      <TouchableOpacity
        style={[
          styles.container,
          { backgroundColor: isDark ? "#282828" : "#F0F0F0" },
        ]}
        onPress={() =>
          router.push({
            pathname: "/song-detail",
            params: { song: JSON.stringify(currentSong) },
          })
        }
        activeOpacity={0.9}
      >
        {/* Cover */}
        <Image
          source={{ uri: currentSong.artworkUrl100 }}
          style={styles.artwork}
        />

        {/* Info */}
        <View style={styles.info}>
          <Text
            style={[styles.title, { color: isDark ? "#FFFFFF" : "#111111" }]}
            numberOfLines={1}
          >
            {currentSong.trackName}
          </Text>
          <Text
            style={[styles.artist, { color: isDark ? "#B3B3B3" : "#777777" }]}
            numberOfLines={1}
          >
            {currentSong.artistName}
          </Text>
        </View>

        {/* Kontrol */}
        <View style={styles.controls}>
          <TouchableOpacity
            onPress={(e) => { e.stopPropagation(); playPrev(); }}
            disabled={!hasPrev}
            style={{ opacity: hasPrev ? 1 : 0.25 }}
            hitSlop={8}
          >
            <Text style={[styles.controlIcon, { color: isDark ? "#FFFFFF" : "#111111" }]}>
              ⏮
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={(e) => { e.stopPropagation(); handlePlayPause(); }}
            style={[
              styles.playBtn,
              { backgroundColor: isDark ? "#FFFFFF" : "#111111" },
            ]}
            hitSlop={4}
          >
            <Text
              style={[
                styles.playIcon,
                { color: isDark ? "#111111" : "#FFFFFF" },
              ]}
            >
              {isPlaying ? "⏸" : "▶"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={(e) => { e.stopPropagation(); playNext(); }}
            disabled={!hasNext}
            style={{ opacity: hasNext ? 1 : 0.25 }}
            hitSlop={8}
          >
            <Text
              style={[
                styles.controlIcon,
                { color: isDark ? "#FFFFFF" : "#111111" },
              ]}
            >
              ⏭
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 10,
  },
  artwork: { width: 44, height: 44, borderRadius: 6 },
  info: { flex: 1 },
  title: { fontSize: 13, fontWeight: "700" },
  artist: { fontSize: 11, marginTop: 2 },
  controls: { flexDirection: "row", alignItems: "center", gap: 8 },
  controlIcon: { fontSize: 20 },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  playIcon: { fontSize: 16 },
});

export default MiniPlayer;