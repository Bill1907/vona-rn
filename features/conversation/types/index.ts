export interface ConversationMessage {
  id: string;
  content: string;
  type: "user" | "assistant";
  timestamp: string | Date;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ConversationMessage[];
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
}

export interface ConversationSummaryResponse {
  title: string;
  error?: string;
}
