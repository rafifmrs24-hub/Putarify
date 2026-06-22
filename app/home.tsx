import { useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Keyboard,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { searchSongs } from "../api/itunesApi";
import BottomNav from "../components/BottomNav";
import EmptyState from "../components/EmptyState";
import GenreFilter, { ALL_GENRE } from "../components/GenreFilter";
import LoadingView from "../components/LoadingView";
import Logo from "../components/Logo";
import MiniPlayer from "../components/MiniPlayer";
import SearchHistoryItem from "../components/SearchHistoryItem";
import SongCard from "../components/SongCard";
import { useAudioContext } from "../context/AudioContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  deleteSearchHistory,
  getSearchHistory,
  saveSearchHistory,
} from "../services/searchHistoryService";
import { SearchHistory } from "../types/SearchHistory";
import { Song } from "../types/Song";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2; // 2 kolom dengan padding

const GENRE_RECOMMENDATIONS = [
  { label: "Pop", emoji: "🎤", color: "#E91E8C", query: "pop" },
  { label: "Rock", emoji: "🎸", color: "#E61E2B", query: "rock" },
  { label: "Hip-Hop", emoji: "🎧", color: "#7B2FBE", query: "hip hop" },
  { label: "Jazz", emoji: "🎷", color: "#E87D0D", query: "jazz" },
  { label: "Electronic", emoji: "🎹", color: "#0D73EC", query: "electronic" },
  { label: "R&B", emoji: "🎵", color: "#1DB954", query: "r&b soul" },
  { label: "K-Pop", emoji: "⭐", color: "#F97316", query: "kpop" },
  { label: "Classical", emoji: "🎻", color: "#6366F1", query: "classical" },
  { label: "Dangdut", emoji: "🥁", color: "#14B8A6", query: "dangdut" },
  { label: "Indie", emoji: "🌿", color: "#84CC16", query: "indie" },
];

const POPULAR_SEARCHES = [
  "Denny Caknan",
  "Taylor Swift",
  "BTS",
  "Coldplay",
  "Raisa",
  "Ed Sheeran",
  "Tulus",
  "Billie Eilish",
];

