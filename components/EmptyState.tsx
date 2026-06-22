import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";

interface EmptyStateProps {
  title: string;
  description?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, description }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🎵</Text>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {description ? (
        <Text style={[styles.description, { color: colors.subText }]}>
          {description}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  icon: { fontSize: 48, marginBottom: 12 },
  title: { fontSize: 18, fontWeight: "700", textAlign: "center" },
  description: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 20,
  },
});

export default EmptyState;
