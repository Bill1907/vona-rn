import { useTheme } from "@/contexts/ThemeContext";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export const ThemeToggleSimple: React.FC = () => {
  const { mode, colorScheme, setMode } = useTheme();

  const handlePress = (newMode: "light" | "dark" | "system") => {
    setMode(newMode);
  };

  const themes = [
    { value: "light" as const, label: "라이트", icon: "☀️" },
    { value: "dark" as const, label: "다크", icon: "🌙" },
    { value: "system" as const, label: "시스템", icon: "⚙️" },
  ];

  // Theme styles
  const styles = {
    container: {
      flexDirection: "row" as const,
      backgroundColor: colorScheme === "dark" ? "#374151" : "#f3f4f6",
      borderRadius: 8,
      padding: 4,
    },
    button: (isSelected: boolean) => ({
      flex: 1,
      flexDirection: "row" as const,
      alignItems: "center" as const,
      justifyContent: "center" as const,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 6,
      backgroundColor: isSelected
        ? colorScheme === "dark"
          ? "#4b5563"
          : "#ffffff"
        : "transparent",
    }),
    icon: {
      fontSize: 16,
      marginRight: 6,
    },
    buttonText: (isSelected: boolean) => ({
      fontSize: 14,
      fontWeight: "500" as const,
      color: isSelected
        ? colorScheme === "dark"
          ? "#ffffff"
          : "#1f2937"
        : colorScheme === "dark"
          ? "#9ca3af"
          : "#6b7280",
    }),
  };

  return (
    <View style={styles.container}>
      {themes.map((theme) => (
        <TouchableOpacity
          key={theme.value}
          onPress={() => handlePress(theme.value)}
          style={styles.button(mode === theme.value)}
        >
          <Text style={styles.icon}>{theme.icon}</Text>
          <Text style={styles.buttonText(mode === theme.value)}>
            {theme.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};
