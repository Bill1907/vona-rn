import { SmartText } from "@/components/common";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "@/hooks/useTranslation";
import {
  Conversation,
  ConversationMessage,
} from "@/stores/hybridConversationStore";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  Share,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

interface ConversationDetailProps {
  visible: boolean;
  conversation: Conversation | null;
  onClose: () => void;
}

export default function ConversationDetail({
  visible,
  conversation,
  onClose,
}: ConversationDetailProps) {
  const { colorScheme } = useTheme();
  const { t } = useTranslation();

  const handleShare = async () => {
    if (!conversation) return;

    const conversationText = conversation.messages
      .map(
        (msg) =>
          `[${msg.type === "user" ? "사용자" : "어시스턴트"}] ${msg.content}`
      )
      .join("\n\n");

    const shareContent = `${conversation.title}\n${"=".repeat(conversation.title.length)}\n\n${conversationText}`;

    try {
      await Share.share({
        message: shareContent,
        title: conversation.title,
      });
    } catch (error) {
      console.error("Share error:", error);
      Alert.alert(t("voice.error"), t("voice.shareError"));
    }
  };

  const renderMessage = ({ item }: { item: ConversationMessage }) => (
    <View
      style={[
        styles.messageContainer,
        item.type === "user" ? styles.userMessage : styles.assistantMessage,
        {
          backgroundColor: item.type === "user" ? "#2563eb" : "transparent",
          borderColor:
            item.type === "assistant"
              ? colorScheme === "dark"
                ? "#374151"
                : "#e5e7eb"
              : "transparent",
          borderWidth: item.type === "assistant" ? 1 : 0,
        },
      ]}
    >
      <SmartText
        weight="regular"
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
      </SmartText>
      <SmartText
        weight="light"
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
        {item.timestamp.toLocaleString()}
      </SmartText>
    </View>
  );

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "flex-end",
      alignItems: "center",
      paddingTop: 50,
    },
    modal: {
      width: "100%",
      height: "92%",
      backgroundColor: colorScheme === "dark" ? "#1f2937" : "#ffffff",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      overflow: "hidden",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colorScheme === "dark" ? "#374151" : "#e5e7eb",
      minHeight: 80,
    },
    headerLeft: {
      flex: 1,
      marginRight: 16,
    },
    headerTitle: {
      fontSize: 18,
      color: colorScheme === "dark" ? "#ffffff" : "#1f2937",
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 14,
      color: colorScheme === "dark" ? "#9ca3af" : "#6b7280",
    },
    headerActions: {
      flexDirection: "row",
      alignItems: "center",
    },
    actionButton: {
      padding: 8,
      marginLeft: 8,
    },
    messagesContainer: {
      flex: 1,
      paddingHorizontal: 16,
      paddingTop: 16,
    },
    messageContainer: {
      maxWidth: "92%",
      padding: 16,
      borderRadius: 16,
      marginVertical: 6,
    },
    userMessage: {
      alignSelf: "flex-end",
    },
    assistantMessage: {
      alignSelf: "flex-start",
    },
    messageText: {
      fontSize: 16,
      lineHeight: 24,
      flexWrap: "wrap",
    },
    timestamp: {
      fontSize: 11,
      marginTop: 8,
      opacity: 0.8,
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      padding: 40,
      minHeight: 200,
    },
    emptyTitle: {
      fontSize: 18,
      marginTop: 16,
      color: colorScheme === "dark" ? "#9ca3af" : "#6b7280",
    },
  });

  if (!conversation) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <SmartText
                weight="bold"
                style={styles.headerTitle}
                numberOfLines={2}
              >
                {conversation.title}
              </SmartText>
              <SmartText weight="regular" style={styles.headerSubtitle}>
                {conversation.messages.length} messages •{" "}
                {conversation.createdAt.toLocaleDateString()}
              </SmartText>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleShare}
              >
                <Ionicons
                  name="share-outline"
                  size={24}
                  color={colorScheme === "dark" ? "#ffffff" : "#1f2937"}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={onClose}>
                <Ionicons
                  name="close"
                  size={24}
                  color={colorScheme === "dark" ? "#ffffff" : "#1f2937"}
                />
              </TouchableOpacity>
            </View>
          </View>

          {conversation.messages.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="chatbubble-outline"
                size={64}
                color={colorScheme === "dark" ? "#6b7280" : "#9ca3af"}
              />
              <SmartText weight="semiBold" style={styles.emptyTitle}>
                {t("voice.noMessages")}
              </SmartText>
            </View>
          ) : (
            <FlatList
              data={conversation.messages}
              keyExtractor={(item) => item.id}
              renderItem={renderMessage}
              style={styles.messagesContainer}
              contentContainerStyle={{ paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            />
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