export default function HomeScreen() {
  const { currentSong, isPlaying: globalPlaying, playSong } = useAudioContext();
  // Tambah userId dan username dari useAuth
  const { user, userId, username } = useAuth();
  const { colors, theme } = useTheme();
  const router = useRouter();

  const [keyword, setKeyword] = useState("");
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string>(ALL_GENRE);
  const [genres, setGenres] = useState<string[]>([]);
  const [history, setHistory] = useState<SearchHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputRef = useRef<TextInput>(null);
  const isDark = theme === "dark";

  const loadHistory = useCallback(async () => {
    if (!user || !userId) return;
    const data = await getSearchHistory(userId); // ← userId bukan user.uid
    setHistory(data.slice(0, 5));
    setShowHistory(true);
  }, [user, userId]);

  const handleFocus = async () => {
    setIsFocused(true);
    await loadHistory();
  };

  const hideHistory = () => {
    setShowHistory(false);
    setIsFocused(false);
    Keyboard.dismiss();
  };

  const handleSearch = async (term: string = keyword) => {
    if (!term.trim()) return;
    setKeyword(term);
    setShowHistory(false);
    setIsFocused(false);
    Keyboard.dismiss();
    setLoading(true);
    setError("");
    setHasSearched(true);
    setSelectedGenre(ALL_GENRE);
    try {
      const results = await searchSongs(term.trim());
      setSongs(results);
      const uniqueGenres = Array.from(
        new Set(
          results.map((s) => s.primaryGenreName).filter(Boolean) as string[]
        )
      );
      setGenres(uniqueGenres);
      // Gunakan userId (username) bukan user.uid
      if (user && userId) {
        await saveSearchHistory(userId, term.trim());
        loadHistory();
      }
    } catch {
      setError("Gagal mengambil data. Periksa koneksi internet.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHistory = async (historyId: string) => {
    if (!user || !userId) return;
    await deleteSearchHistory(userId, historyId); // ← userId bukan user.uid
    setHistory((prev) => prev.filter((h) => h.id !== historyId));
  };

  const filteredSongs =
    selectedGenre === ALL_GENRE
      ? songs
      : songs.filter((s) => s.primaryGenreName === selectedGenre);

  const renderHomeContent = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      onScrollBeginDrag={hideHistory}
    >
      {/* Greeting */}
      <View style={styles.greetingBox}>
        <Text style={[styles.greetingText, { color: colors.subText }]}>
          Selamat datang 👋
        </Text>
        <Text style={[styles.greetingName, { color: colors.text }]}>
          {username ?? user?.email?.split("@")[0] ?? "Pendengar"}
        </Text>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Mulai Jelajahi
      </Text>
      <View style={styles.genreGrid}>
        {GENRE_RECOMMENDATIONS.map((genre) => (
          <TouchableOpacity
            key={genre.label}
            style={[
              styles.genreCard,
              { backgroundColor: genre.color, width: CARD_WIDTH },
            ]}
            onPress={() => handleSearch(genre.query)}
            activeOpacity={0.85}
          >
            <Text style={styles.genreEmoji}>{genre.emoji}</Text>
            <Text style={styles.genreLabel}>{genre.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Temukan Sesuatu yang Lain
      </Text>
      <View style={styles.popularGrid}>
        {POPULAR_SEARCHES.map((term) => (
          <TouchableOpacity
            key={term}
            style={[
              styles.popularChip,
              {
                backgroundColor: isDark ? "#1E1E1E" : "#F0F0F0",
                borderColor: colors.border,
              },
            ]}
            onPress={() => handleSearch(term)}
          >
            <Text style={[styles.popularText, { color: colors.text }]}>
              🔥 {term}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <SafeAreaView style={styles.safeTop} edges={["top"]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Logo size={28} />
            <Text style={[styles.appTitle, { color: colors.primary }]}>
              Putarify
            </Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <View
            style={[
              styles.searchRow,
              {
                backgroundColor: colors.inputBg,
                borderColor: isFocused ? colors.primary : colors.border,
                borderWidth: isFocused ? 2 : 1,
              },
            ]}
          >
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              ref={inputRef}
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Apa yang ingin kamu dengarkan?"
              placeholderTextColor={colors.placeholder}
              value={keyword}
              onChangeText={setKeyword}
              onFocus={handleFocus}
              onSubmitEditing={() => handleSearch()}
              returnKeyType="search"
            />
            {keyword.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setKeyword("");
                  setSongs([]);
                  setHasSearched(false);
                }}
              >
                <Text style={{ color: colors.subText, paddingHorizontal: 8 }}>
                  ✕
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {showHistory && history.length > 0 && (
            <View
              style={[
                styles.historyOverlay,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  shadowColor: isDark ? "#000" : "#333",
                },
              ]}
            >
              <View style={styles.historyHeader}>
                <Text style={[styles.historyTitle, { color: colors.subText }]}>
                  RIWAYAT PENCARIAN
                </Text>
                <TouchableOpacity onPress={hideHistory}>
                  <Text style={[styles.historyClose, { color: colors.primary }]}>
                    Tutup
                  </Text>
                </TouchableOpacity>
              </View>
              {history.map((item) => (
                <SearchHistoryItem
                  key={item.id}
                  keyword={item.keyword}
                  onPress={() => handleSearch(item.keyword)}
                  onDelete={() => handleDeleteHistory(item.id)}
                />
              ))}
            </View>
          )}
        </View>

        {songs.length > 0 && (
          <GenreFilter
            genres={genres}
            selectedGenre={selectedGenre}
            onSelectGenre={setSelectedGenre}
          />
        )}

        {showHistory && (
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={hideHistory}
          />
        )}

        <View style={styles.content}>
          {loading ? (
            <LoadingView />
          ) : error ? (
            <View style={styles.centerBox}>
              <Text style={styles.errorEmoji}>⚠️</Text>
              <Text style={[styles.errorText, { color: colors.text }]}>
                {error}
              </Text>
            </View>
          ) : hasSearched && filteredSongs.length === 0 ? (
            <EmptyState
              title="Lagu tidak ditemukan"
              description="Coba kata kunci lain atau filter genre yang berbeda."
            />
          ) : hasSearched && filteredSongs.length > 0 ? (
            <FlatList
              data={filteredSongs}
              keyExtractor={(item) => String(item.trackId)}
              renderItem={({ item }) => (
                <SongCard
                  song={item}
                  onPress={() => {
                    const idx = filteredSongs.findIndex(
                      (s) => s.trackId === item.trackId
                    );
                    // Set list ke context sebelum navigate
                    playSong(item, filteredSongs, idx >= 0 ? idx : 0);
                    router.push({
                      pathname: "/song-detail",
                      params: {
                        song: JSON.stringify(item),
                        songList: JSON.stringify(filteredSongs),
                      },
                    });
                  }}
                />
              )}
              onScrollBeginDrag={hideHistory}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            renderHomeContent()
          )}
        </View>
      </SafeAreaView>

      {/* Mini Player + Bottom Navbar */}
      <View style={{ backgroundColor: isDark ? "#111111" : "#FFFFFF" }}>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  appTitle: { fontSize: 20, fontWeight: "800" },

  searchContainer: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    zIndex: 100,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15 },

  historyOverlay: {
    position: "absolute",
    top: 54,
    left: 0,
    right: 0,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 8,
    elevation: 10,
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    zIndex: 200,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  historyTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  historyClose: {
    fontSize: 13,
    fontWeight: "700",
  },

  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: 50,
  },

  content: { flex: 1 },
  greetingBox: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  greetingText: { fontSize: 13 },
  greetingName: { fontSize: 22, fontWeight: "800", marginTop: 2 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },

  genreGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 8,
    justifyContent: "space-between",
  },
  genreCard: {
    borderRadius: 10,
    padding: 18,
    marginBottom: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  genreEmoji: { fontSize: 28 },
  genreLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    flexShrink: 1,
  },

  popularGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 8,
  },
  popularChip: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  popularText: { fontSize: 13, fontWeight: "600" },

  centerBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  errorEmoji: { fontSize: 40, marginBottom: 10 },
  errorText: { fontSize: 15, textAlign: "center" },
  listContent: { paddingTop: 4, paddingBottom: 24 },
});