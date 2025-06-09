# Voice Assistant Feature

이 디렉토리는 음성 어시스턴트 기능을 구현합니다. 플랫폼별로 최적화된 구현을 제공합니다.

## 구조

```
features/voice/
├── components/
│   ├── VoiceAssistant.tsx      # 음성 어시스턴트 페이지 컴포넌트
│   ├── VoiceControls.tsx       # 음성 컨트롤 버튼들
│   ├── VoiceMessageList.tsx    # 메시지 리스트
│   ├── VoiceStatusBar.tsx      # 상태 표시바
│   ├── ConversationHistory.tsx # 대화 기록 UI
│   ├── ConversationDetail.tsx  # 대화 상세 UI
│   └── index.ts                # 컴포넌트 export
├── hooks/
│   ├── useVoiceAssistant.ts    # React Native용 구현 (기본)
│   ├── useVoiceAssistant.web.ts # 웹용 구현 (OpenAI Agents SDK)
│   ├── useWebrtc.ts            # WebRTC 헬퍼 훅
│   └── index.ts                # 통합 export
├── types/
│   └── index.ts                # 공통 타입 정의
└── services.ts                 # 백엔드 API 서비스
```

## 플랫폼별 구현

### 웹 환경 (useVoiceAssistant.web.ts)

- OpenAI Agents SDK (`@openai/agents-realtime`)를 사용
- WebRTC 연결 관리를 SDK가 자동으로 처리
- 간소화된 코드로 빠른 개발 가능

### React Native 환경 (useVoiceAssistant.ts)

- `react-native-webrtc` 직접 사용
- Expo Audio API를 통한 세밀한 오디오 제어
- InCallManager를 통한 스피커폰 제어
- 플랫폼별 최적화 적용

## 사용 방법

```typescript
import { useVoiceAssistant } from "@/features/voice/hooks";

const MyComponent = () => {
  const {
    state,
    messages,
    startVoiceSession,
    endVoiceSession,
    toggleMute,
    sendTextMessage,
  } = useVoiceAssistant();

  // 세션 시작
  await startVoiceSession({
    model: "gpt-4o-realtime-preview",
    instructions: "You are a helpful assistant.",
    voice: "alloy",
    temperature: 0.7,
  });
};
```

## 타입 정의

모든 공통 타입은 `types/index.ts`에 정의되어 있습니다:

- `VoiceAssistantState`: 음성 어시스턴트의 상태
- `VoiceMessage`: 대화 메시지
- `VoiceSessionConfig`: 세션 설정
- `VoiceAssistantAPI`: 훅의 반환 타입

## 환경 설정

### 필요한 패키지

```json
{
  // 공통
  "@openai/agents": "latest",

  // React Native 전용
  "react-native-webrtc": "^124.0.5",
  "expo-av": "^15.1.5",

  // 설정 플러그인
  "@config-plugins/react-native-webrtc": "^12.0.0"
}
```

### 환경 변수

Supabase Edge Function을 통해 OpenAI ephemeral token을 발급받습니다.
백엔드 설정은 `supabase/functions/create-voice-session` 참조.

## 주의사항

1. **플랫폼별 기능 차이**

   - 웹: 브라우저의 WebRTC API 사용
   - React Native: 네이티브 WebRTC 구현 사용

2. **오디오 권한**

   - 웹: 브라우저 마이크 권한 필요
   - iOS/Android: 앱 권한 설정 필요

3. **네트워크 요구사항**
   - 안정적인 인터넷 연결 필요
   - WebRTC를 위한 STUN/TURN 서버 접근 가능해야 함
