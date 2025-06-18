import { ScreenBackground } from "@/components/common";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "@/hooks/useTranslation";
import React from "react";
import { ScrollView, Text } from "react-native";

export default function SearchHistory() {
  const { colorScheme } = useTheme();
  const { t } = useTranslation();

  // Theme styles
  const styles = {
    content: {
      flex: 1,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      paddingHorizontal: 24,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold" as const,
      color: "#ffffff",
      marginBottom: 16,
    },
    subtitle: {
      fontSize: 16,
      color: "#d1d5db",
      textAlign: "center" as const,
      lineHeight: 24,
    },
    emptyIcon: {
      fontSize: 48,
      color: "#9ca3af",
      marginBottom: 16,
    },
  };

  return (
    <ScreenBackground variant="animated" isActive={true}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.emptyIcon}>🔍</Text>
        <Text style={styles.title}>{t("pages.searchHistory.title")}</Text>
        <Text style={styles.subtitle}>{t("pages.searchHistory.subtitle")}</Text>
      </ScrollView>
    </ScreenBackground>
  );
}
