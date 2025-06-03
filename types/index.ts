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

export interface Schedule {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export type LoadingState = "idle" | "loading" | "succeeded" | "failed";
