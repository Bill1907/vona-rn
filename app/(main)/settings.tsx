import { ScreenBackground } from "@/components/common";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "@/hooks/useTranslation";
import { useUserStore } from "@/stores/userStore";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function Settings() {
  const { setUser } = useUserStore();
  const { colorScheme } = useTheme();
  const { language, changeLanguage } = useLanguage();
  const { t } = useTranslation();
  const router = useRouter();

  const handleLogout = () => {
    setUser(null);
    router.replace("/(auth)/login" as any);
  };

  const handleLanguageChange = async (newLanguage: "ko" | "en") => {
    await changeLanguage(newLanguage);
  };

  // Theme styles
  const styles = {
    content: {
      flex: 1,
      padding: 24,
    },
    sectionTitle: {
      fontSize: 18,
      color: "#f3f4f6",
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
      backgroundColor: "#1e40af",
      borderColor: "#3b82f6",
    },
    languageButtonInactive: {
      backgroundColor: "transparent",
      borderColor: "rgba(75, 85, 99, 0.6)",
    },
    languageButtonText: {
      textAlign: "center" as const,
      fontSize: 14,
    },
    languageButtonTextActive: {
      color: "#ffffff",
    },
    languageButtonTextInactive: {
      color: "#d1d5db",
    },
    logoutButton: {
      backgroundColor: "#dc2626",
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 8,
    },
    logoutButtonText: {
      color: "#ffffff",
      textAlign: "center" as const,
      fontSize: 16,
    },
  };

  return (
    <ScreenBackground variant="gradient">
      <View style={styles.content}>
        {/* 테마 설정 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("pages.settings.theme")}</Text>
          <ThemeToggle />
        </View>

        {/* 언어 설정 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t("pages.settings.language")}
          </Text>
          <View style={styles.languageContainer}>
            <TouchableOpacity
              style={[
                styles.languageButton,
                language === "ko"
                  ? styles.languageButtonActive
                  : styles.languageButtonInactive,
              ]}
              onPress={() => handleLanguageChange("ko")}
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
              style={[
                styles.languageButton,
                language === "en"
                  ? styles.languageButtonActive
                  : styles.languageButtonInactive,
              ]}
              onPress={() => handleLanguageChange("en")}
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

        {/* 로그아웃 */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>{t("auth.logout")}</Text>
        </TouchableOpacity>
      </View>
    </ScreenBackground>
  );
}
