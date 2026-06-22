import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomNav from "../components/BottomNav";
import CustomButton from "../components/CustomButton";
import MiniPlayer from "../components/MiniPlayer";
import ThemeToggle from "../components/ThemeToggle";
import { useAudioContext } from "../context/AudioContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { getFavoriteCount } from "../services/favoriteService";
import { getPlaylistCount } from "../services/playlistService";
import { getSearchHistoryCount } from "../services/searchHistoryService";

interface StatCardProps {
  icon: string;
  label: string;
  value: number;
  bgColor: string;
  textColor: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon, label, value, bgColor, textColor,
}) => (
  <View style={[styles.statCard, { backgroundColor: bgColor }]}>
    <Text style={styles.statIcon}>{icon}</Text>
    <Text style={[styles.statValue, { color: textColor }]}>{value}</Text>
    <Text style={[styles.statLabel, { color: textColor + "CC" }]}>{label}</Text>
  </View>
);

export default function ProfileScreen() {
  // Ditambahkan username dan userId dari useAuth
  const { user, logout, username, userId } = useAuth();
  const { colors, theme } = useTheme();
  const { currentSong } = useAudioContext();
  const router = useRouter();
  const isDark = theme === "dark";

  const [favCount, setFavCount] = useState(0);
  const [playlistCount, setPlaylistCount] = useState(0);
  const [historyCount, setHistoryCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      if (!user || !userId) return;
      Promise.all([
        getFavoriteCount(userId),
        getPlaylistCount(userId),
        getSearchHistoryCount(userId),
      ]).then(([fav, pl, hist]) => {
        setFavCount(fav);
        setPlaylistCount(pl);
        setHistoryCount(hist);
      });
    }, [user, userId])
  );

  const handleLogout = () => {
    Alert.alert("Logout", "Yakin ingin keluar dari akun?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/login");
        },
      },
    ]);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <SafeAreaView style={styles.safeTop} edges={["top"]}>
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Avatar */}
          <View
            style={[styles.avatarBox, { backgroundColor: colors.primary + "22" }]}
          >
            <Text style={styles.avatarText}>👤</Text>
          </View>
          
          {/* Info User yang baru */}
          <Text style={[styles.email, { color: colors.text }]}>
            @{username ?? "pengguna"}
          </Text>
          <Text style={[styles.uid, { color: colors.subText }]}>
            {user?.email}
          </Text>

          {/* Statistik */}
          <View style={styles.statsRow}>
            <StatCard
              icon="❤️"
              label="Favorit"
              value={favCount}
              bgColor="#FEE2E2"
              textColor="#991B1B"
            />
            <StatCard
              icon="🎶"
              label="Playlist"
              value={playlistCount}
              bgColor="#DBEAFE"
              textColor="#1E40AF"
            />
            <StatCard
              icon="🕐"
              label="Riwayat"
              value={historyCount}
              bgColor="#D1FAE5"
              textColor="#065F46"
            />
          </View>

          {/* Pengaturan tema */}
          <Text style={[styles.sectionTitle, { color: colors.subText }]}>
            PENGATURAN
          </Text>
          <ThemeToggle />

          {/* Logout */}
          <View style={styles.logoutBox}>
            <CustomButton
              title="Logout"
              onPress={handleLogout}
              variant="danger"
            />
          </View>
        </ScrollView>
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
  scroll: { padding: 20, alignItems: "center" },
  avatarBox: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: { fontSize: 44 },
  email: { fontSize: 17, fontWeight: "700", marginBottom: 4 },
  uid: { fontSize: 12, marginBottom: 24 },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 28,
    width: "100%",
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  statIcon: { fontSize: 22, marginBottom: 4 },
  statValue: { fontSize: 22, fontWeight: "800" },
  statLabel: { fontSize: 11, fontWeight: "600", marginTop: 2 },
  sectionTitle: {
    alignSelf: "flex-start",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 8,
  },
  logoutBox: { width: "100%", marginTop: 24 },
});