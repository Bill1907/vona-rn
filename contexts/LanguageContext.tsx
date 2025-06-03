import { i18n } from "@/lib/i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import React, { createContext, useContext, useEffect, useState } from "react";

type Language = "ko" | "en";

interface LanguageContextType {
  language: Language;
  changeLanguage: (language: Language) => Promise<void>;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

const LANGUAGE_STORAGE_KEY = "app_language";

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguage] = useState<Language>("ko");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSavedLanguage();
  }, []);

  const loadSavedLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);

      if (savedLanguage && (savedLanguage === "ko" || savedLanguage === "en")) {
        setLanguage(savedLanguage);
        await i18n.changeLanguage(savedLanguage);
      } else {
        // 시스템 언어 감지
        const systemLanguage =
          Localization.getLocales()[0]?.languageCode || "ko";
        const detectedLanguage: Language =
          systemLanguage === "en" ? "en" : "ko";

        setLanguage(detectedLanguage);
        await i18n.changeLanguage(detectedLanguage);
        await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, detectedLanguage);
      }
    } catch (error) {
      console.log("Error loading saved language:", error);
      // 기본값으로 한국어 설정
      setLanguage("ko");
      await i18n.changeLanguage("ko");
    } finally {
      setIsLoading(false);
    }
  };

  const changeLanguage = async (newLanguage: Language) => {
    try {
      setLanguage(newLanguage);
      await i18n.changeLanguage(newLanguage);
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage);
    } catch (error) {
      console.log("Error changing language:", error);
    }
  };

  const value: LanguageContextType = {
    language,
    changeLanguage,
    isLoading,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
