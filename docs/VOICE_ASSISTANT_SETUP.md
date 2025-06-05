# Voice Assistant WebRTC 설정 가이드

현재 앱에 OpenAI Realtime API와 WebRTC를 사용하는 음성 어시스턴트 기능을 추가하는 방법입니다.

## 1. 필수 패키지 설치

React Native에서 WebRTC를 사용하기 위해 다음 패키지들을 설치해야 합니다:

```bash
# WebRTC 관련 패키지
npm install react-native-webrtc @config-plugins/react-native-webrtc

# expo-dev-client (Expo Go에서는 WebRTC 사용 불가)
npx expo install expo-dev-client

# 오디오 권한 관련
npx expo install expo-av expo-media-library
```

## 2. app.json 설정

`app.json`에 WebRTC 플러그인과 권한을 추가합니다:

```json
{
  "expo": {
    "plugins": [
      "@config-plugins/react-native-webrtc",
      [
        "expo-av",
        {
          "microphonePermission": "마이크 접근 권한이 필요합니다."
        }
      ]
    ],
    "ios": {
      "infoPlist": {
        "NSMicrophoneUsageDescription": "음성 어시스턴트를 위해 마이크 접근이 필요합니다."
      }
    },
    "android": {
      "permissions": [
        "android.permission.RECORD_AUDIO",
        "android.permission.MODIFY_AUDIO_SETTINGS"
      ]
    }
  }
}
```

## 3. 환경 변수 설정

`.env` 파일에 OpenAI API 키를 추가합니다:

```env
EXPO_PUBLIC_OPENAI_API_KEY=your-openai-api-key-here
```

## 4. Supabase Edge Functions 배포

### 4.1 Supabase CLI 설치

```bash
npm install supabase --save-dev
```

### 4.2 Edge Functions 배포

```bash
# Supabase 프로젝트 연결
npx supabase login
npx supabase link --project-ref your-project-ref

# Edge Function 배포
npx supabase functions deploy create-voice-session
npx supabase functions deploy get-voice-session-status
npx supabase functions deploy end-voice-session
npx supabase functions deploy get-user-voice-sessions
```

### 4.3 환경 변수 설정

```bash
# OpenAI API 키를 Supabase에 설정
npx supabase secrets set OPENAI_API_KEY=your-openai-api-key-here
```

## 5. 데이터베이스 마이그레이션

```bash
# 마이그레이션 실행
npx supabase db push
```

## 6. 개발 환경 설정

### 6.1 Development Build 생성

```bash
# iOS
npx expo run:ios

# Android
npx expo run:android
```

### 6.2 중요 사항

- **Expo Go 앱에서는 사용 불가**: WebRTC는 네이티브 코드가 필요하므로 development build를 사용해야 합니다.
- **HTTPS 필수**: WebRTC는 HTTPS 환경에서만 작동합니다.
- **권한 요청**: 마이크 권한을 사용자에게 요청해야 합니다.

## 7. 사용 방법

### 7.1 Voice Assistant 컴포넌트 사용

```typescript
import { VoiceAssistant } from "@/features/voice/components/VoiceAssistant";

export default function VoiceScreen() {
  return <VoiceAssistant />;
}
```

### 7.2 Voice Assistant 훅 사용

```typescript
import { useVoiceAssistant } from "@/features/voice/hooks/useVoiceAssistant";

function MyComponent() {
  const {
    state,
    messages,
    startVoiceSession,
    endVoiceSession,
    toggleListening,
    sendTextMessage,
  } = useVoiceAssistant();

  // 세션 시작
  const handleStart = async () => {
    await startVoiceSession({
      instructions: "당신은 도움이 되는 어시스턴트입니다.",
      voice: "alloy",
      temperature: 0.7,
    });
  };

  return (
    // UI 구현
  );
}
```

## 8. API 구조

### 8.1 VoiceService 메서드

- `createVoiceSession(config)`: 새 음성 세션 생성
- `getSessionStatus(sessionId)`: 세션 상태 확인
- `endVoiceSession(sessionId)`: 세션 종료
- `getUserVoiceSessions()`: 사용자 세션 목록 조회

### 8.2 useVoiceAssistant 훅

- `state`: 연결 상태, 듣기/말하기 상태
- `messages`: 대화 메시지 배열
- `startVoiceSession()`: 세션 시작
- `endVoiceSession()`: 세션 종료
- `toggleListening()`: 음성 인식 시작/중지
- `sendTextMessage()`: 텍스트 메시지 전송

## 9. 디버깅 및 문제 해결

### 9.1 일반적인 문제

1. **마이크 권한 오류**: 앱 권한 설정 확인
2. **WebRTC 연결 실패**: HTTPS 환경 확인
3. **Expo Go에서 동작 안 함**: Development build 사용

### 9.2 로그 확인

```typescript
// 콘솔에서 WebRTC 로그 확인
console.log("Voice Assistant State:", state);
console.log("WebRTC Connection:", webrtcConnection.current);
```

## 10. 보안 고려사항

1. **API 키 보안**: 클라이언트에서 직접 OpenAI API 키 사용 금지
2. **사용자 인증**: Supabase RLS를 통한 세션 접근 제어
3. **세션 만료**: 1시간 자동 만료 설정
4. **데이터 암호화**: 음성 데이터 전송 시 HTTPS 사용

## 11. 추가 개선사항

1. **오프라인 지원**: 네트워크 오류 시 대체 UI
2. **음성 품질 최적화**: 노이즈 캔슬링, 에코 제거
3. **다국어 지원**: 음성 인식 언어 설정
4. **사용량 모니터링**: API 사용량 추적 및 제한
