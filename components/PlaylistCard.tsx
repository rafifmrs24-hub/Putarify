import React from "react";
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
} from "react-native";
import { Playlist } from "../types/Playlist";
import { useTheme } from "../context/ThemeContext";

interface PlaylistCardProps {
  playlist: Playlist;
  onPress: () => void;
  onDelete: () => void;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({
  playlist,
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
      {/* Ikon playlist */}
      <View style={[styles.iconBox, { backgroundColor: colors.primary + "22" }]}>
        <Text style={styles.icon}>🎶</Text>
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {playlist.name}
        </Text>
        {playlist.description ? (
          <Text
            style={[styles.desc, { color: colors.subText }]}
            numberOfLines={1}
          >
            {playlist.description}
          </Text>
        ) : null}
        <Text style={[styles.count, { color: colors.primary }]}>
          {playlist.songs.length} lagu
        </Text>
      </View>
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
    padding: 14,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: { fontSize: 26 },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 15, fontWeight: "700", marginBottom: 2 },
  desc: { fontSize: 12, marginBottom: 3 },
  count: { fontSize: 12, fontWeight: "600" },
  deleteBtn: { padding: 6 },
  deleteIcon: { fontSize: 18 },
});

export default PlaylistCard;
