import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance } from "react-native";
import { create } from "zustand";

export type ThemeMode = "light" | "dark" | "system";
export type ColorScheme = "light" | "dark";

interface ThemeStore {
  mode: ThemeMode;
  colorScheme: ColorScheme;
  setMode: (mode: ThemeMode) => void;
  initializeTheme: () => Promise<void>;
  updateColorScheme: () => void;
}

const THEME_STORAGE_KEY = "@vona_theme_mode";

export const useThemeStore = create<ThemeStore>((set, get) => ({
  mode: "system",
  colorScheme: "light",

  setMode: async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      set({ mode });

      // Update color scheme based on mode
      get().updateColorScheme();
    } catch (error) {
      console.error("Failed to save theme mode:", error);
    }
  },

  initializeTheme: async () => {
    try {
      const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      const mode = (savedMode as ThemeMode) || "system";

      set({ mode });

      // Update color scheme based on mode
      get().updateColorScheme();

      // Listen to system appearance changes
      Appearance.addChangeListener(({ colorScheme }) => {
        if (get().mode === "system") {
          set({ colorScheme: colorScheme || "light" });
        }
      });
    } catch (error) {
      console.error("Failed to load theme mode:", error);
    }
  },

  updateColorScheme: () => {
    const { mode } = get();
    let colorScheme: ColorScheme;

    if (mode === "system") {
      colorScheme = Appearance.getColorScheme() || "light";
    } else {
      colorScheme = mode;
    }

    set({ colorScheme });
  },
}));
