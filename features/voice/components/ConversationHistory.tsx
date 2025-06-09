import { SmartText } from "@/components/common";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "@/hooks/useTranslation";
import {
  Conversation,
  useHybridConversationStore as useConversationStore,
} from "@/stores/hybridConversationStore";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

interface ConversationHistoryProps {
  visible: boolean;
  onClose: () => void;
  onSelectConversation: (conversation: Conversation) => void;
}

export default function ConversationHistory({
  visible,
  onClose,
  onSelectConversation,
}: ConversationHistoryProps) {
  const { colorScheme } = useTheme();
  const { t } = useTranslation();
  const {
    conversations,
    loadConversations,
    deleteConversation,
    syncToCloud,
    isLoading,
    isSyncing,
    error,
    lastSyncTime,
    clearError,
  } = useConversationStore();

  useEffect(() => {
    if (visible) {
      loadConversations();
    }
  }, [visible, loadConversations]);

  useEffect(() => {
    if (error) {
      Alert.alert(t("voice.error"), error, [
        { text: t("common.ok"), onPress: clearError },
      ]);
    }
  }, [error, t, clearError]);

  const handleDeleteConversation = (conversation: Conversation) => {
    Alert.alert(
      t("voice.deleteConversation"),
      t("voice.deleteConversationConfirm"),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: () => deleteConversation(conversation.id),
        },
      ]
    );
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffDays === 1) {
      return t("common.yesterday");
    } else if (diffDays < 7) {
      return `${diffDays}${t("common.daysAgo")}`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={[
        styles.conversationItem,
        {
          backgroundColor: colorScheme === "dark" ? "#374151" : "#f3f4f6",
          borderBottomColor: colorScheme === "dark" ? "#4b5563" : "#e5e7eb",
        },
      ]}
      onPress={() => {
        onSelectConversation(item);
        onClose();
      }}
    >
      <View style={styles.conversationContent}>
        <SmartText
          weight="semiBold"
          style={[
            styles.conversationTitle,
            { color: colorScheme === "dark" ? "#ffffff" : "#1f2937" },
          ]}
          numberOfLines={1}
        >
          {item.title}
        </SmartText>
        <View style={styles.conversationMeta}>
          <SmartText
            weight="regular"
            style={[
              styles.conversationDate,
              { color: colorScheme === "dark" ? "#9ca3af" : "#6b7280" },
            ]}
          >
            {formatDate(item.updatedAt)} • {item.messages.length} messages
          </SmartText>
          {item.localOnly && (
            <View style={styles.localOnlyBadge}>
              <Ionicons name="phone-portrait" size={12} color="#f59e0b" />
              <SmartText style={styles.localOnlyText}>Local</SmartText>
            </View>
          )}
          {item.syncedAt && !item.localOnly && (
            <Ionicons name="cloud-done" size={14} color="#10b981" />
          )}
        </View>
        {item.messages.length > 0 && (
          <SmartText
            weight="light"
            style={[
              styles.conversationPreview,
              { color: colorScheme === "dark" ? "#d1d5db" : "#4b5563" },
            ]}
            numberOfLines={2}
          >
            {item.messages[item.messages.length - 1].content}
          </SmartText>
        )}
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteConversation(item)}
      >
        <Ionicons
          name="trash-outline"
          size={20}
          color={colorScheme === "dark" ? "#ef4444" : "#dc2626"}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons
        name="chatbubbles-outline"
        size={64}
        color={colorScheme === "dark" ? "#6b7280" : "#9ca3af"}
      />
      <SmartText
        weight="semiBold"
        style={[
          styles.emptyTitle,
          { color: colorScheme === "dark" ? "#9ca3af" : "#6b7280" },
        ]}
      >
        {t("voice.noConversations")}
      </SmartText>
      <SmartText
        weight="regular"
        style={[
          styles.emptyDescription,
          { color: colorScheme === "dark" ? "#6b7280" : "#9ca3af" },
        ]}
      >
        {t("voice.startFirstConversation")}
      </SmartText>
    </View>
  );

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modal: {
      width: "90%",
      maxHeight: "80%",
      backgroundColor: colorScheme === "dark" ? "#1f2937" : "#ffffff",
      borderRadius: 16,
      overflow: "hidden",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colorScheme === "dark" ? "#374151" : "#e5e7eb",
    },
    headerLeft: {
      flex: 1,
    },
    headerTitle: {
      fontSize: 20,
      color: colorScheme === "dark" ? "#ffffff" : "#1f2937",
    },
    syncStatus: {
      fontSize: 12,
      color: colorScheme === "dark" ? "#9ca3af" : "#6b7280",
      marginTop: 4,
    },
    headerActions: {
      flexDirection: "row",
      alignItems: "center",
    },
    syncButton: {
      padding: 8,
      marginRight: 8,
      borderRadius: 8,
      backgroundColor: colorScheme === "dark" ? "#374151" : "#e5e7eb",
    },
    closeButton: {
      padding: 4,
    },
    conversationItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      borderBottomWidth: 1,
    },
    conversationContent: {
      flex: 1,
      marginRight: 12,
    },
    conversationTitle: {
      fontSize: 16,
      marginBottom: 4,
    },
    conversationMeta: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    conversationDate: {
      fontSize: 12,
      flex: 1,
    },
    localOnlyBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#fef3c7",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      marginLeft: 8,
    },
    localOnlyText: {
      fontSize: 10,
      color: "#f59e0b",
      marginLeft: 2,
      fontWeight: "600",
    },
    conversationPreview: {
      fontSize: 14,
      lineHeight: 18,
    },
    deleteButton: {
      padding: 8,
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
      marginBottom: 8,
    },
    emptyDescription: {
      fontSize: 14,
      textAlign: "center",
      lineHeight: 20,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <SmartText weight="bold" style={styles.headerTitle}>
                {t("voice.conversationHistory")}
              </SmartText>
              {lastSyncTime && (
                <SmartText weight="light" style={styles.syncStatus}>
                  Last sync: {lastSyncTime.toLocaleTimeString()}
                </SmartText>
              )}
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.syncButton}
                onPress={syncToCloud}
                disabled={isSyncing}
              >
                <Ionicons
                  name={isSyncing ? "sync" : "cloud-upload"}
                  size={20}
                  color={isSyncing ? "#6b7280" : "#ffffff"}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons
                  name="close"
                  size={24}
                  color={colorScheme === "dark" ? "#ffffff" : "#1f2937"}
                />
              </TouchableOpacity>
            </View>
          </View>

          {conversations.length === 0 && !isLoading ? (
            <EmptyState />
          ) : (
            <FlatList
              data={conversations}
              keyExtractor={(item) => item.id}
              renderItem={renderConversationItem}
              showsVerticalScrollIndicator={false}
            />
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
