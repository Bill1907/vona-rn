import { useCallback, useState } from "react";
import { generateConversationTitle } from "../services";
import { ConversationMessage } from "../types";

export const useConversationTitle = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateTitle = useCallback(
    async (
      messages: ConversationMessage[],
      maxLength: number = 30
    ): Promise<string> => {
      setIsGenerating(true);
      setError(null);

      try {
        const title = await generateConversationTitle(messages, maxLength);
        return title;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to generate title";
        setError(errorMessage);
        console.error("Error generating conversation title:", err);

        // 폴백으로 첫 번째 메시지 기반 제목 생성
        if (messages.length > 0) {
          const firstUserMessage = messages.find((msg) => msg.type === "user");
          if (firstUserMessage) {
            const title = firstUserMessage.content.replace(/\n/g, " ").trim();
            return title.length > maxLength
              ? title.substring(0, maxLength - 3) + "..."
              : title;
          }
        }

        return "New Conversation";
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  return {
    generateTitle,
    isGenerating,
    error,
  };
};
