import { ScreenBackground, SmartText } from "@/components/common";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "@/hooks/useTranslation";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useVoiceAssistant } from "../hooks";
import { VoiceControls } from "./VoiceControls";
import { VoiceMessageList } from "./VoiceMessageList";
import { VoiceStatusBar } from "./VoiceStatusBar";

export const VoiceAssistant: React.FC = () => {
  const { colorScheme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    state,
    messages,
    startVoiceSession,
    endVoiceSession,
    toggleListening,
    toggleMute,
  } = useVoiceAssistant();

  const handleStartSession = async () => {
    try {
      await startVoiceSession({
        model: "gpt-4o-realtime-preview",
        instructions:
          "당신은 한국어로 대화하는 친근한 음성 어시스턴트입니다. 자연스럽고 도움이 되는 답변을 제공해주세요.",
        voice: "alloy",
        temperature: 0.7,
      });
    } catch (error) {
      console.error("Voice session start error:", error);
      Alert.alert(
        t("voice.error"),
        error instanceof Error ? error.message : t("voice.sessionStartFailed")
      );
    }
  };

  const handleEndSession = async () => {
    await endVoiceSession();
  };

  const handleBackPress = () => {
    if (state.isConnected) {
      Alert.alert(t("voice.endSession"), t("voice.endSessionConfirm"), [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("common.confirm"),
          style: "destructive",
          onPress: async () => {
            await endVoiceSession();
            router.back();
          },
        },
      ]);
    } else {
      router.back();
    }
  };

  const handleMuteToggle = () => {
    toggleMute();
  };

  const handleStopConversation = async () => {
    Alert.alert(t("voice.endSession"), t("voice.endSessionConfirm"), [
      {
        text: t("common.cancel"),
        style: "cancel",
      },
      {
        text: t("common.confirm"),
        style: "destructive",
        onPress: handleEndSession,
      },
    ]);
  };

  const styles = StyleSheet.create({
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: "rgba(156, 163, 175, 0.3)",
    },
    backButton: {
      padding: 8,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: "#ffffff",
      flex: 1,
      textAlign: "center",
    },
    controlButton: {
      width: 60,
      height: 60,
      borderRadius: 30,
      alignItems: "center",
      justifyContent: "center",
    },
    sessionButton: {
      backgroundColor: state.isConnected ? "#ef4444" : "#10b981",
    },
    errorContainer: {
      backgroundColor: "#fef2f2",
      borderColor: "#fecaca",
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      margin: 16,
    },
    errorText: {
      color: "#dc2626",
      fontSize: 14,
      textAlign: "center",
    },
  });

  return (
    <ScreenBackground variant="animated" isActive={true}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <SmartText weight="semiBold" style={styles.headerTitle}>
          {t("voice.assistant")}
        </SmartText>
        <TouchableOpacity
          style={[styles.controlButton, styles.sessionButton]}
          onPress={state.isConnected ? handleEndSession : handleStartSession}
          disabled={state.isConnecting}
        >
          {state.isConnecting ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Ionicons
              name={state.isConnected ? "stop" : "play"}
              size={24}
              color="#ffffff"
            />
          )}
        </TouchableOpacity>
      </View>

      {/* Status */}
      <VoiceStatusBar state={state} />

      {/* Error Display */}
      {state.error && (
        <View style={styles.errorContainer}>
          <SmartText style={styles.errorText}>{state.error}</SmartText>
        </View>
      )}

      {/* Messages */}
      <VoiceMessageList messages={messages} autoScroll={true} />

      {/* Voice Controls */}
      <VoiceControls
        state={state}
        onMuteToggle={handleMuteToggle}
        onListeningToggle={toggleListening}
        onStopConversation={handleStopConversation}
      />
    </ScreenBackground>
  );
};
