import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

// Server-side configuration for next-intl
// This loads the appropriate translation messages based on the locale
export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that the incoming locale is valid
  if (!locale || !routing.locales.includes(locale as 'en' | 'ja' | 'de' | 'fr')) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
