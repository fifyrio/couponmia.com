// Supported locales configuration
export const locales = ['en', 'ja', 'de', 'fr'] as const;

export type Locale = (typeof locales)[number];

// Default locale (used when no locale is specified)
export const defaultLocale: Locale = 'en';

// Locale display names for language switcher
export const localeNames: Record<Locale, string> = {
  en: 'English',
  ja: '日本語',
  de: 'Deutsch',
  fr: 'Français'
};

// Locale metadata for SEO
export const localeMetadata: Record<Locale, { label: string; flag: string; code: string }> = {
  en: { label: 'English', flag: '🇺🇸', code: 'en-US' },
  ja: { label: '日本語', flag: '🇯🇵', code: 'ja-JP' },
  de: { label: 'Deutsch', flag: '🇩🇪', code: 'de-DE' },
  fr: { label: 'Français', flag: '🇫🇷', code: 'fr-FR' }
};
