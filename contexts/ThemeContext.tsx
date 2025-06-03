import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Appearance } from "react-native";

export type ThemeMode = "light" | "dark" | "system";
export type ColorScheme = "light" | "dark";

interface ThemeContextType {
  mode: ThemeMode;
  colorScheme: ColorScheme;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "@vona_theme_mode";

export const ThemeContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [colorScheme, setColorScheme] = useState<ColorScheme>("light");

  // Update color scheme based on mode
  const updateColorScheme = (currentMode: ThemeMode) => {
    let newColorScheme: ColorScheme;

    if (currentMode === "system") {
      newColorScheme = Appearance.getColorScheme() || "light";
    } else {
      newColorScheme = currentMode;
    }

    setColorScheme(newColorScheme);
  };

  // Set mode and save to storage
  const setMode = async (newMode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
      setModeState(newMode);
      updateColorScheme(newMode);
    } catch (error) {
      console.error("Failed to save theme mode:", error);
    }
  };

  // Initialize theme on mount
  useEffect(() => {
    const initializeTheme = async () => {
      try {
        const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        const initialMode = (savedMode as ThemeMode) || "system";

        setModeState(initialMode);
        updateColorScheme(initialMode);
      } catch (error) {
        console.error("Failed to load theme mode:", error);
        updateColorScheme("system");
      }
    };

    initializeTheme();
  }, []);

  // Listen to system appearance changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(
      ({ colorScheme: systemColorScheme }) => {
        if (mode === "system") {
          const newColorScheme = systemColorScheme || "light";
          setColorScheme(newColorScheme);
        }
      }
    );

    return () => subscription?.remove();
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, colorScheme, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeContextProvider");
  }
  return context;
};
