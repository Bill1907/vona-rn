export interface VoiceAssistantState {
  isConnected: boolean;
  isConnecting: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  sessionId: string | null;
  error: string | null;
  isMicMuted: boolean;
  isSpeakerMuted: boolean;
}

export interface VoiceMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  audio_url?: string;
}

export interface VoiceSessionConfig {
  model?: string;
  instructions?: string;
  voice?: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";
  temperature?: number;
  max_response_output_tokens?: number;
}

export interface VoiceAssistantAPI {
  state: VoiceAssistantState;
  messages: VoiceMessage[];
  startVoiceSession: (config?: Partial<VoiceSessionConfig>) => Promise<void>;
  endVoiceSession: () => Promise<void>;
  toggleListening: () => void;
  toggleMicMute: () => void;
  toggleSpeakerMute: () => void;
  toggleMute: () => void;
  sendTextMessage: (text: string) => Promise<void>;
}
