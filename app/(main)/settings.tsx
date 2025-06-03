import { ThemeToggleSimple } from "@/components/common/ThemeToggleSimple";
import { useTheme } from "@/contexts/ThemeContext";
import { AuthService } from "@/features/auth/services";
import { useUserStore } from "@/stores/userStore";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function Settings() {
  const { setUser } = useUserStore();
  const router = useRouter();
  const { colorScheme } = useTheme();

  const handleLogout = async () => {
    await AuthService.signOut();
    setUser(null);
    router.replace("/(auth)/login" as any);
  };

  // Theme styles
  const styles = {
    container: {
      flex: 1,
      backgroundColor: colorScheme === "dark" ? "#111827" : "#ffffff",
      padding: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600" as const,
      color: colorScheme === "dark" ? "#d1d5db" : "#374151",
      marginBottom: 16,
    },
    section: {
      marginBottom: 32,
    },
    logoutButton: {
      backgroundColor: colorScheme === "dark" ? "#dc2626" : "#ef4444",
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 8,
    },
    logoutButtonText: {
      color: "#ffffff",
      textAlign: "center" as const,
      fontWeight: "600" as const,
      fontSize: 16,
    },
  };

  return (
    <View style={styles.container}>
      {/* Theme Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>테마 설정</Text>
        <ThemeToggleSimple />
      </View>

      {/* Logout Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>계정</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>로그아웃</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
