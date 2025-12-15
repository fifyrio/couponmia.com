import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import CookieConsent from "@/components/CookieConsent";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Coupon Codes & Deals - Save Money Online | CouponMia",
  description: "Save money with latest coupon codes, promo codes, and discount codes with CouponMia. Browse the best 2025 deals and discounts from your favorite stores and brands.",
  keywords: ["coupon codes", "promo codes", "discount codes", "deals", "savings", "online shopping", "coupons", "2025 deals"],
  authors: [{ name: "CouponMia" }],
  robots: "index, follow",
  alternates: {
    canonical: "https://couponmia.com"
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico"
  },
  openGraph: {
    title: "Coupon Codes & Deals - Save Money Online | CouponMia",
    description: "Save money with latest coupon codes, promo codes, and discount codes with CouponMia. Browse the best 2025 deals and discounts from your favorite stores and brands.",
    url: "https://couponmia.com",
    siteName: "CouponMia",
    type: "website",
    locale: "en_US"
  },
  twitter: {
    card: "summary_large_image",
    title: "Coupon Codes & Deals - Save Money Online | CouponMia",
    description: "Save money with latest coupon codes, promo codes, and discount codes with CouponMia. Browse the best 2025 deals and discounts from your favorite stores and brands.",
    site: "@couponmia"
  }
};

export const viewport = {
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
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
      </body>
    </html>
  );
}
