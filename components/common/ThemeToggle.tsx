import { cn } from "@/lib/utils";
import { ThemeMode, useThemeStore } from "@/stores/themeStore";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className }) => {
  const { mode, setMode } = useThemeStore();

  const themes: { value: ThemeMode; label: string; icon: string }[] = [
    { value: "light", label: "라이트", icon: "☀️" },
    { value: "dark", label: "다크", icon: "🌙" },
    { value: "system", label: "시스템", icon: "⚙️" },
  ];

  const handleThemePress = (themeValue: ThemeMode) => {
    try {
      setMode(themeValue);
    } catch (error) {
      console.error("Failed to set theme:", error);
    }
  };

  return (
    <View
      className={cn(
        "flex-row bg-gray-100 dark:bg-gray-800 rounded-lg p-1",
        className
      )}
    >
      {themes.map((theme) => (
        <TouchableOpacity
          key={theme.value}
          onPress={() => handleThemePress(theme.value)}
          className={cn(
            "flex-1 flex-row items-center justify-center py-2 px-3 rounded-md",
            mode === theme.value
              ? "bg-white dark:bg-gray-700 shadow-sm"
              : "bg-transparent"
          )}
        >
          <Text className="text-lg mr-1">{theme.icon}</Text>
          <Text
            className={cn(
              "text-sm font-medium",
              mode === theme.value
                ? "text-gray-900 dark:text-white"
                : "text-gray-600 dark:text-gray-400"
            )}
          >
            {theme.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};
