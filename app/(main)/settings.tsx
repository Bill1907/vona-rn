import { ThemeToggleSimple } from "@/components/common/ThemeToggleSimple";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { AuthService } from "@/features/auth/services";
import { useTranslation } from "@/hooks/useTranslation";
import { useUserStore } from "@/stores/userStore";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function Settings() {
  const { setUser } = useUserStore();
  const router = useRouter();
  const { colorScheme } = useTheme();
  const { language, changeLanguage } = useLanguage();
  const { t } = useTranslation();

  const handleLogout = async () => {
    await AuthService.signOut();
    setUser(null);
    router.replace("/(auth)/login" as any);
  };

  const handleLanguageChange = async (newLanguage: "ko" | "en") => {
    await changeLanguage(newLanguage);
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
    languageContainer: {
      flexDirection: "row" as const,
      gap: 12,
    },
    languageButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      borderWidth: 2,
    },
    languageButtonActive: {
      backgroundColor: colorScheme === "dark" ? "#1e40af" : "#3b82f6",
      borderColor: colorScheme === "dark" ? "#3b82f6" : "#1e40af",
    },
    languageButtonInactive: {
      backgroundColor: "transparent",
      borderColor: colorScheme === "dark" ? "#4b5563" : "#d1d5db",
    },
    languageButtonText: {
      textAlign: "center" as const,
      fontWeight: "500" as const,
      fontSize: 14,
    },
    languageButtonTextActive: {
      color: "#ffffff",
    },
    languageButtonTextInactive: {
      color: colorScheme === "dark" ? "#9ca3af" : "#6b7280",
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
      {/* Language Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("common.language")}</Text>
        <View style={styles.languageContainer}>
          <TouchableOpacity
            onPress={() => handleLanguageChange("ko")}
            style={[
              styles.languageButton,
              language === "ko"
                ? styles.languageButtonActive
                : styles.languageButtonInactive,
            ]}
          >
            <Text
              style={[
                styles.languageButtonText,
                language === "ko"
                  ? styles.languageButtonTextActive
                  : styles.languageButtonTextInactive,
              ]}
            >
              한국어
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleLanguageChange("en")}
            style={[
              styles.languageButton,
              language === "en"
                ? styles.languageButtonActive
                : styles.languageButtonInactive,
            ]}
          >
            <Text
              style={[
                styles.languageButtonText,
                language === "en"
                  ? styles.languageButtonTextActive
                  : styles.languageButtonTextInactive,
              ]}
            >
              English
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Theme Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("common.theme")}</Text>
        <ThemeToggleSimple />
      </View>

      {/* Logout Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("auth.account")}</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>{t("auth.logout")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
