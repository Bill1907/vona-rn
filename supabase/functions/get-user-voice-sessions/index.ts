import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface GetUserSessionsRequest {
  user_id: string;
  limit?: number;
  offset?: number;
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

    const requestBody: GetUserSessionsRequest = await req.json();

    // Validate request
    if (!requestBody.user_id || requestBody.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Invalid user ID" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Set pagination defaults
    const limit = requestBody.limit || 50;
    const offset = requestBody.offset || 0;

    // Get user sessions from database
    let query = supabaseClient
      .from("voice_sessions")
      .select(
        `
        id,
        status,
        created_at,
        updated_at,
        expires_at,
        config
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: sessions, error: sessionError, count } = await query;

    if (sessionError) {
      console.error("Database query error:", sessionError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch sessions" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Process sessions to add calculated fields
    const processedSessions =
      sessions?.map((session) => {
        const createdAt = new Date(session.created_at);
        const updatedAt = new Date(session.updated_at);
        const expiresAt = new Date(session.expires_at);
        const now = new Date();

        // Calculate duration for completed sessions
        let duration = null;
        if (session.status !== "active") {
          const endTime = session.status === "expired" ? expiresAt : updatedAt;
          duration = Math.floor(
            (endTime.getTime() - createdAt.getTime()) / 1000
          );
        } else if (now > expiresAt) {
          // Session should be marked as expired
          duration = Math.floor(
            (expiresAt.getTime() - createdAt.getTime()) / 1000
          );
        }

        return {
          id: session.id,
          status:
            now > expiresAt && session.status === "active"
              ? "expired"
              : session.status,
          created_at: session.created_at,
          updated_at: session.updated_at,
          expires_at: session.expires_at,
          duration,
          config: {
            voice: session.config.voice,
            model: session.config.model,
            temperature: session.config.temperature,
          },
        };
      }) || [];

    // Get total count for pagination
    const { count: totalCount } = await supabaseClient
      .from("voice_sessions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    return new Response(
      JSON.stringify({
        sessions: processedSessions,
        pagination: {
          limit,
          offset,
          total: totalCount || 0,
          hasMore: offset + limit < (totalCount || 0),
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Function error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
