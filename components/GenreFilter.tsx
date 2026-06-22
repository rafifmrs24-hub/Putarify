import React from "react";
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from "react-native";
import { useTheme } from "../context/ThemeContext";

interface GenreFilterProps {
  genres: string[];
  selectedGenre: string;
  onSelectGenre: (genre: string) => void;
}

const ALL_GENRE = "Semua Genre";

const GenreFilter: React.FC<GenreFilterProps> = ({
  genres,
  selectedGenre,
  onSelectGenre,
}) => {
  const { colors } = useTheme();

  const allGenres = [ALL_GENRE, ...genres];

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {allGenres.map((genre) => {
          const active = genre === selectedGenre;
          return (
            <TouchableOpacity
              key={genre}
              onPress={() => onSelectGenre(genre)}
              style={[
                styles.chip,
                {
                  backgroundColor: active
                    ? colors.primary
                    : colors.inputBg,
                  borderColor: active ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: active ? "#FFFFFF" : colors.text },
                ]}
              >
                {genre}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 16, paddingVertical: 8 },
  chip: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 8,
  },
  chipText: { fontSize: 13, fontWeight: "600" },
});

export default GenreFilter;
export { ALL_GENRE };
