import { SmartText } from "@/components/common";
import React, { useEffect, useRef } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import type { VoiceMessage } from "../types";

interface VoiceMessageListProps {
  messages: VoiceMessage[];
  autoScroll?: boolean;
}

export const VoiceMessageList: React.FC<VoiceMessageListProps> = ({
  messages,
  autoScroll = true,
}) => {
  const flatListRef = useRef<FlatList>(null);

  // 메시지가 추가될 때마다 하단으로 스크롤
  useEffect(() => {
    if (autoScroll && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, autoScroll]);

  const renderMessage = ({ item }: { item: VoiceMessage }) => (
    <View
      style={[
        styles.messageContainer,
        item.type === "user" ? styles.userMessage : styles.assistantMessage,
        {
          backgroundColor: item.type === "user" ? "#2563eb" : "transparent",
        },
      ]}
    >
      <SmartText
        weight="regular"
        style={[
          styles.messageText,
          {
            color: "#ffffff",
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
            color: "#e5e7eb",
          },
        ]}
      >
        {item.timestamp.toLocaleTimeString()}
      </SmartText>
    </View>
  );

  const styles = StyleSheet.create({
    container: {
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
  });

  return (
    <FlatList
      ref={flatListRef}
      data={messages}
      renderItem={renderMessage}
      keyExtractor={(item) => item.id}
      style={styles.container}
      showsVerticalScrollIndicator={false}
      onContentSizeChange={() => {
        if (autoScroll) {
          flatListRef.current?.scrollToEnd({ animated: true });
        }
      }}
    />
  );
};
