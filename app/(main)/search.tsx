import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "@/hooks/useTranslation";
import React from "react";
import { Text, View } from "react-native";

export default function Search() {
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
      color: colorScheme === "dark" ? "#3b82f6" : "#2563eb",
    },
    subtitle: {
      color: colorScheme === "dark" ? "#d1d5db" : "#4b5563",
      marginTop: 16,
      textAlign: "center" as const,
      paddingHorizontal: 24,
    },
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("pages.search.title")}</Text>
      <Text style={styles.subtitle}>{t("pages.search.subtitle")}</Text>
    </View>
  );
}
