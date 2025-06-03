# Vona App Setup Guide

## 프로젝트 구조

이 프로젝트는 **Expo Router**와 **절대경로 기반** feature-based 모듈 구조로 구성되어 있습니다:

```
vona/
├── app/                    # Expo Router 파일 기반 라우팅
│   ├── (auth)/             # 인증 관련 화면 그룹
│   │   ├── _layout.tsx     # 인증 레이아웃
│   │   └── login.tsx       # 로그인 화면
│   ├── (main)/             # 메인 앱 화면 그룹
│   │   ├── _layout.tsx     # 메인 탭 레이아웃
│   │   ├── index.tsx       # 홈 화면
│   │   ├── search.tsx      # 검색 화면
│   │   ├── schedule.tsx    # 일정 화면
│   │   └── settings.tsx    # 설정 화면
│   ├── _layout.tsx         # 루트 레이아웃 (인증 라우팅)
│   └── index.tsx           # 엔트리 포인트
├── components/             # 재사용 가능한 UI 컴포넌트
│   ├── common/             # 버튼, 인풋, 모달 등 범용 컴포넌트
│   └── ui/                 # shadcn/ui 스타일 컴포넌트
├── features/               # 핵심 애플리케이션 기능 (모듈)
│   ├── auth/               # 인증 (로그인, 회원가입, E2EE 키 관리)
│   │   ├── components/
│   │   ├── screens/
│   │   ├── hooks/
│   │   ├── store/
│   │   └── services.ts
│   ├── search/             # 웹 검색 기능
│   ├── schedule/           # 일정 관리 기능
│   ├── notifications/      # 푸시 알림 처리
│   └── settings/           # 앱 설정 기능
├── lib/                    # 유틸리티 라이브러리
│   ├── e2eeHelper.ts       # E2EE 암호화/복호화
│   └── utils.ts            # 범용 유틸리티 함수
├── stores/                 # 전역 Zustand 스토어
│   ├── userStore.ts
│   └── uiStore.ts
├── styles/                 # 전역 스타일, 테마
│   ├── global.css          # Tailwind CSS
│   └── theme.ts            # 테마 설정
├── config/                 # 앱 전반의 설정
│   └── index.ts
├── constants/              # 앱에서 사용되는 상수
│   ├── colors.ts
│   └── strings.ts
├── types/                  # TypeScript 타입 정의
│   ├── index.ts
│   └── supabase.ts
├── api/                    # 외부 API 연동 (Supabase 클라이언트)
│   └── supabaseClient.ts
├── assets/                 # 폰트, 이미지 등 정적 에셋
│   ├── fonts/
│   └── images/
├── .env                    # 환경 변수 (Supabase URL, Keys)
├── package.json
├── tailwind.config.js
├── metro.config.js
├── babel.config.js
└── tsconfig.json
```

## 절대경로 설정

이 프로젝트는 **절대경로 imports**를 사용하여 깔끔하고 유지보수하기 쉬운 코드를 제공합니다:

### 📁 경로 매핑

```typescript
// 절대경로 사용 예시
import { Button } from "@/components/common/Button";
import { AuthService } from "@/features/auth/services";
import { useUserStore } from "@/stores/userStore";
import { theme } from "@/styles/theme";
import { User } from "@/types";
```

### ⚙️ 설정 파일들

