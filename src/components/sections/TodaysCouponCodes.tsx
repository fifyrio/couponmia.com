"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { getFeaturedCoupons } from '@/lib/api';

export interface TodaysCoupon {
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

interface TodaysCouponCodesProps {
  onCouponClick: (coupon: TodaysCoupon) => void;
}

export default function TodaysCouponCodes({ onCouponClick }: TodaysCouponCodesProps) {
  const t = useTranslations('home.todaysCoupons');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [featuredCoupons, setFeaturedCoupons] = useState<TodaysCoupon[]>([]);
  const [loading, setLoading] = useState(true);

  // Format discount to remove unnecessary decimal points
  const formatDiscount = (discount: string) => {
    return discount.replace(/\.0+(?=\s*%)/g, '');
  };

  // Format views count for display
  const formatViews = (views: string) => {
    const numViews = parseInt(views);
    if (isNaN(numViews) || numViews <= 0) return '';
    
    if (numViews >= 1000) {
      return `${(numViews / 1000).toFixed(1).replace('.0', '')}k Views`;
    }
    return `${numViews} Views`;
  };

  // Format coupon type for display
  const formatType = (type: string) => {
    if (!type || type === 'other') return 'Deal';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  useEffect(() => {
    const fetchFeaturedCoupons = async () => {
      try {
        const data = await getFeaturedCoupons(6);
        setFeaturedCoupons(data);
      } catch (error) {
        console.error('Failed to fetch featured coupons:', error);
        // API function already handles fallback, but add extra safety
        setFeaturedCoupons([
          {
            title: "75% Off Select Clearance Sitewide Deals + Free Delivery",
            code: "SAVE75",
            url: "https://amazon.com",
            type: "deal",
            views: "1200",
            store: "Amazon",
            storeLogo: "https://logo.clearbit.com/amazon.com",
            discount: "75% OFF",
            expires: "Ends Today"
          },
          {
            title: "Buy 2 Get 1 Free on All Electronics + Extra 20% Off", 
            code: "TECH20",
            url: "https://bestbuy.com",
            type: "code",
            views: "856",
            store: "Best Buy",
            storeLogo: "https://logo.clearbit.com/bestbuy.com",
            discount: "BOGO + 20%",
            expires: "2 Days Left"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedCoupons();
  }, []);

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };


  if (loading) {
    return (
      <div className="w-full mb-8">
        <h2 className="text-2xl font-bold mb-8 text-text-primary px-4">{t('title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-card-bg/90 backdrop-blur-sm rounded-2xl border border-card-border p-6 animate-pulse">
              <div className="h-4 bg-gray-300 rounded mb-4"></div>
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mb-8">
      <h2 className="text-2xl font-bold mb-8 text-text-primary px-4">{t('title')}</h2>
      
      {/* Static Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
        {featuredCoupons.map((coupon, index) => (
          <div 
            key={index} 
            className="bg-card-bg/90 backdrop-blur-sm rounded-2xl border border-card-border p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group cursor-pointer"
            onClick={() => onCouponClick(coupon)}
          >
            {/* Store Logo */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-white/10 border border-card-border flex items-center justify-center overflow-hidden">
                {coupon.storeLogo ? (
                  <img 
                    src={coupon.storeLogo} 
                    alt={`${coupon.store} logo`}
                    className="w-12 h-12 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'block';
                    }}
                  />
                ) : null}
                <div 
                  className="text-sm font-bold text-brand-accent text-center leading-tight"
                  style={{ display: coupon.storeLogo ? 'none' : 'block' }}
                >
                  {coupon.store.slice(0, 3)}
                </div>
              </div>
            </div>

            {/* Store Info */}
            <div className="text-center mb-3">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-xs font-bold text-brand-accent bg-brand-accent/10 px-2 py-1 rounded-full">
                  {coupon.store}
                </span>
                <span className="text-xs font-bold text-purple-400 bg-purple-400/10 px-2 py-1 rounded-full">
                  {formatType(coupon.type)}
                </span>
              </div>
              <span className="text-xs font-bold text-white bg-gradient-to-r from-brand-medium to-brand-light px-3 py-1 rounded-full">
                {formatDiscount(coupon.discount)}
              </span>
            </div>

            {/* Title */}
            <div className="text-sm font-semibold text-text-primary mb-4 leading-relaxed line-clamp-2 text-center">
              {coupon.title}
            </div>
            
            {/* Action Button and Info */}
            <div className="space-y-3">
              <div className="flex justify-center">
                <button 
                  className="bg-gradient-to-r from-brand-medium to-brand-light text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyCode(coupon.code);
                  }}
                >
                  {copiedCode === coupon.code ? '✓ Copied!' : coupon.code}
                </button>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                {formatViews(coupon.views) && (
                  <span className="text-text-muted font-medium">{formatViews(coupon.views)}</span>
                )}
                <span className="text-brand-accent font-medium">{coupon.expires}</span>
                {!formatViews(coupon.views) && <span></span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}