import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { Conversation, ConversationStore } from "./conversation/types";
import {
  STORAGE_KEYS,
  decryptData,
  encryptData,
  generateConversationId,
  parseConversations,
  safeDate,
} from "./conversation/utils";

/**
 * 기본 Conversation Store
 * 로컬 저장소만 사용하는 단순한 버전
 */
export const useConversationStore = create<ConversationStore>((set, get) => ({
  conversations: [],
  currentConversation: null,
  isLoading: false,
  error: null,

  loadConversations: async () => {
    set({ isLoading: true, error: null });
    try {
      const encryptedData = await AsyncStorage.getItem(
        STORAGE_KEYS.SIMPLE_CONVERSATIONS
      );
      if (encryptedData) {
        const decryptedData = decryptData(encryptedData);
        const conversations = parseConversations(decryptedData);
        set({ conversations, isLoading: false });
      } else {
        set({ conversations: [], isLoading: false });
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
      set({ error: "Failed to load conversations", isLoading: false });
    }
  },

  saveConversation: async (conversation: Conversation) => {
    set({ isLoading: true, error: null });
    try {
      const { conversations } = get();
      const updatedConversation = {
        ...conversation,
        updatedAt: safeDate(new Date()),
        createdAt: safeDate(conversation.createdAt),
      };

      const existingIndex = conversations.findIndex(
        (conv) => conv.id === conversation.id
      );
      let updatedConversations: Conversation[];

      if (existingIndex >= 0) {
        updatedConversations = [...conversations];
        updatedConversations[existingIndex] = updatedConversation;
      } else {
        updatedConversations = [...conversations, updatedConversation];
      }

      const encryptedData = encryptData(JSON.stringify(updatedConversations));
      await AsyncStorage.setItem(
        STORAGE_KEYS.SIMPLE_CONVERSATIONS,
        encryptedData
      );

      set({ conversations: updatedConversations, isLoading: false });
    } catch (error) {
      console.error("Failed to save conversation:", error);
      set({ error: "Failed to save conversation", isLoading: false });
    }
  },

  createConversation: (title?: string) => {
    const now = new Date();
    const conversation: Conversation = {
      id: generateConversationId(),
      title: title || "New Conversation",
      messages: [],
      createdAt: now,
      updatedAt: now,
      localOnly: true, // 기본 store는 로컬 전용
    };
    return conversation;
  },

  updateConversation: async (id: string, updates: Partial<Conversation>) => {
    const { conversations, saveConversation } = get();
    const conversation = conversations.find((conv) => conv.id === id);
    if (conversation) {
      const updatedConversation = {
        ...conversation,
        ...updates,
        updatedAt: new Date(),
        createdAt: safeDate(conversation.createdAt),
      };
      await saveConversation(updatedConversation);
    }
  },

  deleteConversation: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { conversations } = get();
      const updatedConversations = conversations.filter(
        (conv) => conv.id !== id
      );
      const encryptedData = encryptData(JSON.stringify(updatedConversations));
      await AsyncStorage.setItem(
        STORAGE_KEYS.SIMPLE_CONVERSATIONS,
        encryptedData
      );

      set({
        conversations: updatedConversations,
        currentConversation:
          get().currentConversation?.id === id
            ? null
            : get().currentConversation,
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      set({ error: "Failed to delete conversation", isLoading: false });
    }
  },

  setCurrentConversation: (conversation: Conversation | null) => {
    set({ currentConversation: conversation });
  },

  clearError: () => {
    set({ error: null });
  },
}));

// Re-export types for backward compatibility
export type { Conversation, ConversationMessage } from "./conversation/types";
