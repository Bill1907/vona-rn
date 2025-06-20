export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  url: string;
  created_at: string;
}

import { Database } from "./supabase";

export type Schedule = Database["public"]["Tables"]["calendar_events"]["Row"];

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export type LoadingState = "idle" | "loading" | "succeeded" | "failed";
