import { usePathname, useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

const BottomNav: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";

  const tabs = [
    { label: "Home", icon: "🏠", route: "/home" },
    { label: "Favorit", icon: "❤️", route: "/favorite" },
    { label: "Playlist", icon: "🎶", route: "/playlist" },
    { label: "Profil", icon: "👤", route: "/profile" },
  ];

  return (
    <View
      style={[
        styles.navbar,
        {
          backgroundColor: isDark ? "#111111" : "#FFFFFF",
          borderTopColor: colors.border,
        },
      ]}
    >
      {tabs.map((tab) => {
        const isActive = pathname === tab.route;
        return (
          <TouchableOpacity
            key={tab.route}
            style={styles.navItem}
            onPress={() => router.push(tab.route as any)}
          >
            <Text style={styles.navIcon}>{tab.icon}</Text>
            <Text
              style={[
                styles.navLabel,
                { color: isActive ? colors.primary : colors.subText },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingVertical: 10,
    paddingBottom: 16,
    paddingHorizontal: 8,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  navIcon: { fontSize: 22 },
  navLabel: { fontSize: 11, fontWeight: "600" },
});

export default BottomNav;