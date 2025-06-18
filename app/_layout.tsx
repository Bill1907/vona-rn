import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeContextProvider } from "@/contexts/ThemeContext";
import { AuthService } from "@/features/auth/services";
import { useFonts } from "@/hooks/useFonts";
import { initializeAmplitude } from "@/lib/amplitude";
import initI18n from "@/lib/i18n";
import { useUserStore } from "@/stores/userStore";
import { Slot, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Import global CSS for Tailwind
import "@/styles/global.css";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { setUser } = useUserStore();
  const router = useRouter();
  const [isI18nInitialized, setIsI18nInitialized] = useState(false);
  const fontsLoaded = useFonts();

  useEffect(() => {
    // Initialize i18n first
    const initializeI18n = async () => {
      try {
        await initI18n();
        setIsI18nInitialized(true);
      } catch (error) {
        console.error("i18n initialization error:", error);
        setIsI18nInitialized(true); // Continue even if i18n fails
      }
    };

    initializeI18n();
  }, []);

  useEffect(() => {
    // Initialize Amplitude Analytics and Session Replay
    // This will only run client-side due to the check in initializeAmplitude
    initializeAmplitude();
  }, []);

  useEffect(() => {
    if (!isI18nInitialized || !fontsLoaded) return;

    // Hide splash screen when everything is ready
    SplashScreen.hideAsync();

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
  }, [setUser, router, isI18nInitialized, fontsLoaded]);

  // Show loading while i18n or fonts are initializing
  if (!isI18nInitialized || !fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeContextProvider>
        <LanguageProvider>
          <Slot />
        </LanguageProvider>
      </ThemeContextProvider>
    </GestureHandlerRootView>
  );
}
