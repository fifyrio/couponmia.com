'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const hasAccepted = localStorage.getItem('cookieConsent');
    if (!hasAccepted) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'true');
    setIsVisible(false);
  };

  const handleClose = () => {
    localStorage.setItem('cookieConsent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#4a4a4a] text-white px-4 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        {/* Text content */}
        <div className="flex-1 text-sm md:text-base">
          <p className="leading-relaxed">
            <span className="font-medium">Couponmia</span> uses cookies from third-parties or affiliate networks to enhance your experience. If you continue without changing your browser settings you agree to their use.{' '}
            <Link
              href="/cookie-policy"
              className="text-purple-400 hover:text-purple-300 underline transition-colors"
            >
              Read More
            </Link>
          </p>
        </div>

        {/* Accept button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleAccept}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-2.5 rounded transition-colors whitespace-nowrap"
          >
            Accept
          </button>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-300 transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
