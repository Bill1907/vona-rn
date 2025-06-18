import { ScreenBackground } from "@/components/common";
import { useTheme } from "@/contexts/ThemeContext";
import React from "react";
import { Text, View } from "react-native";

export default function Index() {
  const { colorScheme } = useTheme();

  // Theme styles
  const styles = {
    content: {
      flex: 1,
      justifyContent: "center" as const,
      alignItems: "center" as const,
    },
    text: {
      fontSize: 20,
      color: "#ffffff",
    },
  };

  return (
    <ScreenBackground variant="animated" isActive={true}>
      <View style={styles.content}>
        <Text style={styles.text}>Loading...</Text>
      </View>
    </ScreenBackground>
  );
}
