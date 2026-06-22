import React from "react";
import {
  TouchableOpacity,
  View,
  Text,
  Image,
  StyleSheet,
} from "react-native";
import { Song } from "../types/Song";
import { useTheme } from "../context/ThemeContext";

interface FavoriteCardProps {
  song: Song;
  onPress: () => void;
  onDelete: () => void;
}

const FavoriteCard: React.FC<FavoriteCardProps> = ({
  song,
  onPress,
  onDelete,
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
      activeOpacity={0.75}
    >
      <Image source={{ uri: song.artworkUrl100 }} style={styles.cover} />
      <View style={styles.info}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {song.trackName}
        </Text>
        <Text style={[styles.artist, { color: colors.subText }]} numberOfLines={1}>
          {song.artistName}
        </Text>
        <Text style={[styles.album, { color: colors.subText }]} numberOfLines={1}>
          {song.collectionName}
        </Text>
        {song.primaryGenreName ? (
          <Text style={[styles.genre, { color: colors.primary }]}>
            {song.primaryGenreName}
          </Text>
        ) : null}
      </View>
      {/* Tombol hapus favorit */}
      <TouchableOpacity onPress={onDelete} style={styles.deleteBtn} hitSlop={8}>
        <Text style={styles.deleteIcon}>🗑️</Text>
      </TouchableOpacity>
    </TouchableOpacity>
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
  cover: { width: 56, height: 56, borderRadius: 8 },
  info: { flex: 1, marginLeft: 12 },
  title: { fontSize: 14, fontWeight: "700", marginBottom: 2 },
  artist: { fontSize: 12, marginBottom: 1 },
  album: { fontSize: 12, marginBottom: 2 },
  genre: { fontSize: 11, fontWeight: "600" },
  deleteBtn: { padding: 6 },
  deleteIcon: { fontSize: 18 },
});

export default FavoriteCard;
