import {
  AnimatedSvgButton,
  ScreenBackground,
  SmartText,
} from "@/components/common";
import { useTheme } from "@/contexts/ThemeContext";
import {
  testSupabaseFunctions,
  useConversationTitle,
} from "@/features/conversation";
import {
  ConversationDetail,
  ConversationHistory,
  VoiceControls,
  VoiceMessageList,
  VoiceStatusBar,
} from "@/features/voice/components";
import { useVoiceAssistant } from "@/features/voice/hooks";
import { useTranslation } from "@/hooks/useTranslation";
import {
  Conversation,
  useHybridConversationStore as useConversationStore,
} from "@/stores/hybridConversationStore";
import { useUserStore } from "@/stores/userStore";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";

export default function Main() {
  const { user } = useUserStore();
  const { colorScheme } = useTheme();
  const { t } = useTranslation();
  const { generateTitle, isGenerating } = useConversationTitle();

  // 디버깅을 위한 함수 테스트
  useEffect(() => {
    const testConnection = async () => {
      const isConnected = await testSupabaseFunctions();
      console.log("Supabase Functions connection test:", isConnected);
    };
    testConnection();
  }, []);

  // 대화 저장 관련 상태
  const [showConversationHistory, setShowConversationHistory] = useState(false);
  const [showConversationDetail, setShowConversationDetail] = useState(false);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);

  const {
    state,
    messages,
    startVoiceSession,
    endVoiceSession,
    toggleListening,
    toggleMute,
  } = useVoiceAssistant();

  const {
    currentConversation,
    createConversation,
    setCurrentConversation,
    saveConversation,
  } = useConversationStore();

  // 대화 세션 시작시 새 대화 생성
  useEffect(() => {
    if (state.isConnected && !currentConversation) {
      const newConversation = createConversation();
      setCurrentConversation(newConversation);
    }
  }, [
    state.isConnected,
    currentConversation,
    createConversation,
    setCurrentConversation,
  ]);

  // 메시지가 추가될 때마다 현재 대화에 임시 저장 (실제 저장은 대화 종료시)
  useEffect(() => {
    if (messages.length > 0 && currentConversation) {
      const lastMessage = messages[messages.length - 1];
      // 현재 대화에 이미 있는 메시지인지 확인
      const messageExists = currentConversation.messages.some(
        (msg) => msg.id === lastMessage.id
      );

      if (!messageExists) {
        const conversationMessage = {
          id: lastMessage.id,
          content: lastMessage.content,
          type: lastMessage.type,
          timestamp: lastMessage.timestamp,
        };

        // 임시로만 추가하고 실제 저장은 하지 않음
        const updatedConversation = {
          ...currentConversation,
          messages: [...currentConversation.messages, conversationMessage],
          updatedAt: new Date(),
          // Date 객체가 확실히 설정되도록 보장
          createdAt:
            currentConversation.createdAt instanceof Date
              ? currentConversation.createdAt
              : new Date(currentConversation.createdAt || Date.now()),
        };

        setCurrentConversation(updatedConversation);
      }
    }
  }, [messages, currentConversation, setCurrentConversation]);

  // 연결이 끊어질 때 자동으로 대화 저장 (제목과 함께)
  useEffect(() => {
    if (
      !state.isConnected &&
      currentConversation &&
      currentConversation.messages.length > 0
    ) {
      const saveOnDisconnect = async () => {
        try {
          // 제목 생성
          const title = await generateTitle(currentConversation.messages, 30);
          const conversationToSave = {
            ...currentConversation,
            title: title,
          };
          await saveConversation(conversationToSave);
          console.log("Conversation saved on disconnect with title:", title);
        } catch (error) {
          console.error("Failed to save conversation on disconnect:", error);
          // 제목 생성 실패시 폴백 제목으로 저장
          try {
            const firstUserMessage = currentConversation.messages.find(
              (msg) => msg.type === "user"
            );
            const fallbackTitle = firstUserMessage
              ? firstUserMessage.content.replace(/\n/g, " ").trim().slice(0, 30)
              : "Untitled Conversation";
            const conversationToSave = {
              ...currentConversation,
              title: fallbackTitle,
            };
            await saveConversation(conversationToSave);
            console.log("Conversation saved with fallback title");
          } catch (fallbackError) {
            console.error(
              "Failed to save conversation with fallback title:",
              fallbackError
            );
          }
        }
      };
      saveOnDisconnect();
    }
  }, [state.isConnected, currentConversation, saveConversation, generateTitle]);

  const handleVoiceButtonPress = async () => {
    if (state.isConnected) {
      await endVoiceSession();
    } else {
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
        onPress: async () => {
          // 대화가 있으면 제목과 함께 저장 후 종료
          if (currentConversation && currentConversation.messages.length > 0) {
            try {
              // 제목 생성
              const title = await generateTitle(
                currentConversation.messages,
                30
              );
              const conversationToSave = {
                ...currentConversation,
                title: title,
              };
              await saveConversation(conversationToSave);
              console.log(
                "Conversation saved successfully on session end with title:",
                title
              );
            } catch (error) {
              console.error(
                "Failed to save conversation on session end:",
                error
              );
              // 제목 생성 실패시 폴백 제목으로 저장
              try {
                const firstUserMessage = currentConversation.messages.find(
                  (msg) => msg.type === "user"
                );
                const fallbackTitle = firstUserMessage
                  ? firstUserMessage.content
                      .replace(/\n/g, " ")
                      .trim()
                      .slice(0, 30)
                  : "Untitled Conversation";
                const conversationToSave = {
                  ...currentConversation,
                  title: fallbackTitle,
                };
                await saveConversation(conversationToSave);
                console.log(
                  "Conversation saved with fallback title on session end"
                );
              } catch (fallbackError) {
                console.error(
                  "Failed to save conversation with fallback title on session end:",
                  fallbackError
                );
                // 저장 실패해도 세션은 종료
              }
            }
          }
          // 대화 세션 종료시 현재 대화도 정리
          setCurrentConversation(null);
          endVoiceSession();
        },
      },
    ]);
  };

  const handleShowConversationHistory = () => {
    setShowConversationHistory(true);
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setShowConversationDetail(true);
  };

  const handleSaveCurrentConversation = async () => {
    if (currentConversation && currentConversation.messages.length > 0) {
      try {
        // 제목 생성
        const title = await generateTitle(currentConversation.messages, 30);
        const conversationToSave = {
          ...currentConversation,
          title: title,
        };
        await saveConversation(conversationToSave);
        // 저장 후 현재 대화 상태도 업데이트 (제목 반영)
        setCurrentConversation(conversationToSave);
        Alert.alert(t("common.success"), t("voice.conversationSaved"));
      } catch (error) {
        console.error("Manual save failed:", error);
        // 제목 생성 실패시 폴백 제목으로 저장
        try {
          const firstUserMessage = currentConversation.messages.find(
            (msg) => msg.type === "user"
          );
          const fallbackTitle = firstUserMessage
            ? firstUserMessage.content.replace(/\n/g, " ").trim().slice(0, 30)
            : "Untitled Conversation";
          const conversationToSave = {
            ...currentConversation,
            title: fallbackTitle,
          };
          await saveConversation(conversationToSave);
          setCurrentConversation(conversationToSave);
          Alert.alert(t("common.success"), t("voice.conversationSaved"));
        } catch (fallbackError) {
          console.error(
            "Manual save with fallback title failed:",
            fallbackError
          );
          Alert.alert(t("voice.error"), t("voice.conversationSaveFailed"));
        }
      }
    }
  };

  const styles = StyleSheet.create({
    content: {
      flex: 1,
      justifyContent: state.isConnected ? "flex-start" : "center",
      alignItems: "center",
      paddingHorizontal: 24,
    },
    voiceButton: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: "transparent",
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    statusContainer: {
      marginTop: 32,
      alignItems: "center",
    },
    statusText: {
      fontSize: 18,
      color: colorScheme === "dark" ? "#ffffff" : "#1f2937",
      fontWeight: "600",
      marginTop: 8,
    },
    instructionText: {
      fontSize: 16,
      color: colorScheme === "dark" ? "#9ca3af" : "#6b7280",
      marginTop: 16,
      textAlign: "center",
      paddingHorizontal: 32,
    },
    // Connected state styles
    connectedContainer: {
      flex: 1,
      width: "100%",
    },
    connectedHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 16,
      backgroundColor: "rgba(55, 65, 81, 0.8)",
    },
    headerButton: {
      padding: 8,
      borderRadius: 8,
    },
    headerCenter: {
      flex: 1,
      alignItems: "center",
      marginHorizontal: 16,
    },
    headerTitle: {
      fontSize: 16,
      color: "#ffffff",
      textAlign: "center",
    },
    headerSubtitle: {
      fontSize: 12,
      color: "#d1d5db",
      textAlign: "center",
      marginTop: 2,
    },
    connectedStatusContainer: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      backgroundColor: "rgba(55, 65, 81, 0.6)",
    },
    connectedStatusText: {
      marginLeft: 8,
      fontSize: 16,
      color: "#ffffff",
    },

    errorContainer: {
      backgroundColor: "#fef2f2",
      borderColor: "#fecaca",
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      marginTop: 24,
      maxWidth: "90%",
    },
    errorText: {
      color: "#dc2626",
      fontSize: 14,
      textAlign: "center",
    },
  });

  return (
    <ScreenBackground
      variant="animated"
      isActive={true}
      includeSafeArea={false}
    >
      {state.isConnected ? (
        // Connected: Show voice assistant interface
        <View style={styles.connectedContainer}>
          {/* Header with conversation controls */}
          <View style={styles.connectedHeader}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleShowConversationHistory}
            >
              <Ionicons name="chatbubbles" size={24} color="#ffffff" />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <SmartText weight="semiBold" style={styles.headerTitle}>
                {currentConversation?.title || t("voice.assistant")}
              </SmartText>
              {currentConversation && (
                <SmartText weight="light" style={styles.headerSubtitle}>
                  {currentConversation.messages.length} messages
                </SmartText>
              )}
            </View>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleSaveCurrentConversation}
              disabled={
                !currentConversation ||
                currentConversation.messages.length === 0
              }
            >
              <Ionicons
                name="save"
                size={24}
                color={
                  currentConversation && currentConversation.messages.length > 0
                    ? "#ffffff"
                    : "#6b7280"
                }
              />
            </TouchableOpacity>
          </View>

          {/* Error Display */}
          {state.error && (
            <View style={styles.errorContainer}>
              <SmartText style={styles.errorText}>{state.error}</SmartText>
            </View>
          )}

          {/* Voice Status */}
          <VoiceStatusBar state={state} />

          {/* Messages */}
          <VoiceMessageList messages={messages} autoScroll={true} />

          {/* Voice Controls */}
          <VoiceControls
            state={state}
            onMuteToggle={handleMuteToggle}
            onListeningToggle={toggleListening}
            onStopConversation={handleStopConversation}
          />
        </View>
      ) : (
        // Disconnected: Show connection button
        <View style={styles.content}>
          {state.isConnecting ? (
            <AnimatedSvgButton
              icon="logo"
              size={200}
              color="#ffffff"
              backgroundColor="transparent"
              animation="rotate"
              animationDuration={5000}
              animationRepeat={true}
              disabled={state.isConnecting}
              containerStyle={styles.voiceButton}
            />
          ) : (
            <AnimatedSvgButton
              icon="logo"
              size={200}
              color="#ffffff"
              backgroundColor="transparent"
              animation="none"
              onPress={handleVoiceButtonPress}
              disabled={state.isConnecting}
              containerStyle={styles.voiceButton}
            />
          )}

          <View style={styles.statusContainer}>
            {state.isConnecting && (
              <SmartText weight="semiBold" style={styles.statusText}>
                {t("voice.connecting")}
              </SmartText>
            )}
            <SmartText weight="regular" style={styles.instructionText}>
              {state.isConnected
                ? t("voice.tapToDisconnect")
                : t("voice.tapToConnect")}
            </SmartText>
          </View>

          {state.error && (
            <View style={styles.errorContainer}>
              <SmartText style={styles.errorText}>{state.error}</SmartText>
            </View>
          )}
        </View>
      )}

      {/* Conversation History Modal */}
      <ConversationHistory
        visible={showConversationHistory}
        onClose={() => setShowConversationHistory(false)}
        onSelectConversation={handleSelectConversation}
      />

      {/* Conversation Detail Modal */}
      <ConversationDetail
        visible={showConversationDetail}
        conversation={selectedConversation}
        onClose={() => setShowConversationDetail(false)}
      />
    </ScreenBackground>
  );
}
