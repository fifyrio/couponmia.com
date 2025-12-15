import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';
import { locales, defaultLocale } from './config';

// Define routing configuration for next-intl
export const routing = defineRouting({
  locales,
  defaultLocale,
  // 'as-needed' means default locale won't have a prefix in the URL
  // e.g., /store/nike instead of /en/store/nike
  localePrefix: 'as-needed',
  // Detect locale from Accept-Language header
  localeDetection: true
});

// Export internationalized navigation components
// These should be used instead of next/link and next/navigation
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
