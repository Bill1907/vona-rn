import { ThemeContextProvider } from "@/contexts/ThemeContext";
import { AuthService } from "@/features/auth/services";
import { useUserStore } from "@/stores/userStore";
import { Slot, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Import global CSS for Tailwind
import "@/styles/global.css";

export default function RootLayout() {
  const { setUser } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuthStatus = async () => {
      try {
        const { user } = await AuthService.getCurrentUser();
        setUser(user);

        // Navigate based on auth status
        if (user) {
          router.replace("/(main)/" as any);
        } else {
          router.replace("/(auth)/login" as any);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        // Fallback to login on any error
        router.replace("/(auth)/login" as any);
      }
    };

    // Add a small delay to ensure router is ready
    const timer = setTimeout(checkAuthStatus, 100);
    return () => clearTimeout(timer);
  }, [setUser, router]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeContextProvider>
        <Slot />
      </ThemeContextProvider>
    </GestureHandlerRootView>
  );
}
