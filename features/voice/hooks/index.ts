// 플랫폼별 export
// React Native는 .web.ts와 .native.ts 확장자를 자동으로 처리합니다
export { useVoiceAssistant } from "./useVoiceAssistant";
export { useWebrtc } from "./useWebrtc";

// 타입 re-export
export type {
  VoiceAssistantAPI,
  VoiceAssistantState,
  VoiceMessage,
  VoiceSessionConfig,
} from "../types";
