import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "@/hooks/useTranslation";
import React from "react";
import { ScrollView, Text, View } from "react-native";

export default function Conversations() {
  const { colorScheme } = useTheme();
  const { t } = useTranslation();

  // Theme styles
  const styles = {
    container: {
      flex: 1,
      backgroundColor: colorScheme === "dark" ? "#111827" : "#ffffff",
    },
    content: {
      flex: 1,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      paddingHorizontal: 24,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold" as const,
      color: colorScheme === "dark" ? "#10b981" : "#059669",
      marginBottom: 16,
    },
    subtitle: {
      fontSize: 16,
      color: colorScheme === "dark" ? "#d1d5db" : "#4b5563",
      textAlign: "center" as const,
      lineHeight: 24,
    },
    emptyIcon: {
      fontSize: 48,
      color: colorScheme === "dark" ? "#6b7280" : "#9ca3af",
      marginBottom: 16,
    },
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.emptyIcon}>💬</Text>
        <Text style={styles.title}>{t("pages.conversations.title")}</Text>
        <Text style={styles.subtitle}>{t("pages.conversations.subtitle")}</Text>
      </ScrollView>
    </View>
  );
}
