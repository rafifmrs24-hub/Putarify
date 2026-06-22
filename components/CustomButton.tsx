import React, { useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "../context/ThemeContext";

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "outline" | "danger";
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = "primary",
}) => {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const bgColor =
    variant === "primary"
      ? colors.primary
      : variant === "danger"
      ? "#EF4444"
      : "transparent";

  const textColor = variant === "outline" ? colors.primary : "#FFFFFF";
  const borderColor = variant === "outline" ? colors.primary : "transparent";

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={1}
        style={[
          styles.button,
          {
            backgroundColor: bgColor,
            borderColor,
            borderWidth: variant === "outline" ? 1.5 : 0,
            opacity: disabled || loading ? 0.6 : 1,
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={[styles.text, { color: textColor }]}>{title}</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 10,
    paddingVertical: 13,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  text: { fontSize: 15, fontWeight: "700" },
});

export default CustomButton;