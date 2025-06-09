import { ScreenBackground, SmartText } from "@/components/common";
import { useTheme } from "@/contexts/ThemeContext";
import ConversationDetail from "@/features/voice/components/ConversationDetail";
import { useTranslation } from "@/hooks/useTranslation";
import {
  Conversation,
  useHybridConversationStore as useConversationStore,
} from "@/stores/hybridConversationStore";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

export default function Conversations() {
  const { colorScheme } = useTheme();
  const { t } = useTranslation();
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [showConversationDetail, setShowConversationDetail] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const {
    conversations,
    loadConversations,
    deleteConversation,
    syncToCloud,
    syncFromCloud,
    isLoading,
    isSyncing,
    error,
    lastSyncTime,
    clearError,
  } = useConversationStore();

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (error) {
      Alert.alert(t("voice.error"), error, [
        { text: t("common.ok"), onPress: clearError },
      ]);
    }
  }, [error, t, clearError]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await syncFromCloud();
      await loadConversations();
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setRefreshing(false);
    }
  };

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

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setShowConversationDetail(true);
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
          backgroundColor: colorScheme === "dark" ? "#374151" : "#ffffff",
          borderBottomColor: colorScheme === "dark" ? "#4b5563" : "#e5e7eb",
        },
      ]}
      onPress={() => handleSelectConversation(item)}
    >
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
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
              weight="light"
              style={[
                styles.conversationDate,
                { color: colorScheme === "dark" ? "#9ca3af" : "#6b7280" },
              ]}
            >
              {formatDate(item.updatedAt)}
            </SmartText>
            {item.localOnly && (
              <View style={styles.localOnlyBadge}>
                <Ionicons name="phone-portrait" size={10} color="#f59e0b" />
                <SmartText style={styles.localOnlyText}>Local</SmartText>
              </View>
            )}
            {item.syncedAt && !item.localOnly && (
              <Ionicons name="cloud-done" size={12} color="#10b981" />
            )}
          </View>
        </View>

        <SmartText
          weight="regular"
          style={[
            styles.messageCount,
            { color: colorScheme === "dark" ? "#9ca3af" : "#6b7280" },
          ]}
        >
          {item.messages.length} messages
        </SmartText>

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
        size={80}
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
    container: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colorScheme === "dark" ? "#374151" : "#e5e7eb",
      backgroundColor: colorScheme === "dark" ? "#1f2937" : "#ffffff",
    },
    headerLeft: {
      flex: 1,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: "bold",
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
      padding: 12,
      borderRadius: 8,
      backgroundColor: colorScheme === "dark" ? "#374151" : "#f3f4f6",
      marginLeft: 8,
    },
    conversationItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      borderBottomWidth: 1,
      marginHorizontal: 0,
    },
    conversationContent: {
      flex: 1,
      marginRight: 12,
    },
    conversationHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 8,
    },
    conversationTitle: {
      fontSize: 16,
      flex: 1,
      marginRight: 8,
    },
    conversationMeta: {
      flexDirection: "row",
      alignItems: "center",
    },
    conversationDate: {
      fontSize: 12,
      marginRight: 8,
    },
    localOnlyBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#fef3c7",
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 4,
      marginRight: 4,
    },
    localOnlyText: {
      fontSize: 8,
      color: "#f59e0b",
      marginLeft: 2,
      fontWeight: "600",
    },
    messageCount: {
      fontSize: 12,
      marginBottom: 4,
    },
    conversationPreview: {
      fontSize: 14,
      lineHeight: 18,
    },
    deleteButton: {
      padding: 8,
    },
    emptyState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 40,
    },
    emptyTitle: {
      fontSize: 20,
      marginTop: 16,
      marginBottom: 8,
    },
    emptyDescription: {
      fontSize: 16,
      textAlign: "center",
      lineHeight: 24,
    },
  });

  return (
    <ScreenBackground
      variant="animated"
      isActive={true}
      includeSafeArea={false}
    >
      <View style={styles.container}>
        {/* Header */}
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
                color={
                  isSyncing
                    ? "#6b7280"
                    : colorScheme === "dark"
                      ? "#ffffff"
                      : "#1f2937"
                }
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Conversation List */}
        {conversations.length === 0 && !isLoading ? (
          <EmptyState />
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={(item) => item.id}
            renderItem={renderConversationItem}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={colorScheme === "dark" ? "#ffffff" : "#1f2937"}
              />
            }
          />
        )}

        {/* Conversation Detail Modal */}
        <ConversationDetail
          visible={showConversationDetail}
          conversation={selectedConversation}
          onClose={() => setShowConversationDetail(false)}
        />
      </View>
    </ScreenBackground>
  );
}
