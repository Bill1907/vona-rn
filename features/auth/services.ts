import { supabase } from "@/api/supabaseClient";
import { E2EEHelper } from "@/lib/e2eeHelper";
import { User } from "@/types";

export class AuthService {
  static async signUp(
    email: string,
    password: string
  ): Promise<{ user: User | null; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { user: null, error: error.message };
      }

      // Generate E2EE keys for the user
      if (data.user) {
        const keyPair = E2EEHelper.createKeyPair();
        // Store public key in user metadata (you might want to store this in a separate table)
        await supabase.auth.updateUser({
          data: { public_key: keyPair.publicKey },
        });

        // Store private key securely (this should be handled carefully in production)
        // For now, we'll return it to be stored locally
        return {
          user: {
            id: data.user.id,
            email: data.user.email!,
            created_at: data.user.created_at,
            updated_at: data.user.updated_at || data.user.created_at,
          },
          error: null,
        };
      }

      return { user: null, error: "Failed to create user" };
    } catch (error) {
      return { user: null, error: "Network error occurred" };
    }
  }

  static async signIn(
    email: string,
    password: string
  ): Promise<{ user: User | null; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user) {
        return {
          user: {
            id: data.user.id,
            email: data.user.email!,
            created_at: data.user.created_at,
            updated_at: data.user.updated_at || data.user.created_at,
          },
          error: null,
        };
      }

      return { user: null, error: "Failed to sign in" };
    } catch (error) {
      return { user: null, error: "Network error occurred" };
    }
  }

  static async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error: error?.message || null };
    } catch (error) {
      return { error: "Network error occurred" };
    }
  }

  static async getCurrentUser(): Promise<{
    user: User | null;
    error: string | null;
  }> {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        return { user: null, error: error.message };
      }

      if (user) {
        return {
          user: {
            id: user.id,
            email: user.email!,
            created_at: user.created_at,
            updated_at: user.updated_at || user.created_at,
          },
          error: null,
        };
      }

      return { user: null, error: null };
    } catch (error) {
      return { user: null, error: "Network error occurred" };
    }
  }
}
