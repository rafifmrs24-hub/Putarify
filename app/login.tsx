import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import CustomButton from "../components/CustomButton";
import CustomInput from "../components/CustomInput";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function LoginScreen() {
  const { login } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Animasi
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 80,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Email dan password wajib diisi.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace("/home");
    } catch {
      setError("Login gagal. Periksa email dan password Anda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Logo dengan animasi spring */}
        <Animated.View
          style={{
            alignItems: "center",
            marginBottom: 8,
            transform: [{ scale: logoScale }],
            opacity: fadeAnim,
          }}
        >
          <Logo size={80} />
        </Animated.View>

        {/* Teks dengan animasi fade + slide */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Text style={[styles.title, { color: colors.text }]}>Putarify</Text>
          <Text style={[styles.subtitle, { color: colors.subText }]}>
            Masuk untuk melanjutkan
          </Text>
        </Animated.View>

        {/* Form dengan animasi delay */}
        <Animated.View
          style={[
            styles.form,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <CustomInput
            label="Email"
            placeholder="email@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={[styles.label, { color: colors.text }]}>Password</Text>
          <View
            style={[
              styles.passwordBox,
              {
                backgroundColor: colors.inputBg,
                borderColor: colors.border,
              },
            ]}
          >
            <TextInput
              style={[styles.passwordInput, { color: colors.text }]}
              placeholder="Minimal 6 karakter"
              placeholderTextColor={colors.placeholder}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword((prev) => !prev)}
              style={styles.eyeBtn}
              activeOpacity={0.7}
            >
              <Text style={[styles.eyeText, { color: colors.subText }]}>
                {showPassword ? "HIDE" : "SHOW"}
              </Text>
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <CustomButton title="Masuk" onPress={handleLogin} loading={loading} />
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim }}>
          <TouchableOpacity onPress={() => router.push("/register")}>
            <Text style={[styles.link, { color: colors.subText }]}>
              Belum punya akun?{" "}
              <Text style={{ color: colors.primary, fontWeight: "700" }}>
                Daftar
              </Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flexGrow: 1, justifyContent: "center", padding: 24 },
  title: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: { fontSize: 15, textAlign: "center", marginBottom: 32 },
  form: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 6 },
  passwordBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  passwordInput: { flex: 1, fontSize: 15, paddingVertical: 12 },
  eyeBtn: { paddingLeft: 10, paddingVertical: 4 },
  eyeText: { fontSize: 12, fontWeight: "700", letterSpacing: 0.5 },
  errorText: {
    color: "#EF4444",
    fontSize: 13,
    marginBottom: 10,
    textAlign: "center",
  },
  link: { fontSize: 14, textAlign: "center", marginTop: 4 },
});