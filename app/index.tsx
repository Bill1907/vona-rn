import { useTheme } from "@/contexts/ThemeContext";
import React from "react";
import { Text, View } from "react-native";

export default function Index() {
  const { colorScheme } = useTheme();

  // Theme styles
  const styles = {
    container: {
      flex: 1,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      backgroundColor: colorScheme === "dark" ? "#111827" : "#ffffff",
    },
    text: {
      fontSize: 20,
      color: colorScheme === "dark" ? "#d1d5db" : "#4b5563",
    },
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Loading...</Text>
    </View>
  );
}
