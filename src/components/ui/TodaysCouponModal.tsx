'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { addReferralTrackingToUrl, logCouponClick } from '@/utils/couponTracking';

interface TodaysCoupon {
  title: string;
  code: string;
  url: string;
  type: string;
  views: string;
  store: string;
  storeLogo: string;
  discount: string;
  expires: string;
}

interface TodaysCouponModalProps {
  coupon: TodaysCoupon | null;
  onClose: () => void;
}

export default function TodaysCouponModal({ coupon, onClose }: TodaysCouponModalProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { user, profile } = useAuth();

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

  const handleVisitStore = (url: string) => {
    if (url) {
      // Generate a unique coupon ID from title and store name for tracking
      const couponId = `${coupon?.store}-${coupon?.title}`.replace(/\s+/g, '-').toLowerCase();
      
      // Log the click for analytics
      logCouponClick(couponId, user?.id, profile?.referral_code);
      
      // Add referral tracking to URL if user is logged in
      const trackedUrl = addReferralTrackingToUrl(url, profile?.referral_code);
      
      // Open the tracked URL
      window.open(trackedUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Format views count for display
  const formatViews = (views: string) => {
    const numViews = parseInt(views);
    if (isNaN(numViews) || numViews <= 0) return '';
    
    if (numViews >= 1000) {
      return `${(numViews / 1000).toFixed(1).replace('.0', '')}k people have viewed this deal today`;
    }
    return `${numViews} people have viewed this deal today`;
  };

  // Format coupon type for display
  const formatType = (type: string) => {
    if (!type || type === 'other') return 'Deal';
    return type.charAt(0).toUpperCase() + type.slice(1);
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
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-bold text-brand-accent bg-brand-accent/10 px-3 py-2 rounded-full">
                {coupon.store}
              </span>
              <span className="text-sm font-bold text-purple-400 bg-purple-400/10 px-3 py-2 rounded-full">
                {formatType(coupon.type)}
              </span>
              <span className="text-sm font-bold text-white bg-gradient-to-r from-brand-medium to-brand-light px-3 py-2 rounded-full">
                {coupon.discount}
              </span>
              <span className="text-sm text-brand-accent font-medium">
                {coupon.expires}
              </span>
            </div>
            <h2 className="text-3xl font-bold text-text-primary mb-4">
              {coupon.title}
            </h2>
          </div>

          {/* Description */}
          <div className="mb-6">
            <p className="text-text-secondary text-lg leading-relaxed">
              Don&apos;t miss out on this amazing deal from {coupon.store}! This exclusive coupon code &apos;{coupon.code}&apos; gives you incredible savings. Copy the code below and apply it at checkout to unlock your discount. This is a limited-time offer that expires soon - grab it now before it&apos;s gone!
            </p>
          </div>

          {/* Popularity Info */}
          {formatViews(coupon.views) && (
            <div className="mb-8">
              <div className="flex items-center text-text-muted">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>{formatViews(coupon.views)}</span>
              </div>
            </div>
          )}

          {/* Code Section */}
          <div className="mb-6">
            <div className="flex items-center space-x-4 p-4 bg-card-bg/50 border-2 border-dashed border-brand-light/30 rounded-xl">
              <div className="flex-1 text-center">
                <div className="text-2xl font-mono font-bold text-brand-light tracking-wider">
                  {coupon.code}
                </div>
              </div>
              <button
                onClick={() => handleCopyCode(coupon.code)}
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

          {/* Action Button */}
          <div className="mb-6 text-center">
            <button 
              onClick={() => handleVisitStore(coupon.url)}
              className="bg-gradient-to-r from-brand-medium to-brand-light text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              Visit {coupon.store} →
            </button>
          </div>

          {/* Bottom Notice */}
          <div className="text-center text-sm text-text-muted">
            <p>
              Click the button above to visit <span className="text-brand-light font-medium">{coupon.store}</span> and apply your discount code at checkout.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}