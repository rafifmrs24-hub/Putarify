import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";

export default function IndexScreen() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Animasi masuk logo dan teks
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (!loading) {
      // Delay sedikit sebelum redirect agar animasi terlihat
      setTimeout(() => {
        if (user) {
          router.replace("/home");
        } else {
          router.replace("/login");
        }
      }, 1800);
    }
  }, [user, loading]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
          alignItems: "center",
        }}
      >
        <Logo size={110} />
      </Animated.View>
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          alignItems: "center",
          marginTop: 20,
        }}
      >
        <Text style={styles.title}>Putarify</Text>
        <Text style={styles.subtitle}>putar musik favoritmu</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#7C3AED",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 6,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 15,
    color: "#DDD6FE",
    letterSpacing: 0.5,
  },
});