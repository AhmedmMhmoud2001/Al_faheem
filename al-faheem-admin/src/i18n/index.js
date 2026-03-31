import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enCommon from './locales/en/common.json';
import arCommon from './locales/ar/common.json';

export function syncDocumentFromLanguage(lng) {
  const code = (lng || 'ar').split('-')[0];
  document.documentElement.lang = lng || 'ar';
  document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr';
}

i18n.on('languageChanged', syncDocumentFromLanguage);

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: enCommon },
      ar: { common: arCommon },
    },
    fallbackLng: 'ar',
    defaultNS: 'common',
    ns: ['common'],
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    interpolation: { escapeValue: false },
  })
  .then(() => {
    syncDocumentFromLanguage(i18n.language);
  });

export default i18n;
