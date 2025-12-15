import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import CookieConsent from "@/components/CookieConsent";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { localeMetadata } from '@/i18n/config';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import "../globals.css";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.home' });
  const localeInfo = localeMetadata[locale as keyof typeof localeMetadata] || localeMetadata.en;

  return {
    title: t('title'),
    description: t('description'),
    keywords: ["coupon codes", "promo codes", "discount codes", "deals", "savings", "online shopping", "coupons", "2025 deals"],
    authors: [{ name: "CouponMia" }],
    robots: "index, follow",
    alternates: {
      canonical: `https://couponmia.com${locale === 'en' ? '' : `/${locale}`}`,
      languages: {
        'en': 'https://couponmia.com',
        'ja': 'https://couponmia.com/ja',
        'de': 'https://couponmia.com/de',
        'fr': 'https://couponmia.com/fr'
      }
    },
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon.ico",
      apple: "/favicon.ico"
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `https://couponmia.com${locale === 'en' ? '' : `/${locale}`}`,
      siteName: "CouponMia",
      type: "website",
      locale: localeInfo.code
    },
    twitter: {
      card: "summary_large_image",
      title: t('title'),
      description: t('description'),
      site: "@couponmia"
    }
  };
}

export const viewport = {
  width: "device-width",
  initialScale: 1
};

export default async function LocaleLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  // Ensure that the incoming locale is valid
  if (!routing.locales.includes(locale as 'en' | 'ja' | 'de' | 'fr')) {
    notFound();
  }

  // Providing all messages to the client side
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages}>
          {children}
          <CookieConsent />
          <Analytics />
          <SpeedInsights />

          {/* Google Analytics */}
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-3M1GW77HJ7"
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-3M1GW77HJ7');
            `}
          </Script>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
