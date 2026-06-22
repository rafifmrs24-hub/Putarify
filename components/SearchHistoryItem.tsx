import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";

interface SearchHistoryItemProps {
  keyword: string;
  onPress: () => void;
  onDelete: () => void;
}

const SearchHistoryItem: React.FC<SearchHistoryItemProps> = ({
  keyword,
  onPress,
  onDelete,
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.inputBg, borderColor: colors.border },
      ]}
    >
      <TouchableOpacity onPress={onPress} style={styles.left}>
        <Text style={[styles.icon]}>🕐</Text>
        <Text style={[styles.keyword, { color: colors.text }]} numberOfLines={1}>
          {keyword}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onDelete} hitSlop={8}>
        <Text style={styles.closeIcon}>✕</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginVertical: 3,
    marginHorizontal: 16,
  },
  left: { flexDirection: "row", alignItems: "center", flex: 1 },
  icon: { fontSize: 14, marginRight: 8 },
  keyword: { fontSize: 14, flex: 1 },
  closeIcon: { fontSize: 13, color: "#9E9E9E", paddingLeft: 8 },
});

export default SearchHistoryItem;
