import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Theme = "light" | "dark";

interface ThemeColors {
  background: string;
  card: string;
  text: string;
  subText: string;
  border: string;
  primary: string;
  inputBg: string;
  placeholder: string;
}

interface ThemeContextType {
  theme: Theme;
  colors: ThemeColors;
  toggleTheme: () => void;
}

const lightColors: ThemeColors = {
  background: "#FFFFFF",
  card: "#FFFFFF",
  text: "#111111",
  subText: "#666666",
  border: "#E0E0E0",
  primary: "#2563EB",
  inputBg: "#F5F5F5",
  placeholder: "#9E9E9E",
};

const darkColors: ThemeColors = {
  background: "#0A0A0A",
  card: "#1E1E1E",
  text: "#F5F5F5",
  subText: "#AAAAAA",
  border: "#333333",
  primary: "#3B82F6",
  inputBg: "#2A2A2A",
  placeholder: "#666666",
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = "@musicfinder_theme";

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("light");

  // Muat pilihan tema dari AsyncStorage saat app dibuka
  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((saved) => {
      if (saved === "dark" || saved === "light") setTheme(saved);
    });
  }, []);

  const toggleTheme = async () => {
    const next: Theme = theme === "light" ? "dark" : "light";
    setTheme(next);
    await AsyncStorage.setItem(THEME_KEY, next);
  };

  const colors = theme === "light" ? lightColors : darkColors;

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};
