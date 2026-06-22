import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CustomButton from "../components/CustomButton";
import { useAudioContext } from "../context/AudioContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { checkIsFavorite, saveFavoriteSong } from "../services/favoriteService";
import { addSongToPlaylist, getPlaylists } from "../services/playlistService";
import { Playlist } from "../types/Playlist";
import { Song } from "../types/Song";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function SongDetailScreen() {
  const { song: songParam, songList: songListParam } =
    useLocalSearchParams<{ song: string; songList?: string }>();

  // Selalu gunakan lagu dari params sebagai tampilan utama
  const songFromParam: Song = JSON.parse(songParam ?? "{}");
  const paramList: Song[] = songListParam ? JSON.parse(songListParam) : [];

  // Tambahkan userId dari useAuth
  const { user, userId } = useAuth();
  const { colors, theme } = useTheme();
  const {
    currentSong,
    isPlaying,
    playSong,
    pauseSong,
    playNext,
    playPrev,
    hasNext,
    hasPrev,
  } = useAudioContext();
  const router = useRouter();
  const isDark = theme === "dark";

  // displaySong selalu dari param — BUKAN dari currentSong
  // Ini agar saat klik lagu lain, tampilan berubah sesuai lagu yang diklik
  const [displaySong, setDisplaySong] = useState<Song>(songFromParam);

  const [isFavorite, setIsFavorite] = useState(false);
  const [savingFav, setSavingFav] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const isMounted = useRef(true);

  // Sinkronisasi displaySong jika currentSong berubah via prev/next
  useEffect(() => {
    if (currentSong && paramList.length > 0) {
      // Hanya update tampilan jika currentSong ada di list yang sama
      const inList = paramList.some((s) => s.trackId === currentSong.trackId);
      if (inList) {
        setDisplaySong(currentSong);
      }
    }
  }, [currentSong]);

  // Cek apakah lagu yang ditampilkan sedang diputar
  const isCurrentlyPlaying =
    isPlaying && currentSong?.trackId === displaySong.trackId;

  useEffect(() => {
    isMounted.current = true;
    if (user && userId) {
      checkIsFavorite(userId, displaySong.trackId).then((val) => {
        if (isMounted.current) setIsFavorite(val);
      });
      getPlaylists(userId).then((val) => {
        if (isMounted.current) setPlaylists(val);
      });
    }
    return () => { isMounted.current = false; };
  }, [displaySong.trackId, user, userId]);

  const handlePlayPause = () => {
    if (!displaySong.previewUrl) {
      Alert.alert("Info", "Preview lagu tidak tersedia.");
      return;
    }
    if (isCurrentlyPlaying) {
      pauseSong();
    } else {
      // Kirim list dari params jika ada, jika tidak kirim lagu tunggal
      if (paramList.length > 0) {
        const idx = paramList.findIndex((s) => s.trackId === displaySong.trackId);
        playSong(displaySong, paramList, idx >= 0 ? idx : 0);
      } else {
        playSong(displaySong, [displaySong], 0);
      }
    }
  };

  const handleSaveFavorite = async () => {
    if (!user || !userId) {
      Alert.alert("Perlu Login", "Silakan login untuk menyimpan favorit.", [
        { text: "Login", onPress: () => router.push("/login") },
        { text: "Batal", style: "cancel" },
      ]);
      return;
    }
    if (isFavorite) return;
    setSavingFav(true);
    try {
      await saveFavoriteSong(userId, displaySong);
      setIsFavorite(true);
      Alert.alert("Berhasil", "Lagu ditambahkan ke favorit!");
    } catch {
      Alert.alert("Error", "Gagal menyimpan ke favorit.");
    } finally {
      setSavingFav(false);
    }
  };

  const handleAddToPlaylist = () => {
    if (!user || !userId) {
      Alert.alert("Perlu Login", "Silakan login untuk mengelola playlist.", [
        { text: "Login", onPress: () => router.push("/login") },
        { text: "Batal", style: "cancel" },
      ]);
      return;
    }
    if (playlists.length === 0) {
      Alert.alert("Info", "Buat playlist terlebih dahulu di halaman Playlist.");
      return;
    }
    setShowPlaylistModal(true);
  };

  const handleSelectPlaylist = async (playlistId: string) => {
    setShowPlaylistModal(false);
    if (!user || !userId) return;
    try {
      await addSongToPlaylist(userId, playlistId, displaySong);
      Alert.alert("Berhasil", "Lagu ditambahkan ke playlist!");
    } catch {
      Alert.alert("Error", "Gagal menambahkan ke playlist.");
    }
  };

  const artworkUrl = displaySong.artworkUrl100?.replace("100x100", "600x600");

  return (
    <View style={[styles.root, { backgroundColor: isDark ? "#121212" : "#FFFFFF" }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Cover artwork */}
        <Image source={{ uri: artworkUrl }} style={styles.artwork} />

        {/* Info lagu + favorit */}
        <View style={styles.infoRow}>
          <View style={styles.infoText}>
            <Text
              style={[styles.trackName, { color: isDark ? "#FFFFFF" : "#111111" }]}
              numberOfLines={1}
            >
              {displaySong.trackName}
            </Text>
            <Text
              style={[styles.artistName, { color: isDark ? "#B3B3B3" : "#555555" }]}
              numberOfLines={1}
            >
              {displaySong.artistName}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleSaveFavorite}
            disabled={isFavorite || savingFav}
            style={styles.heartBtn}
          >
            <Text style={{ fontSize: 28 }}>{isFavorite ? "❤️" : "🤍"}</Text>
          </TouchableOpacity>
        </View>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBg,
              { backgroundColor: isDark ? "#535353" : "#E0E0E0" },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: isDark ? "#FFFFFF" : "#111111",
                  width: isCurrentlyPlaying ? "35%" : "0%",
                },
              ]}
            />
          </View>
          <View style={styles.timeRow}>
            <Text style={[styles.timeText, { color: isDark ? "#B3B3B3" : "#777777" }]}>
              {isCurrentlyPlaying ? "0:10" : "0:00"}
            </Text>
            <Text style={[styles.timeText, { color: isDark ? "#B3B3B3" : "#777777" }]}>
              0:30
            </Text>
          </View>
        </View>

        {/* Kontrol player */}
        <View style={styles.controls}>
          <TouchableOpacity
            onPress={playPrev}
            disabled={!hasPrev}
            style={{ opacity: hasPrev ? 1 : 0.25 }}
          >
            <Text style={[styles.controlBig, { color: isDark ? "#FFFFFF" : "#111111" }]}>
              ⏮
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handlePlayPause}
            style={[
              styles.playBtn,
              { backgroundColor: isDark ? "#FFFFFF" : "#111111" },
            ]}
          >
            <Text style={[styles.playIcon, { color: isDark ? "#111111" : "#FFFFFF" }]}>
              {isCurrentlyPlaying ? "⏸" : "▶"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={playNext}
            disabled={!hasNext}
            style={{ opacity: hasNext ? 1 : 0.25 }}
          >
            <Text style={[styles.controlBig, { color: isDark ? "#FFFFFF" : "#111111" }]}>
              ⏭
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tambah ke playlist */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              { backgroundColor: isDark ? "#282828" : "#F5F5F5" },
            ]}
            onPress={handleAddToPlaylist}
          >
            <Text style={styles.actionBtnIcon}>🎶</Text>
            <Text
              style={[
                styles.actionBtnText,
                { color: isDark ? "#FFFFFF" : "#111111" },
              ]}
            >
              Tambah ke Playlist
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info lagu */}
        <View
          style={[
            styles.infoCard,
            { backgroundColor: isDark ? "#282828" : "#F5F5F5" },
          ]}
        >
          <Text
            style={[styles.infoCardTitle, { color: isDark ? "#FFFFFF" : "#111111" }]}
          >
            Info Lagu
          </Text>
          <View style={styles.infoCardRow}>
            <Text style={[styles.infoCardLabel, { color: isDark ? "#B3B3B3" : "#777" }]}>
              Album
            </Text>
            <Text
              style={[styles.infoCardValue, { color: isDark ? "#FFFFFF" : "#111111" }]}
              numberOfLines={1}
            >
              {displaySong.collectionName}
            </Text>
          </View>
          <View style={styles.infoCardRow}>
            <Text style={[styles.infoCardLabel, { color: isDark ? "#B3B3B3" : "#777" }]}>
              Genre
            </Text>
            <Text
              style={[styles.infoCardValue, { color: isDark ? "#FFFFFF" : "#111111" }]}
            >
              {displaySong.primaryGenreName ?? "-"}
            </Text>
          </View>
          {displaySong.trackPrice && displaySong.trackPrice > 0 ? (
            <View style={styles.infoCardRow}>
              <Text
                style={[styles.infoCardLabel, { color: isDark ? "#B3B3B3" : "#777" }]}
              >
                Harga
              </Text>
              <Text
                style={[styles.infoCardValue, { color: isDark ? "#FFFFFF" : "#111111" }]}
              >
                {displaySong.currency} {displaySong.trackPrice}
              </Text>
            </View>
          ) : null}
          {!displaySong.previewUrl && (
            <Text style={{ color: "#EF4444", fontSize: 13, marginTop: 4 }}>
              ⚠️ Preview tidak tersedia
            </Text>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modal playlist */}
      <Modal
        visible={showPlaylistModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPlaylistModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalBox,
              { backgroundColor: isDark ? "#282828" : "#FFFFFF" },
            ]}
          >
            <Text
              style={[styles.modalTitle, { color: isDark ? "#FFFFFF" : "#111111" }]}
            >
              Pilih Playlist
            </Text>
            <FlatList
              data={playlists}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.playlistItem,
                    { borderBottomColor: isDark ? "#333" : "#E0E0E0" },
                  ]}
                  onPress={() => handleSelectPlaylist(item.id)}
                >
                  <Text
                    style={[
                      styles.playlistItemText,
                      { color: isDark ? "#FFFFFF" : "#111111" },
                    ]}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={{ color: isDark ? "#B3B3B3" : "#777", fontSize: 13 }}
                  >
                    {item.songs.length} lagu
                  </Text>
                </TouchableOpacity>
              )}
            />
            <View style={{ marginTop: 12 }}>
              <CustomButton
                title="Batal"
                onPress={() => setShowPlaylistModal(false)}
                variant="outline"
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingBottom: 40 },
  artwork: { width: SCREEN_WIDTH, height: SCREEN_WIDTH },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 8,
  },
  infoText: { flex: 1 },
  trackName: { fontSize: 22, fontWeight: "800", marginBottom: 4 },
  artistName: { fontSize: 15 },
  heartBtn: { paddingLeft: 16 },
  progressContainer: { paddingHorizontal: 24, marginTop: 8 },
  progressBg: { height: 4, borderRadius: 2, overflow: "hidden" },
  progressFill: { height: 4, borderRadius: 2 },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  timeText: { fontSize: 11 },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    paddingHorizontal: 24,
    marginTop: 24,
    marginBottom: 24,
  },
  controlBig: { fontSize: 36 },
  playBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  playIcon: { fontSize: 30 },
  actionRow: { paddingHorizontal: 24, marginBottom: 20 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  actionBtnIcon: { fontSize: 20 },
  actionBtnText: { fontSize: 15, fontWeight: "600" },
  infoCard: { marginHorizontal: 24, borderRadius: 12, padding: 16 },
  infoCardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
  infoCardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoCardLabel: { fontSize: 13 },
  infoCardValue: {
    fontSize: 13,
    fontWeight: "600",
    maxWidth: "60%",
    textAlign: "right",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalBox: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "60%",
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  playlistItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  playlistItemText: { fontSize: 15, fontWeight: "600" },
});