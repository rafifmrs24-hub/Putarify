import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

interface LogoProps {
  size?: number;
}

const Logo: React.FC<LogoProps> = ({ size = 80 }) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 120 120">
        {/* Piringan vinyl ungu */}
        <Circle cx="60" cy="60" r="56" fill="#7C3AED" />
        <Circle cx="60" cy="60" r="56" fill="none" stroke="#5B21B6" strokeWidth={1} />
        <Circle cx="60" cy="60" r="44" fill="none" stroke="#5B21B6" strokeWidth={0.8} opacity={0.5} />
        <Circle cx="60" cy="60" r="32" fill="none" stroke="#5B21B6" strokeWidth={0.8} opacity={0.5} />
        <Circle cx="60" cy="60" r="20" fill="none" stroke="#5B21B6" strokeWidth={0.8} opacity={0.5} />

        {/* Label tengah vinyl */}
        <Circle cx="60" cy="60" r="13" fill="#FBBF24" />
        <Circle cx="60" cy="60" r="3.5" fill="#5B21B6" />

        {/* Ikon play */}
        <Path d="M75 50 L92 60 L75 70 Z" fill="#FBBF24" />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Logo;