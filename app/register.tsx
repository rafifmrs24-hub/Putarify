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

export default function RegisterScreen() {
  const { register, checkUsername } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();

  // Deklarasi type alias di luar useState agar TypeScript tidak bingung
  type UsernameStatus = "idle" | "checking" | "available" | "taken";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(logoScale, { toValue: 1, tension: 80, friction: 7, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  // Cek ketersediaan username saat user berhenti mengetik
  useEffect(() => {
    if (!username.trim() || username.length < 3) {
      setUsernameStatus("idle");
      return;
    }
    setUsernameStatus("checking");
    const timer = setTimeout(async () => {
      const available = await checkUsername(username.trim());
      setUsernameStatus(available ? "available" : "taken");
    }, 600); // debounce 600ms
    return () => clearTimeout(timer);
  }, [username]);

  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !username.trim()) {
      setError("Semua field wajib diisi.");
      return;
    }
    if (username.length < 3) {
      setError("Username minimal 3 karakter.");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError("Username hanya boleh huruf, angka, dan underscore.");
      return;
    }
    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }
    if (usernameStatus === "taken") {
      setError("Username sudah digunakan. Pilih username lain.");
      return;
    }
    if (usernameStatus === "checking") {
      setError("Mohon tunggu, sedang mengecek username.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await register(email.trim(), password, username.trim());
      router.replace("/home");
    } catch (e: unknown) {
      if (e instanceof Error) {
        switch (e.message) {
          case "USERNAME_TAKEN":
            setError("Username sudah digunakan. Pilih username lain.");
            break;
          case "FIRESTORE_ERROR":
            setError("Gagal menyimpan profil. Coba lagi.");
            break;
          default:
            // Error dari Firebase Auth
            if (e.message.includes("email-already-in-use")) {
              setError("Email sudah terdaftar. Gunakan email lain.");
            } else if (e.message.includes("invalid-email")) {
              setError("Format email tidak valid.");
            } else if (e.message.includes("weak-password")) {
              setError("Password terlalu lemah. Minimal 6 karakter.");
            } else {
              setError("Registrasi gagal. Coba lagi.");
              console.error("Register error:", e.message);
            }
        }
      } else {
        setError("Terjadi kesalahan. Coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getUsernameStatusText = () => {
    switch (usernameStatus) {
      case "checking": return "⏳ Mengecek...";
      case "available": return "✅ Username tersedia";
      case "taken": return "❌ Username sudah dipakai";
      default: return "";
    }
  };

  const getUsernameStatusColor = () => {
    switch (usernameStatus) {
      case "available": return "#10B981";
      case "taken": return "#EF4444";
      default: return colors.subText;
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
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

        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        >
          <Text style={[styles.title, { color: colors.text }]}>Buat Akun</Text>
          <Text style={[styles.subtitle, { color: colors.subText }]}>
            Daftar untuk mulai menggunakan Putarify
          </Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.form,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Field Username */}
          <Text style={[styles.label, { color: colors.text }]}>Username</Text>
          <View
            style={[
              styles.inputBox,
              {
                backgroundColor: colors.inputBg,
                borderColor:
                  usernameStatus === "available"
                    ? "#10B981"
                    : usernameStatus === "taken"
                    ? "#EF4444"
                    : colors.border,
              },
            ]}
          >
            <Text style={{ color: colors.subText, fontSize: 15 }}>@</Text>
            <TextInput
              style={[styles.inputInner, { color: colors.text }]}
              placeholder="username_kamu"
              placeholderTextColor={colors.placeholder}
              value={username}
              onChangeText={(text) =>
                setUsername(text.toLowerCase().replace(/[^a-z0-9_]/g, ""))
              }
              autoCapitalize="none"
            />
          </View>
          {usernameStatus !== "idle" && (
            <Text
              style={[styles.usernameStatus, { color: getUsernameStatusColor() }]}
            >
              {getUsernameStatusText()}
            </Text>
          )}

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
              { backgroundColor: colors.inputBg, borderColor: colors.border },
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
            >
              <Text style={[styles.eyeText, { color: colors.subText }]}>
                {showPassword ? "HIDE" : "SHOW"}
              </Text>
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <CustomButton
            title="Daftar"
            onPress={handleRegister}
            loading={loading}
            disabled={usernameStatus === "taken" || usernameStatus === "checking"}
          />
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim }}>
          <TouchableOpacity onPress={() => router.push("/login")}>
            <Text style={[styles.link, { color: colors.subText }]}>
              Sudah punya akun?{" "}
              <Text style={{ color: colors.primary, fontWeight: "700" }}>
                Masuk
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
  title: { fontSize: 28, fontWeight: "800", textAlign: "center", marginBottom: 4 },
  subtitle: { fontSize: 15, textAlign: "center", marginBottom: 32 },
  form: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 6 },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 4,
  },
  inputInner: { flex: 1, fontSize: 15, paddingVertical: 12, marginLeft: 4 },
  usernameStatus: { fontSize: 12, marginBottom: 12, marginLeft: 2 },
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
  errorText: { color: "#EF4444", fontSize: 13, marginBottom: 10, textAlign: "center" },
  link: { fontSize: 14, textAlign: "center", marginTop: 4 },
});