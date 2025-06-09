import { supabase } from "@/api/supabaseClient";
import { ConversationMessage, ConversationSummaryResponse } from "../types";

/**
 * OpenAI를 사용하여 대화 내용을 요약하는 함수
 * Edge function을 호출하여 대화 제목을 생성합니다.
 */
export const generateConversationTitle = async (
  messages: ConversationMessage[],
  maxLength: number = 30
): Promise<string> => {
  try {
    // 메시지가 없는 경우 기본 제목 반환
    if (!messages || messages.length === 0) {
      return "New Conversation";
    }

    // 단일 메시지의 경우 AI 처리도 시도 (더 나은 제목을 위해)
    // 하지만 메시지가 매우 짧은 경우에만 폴백 사용
    if (messages.length === 1 && messages[0].content.length < 10) {
      const firstMessage = messages[0];
      if (firstMessage.type === "user") {
        const title = firstMessage.content.replace(/\n/g, " ").trim();
        return title.length > maxLength
          ? title.substring(0, maxLength - 3) + "..."
          : title;
      }
    }

    // Edge function 호출하여 AI 요약 생성
    console.log("Attempting to call summarize-conversation function...");
    console.log("Messages to summarize:", messages.length);

    const { data, error } = await supabase.functions.invoke(
      "summarize-conversation",
      {
        body: {
          messages: messages.map((msg) => ({
            id: msg.id,
            content: msg.content,
            type: msg.type,
            timestamp:
              typeof msg.timestamp === "string"
                ? msg.timestamp
                : msg.timestamp.toISOString(),
          })),
          maxLength,
        },
      }
    );

    console.log("Function response - data:", data);
    console.log("Function response - error:", error);

    if (error) {
      console.error("Error calling summarize-conversation function:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      // 실패 시 첫 번째 메시지 기반 폴백
      return generateFallbackTitle(messages, maxLength);
    }

    const response = data as ConversationSummaryResponse;
    if (response.error) {
      console.error(
        "Error from summarize-conversation function:",
        response.error
      );
      return generateFallbackTitle(messages, maxLength);
    }

    return response.title || generateFallbackTitle(messages, maxLength);
  } catch (error) {
    console.error("Error generating conversation title:", error);
    return generateFallbackTitle(messages, maxLength);
  }
};

/**
 * AI 요약이 실패했을 때 사용하는 폴백 제목 생성 함수
 */
const generateFallbackTitle = (
  messages: ConversationMessage[],
  maxLength: number
): string => {
  // 첫 번째 사용자 메시지를 찾아서 제목으로 사용
  const firstUserMessage = messages.find((msg) => msg.type === "user");

  if (firstUserMessage) {
    const title = firstUserMessage.content.replace(/\n/g, " ").trim();
    return title.length > maxLength
      ? title.substring(0, maxLength - 3) + "..."
      : title;
  }

  return "New Conversation";
};

/**
 * 대화 메시지들을 분석하여 카테고리를 제안하는 함수
 */
export const suggestConversationCategory = (
  messages: ConversationMessage[]
): string => {
  const content = messages
    .filter((msg) => msg.type === "user")
    .map((msg) => msg.content.toLowerCase())
    .join(" ");

  // 간단한 키워드 기반 카테고리 분류
  if (
    content.includes("코딩") ||
    content.includes("프로그래밍") ||
    content.includes("개발")
  ) {
    return "Development";
  }
  if (content.includes("번역") || content.includes("translate")) {
    return "Translation";
  }
  if (
    content.includes("질문") ||
    content.includes("help") ||
    content.includes("도움")
  ) {
    return "Q&A";
  }
  if (
    content.includes("작성") ||
    content.includes("write") ||
    content.includes("글")
  ) {
    return "Writing";
  }

  return "General";
};

/**
 * 대화의 총 단어 수를 계산하는 함수
 */
export const calculateConversationStats = (messages: ConversationMessage[]) => {
  const userMessages = messages.filter((msg) => msg.type === "user");
  const assistantMessages = messages.filter((msg) => msg.type === "assistant");

  const totalWords = messages.reduce((count, msg) => {
    return count + msg.content.split(/\s+/).length;
  }, 0);

  return {
    totalMessages: messages.length,
    userMessages: userMessages.length,
    assistantMessages: assistantMessages.length,
    totalWords,
    estimatedReadTime: Math.ceil(totalWords / 200), // 분 단위 (200 단어/분 가정)
  };
};
