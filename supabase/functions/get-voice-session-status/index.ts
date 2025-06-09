import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface GetSessionStatusRequest {
  user_id: string;
  session_id: string;
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

    const requestBody: GetSessionStatusRequest = await req.json();

    // Validate request
    if (!requestBody.user_id || requestBody.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Invalid user ID" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!requestBody.session_id) {
      return new Response(JSON.stringify({ error: "Session ID required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get session from database
    const { data: session, error: sessionError } = await supabaseClient
      .from("voice_sessions")
      .select("*")
      .eq("id", requestBody.session_id)
      .eq("user_id", user.id)
      .single();

    if (sessionError || !session) {
      return new Response(JSON.stringify({ error: "Session not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if session has expired
    const now = new Date();
    const expiresAt = new Date(session.expires_at);

    let currentStatus = session.status;

    // Update status if expired
    if (now > expiresAt && session.status === "active") {
      currentStatus = "expired";

      // Update database
      await supabaseClient
        .from("voice_sessions")
        .update({
          status: "expired",
          updated_at: now.toISOString(),
        })
        .eq("id", requestBody.session_id)
        .eq("user_id", user.id);
    }

    // Calculate session duration if ended
    let duration = null;
    if (currentStatus !== "active") {
      const createdAt = new Date(session.created_at);
      const endTime =
        currentStatus === "expired" ? expiresAt : new Date(session.updated_at);
      duration = Math.floor((endTime.getTime() - createdAt.getTime()) / 1000); // seconds
    }

    return new Response(
      JSON.stringify({
        status: currentStatus,
        session_id: session.id,
        created_at: session.created_at,
        expires_at: session.expires_at,
        updated_at: session.updated_at,
        duration,
        config: session.config,
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
