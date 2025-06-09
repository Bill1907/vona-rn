import { SmartText } from "@/components/common";
import { useTranslation } from "@/hooks/useTranslation";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import type { VoiceAssistantState } from "../types";

interface VoiceStatusBarProps {
  state: VoiceAssistantState;
}

export const VoiceStatusBar: React.FC<VoiceStatusBarProps> = ({ state }) => {
  const { t } = useTranslation();

  const getStatusIcon = () => {
    if (state.isConnecting) {
      return "radio-button-off";
    }

    if (state.isConnected) {
      if (state.isSpeaking) {
        return "volume-high";
      } else if (state.isListening) {
        return "mic";
      } else {
        return "checkmark-circle";
      }
    }

    return "radio-button-off";
  };

  const getStatusColor = () => {
    if (state.isConnected) {
      if (state.isSpeaking || state.isListening) {
        return "#ef4444";
      } else {
        return "#10b981";
      }
    }
    return "#9ca3af";
  };

  const getStatusText = () => {
    if (state.isConnecting) {
      return t("voice.connecting");
    }

    if (state.isConnected) {
      if (state.isSpeaking) {
        return t("voice.speaking");
      } else if (state.isListening) {
        return t("voice.listening");
      } else {
        return t("voice.connected");
      }
    }

    return t("voice.disconnected");
  };

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      backgroundColor: "rgba(55, 65, 81, 0.6)",
    },
    statusText: {
      marginLeft: 8,
      fontSize: 16,
      color: "#ffffff",
    },
  });

  return (
    <View style={styles.container}>
      <Ionicons name={getStatusIcon()} size={20} color={getStatusColor()} />
      <SmartText weight="medium" style={styles.statusText}>
        {getStatusText()}
      </SmartText>
    </View>
  );
};
