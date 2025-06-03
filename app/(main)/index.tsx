import { useTheme } from "@/contexts/ThemeContext";
import { useUserStore } from "@/stores/userStore";
import React from "react";
import { Text, View } from "react-native";

export default function Main() {
  const { user } = useUserStore();
  const { colorScheme } = useTheme();

  // Theme styles
  const styles = {
    container: {
      flex: 1,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      backgroundColor: colorScheme === "dark" ? "#111827" : "#ffffff",
      paddingHorizontal: 24,
    },
    title: {
      fontSize: 30,
      fontWeight: "bold" as const,
      color: colorScheme === "dark" ? "#10b981" : "#059669",
    },
    text: {
      fontSize: 18,
      color: colorScheme === "dark" ? "#d1d5db" : "#4b5563",
      marginTop: 16,
      textAlign: "center" as const,
    },
    subtext: {
      fontSize: 14,
      color: colorScheme === "dark" ? "#9ca3af" : "#6b7280",
      marginTop: 8,
      textAlign: "center" as const,
    },
    instructionText: {
      fontSize: 16,
      color: colorScheme === "dark" ? "#9ca3af" : "#6b7280",
      marginTop: 32,
      textAlign: "center" as const,
      fontStyle: "italic" as const,
    },
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Vona!</Text>
      <Text style={styles.text}>Hello, {user?.email || "User"}!</Text>
      <Text style={styles.subtext}>You are successfully logged in</Text>
      <Text style={styles.instructionText}>
        왼쪽 상단의 햄버거 메뉴를 탭하거나{"\n"}
        화면을 오른쪽으로 스와이프해서 메뉴를 열어보세요
      </Text>
    </View>
  );
}
