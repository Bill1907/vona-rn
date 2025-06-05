import { useCallback, useRef, useState } from "react";
import { Platform } from "react-native";
import { VoiceService, VoiceSessionConfig } from "../services";
import { useWebrtc } from "./useWebrtc";

// React Native WebRTC를 위한 폴리필
if (Platform.OS !== "web") {
  // React Native 환경에서는 WebRTC 폴리필을 사용
  require("react-native-webrtc");
  const { mediaDevices } = require("react-native-webrtc");

  // Global navigator에 mediaDevices 추가
  if (typeof global !== "undefined") {
    if (!global.navigator) {
      (global as any).navigator = {};
    }

    if (!global.navigator.mediaDevices) {
      (global.navigator as any).mediaDevices = mediaDevices;
    }
  }
}

export interface VoiceAssistantState {
  isConnected: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  sessionId: string | null;
  error: string | null;
}

export interface VoiceMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  audio_url?: string;
}

export const useVoiceAssistant = () => {
  const [state, setState] = useState<VoiceAssistantState>({
    isConnected: false,
    isListening: false,
    isSpeaking: false,
    sessionId: null,
    error: null,
  });

  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const ephemeralTokenRef = useRef<string | null>(null);

  // WebRTC 훅 사용
  const webrtc = useWebrtc({
    onIceCandidate: (candidate) => {
      console.log("ICE candidate:", candidate);
    },
    onTrack: (event) => {
      console.log("Remote track received:", event);
      // 원격 오디오 스트림 재생
      if (event.streams[0]) {
        playRemoteAudio(event.streams[0]);
      }
    },
    onConnectionStateChange: (state) => {
      console.log("Connection state changed:", state);
      setState((prev) => ({
        ...prev,
        isConnected: state === "connected",
      }));
    },
  });

  /**
   * Voice Assistant 세션을 시작합니다
   */
  const startVoiceSession = useCallback(
    async (config?: Partial<VoiceSessionConfig>) => {
      try {
        setState((prev) => ({ ...prev, error: null }));

        // 1. Supabase 함수를 통해 ephemeral token 받아오기
        const { token, error: tokenError } =
          await VoiceService.createVoiceSession(config);

        if (tokenError || !token) {
          throw new Error(tokenError || "Failed to get ephemeral token");
        }

        ephemeralTokenRef.current = token.token;

        // 2. 마이크 권한 및 스트림 획득
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        if (!stream) {
          throw new Error("Failed to get microphone access");
        }

        // 3. WebRTC PeerConnection 초기화
        await webrtc.initializePeerConnection();

        // 4. 데이터 채널 생성 (OpenAI 메시지 통신용)
        const dataChannel = webrtc.createDataChannel("oai-events");
        dataChannelRef.current = dataChannel;

        // 데이터 채널 이벤트 리스너 설정
        dataChannel.addEventListener("open", () => {
          console.log("Data channel opened");

          // 세션 설정 메시지 전송
          const sessionUpdate = {
            type: "session.update",
            session: {
              instructions:
                config?.instructions || "You are a helpful assistant.",
              voice: config?.voice || "alloy",
              temperature: config?.temperature || 0.8,
              input_audio_transcription: {
                model: "whisper-1",
              },
              turn_detection: {
                type: "server_vad",
                threshold: 0.5,
                prefix_padding_ms: 300,
                silence_duration_ms: 200,
                create_response: true,
              },
            },
          };

          dataChannel.send(JSON.stringify(sessionUpdate));

          // 초기 응답 생성
          const initialResponse = {
            type: "response.create",
            response: {
              modalities: ["text", "audio"],
              instructions: "Greet the user and ask how you can help them.",
            },
          };

          dataChannel.send(JSON.stringify(initialResponse));
        });

        dataChannel.addEventListener("message", (event: MessageEvent) => {
          try {
            const message = JSON.parse(event.data);
            console.log("Received message:", message);
            handleOpenAIMessage(message);
          } catch (error) {
            console.error("Failed to parse data channel message:", error);
          }
        });

        dataChannel.addEventListener("error", (error: Event) => {
          console.error("Data channel error:", error);
        });

        // 5. 로컬 오디오 트랙 추가
        const audioTrack = stream.getAudioTracks()[0];
        await webrtc.addTrack(audioTrack, stream);

        // 6. Offer 생성
        await webrtc.createOffer();
        const offer = webrtc.getLocalDescription();

        if (!offer) {
          throw new Error("Failed to create offer");
        }

        // 7. OpenAI Realtime API에 offer 전송 (ephemeral token 사용)
        await sendOfferToOpenAI(offer, ephemeralTokenRef.current);

        setState((prev) => ({
          ...prev,
          sessionId: token.session_id,
        }));
      } catch (error) {
        console.error("Failed to start voice session:", error);
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : "Failed to start voice session",
        }));
      }
    },
    [webrtc]
  );

  /**
   * Voice Assistant 세션을 종료합니다
   */
  const endVoiceSession = useCallback(async () => {
    try {
      // 데이터 채널 정리
      if (dataChannelRef.current) {
        dataChannelRef.current.close();
        dataChannelRef.current = null;
      }

      // WebRTC 연결 정리
      webrtc.closeConnection();

      setState({
        isConnected: false,
        isListening: false,
        isSpeaking: false,
        sessionId: null,
        error: null,
      });
    } catch (error) {
      console.error("Failed to end voice session:", error);
      setState((prev) => ({
        ...prev,
        error: "Failed to end voice session",
      }));
    }
  }, [webrtc]);

  /**
   * 음성 듣기 시작/중지
   */
  const toggleListening = useCallback(() => {
    if (!state.isConnected) return;

    setState((prev) => ({
      ...prev,
      isListening: !prev.isListening,
    }));
  }, [state.isConnected]);

  /**
   * 텍스트 메시지 전송
   */
  const sendTextMessage = useCallback(
    async (text: string) => {
      if (!state.isConnected || !dataChannelRef.current) return;

      const message: VoiceMessage = {
        id: Date.now().toString(),
        type: "user",
        content: text,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, message]);

      // 데이터 채널을 통해 텍스트 메시지 전송
      try {
        const createMessage = {
          type: "conversation.item.create",
          item: {
            type: "message",
            role: "user",
            content: [{ type: "input_text", text }],
          },
        };

        dataChannelRef.current.send(JSON.stringify(createMessage));

        // 응답 생성 요청
        const responseCreate = {
          type: "response.create",
          response: {
            modalities: ["text", "audio"],
          },
        };

        dataChannelRef.current.send(JSON.stringify(responseCreate));
      } catch (error) {
        console.error("Failed to send text message:", error);
      }
    },
    [state.isConnected]
  );

  // Helper functions
  const sendOfferToOpenAI = async (
    offer: RTCSessionDescriptionInit,
    ephemeralToken: string
  ) => {
    try {
      // OpenAI Realtime API의 올바른 엔드포인트와 방식 (ephemeral token 사용)
      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-realtime-preview";

      const response = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ephemeralToken}`,
          "Content-Type": "application/sdp",
        },
        body: offer.sdp,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to send offer to OpenAI: ${response.status} ${errorText}`
        );
      }

      const answerSdp = await response.text();
      console.log("Received answer SDP:", answerSdp);

      // Answer를 로컬 peer connection에 설정
      await webrtc.setRemoteDescription({
        type: "answer",
        sdp: answerSdp,
      });
    } catch (error) {
      console.error("Error in sendOfferToOpenAI:", error);
      throw error;
    }
  };

  const handleOpenAIMessage = (message: any) => {
    switch (message.type) {
      case "session.created":
        console.log("Session created:", message.session);
        break;

      case "session.updated":
        console.log("Session updated:", message.session);
        break;

      case "input_audio_buffer.speech_started":
        setState((prev) => ({ ...prev, isListening: true }));
        break;

      case "input_audio_buffer.speech_stopped":
        setState((prev) => ({ ...prev, isListening: false }));
        break;

      case "conversation.item.input_audio_transcription.completed":
        if (message.transcript) {
          const userMessage: VoiceMessage = {
            id: Date.now().toString(),
            type: "user",
            content: message.transcript,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, userMessage]);
        }
        break;

      case "response.audio_transcript.done":
        if (message.transcript) {
          const assistantMessage: VoiceMessage = {
            id: Date.now().toString(),
            type: "assistant",
            content: message.transcript,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, assistantMessage]);
        }
        break;

      case "response.done":
        setState((prev) => ({ ...prev, isSpeaking: false }));
        break;

      case "error":
        console.error("OpenAI error:", message);
        setState((prev) => ({
          ...prev,
          error: message.error?.message || "OpenAI API error",
        }));
        break;

      default:
        console.log("Unhandled message type:", message.type);
    }
  };

  const playRemoteAudio = (stream: MediaStream) => {
    if (Platform.OS === "web") {
      if (!audioElementRef.current) {
        audioElementRef.current = new Audio();
      }

      audioElementRef.current.srcObject = stream;
      audioElementRef.current.play().catch(console.error);

      setState((prev) => ({ ...prev, isSpeaking: true }));

      audioElementRef.current.onended = () => {
        setState((prev) => ({ ...prev, isSpeaking: false }));
      };
    }
  };

  return {
    state,
    messages,
    startVoiceSession,
    endVoiceSession,
    toggleListening,
    sendTextMessage,
  };
};
