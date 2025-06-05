import { supabase } from "@/api/supabaseClient";

export interface VoiceConnectionToken {
  token: string;
  expires_at: string;
  session_id: string;
}

export interface VoiceSessionConfig {
  model: string;
  instructions: string;
  voice: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";
  input_audio_format: "pcm16" | "g711_ulaw" | "g711_alaw";
  output_audio_format: "pcm16" | "g711_ulaw" | "g711_alaw";
  temperature: number;
  max_response_output_tokens?: number;
}

export class VoiceService {
  private static readonly DEFAULT_CONFIG: VoiceSessionConfig = {
    model: "gpt-4o-realtime-preview",
    instructions:
      "당신은 도움이 되는 음성 어시스턴트입니다. 자연스럽고 친근하게 대화하세요.",
    voice: "alloy",
    input_audio_format: "pcm16",
    output_audio_format: "pcm16",
    temperature: 0.7,
    max_response_output_tokens: 4096,
  };

  /**
   * WebRTC Transport 토큰을 발급받습니다
   */
  static async createVoiceSession(
    config?: Partial<VoiceSessionConfig>
  ): Promise<{
    token: VoiceConnectionToken | null;
    error: string | null;
  }> {
    try {
      // 현재 사용자 인증 확인
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return {
          token: null,
          error: "Authentication required",
        };
      }

      // 세션 설정 병합
      const sessionConfig = { ...this.DEFAULT_CONFIG, ...config };

      // Supabase Edge Function을 통해 OpenAI Realtime API 토큰 요청
      const { data, error } = await supabase.functions.invoke(
        "create-voice-session",
        {
          body: {
            user_id: user.id,
            config: sessionConfig,
          },
        }
      );

      console.log("create-voice-session", data);

      if (error) {
        console.error("Voice session creation error:", error);
        return {
          token: null,
          error: error.message || "Failed to create voice session",
        };
      }

      return {
        token: data as VoiceConnectionToken,
        error: null,
      };
    } catch (error) {
      console.error("Network error:", error);
      return {
        token: null,
        error: "Network error occurred",
      };
    }
  }

  /**
   * 음성 세션 상태를 확인합니다
   */
  static async getSessionStatus(sessionId: string): Promise<{
    status: "active" | "inactive" | "expired" | null;
    error: string | null;
  }> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return {
          status: null,
          error: "Authentication required",
        };
      }

      const { data, error } = await supabase.functions.invoke(
        "get-voice-session-status",
        {
          body: {
            user_id: user.id,
            session_id: sessionId,
          },
        }
      );

      if (error) {
        return {
          status: null,
          error: error.message || "Failed to get session status",
        };
      }

      return {
        status: data.status,
        error: null,
      };
    } catch (error) {
      return {
        status: null,
        error: "Network error occurred",
      };
    }
  }

  /**
   * 음성 세션을 종료합니다
   */
  static async endVoiceSession(
    sessionId: string
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return {
          success: false,
          error: "Authentication required",
        };
      }

      const { error } = await supabase.functions.invoke("end-voice-session", {
        body: {
          user_id: user.id,
          session_id: sessionId,
        },
      });

      if (error) {
        return {
          success: false,
          error: error.message || "Failed to end voice session",
        };
      }

      return {
        success: true,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        error: "Network error occurred",
      };
    }
  }

  /**
   * 사용자의 음성 세션 목록을 가져옵니다
   */
  static async getUserVoiceSessions(): Promise<{
    sessions: Array<{
      id: string;
      created_at: string;
      status: string;
      duration?: number;
    }> | null;
    error: string | null;
  }> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return {
          sessions: null,
          error: "Authentication required",
        };
      }

      const { data, error } = await supabase.functions.invoke(
        "get-user-voice-sessions",
        {
          body: {
            user_id: user.id,
          },
        }
      );

      if (error) {
        return {
          sessions: null,
          error: error.message || "Failed to get voice sessions",
        };
      }

      return {
        sessions: data.sessions,
        error: null,
      };
    } catch (error) {
      return {
        sessions: null,
        error: "Network error occurred",
      };
    }
  }
}
