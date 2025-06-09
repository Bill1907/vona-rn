import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Message {
  id: string;
  content: string;
  type: "user" | "assistant";
  timestamp: string;
}

interface SummarizeRequest {
  messages: Message[];
  maxLength?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { messages, maxLength = 30 }: SummarizeRequest = await req.json();

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Messages are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get OpenAI API key from environment
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Format messages for OpenAI
    const conversationText = messages
      .map(
        (msg) => `${msg.type === "user" ? "User" : "Assistant"}: ${msg.content}`
      )
      .join("\n");

    // Call OpenAI API with latest models and optimized approach
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o", // Latest flagship model for better understanding
        messages: [
          {
            role: "system",
            content: `You are a conversation title generator. Create concise, descriptive titles that capture the main topic or question. Keep titles under ${maxLength} characters and respond with only the title, nothing else.`,
          },
          {
            role: "user",
            content: `Generate a title for this conversation:\n\n${conversationText}`,
          },
        ],
        max_tokens: 50, // Reduced for title generation
        temperature: 0.1, // Lower for more consistent results
        top_p: 0.9,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }

      console.error("OpenAI API error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });

      // Provide more specific error information
      const errorMessage =
        errorData?.error?.message ||
        errorData?.message ||
        "Failed to generate summary";

      return new Response(
        JSON.stringify({
          error: "OpenAI API Error",
          details: errorMessage,
          status: response.status,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content?.trim();

    if (!summary) {
      console.error("No summary in OpenAI response:", data);
      return new Response(JSON.stringify({ error: "No summary generated" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Clean and process the summary
    let cleanedSummary = summary
      .replace(/^["']|["']$/g, "") // Remove surrounding quotes
      .replace(/\n+/g, " ") // Replace newlines with spaces
      .trim();

    // Ensure summary doesn't exceed maxLength
    const finalSummary =
      cleanedSummary.length > maxLength
        ? cleanedSummary.substring(0, maxLength - 3) + "..."
        : cleanedSummary;

    console.log("Generated summary:", finalSummary);

    return new Response(JSON.stringify({ title: finalSummary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in summarize-conversation function:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
