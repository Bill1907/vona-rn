export const config = {
  supabase: {
    url: process.env.EXPO_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  },
  openai: {
    apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY!,
    realtimeApiUrl: "https://api.openai.com/v1/realtime",
  },
} as const;
