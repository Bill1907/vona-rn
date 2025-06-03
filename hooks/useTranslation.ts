import { useTranslation as useI18nTranslation } from "react-i18next";

export const useTranslation = (namespace: string = "common") => {
  const { t, i18n } = useI18nTranslation(namespace);

  return {
    t,
    i18n,
    language: i18n.language,
  };
};
