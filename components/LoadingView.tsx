import React from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";

const LoadingView: React.FC = () => {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[styles.text, { color: colors.subText }]}>Memuat...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  text: { fontSize: 14, marginTop: 8 },
});

export default LoadingView;
