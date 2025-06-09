export interface ConversationMessage {
  id: string;
  content: string;
  type: "user" | "assistant";
  timestamp: Date;
}

export interface BaseConversation {
  id: string;
  title: string;
  messages: ConversationMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation extends BaseConversation {
  syncedAt?: Date; // 마지막 동기화 시간
  localOnly?: boolean; // 로컬에만 있는 데이터인지
}

export interface ConversationState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  isLoading: boolean;
  error: string | null;
}

export interface ConversationActions {
  // 기본 CRUD
  loadConversations: () => Promise<void>;
  saveConversation: (conversation: Conversation) => Promise<void>;
  createConversation: (title?: string) => Conversation;
  updateConversation: (
    id: string,
    updates: Partial<Conversation>
  ) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  setCurrentConversation: (conversation: Conversation | null) => void;
  clearError: () => void;
}

export interface HybridConversationState extends ConversationState {
  isSyncing: boolean;
  lastSyncTime: Date | null;
}

export interface HybridConversationActions extends ConversationActions {
  // 동기화 관련
  syncToCloud: () => Promise<void>;
  syncFromCloud: () => Promise<void>;
  enableAutoSync: () => void;
  disableAutoSync: () => void;
}

export type ConversationStore = ConversationState & ConversationActions;
export type HybridConversationStore = HybridConversationState &
  HybridConversationActions;