**tsconfig.json**: TypeScript 경로 매핑

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/features/*": ["./features/*"],
      "@/lib/*": ["./lib/*"],
      "@/stores/*": ["./stores/*"],
      "@/styles/*": ["./styles/*"],
      "@/config/*": ["./config/*"],
      "@/constants/*": ["./constants/*"],
      "@/types/*": ["./types/*"],
      "@/api/*": ["./api/*"]
    }
  }
}
```

**babel.config.js**: Babel Module Resolver

```javascript
module.exports = {
  plugins: [
    [
      "module-resolver",
      {
        alias: {
          "@": "./",
          "@/components": "./components",
          "@/features": "./features",
          // ... 기타 경로들
        },
      },
    ],
  ],
};
```

**metro.config.js**: Metro Resolver

```javascript
config.resolver.alias = {
  "@": path.resolve(__dirname, "./"),
  "@/components": path.resolve(__dirname, "./components"),
  // ... 기타 경로들
};
```

## 환경 설정

### 1. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Supabase 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트를 생성합니다.
2. 프로젝트 설정에서 URL과 anon key를 복사합니다.
3. 위의 `.env` 파일에 값을 설정합니다.

### 3. 데이터베이스 스키마

Supabase SQL 에디터에서 다음 테이블을 생성하세요:

```sql
-- Users 테이블 (Supabase Auth가 자동으로 생성하는 auth.users와 연결)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- 검색 결과 테이블
CREATE TABLE public.search_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  url TEXT NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 일정 테이블
CREATE TABLE public.schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) 활성화
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- 정책 생성
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own search results" ON public.search_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own search results" ON public.search_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own schedules" ON public.schedules
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own schedules" ON public.schedules
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own schedules" ON public.schedules
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own schedules" ON public.schedules
  FOR DELETE USING (auth.uid() = user_id);
```

## 설치 및 실행

1. 의존성 설치:

```bash
npm install
```

2. 개발 서버 시작:

```bash
npm start
```

## 아키텍처 특징

### ✅ Expo Router 파일 기반 라우팅

- **파일 시스템이 곧 라우팅**: `app/` 폴더의 파일 구조가 네비게이션 구조를 결정
- **자동 딥링킹**: 모든 화면이 자동으로 링크 가능하며 URL로 접근 가능
- **그룹 라우팅**: `(auth)`, `(main)` 같은 그룹으로 논리적 분리
- **레이아웃 기반**: `_layout.tsx`로 네비게이션 구조 정의

### ✅ 절대경로 기반 Import

- **깔끔한 코드**: `../../../components` 대신 `@/components` 사용
- **유지보수성**: 파일 이동 시에도 import 경로가 깨지지 않음
- **IDE 지원**: IntelliSense, 자동완성, Go to Definition 등 완벽 지원
- **일관성**: 프로젝트 전체에서 동일한 import 패턴 사용

### ✅ Feature-Based 모듈 구조

- 각 기능별로 독립적인 폴더 구조
- `components/`, `screens/`, `hooks/`, `store/`, `services.ts`로 구성
- 루트 레벨에서 논리적으로 분리된 구조

### ✅ 현대적인 React Native 구조

- **TypeScript 타입 안전성**: Expo Router의 내장 타입 지원
- **자동 코드 분할**: 라우트별 지연 로딩
- **Universal 앱 지원**: 웹과 네이티브에서 동일한 코드 실행

### ✅ 확장 가능한 설계

- Zustand를 이용한 상태 관리
- E2EE 암호화 기능 내장
- Supabase 백엔드 통합

## Expo Router 특징

### 🎯 **파일 기반 라우팅**

```
app/
├── (auth)/login.tsx     → /login
├── (main)/index.tsx     → /
├── (main)/search.tsx    → /search
└── (main)/settings.tsx  → /settings
```

### 🔗 **자동 딥링킹**

- 모든 화면이 자동으로 URL 기반 접근 가능
- 링크 공유, 북마크, 브라우저 뒤로가기 지원

### 📱 **네이티브 네비게이션**

- React Navigation 기반으로 네이티브 성능 보장
- iOS/Android 플랫폼별 최적화된 트랜지션

### 🎨 **레이아웃 시스템**

- `_layout.tsx`로 공통 레이아웃 정의
- 탭, 스택, 드로어 네비게이션 지원

## Tailwind CSS 설정

이 프로젝트는 NativeWind를 사용하여 Tailwind CSS를 React Native에서 사용합니다.

### 문제 해결

만약 Tailwind CSS가 적용되지 않는다면:

1. Metro 서버를 재시작해보세요:

```bash
npx expo start --clear
```

2. 캐시를 클리어해보세요:

```bash
npm start -- --reset-cache
```

3. `metro.config.js`에서 `src/styles/global.css` 경로가 올바른지 확인하세요.

4. `tailwind.config.js`의 content 배열에 `src/**/*.{js,jsx,ts,tsx}`가 포함되어 있는지 확인하세요.

## 주요 기능

- **인증**: Supabase Auth를 사용한 로그인/회원가입
- **E2EE**: 클라이언트 사이드 암호화
- **상태 관리**: Zustand를 사용한 전역 상태 관리
- **스타일링**: Tailwind CSS (NativeWind)
- **내비게이션**: React Navigation Stack
- **타입 안정성**: TypeScript

## 다음 단계

1. **환경 변수 설정**: `.env` 파일에 Supabase 정보 입력
2. **데이터베이스 설정**: 위의 SQL 스키마를 Supabase에서 실행
3. **기능 개발**: `src/features/` 폴더에서 각 모듈별 개발 진행
