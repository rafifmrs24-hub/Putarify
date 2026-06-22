import React, { useRef } from "react";
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { Song } from "../types/Song";

interface SongCardProps {
  song: Song;
  onPress: () => void;
}

const SongCard: React.FC<SongCardProps> = ({ song, onPress }) => {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
        activeOpacity={1}
      >
        <Image source={{ uri: song.artworkUrl100 }} style={styles.cover} />
        <View style={styles.info}>
          <Text
            style={[styles.title, { color: colors.text }]}
            numberOfLines={1}
          >
            {song.trackName}
          </Text>
          <Text
            style={[styles.artist, { color: colors.subText }]}
            numberOfLines={1}
          >
            {song.artistName}
          </Text>
          <Text
            style={[styles.album, { color: colors.subText }]}
            numberOfLines={1}
          >
            {song.collectionName}
          </Text>
          {song.primaryGenreName ? (
            <View
              style={[
                styles.badge,
                { backgroundColor: colors.primary + "22" },
              ]}
            >
              <Text style={[styles.genre, { color: colors.primary }]}>
                {song.primaryGenreName}
              </Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 12,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cover: { width: 60, height: 60, borderRadius: 8 },
  info: { flex: 1, marginLeft: 12 },
  title: { fontSize: 15, fontWeight: "700", marginBottom: 2 },
  artist: { fontSize: 13, marginBottom: 2 },
  album: { fontSize: 12, marginBottom: 4 },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  genre: { fontSize: 11, fontWeight: "600" },
});

export default SongCard;