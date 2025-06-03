import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// 번역 파일들 import
import en from "../locales/en/common.json";
import ko from "../locales/ko/common.json";

const resources = {
  ko: {
    common: ko,
  },
  en: {
    common: en,
  },
};

const initI18n = async () => {
  let savedLanguage = "ko"; // 기본값을 한국어로 설정

  try {
    // AsyncStorage에서 저장된 언어 설정을 가져올 수 있도록 나중에 추가
    // const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    // savedLanguage = await AsyncStorage.getItem('language') || 'ko';
  } catch (error) {
    console.log("Error loading saved language:", error);
  }

  // 시스템 언어 감지 (fallback)
  const systemLanguage = Localization.getLocales()[0]?.languageCode || "ko";
  const supportedLanguages = ["ko", "en"];
  const detectedLanguage = supportedLanguages.includes(systemLanguage)
    ? systemLanguage
    : "ko";

  await i18n.use(initReactI18next).init({
    resources,
    lng: savedLanguage || detectedLanguage,
    fallbackLng: "ko",
    debug: __DEV__,

    // 네임스페이스 설정
    defaultNS: "common",
    ns: ["common"],

    keySeparator: ".",
    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },
  });

  return i18n;
};

export default initI18n;
export { i18n };
