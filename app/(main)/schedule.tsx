import { ScreenBackground } from "@/components/common";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "@/hooks/useTranslation";
import React from "react";
import { Text, View } from "react-native";

export default function Schedule() {
  const { colorScheme } = useTheme();
  const { t } = useTranslation();

  // Theme styles
  const styles = {
    content: {
      flex: 1,
      justifyContent: "center" as const,
      alignItems: "center" as const,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold" as const,
      color: "#ffffff",
    },
    subtitle: {
      color: "#d1d5db",
      marginTop: 16,
    },
  };

  return (
    <ScreenBackground variant="animated" isActive={true}>
      <View style={styles.content}>
        <Text style={styles.title}>{t("pages.schedule.title")}</Text>
        <Text style={styles.subtitle}>{t("pages.schedule.subtitle")}</Text>
      </View>
    </ScreenBackground>
  );
}
