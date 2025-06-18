# AI Voice Agent 웹 검색 기능 통합 가이드

이 문서는 Vona AI 음성 어시스턴트에 웹 검색 기능을 추가하는 방법을 설명합니다.

## 📋 구현 개요

웹 검색 기능은 다음과 같은 구조로 구현됩니다:

1. **OpenAI Function Calling**: 음성 어시스턴트가 사용자 요청을 분석하여 웹 검색이 필요한지 판단
2. **Supabase Edge Function**: 실제 웹 검색 API 호출을 처리하는 서버리스 함수
3. **Tavily Search API**: 고품질 웹 검색 결과를 제공하는 AI 친화적 검색 엔진
4. **검색 기록 저장**: Supabase 데이터베이스에 검색 결과 저장

## 🛠️ 설정 단계

### 1. Tavily API 키 발급

1. [Tavily](https://tavily.com)에 가입
2. API 키를 발급받아 환경 변수에 추가:

```bash
# .env 파일에 추가
TAVILY_API_KEY=tvly-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 2. Supabase Edge Function 배포

```bash
# Supabase CLI를 사용하여 함수 배포
supabase functions deploy web-search

# 환경 변수 설정
supabase secrets set TAVILY_API_KEY=your_tavily_api_key
```

### 3. 데이터베이스 테이블 확인

`search_results` 테이블이 이미 존재하는지 확인하고, 없다면 생성:

```sql
-- 검색 결과 저장용 테이블 (이미 존재함)
CREATE TABLE IF NOT EXISTS public.search_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  url TEXT NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 정책 활성화
ALTER TABLE public.search_results ENABLE ROW LEVEL SECURITY;

-- 사용자별 접근 정책
CREATE POLICY "Users can view own search results"
ON public.search_results FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own search results"
ON public.search_results FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

## 🎯 사용 방법

### 음성으로 웹 검색 요청

음성 어시스턴트에게 다음과 같이 말하면 자동으로 웹 검색이 실행됩니다:

- "오늘 날씨 어때?"
- "삼성전자 주가 알려줘"
- "최신 뉴스 검색해줘"
- "파리 올림픽 일정 찾아줘"
- "ChatGPT 최신 업데이트는 뭐야?"

### Function Calling 동작 과정

1. **사용자 음성 입력** → OpenAI Realtime API로 전송
2. **의도 분석** → AI가 웹 검색이 필요한지 판단
3. **Function Call 실행** → `web_search` 함수 호출
4. **검색 실행** → Tavily API를 통한 실시간 웹 검색
5. **결과 반환** → 검색 결과를 바탕으로 음성 응답 생성
6. **기록 저장** → 검색 결과를 데이터베이스에 저장

## 🔧 기술적 구현 상세

### OpenAI Function Definition

```javascript
{
  type: "function",
  name: "web_search",
  description: "웹에서 최신 정보를 검색합니다. 실시간 뉴스, 날씨, 주식 가격, 최신 이벤트 등을 찾을 때 사용하세요.",
  parameters: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "검색할 쿼리. 한국어 또는 영어로 입력 가능"
      },
      language: {
        type: "string",
        enum: ["ko", "en"],
        description: "검색 언어 설정",
        default: "ko"
      },
      count: {
        type: "number",
        description: "검색 결과 개수 (1-10)",
        minimum: 1,
        maximum: 10,
        default: 5
      }
    },
    required: ["query"]
  }
}
```

### 클라이언트 사이드 Function Calling 처리

#### 웹 환경 (OpenAI Agents SDK)

```typescript
session.on("function_call_result", async (event: any) => {
  if (event.name === "web_search") {
    const { query, language = "ko", count = 5 } = event.arguments;
    const searchResult = await handleWebSearch(query, language, count);
    session.addFunctionCallResult(event.call_id, searchResult);
  }
});
```

#### React Native 환경 (WebRTC)

```typescript
case "response.function_call_arguments.done":
  if (message.name === "web_search") {
    const args = JSON.parse(message.arguments);
    const searchResult = await handleWebSearch(args.query, args.language, args.count);

    const functionResponse = {
      type: "conversation.item.create",
      item: {
        type: "function_call_output",
        call_id: message.call_id,
        output: JSON.stringify(searchResult)
      }
    };

    dataChannel.send(JSON.stringify(functionResponse));
  }
  break;
```

## 📊 검색 결과 형태

```typescript
interface WebSearchResponse {
  query: string;
  results: SearchResult[];
  answer: string | null;
  total_results: number;
  search_metadata: {
    language: string;
    timestamp: string;
  };
}

interface SearchResult {
  title: string;
  description: string;
  url: string;
  published_date?: string;
  source?: string;
}
```

## 🚀 확장 가능성

### 1. 검색 히스토리 UI 구현

- `app/(main)/search-history.tsx`에서 저장된 검색 결과 조회
- 사용자별 검색 기록 표시

### 2. 특화된 검색 도구 추가

- 뉴스 검색: `news_search`
- 이미지 검색: `image_search`
- 학술 자료 검색: `academic_search`

### 3. 검색 결과 후처리

- AI 요약 기능
- 중요 정보 추출
- 관련 검색어 제안

## 🔒 보안 고려사항

1. **API 키 보안**: Supabase Edge Function에서만 Tavily API 키 사용
2. **사용자 인증**: 인증된 사용자만 검색 기능 사용 가능
3. **Rate Limiting**: 과도한 검색 요청 방지
4. **데이터 프라이버시**: 검색 기록의 적절한 보관 및 삭제 정책

## 🧪 테스트 방법

### 1. Edge Function 테스트

```bash
curl -X POST 'https://your-project.supabase.co/functions/v1/web-search' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"query": "OpenAI GPT-4", "language": "ko", "count": 3}'
```

### 2. 음성 어시스턴트 테스트

1. 음성 세션 시작
2. "오늘 날씨 어때?" 라고 말하기
3. 실시간 검색 결과가 포함된 응답 확인

## 💡 팁과 모범 사례

1. **효과적인 프롬프트 엔지니어링**: 음성 어시스턴트가 적절한 시점에 검색을 실행하도록 지시문 최적화
2. **에러 핸들링**: 네트워크 오류나 API 한도 초과 시 적절한 대체 응답 제공
3. **성능 최적화**: 검색 결과 캐싱으로 반복 검색 최소화
4. **사용자 경험**: 검색 중임을 알리는 상태 표시

## 📈 모니터링 및 분석

- Supabase 대시보드에서 Edge Function 로그 확인
- 검색 사용량 및 성공률 모니터링
- 사용자 피드백을 통한 검색 품질 개선

이 가이드를 따라 구현하면 AI 음성 어시스턴트가 실시간 웹 정보를 활용하여 더욱 유용하고 정확한 응답을 제공할 수 있습니다.
