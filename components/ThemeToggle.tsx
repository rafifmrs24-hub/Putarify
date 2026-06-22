import React from "react";
import { View, Text, Switch, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";

const ThemeToggle: React.FC = () => {
  const { theme, colors, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Text style={{ fontSize: 20 }}>{isDark ? "🌙" : "☀️"}</Text>
      <Text style={[styles.label, { color: colors.text }]}>
        {isDark ? "Dark Mode" : "Light Mode"}
      </Text>
      <Switch
        value={isDark}
        onValueChange={toggleTheme}
        trackColor={{ false: "#D1D5DB", true: "#3B82F6" }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 10,
    marginHorizontal: 16,
    marginVertical: 6,
  },
  label: { flex: 1, fontSize: 15, fontWeight: "600" },
});

export default ThemeToggle;
