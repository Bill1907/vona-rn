import { supabase } from "@/api/supabaseClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { Conversation, HybridConversationStore } from "./conversation/types";
import {
  decryptData,
  encryptData,
  generateConversationId,
  parseConversations,
  safeDate,
  safeISOString,
  STORAGE_KEYS,
  SyncQueue,
} from "./conversation/utils";

/**
 * 하이브리드 Conversation Store
 * 로컬 저장소 + 클라우드 동기화 지원
 */
export const useHybridConversationStore = create<HybridConversationStore>(
  (set, get) => ({
    conversations: [],
    currentConversation: null,
    isLoading: false,
    isSyncing: false,
    error: null,
    lastSyncTime: null,

    // 로컬과 클라우드에서 데이터 로드
    loadConversations: async () => {
      set({ isLoading: true, error: null });
      try {
        // 1. 로컬 데이터 먼저 로드
        const localData = await AsyncStorage.getItem(
          STORAGE_KEYS.LOCAL_CONVERSATIONS
        );
        let localConversations: Conversation[] = [];

        if (localData) {
          const decryptedData = decryptData(localData);
          localConversations = parseConversations(decryptedData);
        }

        set({ conversations: localConversations, isLoading: false });

        // 2. 백그라운드에서 클라우드 동기화
        const { syncFromCloud } = get();
        syncFromCloud().catch(console.error);
      } catch (error) {
        console.error("Failed to load conversations:", error);
        set({ error: "Failed to load conversations", isLoading: false });
      }
    },

    // 하이브리드 저장 (로컬 + 클라우드)
    saveConversation: async (conversation: Conversation) => {
      try {
        const { conversations } = get();
        const updatedConversation = {
          ...conversation,
          updatedAt: new Date(),
          createdAt: safeDate(conversation.createdAt),
        };

        // 1. 로컬에 즉시 저장
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
          STORAGE_KEYS.LOCAL_CONVERSATIONS,
          encryptedData
        );
        set({ conversations: updatedConversations });

        // 2. 클라우드 동기화 큐에 추가
        await SyncQueue.add(updatedConversation);

        // 3. 백그라운드에서 클라우드 동기화 시도
        const { syncToCloud } = get();
        syncToCloud().catch(console.error);
      } catch (error) {
        console.error("Failed to save conversation:", error);
        set({ error: "Failed to save conversation" });
      }
    },

    // 클라우드로 동기화
    syncToCloud: async () => {
      try {
        set({ isSyncing: true });

        // 현재 사용자 확인
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          console.log("No user logged in, skipping cloud sync");
          set({ isSyncing: false });
          return;
        }

        // 동기화 큐에서 대화들 가져오기
        const queue = await SyncQueue.getAll();
        if (queue.length === 0) {
          set({ isSyncing: false });
          return;
        }

        for (const conversation of queue) {
          try {
            // 암호화된 데이터 준비
            const encryptedData = encryptData(
              JSON.stringify(conversation.messages)
            );

            // Supabase에 upsert
            const { error } = await supabase.from("conversations").upsert({
              user_id: user.id,
              conversation_id: conversation.id,
              title: conversation.title,
              encrypted_data: encryptedData,
              message_count: conversation.messages.length,
              created_at: safeISOString(conversation.createdAt),
              updated_at: safeISOString(conversation.updatedAt),
              synced_at: new Date().toISOString(),
            });

            if (error) {
              console.error("Failed to sync conversation to cloud:", error);
            } else {
              // 동기화 성공시 큐에서 제거
              await SyncQueue.remove(conversation.id);

              // 로컬 데이터에 syncedAt 업데이트
              const { conversations } = get();
              const updatedConversations = conversations.map((conv) =>
                conv.id === conversation.id
                  ? { ...conv, syncedAt: new Date(), localOnly: false }
                  : conv
              );
              set({ conversations: updatedConversations });
            }
          } catch (error) {
            console.error("Error syncing individual conversation:", error);
          }
        }

        set({ isSyncing: false, lastSyncTime: new Date() });
      } catch (error) {
        console.error("Failed to sync to cloud:", error);
        set({ isSyncing: false, error: "Failed to sync to cloud" });
      }
    },

    // 클라우드에서 동기화
    syncFromCloud: async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: cloudConversations, error } = await supabase
          .from("conversations")
          .select("*")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false });

        if (error) {
          console.error("Failed to fetch from cloud:", error);
          return;
        }

        if (!cloudConversations) return;

        const { conversations: localConversations } = get();
        const mergedConversations: Conversation[] = [...localConversations];

        // 클라우드 데이터와 로컬 데이터 병합
        for (const cloudConv of cloudConversations) {
          try {
            const decryptedMessages = JSON.parse(
              decryptData(cloudConv.encrypted_data)
            );
            const conversation: Conversation = {
              id: cloudConv.conversation_id,
              title: cloudConv.title,
              messages: decryptedMessages.map((msg: any) => ({
                ...msg,
                timestamp: safeDate(msg.timestamp),
              })),
              createdAt: safeDate(cloudConv.created_at),
              updatedAt: safeDate(cloudConv.updated_at),
              syncedAt: safeDate(cloudConv.synced_at),
              localOnly: false,
            };

            const localIndex = mergedConversations.findIndex(
              (conv) => conv.id === conversation.id
            );

            if (localIndex >= 0) {
              // 최신 버전으로 업데이트 (클라우드가 더 최신이면)
              const localConv = mergedConversations[localIndex];
              if (
                !localConv.syncedAt ||
                conversation.updatedAt > localConv.updatedAt
              ) {
                mergedConversations[localIndex] = conversation;
              }
            } else {
              // 새로운 대화 추가
              mergedConversations.push(conversation);
            }
          } catch (decryptError) {
            console.error(
              "Failed to decrypt cloud conversation:",
              decryptError
            );
          }
        }

        // 로컬에 저장
        const encryptedData = encryptData(JSON.stringify(mergedConversations));
        await AsyncStorage.setItem(
          STORAGE_KEYS.LOCAL_CONVERSATIONS,
          encryptedData
        );
        set({ conversations: mergedConversations, lastSyncTime: new Date() });
      } catch (error) {
        console.error("Failed to sync from cloud:", error);
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
        localOnly: true,
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
      try {
        const { conversations } = get();
        const updatedConversations = conversations.filter(
          (conv) => conv.id !== id
        );

        // 로컬에서 삭제
        const encryptedData = encryptData(JSON.stringify(updatedConversations));
        await AsyncStorage.setItem(
          STORAGE_KEYS.LOCAL_CONVERSATIONS,
          encryptedData
        );

        // 클라우드에서도 삭제
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from("conversations")
            .delete()
            .eq("user_id", user.id)
            .eq("conversation_id", id);
        }

        // 동기화 큐에서도 제거
        await SyncQueue.remove(id);

        set({
          conversations: updatedConversations,
          currentConversation:
            get().currentConversation?.id === id
              ? null
              : get().currentConversation,
        });
      } catch (error) {
        console.error("Failed to delete conversation:", error);
        set({ error: "Failed to delete conversation" });
      }
    },

    setCurrentConversation: (conversation: Conversation | null) => {
      set({ currentConversation: conversation });
    },

    clearError: () => {
      set({ error: null });
    },

    enableAutoSync: () => {
      // TODO: 주기적 동기화 구현
      console.log("Auto sync enabled");
    },

    disableAutoSync: () => {
      console.log("Auto sync disabled");
    },
  })
);

// Re-export types for backward compatibility
export type { Conversation, ConversationMessage } from "./conversation/types";
