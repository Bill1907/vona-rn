import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WebSearchRequest {
  query: string;
  language?: "ko" | "en";
  count?: number;
  user_id?: string;
}

interface SearchResult {
  title: string;
  description: string;
  url: string;
  published_date?: string;
  source?: string;
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

    // Verify user authentication (optional for voice sessions)
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    const requestBody: WebSearchRequest = await req.json();
    const { query, language = "ko", count = 5, user_id } = requestBody;

    if (!query || query.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Search query is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Use Tavily Search API for web search
    const tavilyApiKey = Deno.env.get("TAVILY_API_KEY");
    if (!tavilyApiKey) {
      return new Response(
        JSON.stringify({ error: "Search service not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const tavilyResponse = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: tavilyApiKey,
        query: query,
        search_depth: "basic",
        include_answer: true,
        include_images: false,
        include_raw_content: false,
        max_results: Math.min(count, 10),
        include_domains: [],
        exclude_domains: [],
      }),
    });

    if (!tavilyResponse.ok) {
      console.error("Tavily API error:", await tavilyResponse.text());
      return new Response(JSON.stringify({ error: "Search service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const tavilyData = await tavilyResponse.json();

    // Format search results
    const searchResults: SearchResult[] = (tavilyData.results || []).map(
      (result: any) => ({
        title: result.title || "",
        description: result.content || "",
        url: result.url || "",
        published_date: result.published_date || null,
        source: result.source || null,
      })
    );

    // Store search results in database if user is authenticated
    if (user && user_id === user.id && searchResults.length > 0) {
      try {
        const { error: dbError } = await supabaseClient
          .from("search_results")
          .insert(
            searchResults.map((result) => ({
              title: result.title,
              description: result.description,
              url: result.url,
              user_id: user.id,
            }))
          );

        if (dbError) {
          console.error("Database error:", dbError);
          // Don't fail the request, just log the error
        }
      } catch (error) {
        console.error("Database insert error:", error);
      }
    }

    const response = {
      query: query,
      results: searchResults,
      answer: tavilyData.answer || null,
      total_results: searchResults.length,
      search_metadata: {
        language: language,
        timestamp: new Date().toISOString(),
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
