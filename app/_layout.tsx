import { Stack } from "expo-router";
import { AudioProvider } from "../context/AudioContext";
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider, useTheme } from "../context/ThemeContext";

function AppStack() {
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";

  const headerStyle = {
    backgroundColor: colors.background,
  };

  const headerTitleStyle = {
    color: colors.text,
  };

  const headerTintColor = colors.text;

  return (
    <Stack
      screenOptions={{
        headerStyle,
        headerTitleStyle,
        headerTintColor,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen
        name="song-detail"
        options={{
          title: "Detail Lagu",
          headerBackTitle: "Kembali",
          headerStyle,
          headerTitleStyle,
          headerTintColor,
        }}
      />
      <Stack.Screen
        name="favorite"
        options={{
          title: "Favorit Saya",
          headerBackTitle: "Kembali",
          headerStyle,
          headerTitleStyle,
          headerTintColor,
        }}
      />
      <Stack.Screen
        name="playlist"
        options={{
          title: "Playlist Saya",
          headerBackTitle: "Kembali",
          headerStyle,
          headerTitleStyle,
          headerTintColor,
        }}
      />
      <Stack.Screen
        name="playlist-detail"
        options={{
          title: "Detail Playlist",
          headerBackTitle: "Kembali",
          headerStyle,
          headerTitleStyle,
          headerTintColor,
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          title: "Profil",
          headerBackTitle: "Kembali",
          headerStyle,
          headerTitleStyle,
          headerTintColor,
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AudioProvider>
          <AppStack />
        </AudioProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}