// Supported locales configuration
export const locales = ['en', 'zh', 'de', 'es', 'fr', 'it', 'pt', 'ja', 'ko', 'ru', 'vi', 'th', 'id'] as const;

export type Locale = (typeof locales)[number];

// Default locale (used when no locale is specified)
export const defaultLocale: Locale = 'en';

// Locale display names for language switcher
export const localeNames: Record<Locale, string> = {
  en: 'English',
  zh: '中文',
  de: 'Deutsch',
  es: 'Español',
  fr: 'Français',
  it: 'Italiano',
  pt: 'Português',
  ja: '日本語',
  ko: '한국어',
  ru: 'Русский',
  vi: 'Tiếng Việt',
  th: 'ไทย',
  id: 'Bahasa Indonesia'
};

// Locale metadata for SEO
export const localeMetadata: Record<Locale, { label: string; flag: string; code: string }> = {
  en: { label: 'English', flag: '🇺🇸', code: 'en-US' },
  zh: { label: '中文', flag: '🇨🇳', code: 'zh-CN' },
  de: { label: 'Deutsch', flag: '🇩🇪', code: 'de-DE' },
  es: { label: 'Español', flag: '🇪🇸', code: 'es-ES' },
  fr: { label: 'Français', flag: '🇫🇷', code: 'fr-FR' },
  it: { label: 'Italiano', flag: '🇮🇹', code: 'it-IT' },
  pt: { label: 'Português', flag: '🇧🇷', code: 'pt-BR' },
  ja: { label: '日本語', flag: '🇯🇵', code: 'ja-JP' },
  ko: { label: '한국어', flag: '🇰🇷', code: 'ko-KR' },
  ru: { label: 'Русский', flag: '🇷🇺', code: 'ru-RU' },
  vi: { label: 'Tiếng Việt', flag: '🇻🇳', code: 'vi-VN' },
  th: { label: 'ไทย', flag: '🇹🇭', code: 'th-TH' },
  id: { label: 'Bahasa Indonesia', flag: '🇮🇩', code: 'id-ID' }
};
