import { ScreenBackground } from "@/components/common";
import { ThemeToggleSimple } from "@/components/common/ThemeToggleSimple";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "@/hooks/useTranslation";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function AppSettings() {
  const { colorScheme } = useTheme();
  const { language, changeLanguage } = useLanguage();
  const { t } = useTranslation();
  const router = useRouter();

  const handleLanguageChange = async (newLanguage: "ko" | "en") => {
    await changeLanguage(newLanguage);
  };

  // Theme styles
  const styles = {
    scrollContainer: {
      flex: 1,
    },
    content: {
      padding: 24,
    },
    header: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      marginBottom: 32,
    },
    backButton: {
      padding: 8,
      marginRight: 16,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: "bold" as const,
      color: "#ffffff",
    },
    section: {
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600" as const,
      color: "#f3f4f6",
      marginBottom: 16,
    },
    settingItem: {
      backgroundColor: "rgba(31, 41, 55, 0.6)",
      borderRadius: 8,
      padding: 16,
      marginBottom: 12,
    },
    settingHeader: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      justifyContent: "space-between" as const,
      marginBottom: 8,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: "600" as const,
      color: "#ffffff",
    },
    settingDescription: {
      fontSize: 14,
      color: "#9ca3af",
      marginBottom: 12,
    },
    languageContainer: {
      flexDirection: "row" as const,
      gap: 12,
    },
    languageButton: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 6,
      alignItems: "center" as const,
      borderWidth: 1,
    },
    languageButtonActive: {
      backgroundColor: "#3b82f6",
      borderColor: "#3b82f6",
    },
    languageButtonInactive: {
      backgroundColor: "transparent",
      borderColor: "rgba(156, 163, 175, 0.5)",
    },
    languageButtonText: {
      fontSize: 14,
      fontWeight: "500" as const,
    },
    languageButtonTextActive: {
      color: "#ffffff",
    },
    languageButtonTextInactive: {
      color: "#9ca3af",
    },
    themeContainer: {
      alignItems: "flex-start" as const,
    },
  };

  return (
    <ScreenBackground variant="animated" isActive={true}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#ffffff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {t("pages.profile.appSettings")}
            </Text>
          </View>

          {/* Theme Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t("pages.profile.themeSettings")}
            </Text>
            <View style={styles.settingItem}>
              <View style={styles.settingHeader}>
                <Text style={styles.settingTitle}>{t("common.theme")}</Text>
              </View>
              <Text style={styles.settingDescription}>
                {colorScheme === "dark"
                  ? t("pages.profile.darkMode")
                  : t("pages.profile.lightMode")}
              </Text>
              <View style={styles.themeContainer}>
                <ThemeToggleSimple />
              </View>
            </View>
          </View>

          {/* Language Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t("pages.profile.languageSettings")}
            </Text>
            <View style={styles.settingItem}>
              <View style={styles.settingHeader}>
                <Text style={styles.settingTitle}>{t("common.language")}</Text>
              </View>
              <Text style={styles.settingDescription}>
                {language === "ko" ? "한국어" : "English"}
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
          </View>

          {/* Additional Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t("pages.profile.preferences")}
            </Text>

            <View style={styles.settingItem}>
              <View style={styles.settingHeader}>
                <Text style={styles.settingTitle}>
                  {t("pages.profile.notifications")}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </View>
              <Text style={styles.settingDescription}>
                {t("pages.profile.manageNotifications")}
              </Text>
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingHeader}>
                <Text style={styles.settingTitle}>
                  {t("pages.profile.privacy")}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </View>
              <Text style={styles.settingDescription}>
                {t("pages.profile.privacySettings")}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}
