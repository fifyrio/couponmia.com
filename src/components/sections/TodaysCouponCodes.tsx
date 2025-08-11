"use client";

import { useState, useEffect } from 'react';
import { getFeaturedCoupons } from '@/lib/api';

export interface TodaysCoupon {
  title: string;
  code: string;
  views: string;
  store: string;
  discount: string;
  expires: string;
}

interface TodaysCouponCodesProps {
  onCouponClick: (coupon: TodaysCoupon) => void;
}

export default function TodaysCouponCodes({ onCouponClick }: TodaysCouponCodesProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [featuredCoupons, setFeaturedCoupons] = useState<TodaysCoupon[]>([]);
  const [loading, setLoading] = useState(true);

  // Format discount to remove unnecessary decimal points
  const formatDiscount = (discount: string) => {
    return discount.replace(/\.0+(?=\s*%)/g, '');
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
            views: "1.2k Views",
            store: "Amazon",
            discount: "75% OFF",
            expires: "Ends Today"
          },
          {
            title: "Buy 2 Get 1 Free on All Electronics + Extra 20% Off", 
            code: "TECH20",
            views: "856 Views",
            store: "Best Buy",
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
        <h2 className="text-2xl font-bold mb-8 text-text-primary px-4">Today&apos;s Coupon Codes</h2>
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
      <h2 className="text-2xl font-bold mb-8 text-text-primary px-4">Today&apos;s Coupon Codes</h2>
      
      {/* Static Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
        {featuredCoupons.map((coupon, index) => (
          <div 
            key={index} 
            className="bg-card-bg/90 backdrop-blur-sm rounded-2xl border border-card-border p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group cursor-pointer"
            onClick={() => onCouponClick(coupon)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-bold text-brand-accent bg-brand-accent/10 px-2 py-1 rounded-full">
                    {coupon.store}
                  </span>
                  <span className="text-xs font-bold text-white bg-gradient-to-r from-brand-medium to-brand-light px-2 py-1 rounded-full">
                    {formatDiscount(coupon.discount)}
                  </span>
                </div>
                <div className="text-sm font-semibold text-text-primary mb-3 leading-relaxed line-clamp-2">
                  {coupon.title}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button 
                  className="bg-gradient-to-r from-brand-medium to-brand-light text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyCode(coupon.code);
                  }}
                >
                  {copiedCode === coupon.code ? '✓ Copied!' : coupon.code}
                </button>
                <span className="text-xs text-text-muted font-medium">{coupon.views}</span>
              </div>
              <span className="text-xs text-brand-accent font-medium">{coupon.expires}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}