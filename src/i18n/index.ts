import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';
import en from './translations/en.json';
import zh from './translations/zh.json';

// Set up translations
const translations = {
  en,
  zh,
  'zh-CN': zh,
  'zh-TW': zh,
  'zh-HK': zh
};

// Create i18n instance
const i18n = new I18n(translations);

// Set the locale once at the beginning of your app from device settings
const locales = Localization.getLocales();
i18n.locale = locales && locales.length > 0 ? locales[0].languageCode || 'en' : 'en';
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

// Function to get the current locale
export const getCurrentLocale = (): string => {
  return i18n.locale;
};

// Function to check if current locale is Chinese
export const isChineseLocale = (): boolean => {
  return i18n.locale.toLowerCase().startsWith('zh');
};

export default i18n; 