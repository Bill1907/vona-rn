import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "@/hooks/useTranslation";
import React from "react";
import { Text, View } from "react-native";

export default function Schedule() {
  const { colorScheme } = useTheme();
  const { t } = useTranslation();

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
      <Text style={styles.title}>{t("pages.schedule.title")}</Text>
      <Text style={styles.subtitle}>{t("pages.schedule.subtitle")}</Text>
    </View>
  );
}
