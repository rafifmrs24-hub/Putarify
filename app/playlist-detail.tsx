import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomNav from "../components/BottomNav";
import EmptyState from "../components/EmptyState";
import LoadingView from "../components/LoadingView";
import MiniPlayer from "../components/MiniPlayer";
import { useAudioContext } from "../context/AudioContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { getPlaylists, removeSongFromPlaylist } from "../services/playlistService";
import { Song } from "../types/Song";

export default function PlaylistDetailScreen() {
  const { playlistId, playlistName, playlistDesc } = useLocalSearchParams<{
    playlistId: string;
    playlistName: string;
    playlistDesc: string;
  }>();
  // Tambahkan userId dari useAuth
  const { user, userId } = useAuth();
  const { colors, theme } = useTheme();
  const { currentSong, playSong } = useAudioContext();
  const router = useRouter();
  const isDark = theme === "dark";

  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  // Muat ulang lagu saat halaman difokuskan
  useFocusEffect(
    useCallback(() => {
      // Pastikan userId tersedia
      if (!user || !userId || !playlistId) return;
      setLoading(true);
      getPlaylists(userId).then((all) => {
        const target = all.find((p) => p.id === playlistId);
        setSongs(target?.songs ?? []);
        setLoading(false);
      });
    }, [user, userId, playlistId])
  );

  // Hapus lagu dari playlist
  const handleRemove = (trackId: number) => {
    Alert.alert(
      "Hapus Lagu",
      "Yakin ingin menghapus lagu ini dari playlist?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            // Gunakan userId untuk menghapus lagu
            await removeSongFromPlaylist(userId!, playlistId, trackId);
            setSongs((prev) => prev.filter((s) => s.trackId !== trackId));
          },
        },
      ]
    );
  };

  if (loading) return <LoadingView />;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <SafeAreaView style={styles.safeTop} edges={["top"]}>
        {/* Header info playlist */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.name, { color: colors.text }]}>
            {playlistName}
          </Text>
          {playlistDesc ? (
            <Text style={[styles.desc, { color: colors.subText }]}>
              {playlistDesc}
            </Text>
          ) : null}
          <Text style={[styles.count, { color: colors.primary }]}>
            {songs.length} lagu
          </Text>
        </View>

        {/* Daftar lagu */}
        {songs.length === 0 ? (
          <EmptyState
            title="Playlist kosong"
            description="Tambahkan lagu dari halaman detail lagu."
          />
        ) : (
          <FlatList
            data={songs}
            keyExtractor={(item) => String(item.trackId)}
            renderItem={({ item }) => {
              const isActive = currentSong?.trackId === item.trackId;
              return (
                <TouchableOpacity
                  style={[
                    styles.songRow,
                    {
                      backgroundColor: isActive
                        ? colors.primary + "22"
                        : colors.card,
                      borderColor: isActive
                        ? colors.primary
                        : colors.border,
                    },
                  ]}
                  onPress={() =>
                    router.push({
                      pathname: "/song-detail",
                      params: {
                        song: JSON.stringify(item),
                        songList: JSON.stringify(songs),
                      },
                    })
                  }
                  activeOpacity={0.75}
                >
                  <Image
                    source={{ uri: item.artworkUrl100 }}
                    style={styles.cover}
                  />
                  <View style={styles.info}>
                    <Text
                      style={[
                        styles.trackName,
                        {
                          color: isActive ? colors.primary : colors.text,
                          fontWeight: isActive ? "800" : "700",
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {isActive ? "▶ " : ""}{item.trackName}
                    </Text>
                    <Text
                      style={[styles.artistName, { color: colors.subText }]}
                      numberOfLines={1}
                    >
                      {item.artistName}
                    </Text>
                  </View>
                  {/* Tombol hapus */}
                  <TouchableOpacity
                    onPress={() => handleRemove(item.trackId)}
                    style={styles.removeBtn}
                    hitSlop={8}
                  >
                    <Text style={styles.removeIcon}>🗑️</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            }}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>

      {/* Mini Player + Bottom Nav */}
      <View>
        {currentSong && <MiniPlayer />}
        <BottomNav />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeTop: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  name: { fontSize: 22, fontWeight: "800", marginBottom: 4 },
  desc: { fontSize: 14, marginBottom: 4 },
  count: { fontSize: 13, fontWeight: "600" },
  listContent: { paddingTop: 8, paddingBottom: 24 },
  songRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  cover: { width: 50, height: 50, borderRadius: 8 },
  info: { flex: 1, marginLeft: 12 },
  trackName: { fontSize: 14, marginBottom: 2 },
  artistName: { fontSize: 12 },
  removeBtn: { padding: 6 },
  removeIcon: { fontSize: 17 },
});