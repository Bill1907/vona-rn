import { useCallback, useRef, useState } from "react";
import { Platform } from "react-native";

// React Native WebRTC 폴리필 설정
let RTCPeerConnection: any;
let RTCIceCandidate: any;
let RTCSessionDescription: any;
let mediaDevices: any;

if (Platform.OS !== "web") {
  const webrtc = require("react-native-webrtc");

  // WebRTC 클래스들을 전역에 등록
  RTCPeerConnection = webrtc.RTCPeerConnection;
  RTCIceCandidate = webrtc.RTCIceCandidate;
  RTCSessionDescription = webrtc.RTCSessionDescription;
  mediaDevices = webrtc.mediaDevices;

  // 전역 객체에 등록
  if (typeof global !== "undefined") {
    (global as any).RTCPeerConnection = RTCPeerConnection;
    (global as any).RTCIceCandidate = RTCIceCandidate;
    (global as any).RTCSessionDescription = RTCSessionDescription;

    if (!global.navigator) {
      (global as any).navigator = {};
    }
    (global.navigator as any).mediaDevices = mediaDevices;
  }
} else {
  // 웹 환경에서는 내장 WebRTC API 사용
  RTCPeerConnection = window.RTCPeerConnection;
  RTCIceCandidate = window.RTCIceCandidate;
  RTCSessionDescription = window.RTCSessionDescription;
  mediaDevices = navigator.mediaDevices;
}

export interface WebRTCState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connectionState: RTCPeerConnectionState | null;
}

export interface WebRTCConfig {
  iceServers?: RTCIceServer[];
  audioConstraints?: MediaTrackConstraints;
  onIceCandidate?: (candidate: RTCIceCandidate) => void;
  onTrack?: (event: RTCTrackEvent) => void;
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
}

// WebRTC 기본 설정
const iceServers: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export const useWebrtc = (config?: WebRTCConfig) => {
  const [state, setState] = useState<WebRTCState>({
    isConnected: false,
    isConnecting: false,
    connectionState: "new",
    error: null,
  });

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  /**
   * WebRTC Peer Connection을 초기화합니다
   */
  const initializePeerConnection = useCallback(async () => {
    try {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }

      const pc = new RTCPeerConnection(iceServers);
      peerConnectionRef.current = pc;

      // 연결 상태 변경 이벤트
      pc.onconnectionstatechange = () => {
        const connectionState = pc.connectionState;
        setState((prev) => ({
          ...prev,
          connectionState,
          isConnected: connectionState === "connected",
          isConnecting: connectionState === "connecting",
        }));

        config?.onConnectionStateChange?.(connectionState);
      };

      // ICE candidate 이벤트
      pc.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
        if (event.candidate) {
          config?.onIceCandidate?.(event.candidate);
        }
      };

      // 원격 스트림 수신 이벤트
      pc.ontrack = (event: RTCTrackEvent) => {
        config?.onTrack?.(event);
      };

      setState((prev) => ({ ...prev, error: null }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error
            ? error.message
            : "Failed to initialize WebRTC",
      }));
      throw error;
    }
  }, [config]);

  /**
   * 로컬 오디오 스트림을 가져옵니다
   */
  const getLocalAudioStream = useCallback(async () => {
    try {
      const constraints: MediaStreamConstraints = {
        audio: config?.audioConstraints || {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 24000,
          channelCount: 1,
        },
        video: false,
      };

      const stream = await mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      return stream;
    } catch (error) {
      console.error("Failed to get local audio stream:", error);
      setState((prev) => ({
        ...prev,
        error: "Failed to access microphone",
      }));
      throw error;
    }
  }, [config?.audioConstraints]);

  /**
   * 로컬 스트림을 Peer Connection에 추가합니다
   */
  const addLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;

      if (peerConnectionRef.current) {
        // 새 스트림 추가
        stream.getAudioTracks().forEach((track: MediaStreamTrack) => {
          peerConnectionRef.current!.addTrack(track, stream);
        });
      }

      return stream;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error.message : "Failed to get media stream",
      }));
      throw error;
    }
  }, []);

  /**
   * 데이터 채널을 생성합니다
   */
  const createDataChannel = useCallback(
    (label: string, options?: RTCDataChannelInit) => {
      if (!peerConnectionRef.current) {
        throw new Error("PeerConnection not initialized");
      }

      return peerConnectionRef.current.createDataChannel(label, options);
    },
    []
  );

  /**
   * 트랙을 추가합니다
   */
  const addTrack = useCallback(
    (track: MediaStreamTrack, stream: MediaStream) => {
      if (!peerConnectionRef.current) {
        throw new Error("PeerConnection not initialized");
      }

      return peerConnectionRef.current.addTrack(track, stream);
    },
    []
  );

  /**
   * Offer를 생성합니다
   */
  const createOffer = useCallback(async () => {
    if (!peerConnectionRef.current) {
      throw new Error("PeerConnection not initialized");
    }

    try {
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      return offer;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error.message : "Failed to create offer",
      }));
      throw error;
    }
  }, []);

  /**
   * Local Description을 가져옵니다
   */
  const getLocalDescription = useCallback(() => {
    return peerConnectionRef.current?.localDescription || null;
  }, []);

  /**
   * Answer를 생성합니다
   */
  const createAnswer = useCallback(async () => {
    if (!peerConnectionRef.current) {
      throw new Error("PeerConnection not initialized");
    }

    try {
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      return answer;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error.message : "Failed to create answer",
      }));
      throw error;
    }
  }, []);

  /**
   * 원격 설명을 설정합니다
   */
  const setRemoteDescription = useCallback(
    async (description: RTCSessionDescriptionInit) => {
      if (!peerConnectionRef.current) {
        throw new Error("PeerConnection not initialized");
      }

      try {
        await peerConnectionRef.current.setRemoteDescription(description);
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : "Failed to set remote description",
        }));
        throw error;
      }
    },
    []
  );

  /**
   * ICE candidate를 추가합니다
   */
  const addIceCandidate = useCallback(
    async (candidate: RTCIceCandidateInit) => {
      if (!peerConnectionRef.current) {
        throw new Error("PeerConnection not initialized");
      }

      try {
        await peerConnectionRef.current.addIceCandidate(candidate);
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : "Failed to add ICE candidate",
        }));
        throw error;
      }
    },
    []
  );

  /**
   * WebRTC 연결을 종료합니다
   */
  const closeConnection = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    setState({
      isConnected: false,
      isConnecting: false,
      connectionState: "closed",
      error: null,
    });
  }, []);

  /**
   * 연결 상태를 초기화합니다
   */
  const resetState = useCallback(() => {
    setState({
      isConnected: false,
      isConnecting: false,
      connectionState: "new",
      error: null,
    });
  }, []);

  return {
    state,
    peerConnection: peerConnectionRef.current,
    localStream: localStreamRef.current,
    initializePeerConnection,
    createDataChannel,
    addLocalStream,
    addTrack,
    createOffer,
    createAnswer,
    getLocalDescription,
    setRemoteDescription,
    addIceCandidate,
    closeConnection,
    resetState,
  };
};
