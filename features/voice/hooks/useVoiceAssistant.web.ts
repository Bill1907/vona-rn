import { supabase } from "@/api/supabaseClient";
import {
  RealtimeAgent,
  RealtimeSession,
  RealtimeSessionConnectOptions,
  TransportEvent,
} from "@openai/agents-realtime";
import { useCallback, useRef, useState } from "react";
import { VoiceService } from "../services";
import type {
  VoiceAssistantAPI,
  VoiceAssistantState,
  VoiceMessage,
  VoiceSessionConfig,
} from "../types";

export const useVoiceAssistant = (): VoiceAssistantAPI => {
  const [state, setState] = useState<VoiceAssistantState>({
    isConnected: false,
    isConnecting: false,
    isListening: false,
    isSpeaking: false,
    sessionId: null,
    error: null,
    isMicMuted: false,
    isSpeakerMuted: false,
  });

  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const sessionRef = useRef<RealtimeSession | null>(null);
  const agentRef = useRef<RealtimeAgent | null>(null);

  // 웹 검색 function calling 처리 (현재 웹 SDK에서는 지원되지 않음)
  const handleWebSearch = useCallback(
    async (query: string, language: string = "ko", count: number = 5) => {
      try {
        const { data, error } = await supabase.functions.invoke("web-search", {
          body: {
            query,
            language,
            count,
          },
        });

        if (error) {
          console.error("Web search error:", error);
          return {
            error: "검색 중 오류가 발생했습니다.",
            results: [],
          };
        }

        return {
          query: data.query,
          results: data.results || [],
          answer: data.answer,
          total_results: data.total_results || 0,
        };
      } catch (error) {
        console.error("Web search function error:", error);
        return {
          error: "검색 서비스를 사용할 수 없습니다.",
          results: [],
        };
      }
    },
    []
  );

  /**
   * Voice Assistant 세션을 시작합니다
   */
  const startVoiceSession = useCallback(
    async (config?: Partial<VoiceSessionConfig>) => {
      try {
        setState((prev) => ({ ...prev, error: null, isConnecting: true }));

        // 1. Supabase 함수를 통해 ephemeral token 받아오기
        const { token, error: tokenError } =
          await VoiceService.createVoiceSession(config);

        if (tokenError || !token) {
          throw new Error(tokenError || "Failed to get ephemeral token");
        }

        // 2. RealtimeAgent 생성
        const agent = new RealtimeAgent({
          name: "Voice Assistant",
          instructions: config?.instructions || "You are a helpful assistant.",
        });
        agentRef.current = agent;

        // 3. RealtimeSession 생성 - 올바른 옵션 구조 사용
        const session = new RealtimeSession(agent, {
          apiKey: token.token,
          transport: "webrtc", // WebRTC 사용 (브라우저 환경)
          model: config?.model || "gpt-4o-realtime-preview",
          config: {
            voice: config?.voice || "alloy",
            inputAudioTranscription: { model: "whisper-1" },
            turnDetection: {
              type: "server_vad",
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 200,
              create_response: true,
            },
          },
        });

        // 4. 이벤트 리스너 설정 - SDK의 실제 이벤트 사용
        session.on("agent_start", () => {
          console.log("🎙️ Agent started speaking");
          setState((prev) => ({ ...prev, isSpeaking: true }));
        });

        session.on("agent_end", () => {
          console.log("🎙️ Agent stopped speaking");
          setState((prev) => ({ ...prev, isSpeaking: false }));
        });

        session.on("audio_start", () => {
          console.log("🔊 Audio output started");
          setState((prev) => ({ ...prev, isSpeaking: true }));
        });

        session.on("audio_stopped", () => {
          console.log("🔊 Audio output stopped");
          setState((prev) => ({ ...prev, isSpeaking: false }));
        });

        session.on("history_updated", (history) => {
          // 대화 기록이 업데이트될 때 메시지 동기화
          const newMessages: VoiceMessage[] = [];

          history.forEach((item: any) => {
            if (item.type === "message") {
              if (
                item.role === "user" &&
                item.content?.[0]?.type === "input_text"
              ) {
                newMessages.push({
                  id: item.id || Date.now().toString(),
                  type: "user",
                  content: item.content[0].text,
                  timestamp: new Date(),
                });
              } else if (
                item.role === "assistant" &&
                item.content?.[0]?.type === "text"
              ) {
                newMessages.push({
                  id: item.id || Date.now().toString(),
                  type: "assistant",
                  content: item.content[0].text,
                  timestamp: new Date(),
                });
              }
            }
          });

          setMessages(newMessages);
        });

        session.on("error", (error: any) => {
          console.error("Session error:", error);
          setState((prev) => ({
            ...prev,
            error: error.error?.message || "Session error occurred",
          }));
        });

        // transport_event는 낮은 수준의 이벤트를 위해 보조적으로 사용
        session.on("transport_event", (event: TransportEvent) => {
          switch (event.type) {
            case "session.created":
              console.log("Session created");
              setState((prev) => ({
                ...prev,
                isConnected: true,
                isConnecting: false,
                sessionId: token.session_id,
              }));
              break;

            case "input_audio_buffer.speech_started":
              setState((prev) => ({ ...prev, isListening: true }));
              break;

            case "input_audio_buffer.speech_stopped":
              setState((prev) => ({ ...prev, isListening: false }));
              break;

            case "conversation.item.input_audio_transcription.completed":
              // 이미 history_updated에서 처리되므로 중복 방지
              console.log("Audio transcription completed:", event);
              break;

            // TODO: Function calling 지원이 추가되면 여기서 처리
            case "response.function_call_arguments.done":
              console.log(
                "Function call detected (not yet supported in web):",
                event
              );
              // 웹 검색 기능은 현재 React Native 버전에서만 지원
              break;

            default:
              console.log("Transport event:", event.type);
          }
        });

        // 5. 연결 시작
        const connectOptions: RealtimeSessionConnectOptions = {
          apiKey: token.token,
          model: config?.model || "gpt-4o-realtime-preview",
        };

        await session.connect(connectOptions);

        sessionRef.current = session;

        // 6. 웹 환경 오디오 설정 및 권한 처리
        if (typeof window !== "undefined") {
          // 브라우저 오디오 컨텍스트 활성화 (자동재생 정책 대응)
          try {
            // AudioContext 생성 및 resume (사용자 제스처가 있는 상태에서)
            const audioContext = new (window.AudioContext ||
              (window as any).webkitAudioContext)();
            if (audioContext.state === "suspended") {
              audioContext
                .resume()
                .then(() => {
                  console.log("AudioContext resumed successfully");
                })
                .catch((error) => {
                  console.warn("Failed to resume AudioContext:", error);
                });
            }

            // Transport의 오디오 요소 설정
            setTimeout(() => {
              const transport = session.transport;
              if (transport && "audioElement" in transport) {
                const audioElement = (transport as any).audioElement;
                if (audioElement) {
                  // 오디오 엘리먼트 기본 설정
                  audioElement.autoplay = true;
                  audioElement.muted = false;
                  audioElement.volume = 1.0;
                  audioElement.setAttribute("playsinline", "true");

                  // 오디오 재생 시도 (자동재생 정책 테스트)
                  audioElement.play().catch((error: any) => {
                    if (error.name === "NotAllowedError") {
                      console.warn(
                        "Audio autoplay blocked by browser policy. User interaction required."
                      );
                    } else {
                      console.error("Audio play error:", error);
                    }
                  });

                  console.log("Audio element configured:", audioElement);
                }
              }
            }, 1000);
          } catch (error) {
            console.error("Audio setup error:", error);
          }
        }
      } catch (error) {
        console.error("Failed to start voice session:", error);
        setState((prev) => ({
          ...prev,
          isConnecting: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to start voice session",
        }));
      }
    },
    []
  );

  /**
   * Voice Assistant 세션을 종료합니다
   */
  const endVoiceSession = useCallback(async () => {
    try {
      if (sessionRef.current) {
        sessionRef.current.close(); // disconnect 대신 close 사용
        sessionRef.current = null;
      }

      agentRef.current = null;

      setState({
        isConnected: false,
        isConnecting: false,
        isListening: false,
        isSpeaking: false,
        sessionId: null,
        error: null,
        isMicMuted: false,
        isSpeakerMuted: false,
      });
    } catch (error) {
      console.error("Failed to end voice session:", error);
      setState((prev) => ({
        ...prev,
        error: "Failed to end voice session",
      }));
    }
  }, []);

  /**
   * 음성 듣기 시작/중지 (자동으로 처리됨)
   */
  const toggleListening = useCallback(() => {
    // OpenAI SDK는 자동으로 VAD를 처리하므로 별도 구현 불필요
    console.log("Voice activity detection is handled automatically");
  }, []);

  /**
   * 마이크 음소거/해제
   */
  const toggleMicMute = useCallback(() => {
    if (!sessionRef.current) return;

    const newMuteState = !state.isMicMuted;

    // Session의 mute 메서드 사용
    sessionRef.current.mute(newMuteState);

    setState((prev) => ({
      ...prev,
      isMicMuted: newMuteState,
    }));
  }, [state.isMicMuted]);

  /**
   * 스피커 음소거/해제
   */
  const toggleSpeakerMute = useCallback(() => {
    if (!sessionRef.current) return;

    const newMuteState = !state.isSpeakerMuted;

    // transport layer의 오디오 엘리먼트를 직접 제어
    const transport = sessionRef.current.transport;
    if (transport && "audioElement" in transport) {
      const audioElement = (transport as any).audioElement;
      if (audioElement) {
        audioElement.muted = newMuteState;

        // 음소거 해제 시 오디오 재생 활성화 시도
        if (!newMuteState) {
          audioElement.play().catch((error: any) => {
            console.warn("Audio play failed during unmute:", error);
          });
        }
      }
    }

    setState((prev) => ({
      ...prev,
      isSpeakerMuted: newMuteState,
    }));
  }, [state.isSpeakerMuted]);

  /**
   * 전체 음소거/해제
   */
  const toggleMute = useCallback(() => {
    const shouldMute = !state.isMicMuted || !state.isSpeakerMuted;

    if (sessionRef.current) {
      // 마이크 뮤트
      sessionRef.current.mute(shouldMute);

      // 스피커 뮤트
      const transport = sessionRef.current.transport;
      if (transport && "audioElement" in transport) {
        const audioElement = (transport as any).audioElement;
        if (audioElement) {
          audioElement.muted = shouldMute;

          // 음소거 해제 시 오디오 재생 활성화 시도
          if (!shouldMute) {
            audioElement.play().catch((error: any) => {
              console.warn("Audio play failed during unmute:", error);
            });
          }
        }
      }
    }

    setState((prev) => ({
      ...prev,
      isMicMuted: shouldMute,
      isSpeakerMuted: shouldMute,
    }));
  }, [state.isMicMuted, state.isSpeakerMuted]);

  /**
   * 텍스트 메시지 전송
   */
  const sendTextMessage = useCallback(
    async (text: string) => {
      if (!state.isConnected || !sessionRef.current) return;

      const message: VoiceMessage = {
        id: Date.now().toString(),
        type: "user",
        content: text,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, message]);

      try {
        // sendMessage는 string 또는 특정 형식의 객체를 받음
        sessionRef.current.sendMessage({
          type: "message",
          role: "user",
          content: [{ type: "input_text", text }],
        });
      } catch (error) {
        console.error("Failed to send text message:", error);
      }
    },
    [state.isConnected]
  );

  return {
    state,
    messages,
    startVoiceSession,
    endVoiceSession,
    toggleListening,
    toggleMicMute,
    toggleSpeakerMute,
    toggleMute,
    sendTextMessage,
  };
};
