import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VoiceSessionRequest {
  user_id: string;
  config: {
    model: string;
    instructions: string;
    voice: string;
    input_audio_format: string;
    output_audio_format: string;
    temperature: number;
    max_response_output_tokens?: number;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Verify user authentication
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const requestBody: VoiceSessionRequest = await req.json();

    // Validate request
    if (!requestBody.user_id || requestBody.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Invalid user ID" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate session ID
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;

    // Create OpenAI Realtime session
    const openaiResponse = await fetch(
      "https://api.openai.com/v1/realtime/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: requestBody.config.model,
          instructions: `${requestBody.config.instructions}\n\n당신은 웹 검색 기능을 사용할 수 있습니다. 사용자가 최신 정보나 실시간 정보를 요청하면 web_search 함수를 사용하여 검색하고 결과를 제공해주세요.`,
          voice: requestBody.config.voice,
          input_audio_format: requestBody.config.input_audio_format,
          output_audio_format: requestBody.config.output_audio_format,
          temperature: requestBody.config.temperature,
          max_response_output_tokens:
            requestBody.config.max_response_output_tokens,
          turn_detection: {
            type: "server_vad",
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 500,
          },
          tools: [
            {
              type: "function",
              name: "web_search",
              description:
                "웹에서 최신 정보를 검색합니다. 실시간 뉴스, 날씨, 주식 가격, 최신 이벤트 등을 찾을 때 사용하세요.",
              parameters: {
                type: "object",
                properties: {
                  query: {
                    type: "string",
                    description: "검색할 쿼리. 한국어 또는 영어로 입력 가능",
                  },
                  language: {
                    type: "string",
                    enum: ["ko", "en"],
                    description: "검색 언어 설정",
                    default: "ko",
                  },
                  count: {
                    type: "number",
                    description: "검색 결과 개수 (1-10)",
                    minimum: 1,
                    maximum: 10,
                    default: 5,
                  },
                },
                required: ["query"],
              },
            },
          ],
          tool_choice: "auto",
        }),
      }
    );

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error("OpenAI API Error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to create OpenAI session" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const openaiSession = await openaiResponse.json();

    // Store session in database
    const { error: dbError } = await supabaseClient
      .from("voice_sessions")
      .insert({
        id: sessionId,
        user_id: user.id,
        openai_session_id: openaiSession.id,
        status: "active",
        config: requestBody.config,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
      });

    if (dbError) {
      console.error("Database error:", dbError);
      return new Response(
        JSON.stringify({ error: "Failed to store session" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Return session token
    const response = {
      token: openaiSession.client_secret.value,
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      session_id: sessionId,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Function error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
