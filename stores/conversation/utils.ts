import AsyncStorage from "@react-native-async-storage/async-storage";
import { Conversation } from "./types";

// 저장소 키들
export const STORAGE_KEYS = {
  LOCAL_CONVERSATIONS: "hybrid_conversations",
  SYNC_QUEUE: "sync_queue",
  SIMPLE_CONVERSATIONS: "encrypted_conversations", // 기존 단순 저장소용
} as const;

/**
 * 간단한 암호화/복호화 (Base64 + XOR)
 */
const ENCRYPTION_KEY = "vona2024";

export const encryptData = (data: string): string => {
  const encoded = btoa(unescape(encodeURIComponent(data)));
  let result = "";
  for (let i = 0; i < encoded.length; i++) {
    result += String.fromCharCode(
      encoded.charCodeAt(i) ^
        ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length)
    );
  }
  return btoa(result);
};

export const decryptData = (encryptedData: string): string => {
  const encrypted = atob(encryptedData);
  let decoded = "";
  for (let i = 0; i < encrypted.length; i++) {
    decoded += String.fromCharCode(
      encrypted.charCodeAt(i) ^
        ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length)
    );
  }
  return decodeURIComponent(escape(atob(decoded)));
};

/**
 * 대화 제목 자동 생성 (폴백용)
 */
export const generateFallbackTitle = (
  firstMessage: string,
  maxLength: number = 30
): string => {
  const title = firstMessage.replace(/\n/g, " ").trim();
  return title.length > maxLength
    ? title.substring(0, maxLength - 3) + "..."
    : title;
};

/**
 * 고유 ID 생성
 */
export const generateConversationId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

/**
 * Date 객체 안전 변환
 */
export const safeDate = (date: Date | string | undefined | null): Date => {
  if (!date) return new Date();
  if (date instanceof Date) return date;
  return new Date(date);
};

/**
 * Date를 ISO 문자열로 안전 변환
 */
export const safeISOString = (
  date: Date | string | undefined | null
): string => {
  return safeDate(date).toISOString();
};

/**
 * JSON 데이터에서 Conversation 배열로 안전 변환
 */
export const parseConversations = (jsonData: string): Conversation[] => {
  try {
    const parsed = JSON.parse(jsonData);
    return Array.isArray(parsed) ? parsed.map(normalizeConversation) : [];
  } catch (error) {
    console.error("Failed to parse conversations:", error);
    return [];
  }
};

/**
 * Conversation 객체 정규화 (Date 변환 등)
 */
export const normalizeConversation = (conv: any): Conversation => {
  return {
    ...conv,
    createdAt: safeDate(conv.createdAt),
    updatedAt: safeDate(conv.updatedAt),
    syncedAt: conv.syncedAt ? safeDate(conv.syncedAt) : undefined,
    messages: Array.isArray(conv.messages)
      ? conv.messages.map((msg: any) => ({
          ...msg,
          timestamp: safeDate(msg.timestamp),
        }))
      : [],
  };
};

/**
 * 동기화 큐 관리
 */
export class SyncQueue {
  static async add(conversation: Conversation): Promise<void> {
    try {
      const existingQueue = await AsyncStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
      const queue = existingQueue ? JSON.parse(existingQueue) : [];
      const existingIndex = queue.findIndex(
        (item: Conversation) => item.id === conversation.id
      );

      if (existingIndex >= 0) {
        queue[existingIndex] = conversation;
      } else {
        queue.push(conversation);
      }

      await AsyncStorage.setItem(
        STORAGE_KEYS.SYNC_QUEUE,
        JSON.stringify(queue)
      );
    } catch (error) {
      console.error("Failed to add to sync queue:", error);
    }
  }

  static async remove(conversationId: string): Promise<void> {
    try {
      const existingQueue = await AsyncStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
      if (existingQueue) {
        const queue = JSON.parse(existingQueue);
        const filteredQueue = queue.filter(
          (item: Conversation) => item.id !== conversationId
        );
        await AsyncStorage.setItem(
          STORAGE_KEYS.SYNC_QUEUE,
          JSON.stringify(filteredQueue)
        );
      }
    } catch (error) {
      console.error("Failed to remove from sync queue:", error);
    }
  }

  static async getAll(): Promise<Conversation[]> {
    try {
      const queueData = await AsyncStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
      return queueData ? JSON.parse(queueData) : [];
    } catch (error) {
      console.error("Failed to get sync queue:", error);
      return [];
    }
  }

  static async clear(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.SYNC_QUEUE);
    } catch (error) {
      console.error("Failed to clear sync queue:", error);
    }
  }
}
