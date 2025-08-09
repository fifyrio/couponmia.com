'use client';

import { useState, useEffect } from 'react';

interface Coupon {
  id: number;
  title: string;
  subtitle: string;
  code: string | null;
  type: 'code' | 'deal';
  discount: string;
  description: string;
  expiresAt: string;
  isPopular: boolean;
  minSpend: number | null;
  url: string;
}

interface CouponModalProps {
  coupon: Coupon | null;
  storeName: string;
  onClose: () => void;
}

export default function CouponModal({ coupon, storeName, onClose }: CouponModalProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Close modal on ESC key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (coupon) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [coupon, onClose]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDiscount = (subtitle: string) => {
    if (subtitle === 'other') return 'DEAL';
    // Handle 'FROM 0.00' case
    if (subtitle && subtitle.toLowerCase().includes('from 0.00')) return 'DEAL';
    // Handle other cases with 'from 0' variations
    if (subtitle && /from\s*0(\.0+)?/i.test(subtitle)) return 'DEAL';
    // Remove unnecessary decimal points (e.g., "15.00% OFF" -> "15% OFF")
    return subtitle.replace(/\.0+(?=\s*%)/g, '');
  };

  const formatExpiryDate = (dateString: string) => {
    const date = new Date(dateString);
    
    // Handle invalid date
    if (isNaN(date.getTime())) {
      return 'Expires Soon';
    }
    
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Expires Today';
    if (diffDays === 1) return 'Expires Tomorrow';
    if (diffDays <= 7) return `Expires in ${diffDays} days`;
    return `Expires ${date.toLocaleDateString()}`;
  };

  if (!coupon) return null;

  return (
    <div 
      className="z-50 flex items-center justify-center p-4" 
      style={{ 
        position: 'fixed', 
        top: '0', 
        left: '0', 
        right: '0', 
        bottom: '0',
        width: '100vw',
        height: '100vh'
      }}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-card-bg border border-card-border rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="text-3xl font-bold text-text-primary mb-2">
              {formatDiscount(coupon.subtitle)}
            </div>
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-gradient-to-r from-brand-light to-brand-accent text-white px-4 py-2 rounded-lg font-bold text-lg">
                {coupon.title}
              </div>
              {coupon.isPopular && (
                <span className="bg-brand-light/10 text-brand-light px-3 py-1 rounded-full text-sm font-medium border border-brand-light/20">
                  Popular
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <p className="text-text-secondary text-lg leading-relaxed">
              Is getting a good deal from your favorite store something you&apos;re interested in? You&apos;ve found the right spot. Get {storeName} coupon code &apos;{coupon.code || 'DEAL'}&apos; to save big now. {coupon.type === 'code' ? 'Copy and paste this code at checkout.' : 'No codes need.'} Discount automatically applied in cart. Don&apos;t let this offer expire. Grab it now. Valid for online use only.
            </p>
          </div>

          {/* Expiry Info */}
          <div className="mb-8">
            <div className="flex items-center text-text-muted">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{formatExpiryDate(coupon.expiresAt)}</span>
            </div>
            {coupon.minSpend && (
              <div className="flex items-center text-text-muted mt-2">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <span>Minimum spend: ${coupon.minSpend}</span>
              </div>
            )}
          </div>

          {/* Code Section */}
          {coupon.type === 'code' && coupon.code ? (
            <div className="mb-6">
              <div className="flex items-center space-x-4 p-4 bg-card-bg/50 border-2 border-dashed border-brand-light/30 rounded-xl">
                <div className="flex-1 text-center">
                  <div className="text-2xl font-mono font-bold text-brand-light tracking-wider">
                    {coupon.code}
                  </div>
                </div>
                <button
                  onClick={() => handleCopyCode(coupon.code!)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    copiedCode === coupon.code
                      ? 'bg-green-500 text-white'
                      : 'bg-brand-light text-white hover:bg-brand-accent'
                  }`}
                >
                  {copiedCode === coupon.code ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <div className="text-center p-6 bg-card-bg/50 border border-card-border rounded-xl">
                <div className="text-xl font-semibold text-text-primary mb-2">
                  No codes needed
                </div>
                <p className="text-text-secondary">
                  Discount will be automatically applied at checkout
                </p>
              </div>
            </div>
          )}

          {/* Go To Shop Button */}
          <div className="mb-6 text-center">
            <a
              href={coupon.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-flex items-center justify-center bg-gradient-to-r from-brand-light to-brand-accent text-white px-8 py-4 rounded-xl font-semibold text-lg hover:scale-105 transition-all duration-200 shadow-lg cursor-pointer"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              Go To Shop
            </a>
          </div>

          {/* Bottom Notice */}
          <div className="text-center text-sm text-text-muted">
            <p>
              Site was opened in the previous tab. {coupon.type === 'code' ? 'Copy and paste the code at checkout on' : 'Complete your purchase on'} <span className="text-brand-light font-medium">{storeName}</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}