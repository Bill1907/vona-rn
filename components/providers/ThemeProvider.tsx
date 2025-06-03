import { useThemeStore } from "@/stores/themeStore";
import React, { useEffect } from "react";
import { View } from "react-native";

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { colorScheme, initializeTheme } = useThemeStore();

  useEffect(() => {
    // Delay initialization to avoid navigation context issues
    const timer = setTimeout(() => {
      initializeTheme();
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View className={colorScheme === "dark" ? "dark" : ""} style={{ flex: 1 }}>
      {children}
    </View>
  );
};
