import { useTheme } from "@/contexts/ThemeContext";
import React from "react";
import { Text, View } from "react-native";

export default function Schedule() {
  const { colorScheme } = useTheme();

  // Theme styles
  const styles = {
    container: {
      flex: 1,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      backgroundColor: colorScheme === "dark" ? "#111827" : "#ffffff",
    },
    title: {
      fontSize: 24,
      fontWeight: "bold" as const,
      color: colorScheme === "dark" ? "#a855f7" : "#9333ea",
    },
    subtitle: {
      color: colorScheme === "dark" ? "#d1d5db" : "#4b5563",
      marginTop: 16,
    },
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Schedule</Text>
      <Text style={styles.subtitle}>일정 관리 기능이 여기에 구현됩니다</Text>
    </View>
  );
}
