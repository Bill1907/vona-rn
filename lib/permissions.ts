import * as MediaLibrary from "expo-media-library";
import { Alert, Linking, Platform } from "react-native";

export interface PermissionResult {
  granted: boolean;
  message?: string;
}

/**
 * 마이크 권한을 요청합니다
 */
export const requestMicrophonePermission =
  async (): Promise<PermissionResult> => {
    try {
      if (Platform.OS === "web") {
        // 웹에서는 getUserMedia를 호출할 때 자동으로 권한 요청
        return { granted: true };
      }

      // React Native에서 마이크 권한 요청
      const { status } = await MediaLibrary.requestPermissionsAsync();

      if (status === "granted") {
        return { granted: true };
      } else if (status === "denied") {
        return {
          granted: false,
          message:
            "마이크 권한이 거부되었습니다. 설정에서 권한을 허용해주세요.",
        };
      } else {
        return {
          granted: false,
          message: "마이크 권한을 확인할 수 없습니다.",
        };
      }
    } catch (error) {
      console.error("Permission request error:", error);
      return {
        granted: false,
        message: "권한 요청 중 오류가 발생했습니다.",
      };
    }
  };

/**
 * 권한 거부 시 설정 앱으로 이동할지 묻는 Alert 표시
 */
export const showPermissionAlert = (message: string): void => {
  Alert.alert("권한 필요", message, [
    {
      text: "취소",
      style: "cancel",
    },
    {
      text: "설정으로 이동",
      onPress: () => {
        if (Platform.OS === "ios") {
          Linking.openURL("app-settings:");
        } else {
          Linking.openSettings();
        }
      },
    },
  ]);
};

/**
 * WebRTC 기능 사용 전 필요한 모든 권한을 확인합니다
 */
export const checkWebRTCPermissions = async (): Promise<PermissionResult> => {
  const micPermission = await requestMicrophonePermission();

  if (!micPermission.granted && micPermission.message) {
    showPermissionAlert(micPermission.message);
    return micPermission;
  }

  return { granted: true };
};
