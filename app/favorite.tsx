import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomNav from "../components/BottomNav";
import EmptyState from "../components/EmptyState";
import FavoriteCard from "../components/FavoriteCard";
import LoadingView from "../components/LoadingView";
import MiniPlayer from "../components/MiniPlayer";
import { useAudioContext } from "../context/AudioContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { deleteFavoriteSong, getFavoriteSongs } from "../services/favoriteService";
import { Song } from "../types/Song";

export default function FavoriteScreen() {
  const { user, userId } = useAuth();
  const { colors, theme } = useTheme();
  const { currentSong } = useAudioContext();
  const router = useRouter();
  const isDark = theme === "dark";

  const [favorites, setFavorites] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!user || !userId) return;
      setLoading(true);
      getFavoriteSongs(userId)
        .then(setFavorites)
        .finally(() => setLoading(false));
    }, [user, userId])
  );

  const handleDelete = (trackId: number) => {
    Alert.alert(
      "Hapus Favorit",
      "Yakin ingin menghapus lagu ini dari favorit?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            await deleteFavoriteSong(userId!, trackId);
            setFavorites((prev) => prev.filter((s) => s.trackId !== trackId));
          },
        },
      ]
    );
  };

  if (loading) return <LoadingView />;

  return (
    // Root View mengikuti warna background tema
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <SafeAreaView style={styles.safeTop} edges={["top"]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            ❤️ Favorit Saya
          </Text>
          <Text style={[styles.count, { color: colors.subText }]}>
            {favorites.length} lagu
          </Text>
        </View>

        {favorites.length === 0 ? (
          <EmptyState
            title="Belum ada lagu favorit"
            description="Simpan lagu favorit dari halaman detail lagu."
          />
        ) : (
          <FlatList
            data={favorites}
            keyExtractor={(item) => String(item.trackId)}
            renderItem={({ item }) => (
              <FavoriteCard
                song={item}
                onPress={() =>
                  router.push({
                    pathname: "/song-detail",
                    params: {
                      song: JSON.stringify(item),
                      songList: JSON.stringify(favorites),
                    },
                  })
                }
                onDelete={() => handleDelete(item.trackId)}
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>

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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  title: { fontSize: 20, fontWeight: "800" },
  count: { fontSize: 14 },
  listContent: { paddingTop: 8, paddingBottom: 24 },
});