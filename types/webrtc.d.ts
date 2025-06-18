// WebRTC types for React Native
declare global {
  interface Navigator {
    mediaDevices: MediaDevices;
  }

  interface MediaDevices {
    getUserMedia(constraints?: MediaStreamConstraints): Promise<MediaStream>;
  }

  interface MediaStreamConstraints {
    audio?: boolean | MediaTrackConstraints;
    video?: boolean | MediaTrackConstraints;
  }

  interface MediaTrackConstraints {
    echoCancellation?: boolean;
    noiseSuppression?: boolean;
    autoGainControl?: boolean;
    sampleRate?: number;
    channelCount?: number;
  }
}

export {};
