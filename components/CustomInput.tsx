import React from "react";
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
} from "react-native";
import { useTheme } from "../context/ThemeContext";

interface CustomInputProps extends TextInputProps {
  label?: string;
}

const CustomInput: React.FC<CustomInputProps> = ({ label, style, ...rest }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {label ? (
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      ) : null}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.inputBg,
            color: colors.text,
            borderColor: colors.border,
          },
          style,
        ]}
        placeholderTextColor={colors.placeholder}
        {...rest}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
});

export default CustomInput;
