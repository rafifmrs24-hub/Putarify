import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomNav from "../components/BottomNav";
import CustomButton from "../components/CustomButton";
import CustomInput from "../components/CustomInput";
import EmptyState from "../components/EmptyState";
import LoadingView from "../components/LoadingView";
import MiniPlayer from "../components/MiniPlayer";
import PlaylistCard from "../components/PlaylistCard";
import { useAudioContext } from "../context/AudioContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { createPlaylist, deletePlaylist, getPlaylists } from "../services/playlistService";
import { Playlist } from "../types/Playlist";

export default function PlaylistScreen() {
  const { user, userId } = useAuth();
  const { colors, theme } = useTheme();
  const { currentSong } = useAudioContext();
  const router = useRouter();
  const isDark = theme === "dark";

  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!user || !userId) return;
      setLoading(true);
      getPlaylists(userId)
        .then(setPlaylists)
        .finally(() => setLoading(false));
    }, [user, userId])
  );

  const handleCreate = async () => {
    if (!newName.trim()) {
      Alert.alert("Error", "Nama playlist wajib diisi.");
      return;
    }
    setCreating(true);
    try {
      await createPlaylist(userId!, newName.trim(), newDesc.trim());
      setShowModal(false);
      setNewName("");
      setNewDesc("");
      const updated = await getPlaylists(userId!);
      setPlaylists(updated);
    } catch {
      Alert.alert("Error", "Gagal membuat playlist.");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = (playlistId: string, name: string) => {
    Alert.alert(
      "Hapus Playlist",
      `Yakin ingin menghapus playlist "${name}"?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            await deletePlaylist(userId!, playlistId);
            setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
            Alert.alert("Berhasil", "Playlist berhasil dihapus.");
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
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            🎶 Playlist Saya
          </Text>
          <CustomButton
            title="+ Baru"
            onPress={() => setShowModal(true)}
            variant="primary"
          />
        </View>

        {playlists.length === 0 ? (
          <EmptyState
            title="Belum ada playlist"
            description="Buat playlist pertama Anda dengan menekan tombol + Baru."
          />
        ) : (
          <FlatList
            data={playlists}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <PlaylistCard
                playlist={item}
                onPress={() =>
                  router.push({
                    pathname: "/playlist-detail",
                    params: {
                      playlistId: item.id,
                      playlistName: item.name,
                      playlistDesc: item.description ?? "",
                    },
                  })
                }
                onDelete={() => handleDelete(item.id, item.name)}
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

      {/* Modal buat playlist */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={[styles.modalBox, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Buat Playlist Baru
            </Text>
            <CustomInput
              label="Nama Playlist"
              placeholder="Contoh: Favorit Pagi"
              value={newName}
              onChangeText={setNewName}
            />
            <CustomInput
              label="Deskripsi (opsional)"
              placeholder="Deskripsi singkat playlist"
              value={newDesc}
              onChangeText={setNewDesc}
              multiline
            />
            <View style={styles.modalButtons}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <CustomButton
                  title="Batal"
                  onPress={() => {
                    setShowModal(false);
                    setNewName("");
                    setNewDesc("");
                  }}
                  variant="outline"
                />
              </View>
              <View style={{ flex: 1 }}>
                <CustomButton
                  title="Buat"
                  onPress={handleCreate}
                  loading={creating}
                />
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  title: { fontSize: 20, fontWeight: "800" },
  listContent: { paddingTop: 8, paddingBottom: 24 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalBox: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 16 },
  modalButtons: { flexDirection: "row", marginTop: 4 },
});