import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import type { VoiceAssistantState } from "../types";

interface VoiceControlsProps {
  state: VoiceAssistantState;
  onMuteToggle: () => void;
  onListeningToggle: () => void;
  onStopConversation: () => void;
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({
  state,
  onMuteToggle,
  onListeningToggle,
  onStopConversation,
}) => {
  const styles = StyleSheet.create({
    controlsContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: "rgba(156, 163, 175, 0.3)",
    },
    controlButton: {
      width: 60,
      height: 60,
      borderRadius: 30,
      alignItems: "center",
      justifyContent: "center",
    },
    muteButton: {
      backgroundColor:
        state.isMicMuted || state.isSpeakerMuted ? "#ef4444" : "#6b7280",
    },
    sessionButton: {
      backgroundColor: state.isConnected ? "#ef4444" : "#10b981",
    },
    stopButton: {
      backgroundColor: "#ef4444",
    },
  });

  return (
    <View style={styles.controlsContainer}>
      <TouchableOpacity
        style={[styles.controlButton, styles.muteButton]}
        onPress={onMuteToggle}
        disabled={!state.isConnected}
      >
        <Ionicons
          name={
            state.isMicMuted || state.isSpeakerMuted
              ? "volume-mute"
              : "volume-high"
          }
          size={28}
          color="#ffffff"
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.controlButton, styles.sessionButton]}
        onPress={onListeningToggle}
        disabled={!state.isConnected}
      >
        <Ionicons
          name={state.isListening ? "stop" : "mic"}
          size={32}
          color="#ffffff"
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.controlButton, styles.stopButton]}
        onPress={onStopConversation}
        disabled={!state.isConnected}
      >
        <Ionicons name="stop-circle" size={28} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
};
