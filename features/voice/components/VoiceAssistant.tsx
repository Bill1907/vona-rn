import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "@/hooks/useTranslation";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useVoiceAssistant, VoiceMessage } from "../hooks/useVoiceAssistant";

export const VoiceAssistant: React.FC = () => {
  const { colorScheme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [textInput, setTextInput] = useState("");

  const {
    state,
    messages,
    startVoiceSession,
    endVoiceSession,
    toggleListening,
    sendTextMessage,
  } = useVoiceAssistant();

  const handleStartSession = async () => {
    try {
      await startVoiceSession({
        model: "gpt-4o-realtime-preview",
        instructions:
          "당신은 한국어로 대화하는 친근한 음성 어시스턴트입니다. 자연스럽고 도움이 되는 답변을 제공해주세요.",
        voice: "alloy",
        input_audio_format: "pcm16",
        output_audio_format: "pcm16",
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

  const handleSendMessage = async () => {
    if (!textInput.trim()) return;

    await sendTextMessage(textInput);
    setTextInput("");
  };

  const renderMessage = ({ item }: { item: VoiceMessage }) => (
    <View
      style={[
        styles.messageContainer,
        item.type === "user" ? styles.userMessage : styles.assistantMessage,
        {
          backgroundColor:
            item.type === "user"
              ? colorScheme === "dark"
                ? "#2563eb"
                : "#3b82f6"
              : colorScheme === "dark"
                ? "#374151"
                : "#f3f4f6",
        },
      ]}
    >
      <Text
        style={[
          styles.messageText,
          {
            color:
              item.type === "user"
                ? "#ffffff"
                : colorScheme === "dark"
                  ? "#ffffff"
                  : "#1f2937",
          },
        ]}
      >
        {item.content}
      </Text>
      <Text
        style={[
          styles.timestamp,
          {
            color:
              item.type === "user"
                ? "#e5e7eb"
                : colorScheme === "dark"
                  ? "#9ca3af"
                  : "#6b7280",
          },
        ]}
      >
        {item.timestamp.toLocaleTimeString()}
      </Text>
    </View>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorScheme === "dark" ? "#1f2937" : "#ffffff",
      paddingTop: insets.top,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colorScheme === "dark" ? "#374151" : "#e5e7eb",
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: colorScheme === "dark" ? "#ffffff" : "#1f2937",
    },
    statusContainer: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      backgroundColor: colorScheme === "dark" ? "#374151" : "#f9fafb",
    },
    statusText: {
      marginLeft: 8,
      fontSize: 16,
      color: colorScheme === "dark" ? "#ffffff" : "#1f2937",
    },
    messagesContainer: {
      flex: 1,
      padding: 16,
    },
    messageContainer: {
      maxWidth: "80%",
      padding: 12,
      borderRadius: 12,
      marginVertical: 4,
    },
    userMessage: {
      alignSelf: "flex-end",
    },
    assistantMessage: {
      alignSelf: "flex-start",
    },
    messageText: {
      fontSize: 16,
      lineHeight: 20,
    },
    timestamp: {
      fontSize: 12,
      marginTop: 4,
      opacity: 0.7,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: colorScheme === "dark" ? "#374151" : "#e5e7eb",
      paddingBottom: insets.bottom + 16,
    },
    textInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: colorScheme === "dark" ? "#374151" : "#d1d5db",
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: colorScheme === "dark" ? "#ffffff" : "#1f2937",
      backgroundColor: colorScheme === "dark" ? "#374151" : "#ffffff",
      marginRight: 8,
    },
    controlButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
      marginHorizontal: 4,
    },
    sessionButton: {
      backgroundColor: state.isConnected ? "#ef4444" : "#10b981",
    },
    voiceButton: {
      backgroundColor: state.isListening ? "#ef4444" : "#3b82f6",
    },
    sendButton: {
      backgroundColor: "#2563eb",
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("voice.assistant")}</Text>
        <TouchableOpacity
          style={[styles.controlButton, styles.sessionButton]}
          onPress={state.isConnected ? handleEndSession : handleStartSession}
        >
          <Ionicons
            name={state.isConnected ? "stop" : "play"}
            size={24}
            color="#ffffff"
          />
        </TouchableOpacity>
      </View>

      {/* Status */}
      <View style={styles.statusContainer}>
        <Ionicons
          name={
            state.isConnected
              ? state.isSpeaking
                ? "volume-high"
                : state.isListening
                  ? "mic"
                  : "checkmark-circle"
              : "radio-button-off"
          }
          size={20}
          color={
            state.isConnected
              ? state.isSpeaking || state.isListening
                ? "#ef4444"
                : "#10b981"
              : colorScheme === "dark"
                ? "#6b7280"
                : "#9ca3af"
          }
        />
        <Text style={styles.statusText}>
          {state.isConnected
            ? state.isSpeaking
              ? t("voice.speaking")
              : state.isListening
                ? t("voice.listening")
                : t("voice.connected")
            : t("voice.disconnected")}
        </Text>
      </View>

      {/* Error Display */}
      {state.error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{state.error}</Text>
        </View>
      )}

      {/* Messages */}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Input Controls */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={textInput}
          onChangeText={setTextInput}
          placeholder={t("voice.typeMessage")}
          placeholderTextColor={colorScheme === "dark" ? "#9ca3af" : "#6b7280"}
          multiline
          editable={state.isConnected}
        />

        <TouchableOpacity
          style={[styles.controlButton, styles.voiceButton]}
          onPress={toggleListening}
          disabled={!state.isConnected}
        >
          <Ionicons
            name={state.isListening ? "stop" : "mic"}
            size={24}
            color="#ffffff"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.sendButton]}
          onPress={handleSendMessage}
          disabled={!state.isConnected || !textInput.trim()}
        >
          <Ionicons name="send" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
